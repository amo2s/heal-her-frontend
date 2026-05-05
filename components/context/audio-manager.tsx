'use client';

import { useSyncExternalStore } from 'react';
import { Howl, Howler } from 'howler';

// --- TYPES ---
export type SfxType = 'yay' | 'boing' | 'click';
export type MoodType = 'happy' | 'gentle' | 'neutral';

interface AudioState {
  voiceEnabled: boolean;
  isMuted: boolean;
}

type Listener = (state: AudioState) => void;

// --- CONSTANTS ---
const VOICE_STORAGE_KEY = '@heal-her:buddy-voice-enabled';

const ASSETS: Record<SfxType, string> = {
  yay: 'https://res.cloudinary.com/dysqtpzox/video/upload/v1777595366/yay.mp3_lil7ov.mp3',
  boing: 'https://res.cloudinary.com/dysqtpzox/video/upload/v1777595365/boing.mp3_xktwrm.mp3',
  click: 'https://res.cloudinary.com/dysqtpzox/video/upload/v1777595881/click_vfqqid.wav',
};

// --- SINGLETON CLASS ---
class AudioEngine {
  private static instance: AudioEngine;
  private sfxMap: Map<SfxType, Howl> = new Map();
  private voices: SpeechSynthesisVoice[] = [];
  
  // Memory lock for the garbage collector
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  
  // Reactive State
  private state: AudioState = {
    voiceEnabled: false, 
    isMuted: false,
  };
  private listeners: Set<Listener> = new Set();

  private constructor() {
    if (typeof window === 'undefined') return;

    try {
      const savedPref = localStorage.getItem(VOICE_STORAGE_KEY);
      if (savedPref !== null) {
        this.state.voiceEnabled = savedPref === 'true';
      }
    } catch (e) {
      console.warn("Local storage access denied.");
    }

    Object.entries(ASSETS).forEach(([key, url]) => {
      this.sfxMap.set(key as SfxType, new Howl({
        src: [url],
        preload: true,
        volume: 0.5,
        html5: false, 
      }));
    });

    const loadVoices = () => {
      this.voices = window.speechSynthesis.getVoices();
    };
    
    setTimeout(loadVoices, 50); 
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  public getState = () => this.state;

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  public toggleVoice = () => {
    const nextState = !this.state.voiceEnabled;
    this.state = { ...this.state, voiceEnabled: nextState };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(VOICE_STORAGE_KEY, String(nextState));
    }
    
    this.notify();

    if (this.state.voiceEnabled) {
      this.triggerHaptic('toggle');
      this.playSfx('yay'); 
      
      if (typeof window !== 'undefined' && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
      }
      setTimeout(() => this.speak("Heal Buddy is ready!", 'happy'), 300);
    } else {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
        this.activeUtterance = null;
      }
      this.triggerHaptic('click');
    }
  };

  public toggleMute = () => {
    this.state = { ...this.state, isMuted: !this.state.isMuted };
    Howler.mute(this.state.isMuted);
    this.notify();
  };

  public playSfx = (type: SfxType) => {
    if (this.state.isMuted) return;

    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume();
    }

    const sound = this.sfxMap.get(type);
    if (sound) sound.play();
    this.triggerHaptic(type);
  };

  /**
   * REFINED: Returns a Promise that resolves when the speech has finished.
   * This allows for "await speak(...)" logic in your components.
   */
  public speak = (text: string, mood: MoodType = 'neutral', forcePlay: boolean = false): Promise<void> => {
    return new Promise((resolve) => {
      if ((!this.state.voiceEnabled && !forcePlay) || typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      // Aggressively clear and wake up the engine
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      this.activeUtterance = new SpeechSynthesisUtterance(text);
      
      // Dynamic Tone Matrix
      switch (mood) {
        case 'happy':
          this.activeUtterance.pitch = 1.4;
          this.activeUtterance.rate = 1.0;
          break;
        case 'gentle':
          this.activeUtterance.pitch = 0.9;
          this.activeUtterance.rate = 0.85;
          break;
        default:
          this.activeUtterance.pitch = 1.1;
          this.activeUtterance.rate = 0.95;
      }

      if (this.voices.length === 0) {
        this.voices = window.speechSynthesis.getVoices();
      }

      const friendlyVoice = this.voices.find(v => 
        v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')
      );
      
      if (friendlyVoice) {
        this.activeUtterance.voice = friendlyVoice;
      } else if (this.voices.length > 0) {
        this.activeUtterance.voice = this.voices[0]; 
      }

      // SMART EVENT: Resolve promise when speaking ends
      this.activeUtterance.onend = () => {
        this.activeUtterance = null;
        resolve();
      };
      
      // SMART EVENT: Resolve on error so the app doesn't hang
      this.activeUtterance.onerror = (e) => {
        console.warn("Speech API Error:", e);
        this.activeUtterance = null;
        window.speechSynthesis.cancel();
        resolve();
      };

      window.speechSynthesis.speak(this.activeUtterance);
    });
  };

  private triggerHaptic(type: SfxType | 'toggle') {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;
    
    switch (type) {
      case 'yay':
        navigator.vibrate([100, 50, 100]); 
        break;
      case 'boing':
        navigator.vibrate(50); 
        break;
      case 'toggle':
      case 'click':
        navigator.vibrate(20); 
        break;
    }
  }
}

export function useAudio() {
  const engine = AudioEngine.getInstance();
  
  const state = useSyncExternalStore(
    engine.subscribe,
    engine.getState,
    engine.getState 
  );

  return {
    voiceEnabled: state.voiceEnabled,
    isMuted: state.isMuted,
    toggleVoice: engine.toggleVoice,
    toggleMute: engine.toggleMute,
    playSfx: engine.playSfx,
    speak: engine.speak,
  };
}