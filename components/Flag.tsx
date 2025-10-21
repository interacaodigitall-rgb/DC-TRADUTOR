import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';

interface FlagProps {
  langCode: string;
  onClick: () => void;
}

const getFlagEmoji = (langCode: string): string => {
  if (langCode === 'auto') return '🌐';
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  return lang?.flag || '🏳️';
};

const Flag: React.FC<FlagProps> = ({ langCode, onClick }) => {
  return (
    <button 
        onClick={onClick} 
        className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-4xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all transform hover:scale-105"
        aria-label={`Select language: ${SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name}`}
    >
      {getFlagEmoji(langCode)}
    </button>
  );
};

export default Flag;
