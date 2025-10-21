// FIX: Add global declarations for browser-specific APIs not in standard TS types.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { translateText, generateSpeech, getAiClient } from './services/geminiService';
import { SUPPORTED_LANGUAGES } from './constants';
import { decode, decodeAudioData } from './utils/audio';
import { useDebounce } from './utils/hooks';
import SwapIcon from './components/icons/SwapIcon';
import TranslationPanel from './components/TranslationPanel';
import LanguageSelector from './components/LanguageSelector';
import { type Language } from './types';

const App: React.FC = () => {
    const [sourceLang, setSourceLang] = useState<string>('auto');
    const [targetLang, setTargetLang] = useState<string>('pt-BR');
    const [inputText, setInputText] = useState<string>('');
    const [outputText, setOutputText] = useState<string>('');
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const debouncedInputText = useDebounce(inputText, 500);
    const recognitionRef = useRef<any | null>(null);
    const finalTranscriptRef = useRef<string>('');
    const startRecAfterSwap = useRef(false);

    const handleTranslate = useCallback(async (textToTranslate: string) => {
        if (!textToTranslate.trim()) {
            setOutputText('');
            return;
        }
        setError(null);
        setIsLoading(true);
        setOutputText('');

        try {
            const sourceLangName = SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || 'Auto Detect';
            const targetLangName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || 'Portuguese';
            const translated = await translateText(textToTranslate, sourceLangName, targetLangName);
            setOutputText(translated);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Translation failed: ${errorMessage}`);
            setOutputText('');
        } finally {
            setIsLoading(false);
        }
    }, [sourceLang, targetLang]);

    useEffect(() => {
        handleTranslate(debouncedInputText);
    }, [debouncedInputText, handleTranslate]);
    
    const playAudio = useCallback(async (textToPlay: string) => {
        if (!textToPlay.trim()) return;
        let outputAudioContext: AudioContext | null = null;
        setError(null);
        try {
            const audioData = await generateSpeech(textToPlay);
            outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = outputAudioContext.createGain();
            outputNode.connect(outputAudioContext.destination);

            const audioBuffer = await decodeAudioData(
                decode(audioData),
                outputAudioContext,
                24000, 1
            );
            
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputNode);
            source.onended = () => {
                outputAudioContext?.close().catch(console.error);
            };
            source.start();

        } catch (err) {
            console.error("Error during audio playback:", err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Audio playback failed: ${errorMessage}`);
            outputAudioContext?.close().catch(console.error);
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            startRecognition();
        }
    };

    const startRecognition = () => {
        if (recognitionRef.current) {
            finalTranscriptRef.current = '';
            setInputText(''); // Clear text on new recording
            setOutputText('');
            recognitionRef.current.lang = sourceLang === 'auto' ? 'en-US' : sourceLang; // SpeechRecognition needs a concrete lang
            recognitionRef.current.start();
        }
    };
    
    useEffect(() => {
        // This effect starts recording after languages have been swapped by `handleTargetRecord`
        if (startRecAfterSwap.current) {
            startRecAfterSwap.current = false;
            toggleRecording();
        }
    }, [sourceLang, targetLang]); // Depends on state change to fire after re-render

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setError(`Speech recognition error: ${event.error}`);
            setIsRecording(false);
        };
        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscriptRef.current += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setInputText(finalTranscriptRef.current + interimTranscript);
        };
        
        recognitionRef.current = recognition;

        return () => recognition.abort();
    }, [sourceLang]);

    const handleSwapLanguages = () => {
        if (sourceLang === 'auto') return;

        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        
        setInputText(outputText);
        setOutputText(inputText);
    };

    const handleTargetRecord = () => {
        if (isRecording) {
            toggleRecording();
            return;
        }
        if (sourceLang === 'auto') return; // Should be disabled, but as a safeguard.

        startRecAfterSwap.current = true; // Set flag to start recording after state update
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        setInputText('');
        setOutputText('');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
            <div className="w-full max-w-5xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 tracking-tight">Ayla Translator</h1>
                </header>

                <main className="bg-white rounded-2xl shadow-xl border border-gray-200/80 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4 sm:gap-4 flex-wrap">
                        <div className="w-full sm:w-auto flex-1">
                            <select
                                value={sourceLang}
                                onChange={(e) => setSourceLang(e.target.value)}
                                className="w-full bg-gray-100 border-transparent text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 appearance-none text-center sm:text-left font-medium"
                                aria-label="Select source language"
                            >
                                {SUPPORTED_LANGUAGES.map((lang: Language) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.flag} {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button 
                            onClick={handleSwapLanguages}
                            className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Swap languages"
                            disabled={sourceLang === 'auto'}
                        >
                            <SwapIcon />
                        </button>

                        <LanguageSelector selectedLanguage={targetLang} onLanguageChange={setTargetLang} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <TranslationPanel
                            id="source-panel"
                            text={inputText}
                            onTextChange={setInputText}
                            onRecord={toggleRecording}
                            isRecording={isRecording}
                            placeholder="Enter text or use microphone"
                            isSource={true}
                            onPlayAudio={() => playAudio(inputText)}
                        />
                        <TranslationPanel
                            id="target-panel"
                            text={outputText}
                            onPlayAudio={() => playAudio(outputText)}
                            isLoading={isLoading}
                            placeholder="Translation"
                            isSource={false}
                            onRecord={handleTargetRecord}
                            isRecording={isRecording}
                            isTargetMicDisabled={sourceLang === 'auto'}
                        />
                    </div>
                     {error && <div className="mt-4 p-3 bg-red-100 text-red-700 text-center text-sm rounded-lg">{error}</div>}
                </main>

                <footer className="text-center mt-8 text-sm text-gray-400">
                    <p>Powered by Google Gemini</p>
                </footer>
            </div>
        </div>
    );
};

export default App;