
import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { type Language } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange }) => {
  return (
    <div className="flex-1">
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200 appearance-none text-center"
        aria-label="Select language"
      >
        {SUPPORTED_LANGUAGES.map((lang: Language) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
