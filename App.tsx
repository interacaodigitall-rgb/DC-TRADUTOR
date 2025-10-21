// FIX: Add global declarations for browser-specific APIs not in standard TS types.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { translateText, generateSpeech, getAiClient, initializeAiClient } from './services/geminiService';
import { SUPPORTED_LANGUAGES } from './constants';
import { decode, decodeAudioData } from './utils/audio';
import MicIcon from './components/icons/MicIcon';
import Flag from './components/Flag';
import LanguageModal from './components/LanguageModal';
import ChatBubble from './components/ChatBubble';
import ApiKeyError from './components/ApiKeyError';

interface Message {
    id: number;
    text: string;
    isSourceLanguage: boolean;
    isLoading?: boolean;
}

const App: React.FC = () => {
    const [sourceLang, setSourceLang] = useState<string>('es-ES');
    const [targetLang, setTargetLang] = useState<string>('en-US');
    const [conversation, setConversation] = useState<Message[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState<string>('');
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalTarget, setModalTarget] = useState<'source' | 'target'>('source');
    const [activeInput, setActiveInput] = useState<'source' | 'target'>('source');
    const [conversationModeActive, setConversationModeActive] = useState<boolean>(false);
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);


    const recognitionRef = useRef<any | null>(null);
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const finalTranscriptAggregatedRef = useRef<string>('');

    useEffect(() => {
        try {
            getAiClient();
        } catch (err) {
            if (err instanceof Error) {
                setApiKeyError(err.message);
            } else {
                setApiKeyError("An unexpected error occurred on startup.");
            }
        }
    }, []);
    
    const handleApiKeySubmit = async (key: string) => {
        try {
            initializeAiClient(key);
            // Test the key with a simple API call to ensure it's valid.
            await translateText("hello", "English", "Portuguese");
            setApiKeyError(null); // Key is valid, clear error and render the app.
        } catch (err) {
            console.error("API Key validation failed:", err);
            setApiKeyError("A chave fornecida é inválida ou a API não respondeu. Verifique a chave e sua conexão de rede, e tente novamente.");
        }
    };


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, currentTranscript]);

    const playAudio = useCallback(async (textToPlay: string) => {
        if (!textToPlay.trim() || textToPlay === '...') return;
        let outputAudioContext: AudioContext | null = null;
        try {
            const audioData = await generateSpeech(textToPlay);
            outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = outputAudioContext.createGain();
            outputNode.connect(outputAudioContext.destination);

            const audioBuffer = await decodeAudioData(
                decode(audioData),
                outputAudioContext,
                24000,
                1
            );
            
            return new Promise<void>((resolve) => {
                const source = outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                source.onended = () => {
                    outputAudioContext?.close().catch(console.error);
                    resolve();
                };
                source.start();
            });
        } catch (err) {
            console.error("Error during audio playback:", err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Audio playback failed: ${errorMessage}`);
            outputAudioContext?.close().catch(console.error);
            throw err;
        }
    }, []);

    const handleTranslationAndSpeech = useCallback(async (text: string, direction: 'source' | 'target') => {
        if (!text.trim()) return;
        setError(null);
        
        const isSourceToTarget = direction === 'source';
        const fromLangCode = isSourceToTarget ? sourceLang : targetLang;
        const toLangCode = isSourceToTarget ? targetLang : sourceLang;
        const fromLangName = SUPPORTED_LANGUAGES.find(l => l.code === fromLangCode)?.name || 'auto';
        const toLangName = SUPPORTED_LANGUAGES.find(l => l.code === toLangCode)?.name || 'the target language';
        
        const userMessage: Message = { id: Date.now(), text, isSourceLanguage: true }; // User input is always "source" bubble color
        const translationPlaceholder: Message = { id: Date.now() + 1, text: '...', isSourceLanguage: false, isLoading: true };

        setConversation(prev => [...prev, userMessage, translationPlaceholder]);

        try {
            const translated = await translateText(text, fromLangName, toLangName);
            
            setConversation(prev => prev.map(msg => 
                msg.id === translationPlaceholder.id 
                ? { ...msg, text: translated, isLoading: false } 
                : msg
            ));
            
            // Await audio playback before proceeding
            await playAudio(translated);

            if (conversationModeActive) {
                // Switch language and continue recognition
                setActiveInput(prev => prev === 'source' ? 'target' : 'source');
            }

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Translation failed: ${errorMessage}`);
            // Clean up failed messages
            setConversation(prev => prev.filter(msg => msg.id !== userMessage.id && msg.id !== translationPlaceholder.id));
            setConversationModeActive(false);
        }
    }, [sourceLang, targetLang, conversationModeActive, playAudio]);

    const startRecognition = useCallback(() => {
        if (recognitionRef.current && !isRecording) {
            finalTranscriptAggregatedRef.current = '';
            setCurrentTranscript('');
            recognitionRef.current.lang = activeInput === 'source' ? sourceLang : targetLang;
            recognitionRef.current.start();
            setIsRecording(true);
            setError(null);
        }
    }, [activeInput, sourceLang, targetLang, isRecording]);

    const stopRecognition = useCallback(() => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    useEffect(() => {
        if (conversationModeActive) {
            startRecognition();
        } else {
            stopRecognition();
        }
    }, [conversationModeActive, activeInput, startRecognition, stopRecognition]);

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
            setConversationModeActive(false);
        };
        
        recognition.onend = () => {
            setIsRecording(false);
            const finalTranscript = finalTranscriptAggregatedRef.current.trim();
            if (finalTranscript) {
              handleTranslationAndSpeech(finalTranscript, activeInput);
            } else if (conversationModeActive) {
              startRecognition();
            }
            finalTranscriptAggregatedRef.current = '';
            setCurrentTranscript('');
        };
        
        recognitionRef.current = recognition;

        return () => {
            recognition.abort();
        };
    }, [activeInput, conversationModeActive, startRecognition, handleTranslationAndSpeech]);

    const toggleConversationMode = () => {
        setConversationModeActive(prev => !prev);
    };
    
    const openLanguageModal = (target: 'source' | 'target') => {
        setModalTarget(target);
        setIsModalOpen(true);
    };

    const handleSelectLanguage = (langCode: string) => {
        setConversationModeActive(false);
        setConversation([]);
        setActiveInput('source');
        if (modalTarget === 'source') {
            setSourceLang(langCode);
        } else {
            setTargetLang(langCode);
        }
    };

    const micButtonClasses = conversationModeActive
        ? 'bg-red-700 scale-110 animate-pulse'
        : 'bg-red-600';

    if (apiKeyError) {
        return <ApiKeyError onApiKeySubmit={handleApiKeySubmit} error={apiKeyError} />;
    }

    return (
        <div className="h-screen w-screen bg-[#FFF9F0] flex flex-col font-sans text-gray-800">
            <header className="text-center p-4 border-b border-gray-200 bg-white flex-shrink-0">
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
                        onPlayAudio={() => playAudio(msg.text)} 
                        isLoading={msg.isLoading} 
                    />
                ))}

                {isRecording && <div className="text-center text-red-600 p-2 self-center bg-red-50 rounded-lg">{currentTranscript || 'Listening...'}</div>}

                <div ref={chatEndRef} />
            </main>

            {error && <div className="p-2 bg-red-100 text-red-700 text-center text-sm flex-shrink-0">{error}</div>}

            <footer className="p-4 bg-white border-t flex-shrink-0">
                <div className="flex justify-evenly items-center">
                    <Flag langCode={sourceLang} onClick={() => openLanguageModal('source')} isActive={activeInput === 'source'} />
                    
                    <button onClick={toggleConversationMode} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-lg ${micButtonClasses}`} aria-label={conversationModeActive ? 'End conversation' : 'Start conversation'}>
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