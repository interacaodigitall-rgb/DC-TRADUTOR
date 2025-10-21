import React from 'react';
import CopyIcon from './icons/CopyIcon';
import MicIcon from './icons/MicIcon';
import SpeakerIcon from './icons/SpeakerIcon';

interface TranslationPanelProps {
  id: string;
  text: string;
  onTextChange?: (text: string) => void;
  onPlayAudio?: () => void;
  onRecord?: () => void;
  isRecording?: boolean;
  isLoading?: boolean;
  isSource: boolean;
  placeholder: string;
  isTargetMicDisabled?: boolean;
}

const TranslationPanel: React.FC<TranslationPanelProps> = ({
  id,
  text,
  onTextChange,
  onPlayAudio,
  onRecord,
  isRecording,
  isLoading,
  isSource,
  placeholder,
  isTargetMicDisabled,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex flex-col h-64 sm:h-80 border border-gray-200/80 shadow-inner relative">
      <div className="relative flex-grow">
        <textarea
          id={id}
          value={text}
          onChange={(e) => onTextChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={!isSource}
          className="w-full h-full bg-transparent text-gray-800 resize-none focus:outline-none placeholder-gray-400 text-lg"
          aria-label={isSource ? 'Source text' : 'Translated text'}
        />
         {isLoading && (
           <div className="absolute inset-0 flex items-center justify-center bg-white/50">
             <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
           </div>
         )}
      </div>
      <div className="border-t border-gray-200/80 pt-3 mt-auto flex items-center gap-2">
        {isSource ? (
            <>
                <button
                    onClick={onRecord}
                    className={`p-3 rounded-full transition-colors ${isRecording ? 'bg-red-500/20 text-red-600' : 'hover:bg-gray-200'}`}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    <MicIcon recording={isRecording ?? false} />
                </button>
                <button
                    onClick={onPlayAudio}
                    disabled={!text.trim()}
                    className="p-3 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Listen to text"
                >
                    <SpeakerIcon />
                </button>
            </>
        ) : (
            <>
                <button
                    onClick={onRecord}
                    className={`p-3 rounded-full transition-colors ${isRecording ? 'bg-red-500/20 text-red-600' : 'hover:bg-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording in this language'}
                    disabled={isTargetMicDisabled}
                >
                    <MicIcon recording={isRecording ?? false} />
                </button>
                <button
                    onClick={onPlayAudio}
                    disabled={!text.trim() || isLoading}
                    className="p-3 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Listen to text"
                >
                    <SpeakerIcon />
                </button>
                <div className="flex-grow"></div>
                <button
                    onClick={handleCopy}
                    disabled={!text.trim() || isLoading}
                    className="p-3 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Copy text"
                >
                    <CopyIcon />
                </button>
            </>
        )}
      </div>
    </div>
  );
};

export default TranslationPanel;