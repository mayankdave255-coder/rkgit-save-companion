import { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../types';

export function useSpeechSynthesis() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const stepsRef = useRef<string[]>([]);
  const currentLangRef = useRef<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentStepIndex(-1);
  }, []);

  const speakText = useCallback((text: string, lang: Language = 'en', onEnd?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95; // Slightly slower for clear emergency guidance
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const playSequence = useCallback((steps: string[], lang: Language = 'en', startIndex: number = 0) => {
    if (!steps.length || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    stepsRef.current = steps;
    currentLangRef.current = lang;
    setIsPlaying(true);

    const speakIndex = (index: number) => {
      if (index >= steps.length) {
        setIsPlaying(false);
        setCurrentStepIndex(-1);
        return;
      }

      setCurrentStepIndex(index);
      const textToSpeak = steps[index];
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.92;

      utterance.onend = () => {
        // Pause 750ms between steps
        setTimeout(() => {
          speakIndex(index + 1);
        }, 750);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentStepIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakIndex(startIndex);
  }, []);

  return {
    isSupported,
    isPlaying,
    currentStepIndex,
    speakText,
    playSequence,
    stop,
  };
}
