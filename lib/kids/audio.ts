"use client"

import { MoodType } from "@/components/context/audio-manager"

/**
 * HEAL Her Advanced Audio Engine
 * Handles: Sentence-level chunking, Mood-based inflection, and Playback Queueing.
 */

class AudioEngine {
  private queue: string[] = []
  private isSpeaking: boolean = false
  private synth: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.synth = window.speechSynthesis
    }
  }

  // --- 1. MOOD MAPPER ---
  // Maps the child's emotion to specific voice parameters
  private getMoodSettings(mood: MoodType) {
    switch (mood) {
      case "happy":
        return { pitch: 1.2, rate: 1.0, volume: 1.0 }
      case "gentle":
        return { pitch: 0.9, rate: 0.85, volume: 0.8 }
      case "excited":
        return { pitch: 1.3, rate: 1.1, volume: 1.0 }
      default:
        return { pitch: 1.0, rate: 0.95, volume: 0.9 }
    }
  }

  // --- 2. SENTENCE SPLITTER ---
  // Splits streaming text into logical chunks for the voice to read
  private splitIntoSentences(text: string): string[] {
    // Regex matches ends of sentences but keeps the punctuation
    return text.match(/[^.!?]+[.!?]+/g) || [text]
  }

  // --- 3. QUEUE MANAGER ---
  public async speak(text: string, mood: MoodType = "neutral", interrupt: boolean = false) {
    if (!this.synth) return

    if (interrupt) {
      this.stop()
    }

    const sentences = this.splitIntoSentences(text)
    this.queue.push(...sentences)

    if (!this.isSpeaking) {
      this.processQueue(mood)
    }
  }

  private processQueue(mood: MoodType) {
    if (this.queue.length === 0 || !this.synth) {
      this.isSpeaking = false
      return
    }

    this.isSpeaking = true
    const nextText = this.queue.shift()
    if (!nextText) return

    const settings = this.getMoodSettings(mood)
    this.currentUtterance = new SpeechSynthesisUtterance(nextText)
    
    // Voice Selection (Heal Her "Big Sister" Voice)
    const voices = this.synth.getVoices()
    // Prefer "Google UK English Female" or "Microsoft Zira" for a gentle tone
    const preferredVoice = voices.find(v => 
      v.name.includes("Female") || v.name.includes("Google UK English")
    ) || voices[0]

    this.currentUtterance.voice = preferredVoice
    this.currentUtterance.pitch = settings.pitch
    this.currentUtterance.rate = settings.rate
    this.currentUtterance.volume = settings.volume

    this.currentUtterance.onend = () => {
      this.processQueue(mood)
    }

    this.currentUtterance.onerror = (event) => {
      console.error("Audio Engine Error:", event)
      this.isSpeaking = false
    }

    this.synth.speak(this.currentUtterance)
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel()
      this.queue = []
      this.isSpeaking = false
    }
  }

  public pause() {
    this.synth?.pause()
  }

  public resume() {
    this.synth?.resume()
  }
}

// Export as a singleton for the app
export const audioService = new AudioEngine()