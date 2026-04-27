// Storage Service using IndexedDB via Dexie
import Dexie from 'dexie';

const db = new Dexie('TalkToExpertDB');

db.version(1).stores({
  conversations: '++id, expertId, createdAt, updatedAt, language',
  messages: '++id, conversationId, sender, text, timestamp, interactiveElements',
  preferences: 'key',
});

// ---- Conversations ----

export async function createConversation(expertId, language = 'hinglish') {
  const id = await db.conversations.add({
    expertId,
    language,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    preview: '',
  });
  return id;
}

export async function getOrCreateConversation(expertId, language) {
  const existing = await db.conversations
    .where({ expertId })
    .reverse()
    .sortBy('updatedAt');
  
  if (existing.length > 0) {
    return existing[0].id;
  }
  return createConversation(expertId, language);
}

export async function updateConversationPreview(conversationId, preview) {
  await db.conversations.update(conversationId, {
    preview,
    updatedAt: Date.now(),
  });
}

export async function getRecentConversations(limit = 10) {
  const convs = await db.conversations
    .orderBy('updatedAt')
    .reverse()
    .limit(limit)
    .toArray();
  return convs;
}

export async function getAllConversationsForExpert(expertId) {
  return db.conversations.where({ expertId }).reverse().sortBy('updatedAt');
}

export async function deleteConversation(conversationId) {
  await db.messages.where({ conversationId }).delete();
  await db.conversations.delete(conversationId);
}

export async function clearAllHistory() {
  await db.messages.clear();
  await db.conversations.clear();
}

// ---- Messages ----

export async function saveMessage(conversationId, sender, text, interactiveElements = []) {
  const id = await db.messages.add({
    conversationId,
    sender,
    text,
    interactiveElements: JSON.stringify(interactiveElements),
    timestamp: Date.now(),
  });

  // Update conversation preview
  if (sender === 'user') {
    await updateConversationPreview(conversationId, text.slice(0, 80));
  }

  return id;
}

export async function getMessages(conversationId) {
  const msgs = await db.messages
    .where({ conversationId })
    .sortBy('timestamp');
  
  return msgs.map(m => ({
    ...m,
    interactiveElements: m.interactiveElements ? JSON.parse(m.interactiveElements) : [],
  }));
}

export async function clearConversationMessages(conversationId) {
  await db.messages.where({ conversationId }).delete();
}

// ---- Preferences ----

export async function savePreference(key, value) {
  await db.preferences.put({ key, value });
}

export async function getPreference(key, defaultValue = null) {
  const record = await db.preferences.get(key);
  return record ? record.value : defaultValue;
}

// ---- Export ----

export async function exportConversationAsText(conversationId, expertName) {
  const messages = await getMessages(conversationId);
  const lines = [`Talk To Expert - Conversation with ${expertName}`, `Date: ${new Date().toLocaleDateString()}`, '='.repeat(50), ''];
  
  for (const msg of messages) {
    const sender = msg.sender === 'user' ? 'You' : expertName;
    const time = new Date(msg.timestamp).toLocaleTimeString();
    lines.push(`[${time}] ${sender}:`);
    lines.push(msg.text);
    lines.push('');
  }
  
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-${expertName}-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
