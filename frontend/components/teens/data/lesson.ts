export interface Lesson {
  id: string;
  title: string;
  duration: string;
  progress: number;
  category: string;
  emoji: string;
}

export const TEENS_LESSONS: Lesson[] = [
  { id: "t1", title: "Boundaries: Online & In Real Life", duration: "8 min", progress: 80, category: "Digital Safety", emoji: "🛡️" },
  { id: "t2", title: "Understanding Consent (Really)", duration: "10 min", progress: 45, category: "Relationships", emoji: "💬" },
  { id: "t3", title: "Your Cycle, Decoded", duration: "12 min", progress: 100, category: "Health", emoji: "🌙" },
  { id: "t4", title: "Spotting Manipulation in DMs", duration: "9 min", progress: 20, category: "Online Safety", emoji: "🔍" },
  { id: "t5", title: "Mental Health Toolkit", duration: "11 min", progress: 0, category: "Wellbeing", emoji: "🧠" },
];