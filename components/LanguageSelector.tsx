import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { type Language } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange }) => {
  return (
    <div className="w-full sm:w-auto flex-1">
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="w-full bg-gray-100 border-transparent text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 appearance-none text-center sm:text-left font-medium"
        aria-label="Select language"
      >
        {SUPPORTED_LANGUAGES.map((lang: Language) => {
           if (lang.code === 'auto') return null; // 'Auto Detect' is only for the source language dropdown in App.tsx
           return (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
           );
        })}
      </select>
    </div>
  );
};

export default LanguageSelector;