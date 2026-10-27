export interface Lesson {
  id: string;
  title: string;
  duration: string;
  progress: number;
  category: string;
  emoji: string;
}

export const YOUNG_ADULT_LESSONS: Lesson[] = [
  { 
    id: "ya1", 
    title: "Setting Boundaries: Work, Friends & Dating", 
    duration: "10 min", 
    progress: 80, 
    category: "Personal Growth", 
    emoji: "🛡️" 
  },
  { 
    id: "ya2", 
    title: "Navigating Consent in Adult Relationships", 
    duration: "12 min", 
    progress: 45, 
    category: "Relationships", 
    emoji: "🤝" 
  },
  { 
    id: "ya3", 
    title: "Reproductive Health & Family Planning", 
    duration: "15 min", 
    progress: 100, 
    category: "Health", 
    emoji: "🩺" 
  },
  { 
    id: "ya4", 
    title: "Spotting Red Flags in Modern Dating", 
    duration: "11 min", 
    progress: 20, 
    category: "Safety", 
    emoji: "🚩" 
  },
  { 
    id: "ya5", 
    title: "Managing Burnout & Imposter Syndrome", 
    duration: "14 min", 
    progress: 0, 
    category: "Mental Health", 
    emoji: "🧠" 
  },
];