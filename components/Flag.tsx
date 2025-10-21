import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';

interface FlagProps {
  langCode: string;
  onClick: () => void;
  isActive: boolean;
}

const getFlagEmoji = (langCode: string): string => {
  if (langCode === 'auto') return '🌐';
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  return lang?.flag || '🏳️';
};

const Flag: React.FC<FlagProps> = ({ langCode, onClick, isActive }) => {
  const activeClasses = isActive ? 'ring-4 ring-offset-2 ring-red-600' : '';

  return (
    <button 
        onClick={onClick} 
        className={`w-16 h-16 rounded-full bg-white flex items-center justify-center text-4xl shadow-md focus:outline-none transition-all transform hover:scale-105 ${activeClasses}`}
        aria-label={`Select language: ${SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name}`}
    >
      {getFlagEmoji(langCode)}
    </button>
  );
};

export default Flag;
