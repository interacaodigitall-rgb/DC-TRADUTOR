import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { type Language } from '../types';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (langCode: string) => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose, onSelectLanguage }) => {
  if (!isOpen) return null;

  const handleSelect = (code: string) => {
    onSelectLanguage(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Select a Language</h2>
        </div>
        <ul className="overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((lang: Language) => (
            <li key={lang.code}>
              <button 
                onClick={() => handleSelect(lang.code)}
                className="w-full text-left p-4 hover:bg-gray-100 transition-colors flex items-center gap-4 text-gray-700"
              >
                <span className="text-2xl w-8 text-center">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LanguageModal;
