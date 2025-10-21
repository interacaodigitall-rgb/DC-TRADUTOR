import React from 'react';
import SpeakerIcon from './icons/SpeakerIcon';

interface ChatBubbleProps {
    text: string;
    isSource: boolean;
    onPlayAudio: () => void;
    isLoading?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ text, isSource, onPlayAudio, isLoading = false }) => {
    const bubbleClasses = isSource
        ? 'bg-blue-500 text-white self-end rounded-br-lg'
        : 'bg-gray-200 text-gray-800 self-start rounded-bl-lg';

    if (isLoading) {
        return (
             <div className="self-start p-4 my-1 flex items-center justify-center bg-gray-200 rounded-2xl rounded-bl-lg">
               <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-gray-400"></div>
             </div>
        );
    }

    return (
        <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl p-3 my-1 shadow flex items-end gap-2 ${bubbleClasses}`}>
            <p className="flex-1 break-words">{text}</p>
            <button
                onClick={onPlayAudio}
                className={`p-1 rounded-full transition-colors self-end ${isSource ? 'hover:bg-blue-600' : 'hover:bg-gray-300'}`}
                aria-label="Listen"
            >
                <SpeakerIcon isSource={isSource} />
            </button>
        </div>
    );
};

export default ChatBubble;
