'use client';

import { 
  createContext, 
  useCallback, 
  useContext, 
  useEffect, 
  useMemo, 
  useState, 
  type ReactNode 
} from "react";
import type { AgeGroup } from "@/data/heal";

interface HealState {
  nickname: string;
  age: number;
  group: AgeGroup;
  stealthMode: boolean;
  setUser: (nickname: string, age: number) => void;
  setStealth: (v: boolean) => void;
  toggleStealth: () => void;
}

export const groupFor = (age: number): AgeGroup =>
  age <= 12 ? "kids" : age <= 17 ? "teens" : "ya";

const HealCtx = createContext<HealState | null>(null);

const STORAGE_KEY = "heal-her-user";

export function HealProvider({ children }: { children: ReactNode }) {
  // Initial states match your React version
  const [nickname, setNickname] = useState("Sarah");
  const [age, setAge] = useState(16);
  const [stealthMode, setStealthMode] = useState(false);

  // Sync with localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.nickname) setNickname(parsed.nickname);
        if (typeof parsed.age === "number") setAge(parsed.age);
      }
    } catch (error) {
      console.error("Failed to load heal state:", error);
    }
  }, []);

  const setUser = useCallback((n: string, a: number) => {
    setNickname(n);
    setAge(a);
    try { 
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nickname: n, age: a })); 
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  }, []);

  // Global stealth keyboard shortcut: Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStealthMode((s) => !s);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<HealState>(() => ({
    nickname, 
    age, 
    group: groupFor(age), 
    stealthMode,
    setUser,
    setStealth: setStealthMode,
    toggleStealth: () => setStealthMode((s) => !s),
  }), [nickname, age, stealthMode, setUser]);

  return <HealCtx.Provider value={value}>{children}</HealCtx.Provider>;
}

export function useHeal() {
  const ctx = useContext(HealCtx);
  if (!ctx) {
    throw new Error("useHeal must be used inside HealProvider");
  }
  return ctx;
}