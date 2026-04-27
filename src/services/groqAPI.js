// Groq API Service for Talk To Expert
import { getSystemPrompt } from '../data/systemPrompts.js';
import { WORLD_LANGUAGES } from '../context/AppContext.jsx';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const getApiKey = () => window.__GROQ_KEY__ || import.meta.env.VITE_GROQ_API_KEY || '';

/**
 * Build an explicit language instruction block for the AI.
 * Prepended to the system prompt so AI ALWAYS responds in the correct language.
 */
function buildLanguageInstruction(languageCode) {
  const lang = WORLD_LANGUAGES.find(l => l.code === languageCode);
  const nativeName = lang?.native || 'English';
  const englishName = lang?.label || 'English';

  if (languageCode === 'hinglish') {
    return `CRITICAL LANGUAGE RULE: You MUST respond ONLY in Hinglish (a natural mix of Hindi and English). Write Hindi words in Roman script (not Devanagari). Example: "Aapka swagat hai!", "Kya problem hai?", "Bilkul sahi!". Never respond in pure English or pure Devanagari script.`;
  }
  if (languageCode === 'english') {
    return `CRITICAL LANGUAGE RULE: You MUST respond ONLY in English. Use clear simple English regardless of what language the user writes in.`;
  }
  if (languageCode === 'hindi') {
    return `CRITICAL LANGUAGE RULE: You MUST respond ONLY in Hindi using Devanagari script (हिन्दी). Always write in हिन्दी regardless of what language the user writes in.`;
  }

  return `CRITICAL LANGUAGE RULE: You MUST respond ONLY in ${englishName} (${nativeName}). This is a strict requirement — ALWAYS respond in ${englishName} regardless of what language the user writes in.`;
}

/**
 * Parse interactive elements from AI response
 */
export function parseInteractiveElements(response) {
  const interactiveElements = [];
  let cleanText = response;

  const yesNoRegex = /\[INTERACTIVE_QUESTION\]([\s\S]*?)\[\/INTERACTIVE_QUESTION\]/g;
  let match;
  while ((match = yesNoRegex.exec(response)) !== null) {
    const content = match[1];
    const questionMatch = content.match(/Question:\s*(.+)/);
    const yesMatch = content.match(/YES_LABEL:\s*(.+)/);
    const noMatch = content.match(/NO_LABEL:\s*(.+)/);
    if (questionMatch) {
      interactiveElements.push({
        type: 'yesno',
        question: questionMatch[1].trim(),
        yesLabel: yesMatch ? yesMatch[1].trim() : 'Yes',
        noLabel: noMatch ? noMatch[1].trim() : 'No',
      });
    }
    cleanText = cleanText.replace(match[0], '');
  }

  const choiceRegex = /\[INTERACTIVE_CHOICE\]([\s\S]*?)\[\/INTERACTIVE_CHOICE\]/g;
  while ((match = choiceRegex.exec(response)) !== null) {
    const content = match[1];
    const questionMatch = content.match(/Question:\s*(.+)/);
    const optionsMatch = content.match(/OPTIONS:\s*(.+)/);
    if (questionMatch && optionsMatch) {
      interactiveElements.push({
        type: 'choice',
        question: questionMatch[1].trim(),
        options: optionsMatch[1].trim().split('|').map(o => o.trim()),
      });
    }
    cleanText = cleanText.replace(match[0], '');
  }

  const recipeRegex = /\[RECIPE_CARD\]([\s\S]*?)\[\/RECIPE_CARD\]/g;
  while ((match = recipeRegex.exec(response)) !== null) {
    interactiveElements.push({ type: 'recipe', content: match[1].trim() });
    cleanText = cleanText.replace(match[0], '');
  }

  const tripRegex = /\[TRIP_CARD\]([\s\S]*?)\[\/TRIP_CARD\]/g;
  while ((match = tripRegex.exec(response)) !== null) {
    interactiveElements.push({ type: 'trip', content: match[1].trim() });
    cleanText = cleanText.replace(match[0], '');
  }

  const breathRegex = /\[BREATHING_EXERCISE\]([\s\S]*?)\[\/BREATHING_EXERCISE\]/g;
  while ((match = breathRegex.exec(response)) !== null) {
    interactiveElements.push({ type: 'breathing', content: match[1].trim() });
    cleanText = cleanText.replace(match[0], '');
  }

  return { text: cleanText.trim(), interactiveElements };
}

/**
 * Main chat function
 */
export async function chatWithExpert({
  expertId,
  userMessage,
  conversationHistory = [],
  language = 'hinglish',
  onChunk = null,
}) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('GROQ_API_KEY_MISSING');

  // Language instruction is prepended first — strongest signal to the model
  const basePrompt = getSystemPrompt(expertId, language);
  const langInstruction = buildLanguageInstruction(language);
  const systemPrompt = `${langInstruction}\n\n${basePrompt}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-10).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    { role: 'user', content: userMessage },
  ];

  const useStreaming = typeof onChunk === 'function';

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.8,
      max_tokens: 600,
      stream: useStreaming,
    }),
  });

  if (!response.ok) {
    let errorMsg = 'API_ERROR';
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error?.message || errorData?.message || JSON.stringify(errorData);
    } catch { errorMsg = `HTTP Error ${response.status}`; }
    console.error('Groq API Error:', errorMsg);
    if (response.status === 429) throw new Error('RATE_LIMITED');
    if (response.status === 401) throw new Error('INVALID_API_KEY');
    throw new Error(errorMsg);
  }

  if (useStreaming) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.trim() !== '');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) { fullText += content; onChunk(content, fullText); }
        } catch { /* skip malformed */ }
      }
    }
    return fullText;
  } else {
    const data = await response.json();
    return data.choices[0].message.content;
  }
}

/**
 * Translate a single block of text into any target language
 */
export async function translateMessage(text, targetLanguageCode) {
  const apiKey = getApiKey();
  if (!apiKey || !text?.trim()) return text;

  const lang = WORLD_LANGUAGES.find(l => l.code === targetLanguageCode);
  const targetLang = lang ? `${lang.label} (${lang.native})` : targetLanguageCode;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the given text into ${targetLang}. Return ONLY the translated text — no labels, no explanations. Preserve emojis, bullet points, and formatting exactly.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.2,
        max_tokens: 800,
      }),
    });
    if (!response.ok) return text;
    const data = await response.json();
    return data.choices[0].message.content?.trim() || text;
  } catch {
    return text;
  }
}
