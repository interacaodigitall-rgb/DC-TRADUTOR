import { type Language } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'auto', name: 'Auto Detect', flag: '🌐' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
];