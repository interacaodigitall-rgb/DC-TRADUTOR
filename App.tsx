// FIX: Add global declarations for browser-specific APIs not in standard TS types.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { translateText, generateSpeech } from './services/geminiService';
import { SUPPORTED_LANGUAGES } from './constants';
import { decode, decodeAudioData } from './utils/audio';
import MicIcon from './components/icons/MicIcon';
import Flag from './components/Flag';
import LanguageModal from './components/LanguageModal';
import ChatBubble from './components/ChatBubble';

interface Message {
    id: number;
    text: string;
    isSourceLanguage: boolean;
    isLoading?: boolean;
}

const App: React.FC = () => {
    const [sourceLang, setSourceLang] = useState<string>('pt-BR');
    const [targetLang, setTargetLang] = useState<string>('en-US');
    const [conversation, setConversation] = useState<Message[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState<string>('');
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalTarget, setModalTarget] = useState<'source' | 'target'>('source');
    const [activeInput, setActiveInput] = useState<'source' | 'target'>('source');

    const recognitionRef = useRef<any | null>(null);
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const finalTranscriptAggregatedRef = useRef<string>('');

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, currentTranscript]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscriptAggregatedRef.current += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setCurrentTranscript(interimTranscript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setError(`Speech recognition error: ${event.error}`);
            setIsRecording(false);
        };
        
        recognition.onend = () => {
            setIsRecording(false);
            const finalTranscript = finalTranscriptAggregatedRef.current.trim();
            if (finalTranscript) {
              handleTranslationAndSpeech(finalTranscript, activeInput);
            }
            finalTranscriptAggregatedRef.current = '';
            setCurrentTranscript('');
        };
        
        recognitionRef.current = recognition;
    }, []);

    const handleTranslationAndSpeech = useCallback(async (text: string, direction: 'source' | 'target') => {
        setError(null);
        
        const isSourceToTarget = direction === 'source';
        const fromLangCode = isSourceToTarget ? sourceLang : targetLang;
        const toLangCode = isSourceToTarget ? targetLang : sourceLang;
        const fromLangName = SUPPORTED_LANGUAGES.find(l => l.code === fromLangCode)?.name || 'auto';
        const toLangName = SUPPORTED_LANGUAGES.find(l => l.code === toLangCode)?.name || 'the target language';
        
        const userMessage: Message = {
            id: Date.now(),
            text,
            isSourceLanguage: isSourceToTarget,
        };
        const translationPlaceholder: Message = {
            id: Date.now() + 1,
            text: '...',
            isSourceLanguage: !isSourceToTarget,
            isLoading: true,
        };

        setConversation(prev => [...prev, userMessage, translationPlaceholder]);

        try {
            const translated = await translateText(text, fromLangName, toLangName);
            
            setConversation(prev => prev.map(msg => 
                msg.id === translationPlaceholder.id 
                ? { ...msg, text: translated, isLoading: false } 
                : msg
            ));
            
            await handlePlayAudio(translated);
            setActiveInput(prev => prev === 'source' ? 'target' : 'source');

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Translation failed: ${errorMessage}`);
            setConversation(prev => prev.filter(msg => msg.id !== userMessage.id && msg.id !== translationPlaceholder.id));
        }
    }, [sourceLang, targetLang]);


    const handleRecord = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            if (recognitionRef.current) {
                finalTranscriptAggregatedRef.current = '';
                setCurrentTranscript('');
                recognitionRef.current.lang = activeInput === 'source' ? sourceLang : targetLang;
                recognitionRef.current.start();
                setIsRecording(true);
                setError(null);
            } else {
                 setError("Speech recognition is not available.");
            }
        }
    };
    
    const handlePlayAudio = async (textToPlay: string) => {
        if (!textToPlay.trim() || textToPlay === '...') return;
        try {
            const audioData = await generateSpeech(textToPlay);
            const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = outputAudioContext.createGain();
            outputNode.connect(outputAudioContext.destination);

            const audioBuffer = await decodeAudioData(
                decode(audioData),
                outputAudioContext,
                24000,
                1
            );
            
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputNode);
            source.start();
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Audio playback failed: ${errorMessage}`);
        }
    };

    const openLanguageModal = (target: 'source' | 'target') => {
        setModalTarget(target);
        setIsModalOpen(true);
    };

    const handleSelectLanguage = (langCode: string) => {
        if (modalTarget === 'source') {
            if (langCode !== sourceLang) {
                setConversation([]);
                setActiveInput('source');
            }
            setSourceLang(langCode);
        } else {
            if (langCode !== targetLang) {
                setConversation([]);
                setActiveInput('source');
            }
            setTargetLang(langCode);
        }
    };

    return (
        <div className="h-screen w-screen bg-white flex flex-col font-sans text-gray-800">
            <header className="text-center p-4 border-b bg-gray-50 flex-shrink-0">
                <h1 className="text-xl font-semibold text-gray-700">Translate</h1>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {conversation.length === 0 && !isRecording && !currentTranscript && (
                    <div className="m-auto text-center text-gray-400">
                        <p>Press the microphone to start</p>
                        <p>a conversation.</p>
                    </div>
                )}

                {conversation.map(msg => (
                    <ChatBubble 
                        key={msg.id}
                        text={msg.text} 
                        isSource={msg.isSourceLanguage} 
                        onPlayAudio={() => handlePlayAudio(msg.text)} 
                        isLoading={msg.isLoading} 
                    />
                ))}

                {isRecording && <div className="text-center text-blue-500 p-2 self-center bg-blue-50 rounded-lg">{currentTranscript || 'Listening...'}</div>}

                <div ref={chatEndRef} />
            </main>

            {error && <div className="p-2 bg-red-100 text-red-700 text-center text-sm flex-shrink-0">{error}</div>}

            <footer className="p-4 bg-gray-100 border-t flex-shrink-0">
                <div className="flex justify-evenly items-center">
                    <Flag langCode={sourceLang} onClick={() => openLanguageModal('source')} isActive={activeInput === 'source'} />
                    
                    <button onClick={handleRecord} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-lg ${isRecording ? 'bg-red-500 scale-110' : 'bg-blue-500'}`} aria-label={isRecording ? 'Stop recording' : 'Start recording'}>
                        <MicIcon recording={isRecording} />
                    </button>
                    
                    <Flag langCode={targetLang} onClick={() => openLanguageModal('target')} isActive={activeInput === 'target'} />
                </div>
            </footer>
            
            <LanguageModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectLanguage={handleSelectLanguage}
            />
        </div>
    );
};

export default App;