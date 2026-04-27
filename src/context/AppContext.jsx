import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig.js';
import { getPreference, savePreference } from '../services/storageService.js';

const AppContext = createContext(null);

// 50+ world languages (ISO code, display name, native name)
export const WORLD_LANGUAGES = [
  { code: 'english', label: 'English', native: 'English', iso: 'en' },
  { code: 'hinglish', label: 'Hinglish', native: 'Hinglish', iso: 'hi' },
  { code: 'hindi', label: 'Hindi', native: 'हिन्दी', iso: 'hi' },
  { code: 'japanese', label: 'Japanese', native: '日本語', iso: 'ja' },
  { code: 'chinese', label: 'Chinese', native: '中文', iso: 'zh' },
  { code: 'spanish', label: 'Spanish', native: 'Español', iso: 'es' },
  { code: 'french', label: 'French', native: 'Français', iso: 'fr' },
  { code: 'arabic', label: 'Arabic', native: 'العربية', iso: 'ar' },
  { code: 'portuguese', label: 'Portuguese', native: 'Português', iso: 'pt' },
  { code: 'russian', label: 'Russian', native: 'Русский', iso: 'ru' },
  { code: 'german', label: 'German', native: 'Deutsch', iso: 'de' },
  { code: 'korean', label: 'Korean', native: '한국어', iso: 'ko' },
  { code: 'italian', label: 'Italian', native: 'Italiano', iso: 'it' },
  { code: 'turkish', label: 'Turkish', native: 'Türkçe', iso: 'tr' },
  { code: 'dutch', label: 'Dutch', native: 'Nederlands', iso: 'nl' },
  { code: 'polish', label: 'Polish', native: 'Polski', iso: 'pl' },
  { code: 'swedish', label: 'Swedish', native: 'Svenska', iso: 'sv' },
  { code: 'norwegian', label: 'Norwegian', native: 'Norsk', iso: 'no' },
  { code: 'danish', label: 'Danish', native: 'Dansk', iso: 'da' },
  { code: 'finnish', label: 'Finnish', native: 'Suomi', iso: 'fi' },
  { code: 'greek', label: 'Greek', native: 'Ελληνικά', iso: 'el' },
  { code: 'czech', label: 'Czech', native: 'Čeština', iso: 'cs' },
  { code: 'hungarian', label: 'Hungarian', native: 'Magyar', iso: 'hu' },
  { code: 'romanian', label: 'Romanian', native: 'Română', iso: 'ro' },
  { code: 'thai', label: 'Thai', native: 'ภาษาไทย', iso: 'th' },
  { code: 'vietnamese', label: 'Vietnamese', native: 'Tiếng Việt', iso: 'vi' },
  { code: 'indonesian', label: 'Indonesian', native: 'Bahasa Indonesia', iso: 'id' },
  { code: 'malay', label: 'Malay', native: 'Bahasa Melayu', iso: 'ms' },
  { code: 'bengali', label: 'Bengali', native: 'বাংলা', iso: 'bn' },
  { code: 'urdu', label: 'Urdu', native: 'اردو', iso: 'ur' },
  { code: 'punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', iso: 'pa' },
  { code: 'gujarati', label: 'Gujarati', native: 'ગુજરાતી', iso: 'gu' },
  { code: 'marathi', label: 'Marathi', native: 'मराठी', iso: 'mr' },
  { code: 'tamil', label: 'Tamil', native: 'தமிழ்', iso: 'ta' },
  { code: 'telugu', label: 'Telugu', native: 'తెలుగు', iso: 'te' },
  { code: 'kannada', label: 'Kannada', native: 'ಕನ್ನಡ', iso: 'kn' },
  { code: 'malayalam', label: 'Malayalam', native: 'മലയാളം', iso: 'ml' },
  { code: 'swahili', label: 'Swahili', native: 'Kiswahili', iso: 'sw' },
  { code: 'hebrew', label: 'Hebrew', native: 'עברית', iso: 'he' },
  { code: 'persian', label: 'Persian', native: 'فارسی', iso: 'fa' },
  { code: 'ukrainian', label: 'Ukrainian', native: 'Українська', iso: 'uk' },
  { code: 'catalan', label: 'Catalan', native: 'Català', iso: 'ca' },
  { code: 'croatian', label: 'Croatian', native: 'Hrvatski', iso: 'hr' },
  { code: 'slovak', label: 'Slovak', native: 'Slovenčina', iso: 'sk' },
  { code: 'bulgarian', label: 'Bulgarian', native: 'Български', iso: 'bg' },
  { code: 'serbian', label: 'Serbian', native: 'Српски', iso: 'sr' },
  { code: 'latvian', label: 'Latvian', native: 'Latviešu', iso: 'lv' },
  { code: 'lithuanian', label: 'Lithuanian', native: 'Lietuvių', iso: 'lt' },
  { code: 'estonian', label: 'Estonian', native: 'Eesti', iso: 'et' },
  { code: 'slovenian', label: 'Slovenian', native: 'Slovenščina', iso: 'sl' },
  { code: 'nepali', label: 'Nepali', native: 'नेपाली', iso: 'ne' },
  { code: 'sinhala', label: 'Sinhala', native: 'සිංහල', iso: 'si' },
  { code: 'myanmar', label: 'Myanmar', native: 'မြန်မာ', iso: 'my' },
  { code: 'khmer', label: 'Khmer', native: 'ខ្មែរ', iso: 'km' },
  { code: 'afrikaans', label: 'Afrikaans', native: 'Afrikaans', iso: 'af' },
  { code: 'amharic', label: 'Amharic', native: 'አማርኛ', iso: 'am' },
];

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('hinglish');
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';

  useEffect(() => {
    if (apiKey) window.__GROQ_KEY__ = apiKey;
    getPreference('language', 'hinglish').then(setLanguage);

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const updateLanguage = async (lang) => {
    setLanguage(lang);
    await savePreference('language', lang);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3500);
  };

  return (
    <AppContext.Provider value={{
      language,
      updateLanguage,
      apiKey,
      notifications,
      addNotification,
      user,
      authLoading,
      signOut,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
