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

interface ConversationTurn {
    id: number;
    sourceText: string;
    translatedText: string;
}

const App: React.FC = () => {
    const [sourceLang, setSourceLang] = useState<string>('pt-BR');
    const [targetLang, setTargetLang] = useState<string>('en-US');
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalTarget, setModalTarget] = useState<'source' | 'target'>('source');

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
        recognition.lang = sourceLang;

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            finalTranscriptAggregatedRef.current = finalTranscript;
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
              handleTranslationAndSpeech(finalTranscript);
            }
            finalTranscriptAggregatedRef.current = '';
            setCurrentTranscript('');
        };
        
        recognitionRef.current = recognition;
    }, [sourceLang]);

    const handleTranslationAndSpeech = useCallback(async (text: string) => {
        setIsLoading(true);
        setError(null);
        
        const tempId = Date.now();
        setConversation(prev => [...prev, {id: tempId, sourceText: text, translatedText: '...'}]);

        try {
            const sourceLanguage = SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || 'auto';
            const targetLanguage = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || 'the target language';
            const translated = await translateText(text, sourceLanguage, targetLanguage);

            setConversation(prev => prev.map(turn => turn.id === tempId ? { ...turn, translatedText: translated } : turn));
            
            await handlePlayAudio(translated);

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Translation failed: ${errorMessage}`);
            setConversation(prev => prev.filter(turn => turn.id !== tempId));
        } finally {
            setIsLoading(false);
        }
    }, [sourceLang, targetLang]);


    const handleRecord = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            if (recognitionRef.current) {
                finalTranscriptAggregatedRef.current = '';
                setCurrentTranscript('');
                recognitionRef.current.lang = sourceLang;
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
            if (langCode !== sourceLang) setConversation([]);
            setSourceLang(langCode);
        } else {
            if (langCode !== targetLang) setConversation([]);
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

                {conversation.map(turn => (
                    <React.Fragment key={turn.id}>
                        <ChatBubble text={turn.sourceText} isSource={true} onPlayAudio={() => handlePlayAudio(turn.sourceText)} />
                        <ChatBubble text={turn.translatedText} isSource={false} onPlayAudio={() => handlePlayAudio(turn.translatedText)} isLoading={turn.translatedText === '...'} />
                    </React.Fragment>
                ))}

                {isRecording && <div className="text-center text-blue-500 p-2 self-center bg-blue-50 rounded-lg">{currentTranscript || 'Listening...'}</div>}

                <div ref={chatEndRef} />
            </main>

            {error && <div className="p-2 bg-red-100 text-red-700 text-center text-sm flex-shrink-0">{error}</div>}

            <footer className="p-4 bg-gray-100 border-t flex-shrink-0">
                <div className="flex justify-evenly items-center">
                    <Flag langCode={sourceLang} onClick={() => openLanguageModal('source')} />
                    
                    <button onClick={handleRecord} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-lg ${isRecording ? 'bg-red-500 scale-110' : 'bg-blue-500'}`} aria-label={isRecording ? 'Stop recording' : 'Start recording'}>
                        <MicIcon recording={isRecording} />
                    </button>
                    
                    <Flag langCode={targetLang} onClick={() => openLanguageModal('target')} />
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