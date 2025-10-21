
import React from 'react';
import CopyIcon from './icons/CopyIcon';
import MicIcon from './icons/MicIcon';
import SpeakerIcon from './icons/SpeakerIcon';

interface TranslationPanelProps {
  id: string;
  language: string;
  text: string;
  onTextChange: (text: string) => void;
  onPlayAudio: () => void;
  onRecord?: () => void;
  isRecording: boolean;
  isLoading: boolean;
  isSource: boolean;
}

const TranslationPanel: React.FC<TranslationPanelProps> = ({
  id,
  language,
  text,
  onTextChange,
  onPlayAudio,
  onRecord,
  isRecording,
  isLoading,
  isSource,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };
  
  const placeholderText = isSource ? "Enter text or use the microphone..." : "Translation";

  return (
    <div className="bg-slate-800 rounded-lg p-4 flex flex-col h-full border border-slate-700 shadow-lg">
      <h2 className="text-lg font-semibold text-sky-400 mb-2">{language}</h2>
      <div className="relative flex-grow">
        <textarea
          id={id}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={placeholderText}
          readOnly={!isSource && !isLoading}
          className={`w-full h-48 sm:h-56 bg-transparent text-slate-200 resize-none focus:outline-none placeholder-slate-500 ${isLoading && !isSource ? 'opacity-50' : ''}`}
        />
         {isLoading && !isSource && (
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-sky-400"></div>
           </div>
         )}
      </div>
      <div className="border-t border-slate-700 pt-3 mt-auto flex items-center gap-2">
        <button
            onClick={onPlayAudio}
            disabled={!text.trim() || isLoading}
            className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Listen to text"
        >
            <SpeakerIcon />
        </button>
        {isSource && onRecord && (
            <button
                onClick={onRecord}
                className={`p-2 rounded-full hover:bg-slate-700 transition-colors ${isRecording ? 'bg-red-500/50 text-red-300' : ''}`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
                <MicIcon recording={isRecording} />
            </button>
        )}
        <div className="flex-grow"></div>
        <button
            onClick={handleCopy}
            disabled={!text.trim()}
            className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Copy text"
        >
            <CopyIcon />
        </button>
      </div>
    </div>
  );
};

export default TranslationPanel;
