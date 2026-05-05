export interface Lesson {
  id: string;
  title: string;
  duration: string;
  progress: number;
  category: string;
  emoji: string;
}

export const KIDS_LESSONS: Lesson[] = [
  // --- Body Safety & Autonomy ---
  { 
    id: "k1", 
    title: "My Body Belongs to Me", 
    duration: "4 min", 
    progress: 100, 
    category: "Body Safety", 
    emoji: "🧸" 
  },
  { 
    id: "k2", 
    title: "Safe Touches & Unsafe Touches", 
    duration: "6 min", 
    progress: 65, 
    category: "Awareness", 
    emoji: "🤗" 
  },
  { 
    id: "k6", 
    title: "The Swimming Suit Rule", 
    duration: "5 min", 
    progress: 0, 
    category: "Body Safety", 
    emoji: "🩱" 
  },
  { 
    id: "k13", 
    title: "My Personal Space Bubble", 
    duration: "4 min", 
    progress: 0, 
    category: "Privacy", 
    emoji: "🫧" 
  },
  { 
    id: "k20", 
    title: "My Private Parts are Private", 
    duration: "5 min", 
    progress: 0, 
    category: "Body Safety", 
    emoji: "🔒" 
  },

  // --- Safe Circle & Communication ---
  { 
    id: "k3", 
    title: "Who Are My Trusted Grown-ups?", 
    duration: "5 min", 
    progress: 30, 
    category: "Safe Circle", 
    emoji: "👨‍👩‍👧" 
  },
  { 
    id: "k7", 
    title: "Secrets vs. Surprises", 
    duration: "4 min", 
    progress: 0, 
    category: "Awareness", 
    emoji: "🎁" 
  },
  { 
    id: "k8", 
    title: "How to Use My 'Big Voice'", 
    duration: "3 min", 
    progress: 0, 
    category: "Safety Skills", 
    emoji: "📣" 
  },
  { 
    id: "k15", 
    title: "The 'Keep Telling' Rule", 
    duration: "4 min", 
    progress: 0, 
    category: "Safety Skills", 
    emoji: "🔄" 
  },
  { 
    id: "k19", 
    title: "Telling a Safe Adult", 
    duration: "5 min", 
    progress: 0, 
    category: "Safe Circle", 
    emoji: "🗣️" 
  },

  // --- Awareness & Instincts ---
  { 
    id: "k9", 
    title: "Listening to My Tummy Feelings", 
    duration: "4 min", 
    progress: 0, 
    category: "Instincts", 
    emoji: "🦋" 
  },
  { 
    id: "k11", 
    title: "What is a Tricky Person?", 
    duration: "6 min", 
    progress: 0, 
    category: "Awareness", 
    emoji: "🕵️" 
  },
  { 
    id: "k14", 
    title: "Tricky Favors", 
    duration: "5 min", 
    progress: 0, 
    category: "Awareness", 
    emoji: "🍭" 
  },

  // --- Emotions & Confidence ---
  { 
    id: "k4", 
    title: "Big Feelings Are Okay", 
    duration: "3 min", 
    progress: 10, 
    category: "Emotions", 
    emoji: "🌈" 
  },
  { 
    id: "k5", 
    title: "Saying NO is Brave", 
    duration: "4 min", 
    progress: 0, 
    category: "Confidence", 
    emoji: "🦁" 
  },
  { 
    id: "k17", 
    title: "Breathing Like a Hero", 
    duration: "3 min", 
    progress: 0, 
    category: "Emotions", 
    emoji: "🧘" 
  },
  { 
    id: "k18", 
    title: "I Am a Body Boss", 
    duration: "5 min", 
    progress: 0, 
    category: "Confidence", 
    emoji: "👑" 
  },

  // --- Digital & Social Safety ---
  { 
    id: "k10", 
    title: "Being Kind to Friends Online", 
    duration: "5 min", 
    progress: 0, 
    category: "Digital Safety", 
    emoji: "🎮" 
  },
  { 
    id: "k12", 
    title: "Asking Before I Share", 
    duration: "3 min", 
    progress: 0, 
    category: "Privacy", 
    emoji: "📱" 
  },
  { 
    id: "k16", 
    title: "Game Chat Safety", 
    duration: "5 min", 
    progress: 0, 
    category: "Digital Safety", 
    emoji: "🕹️" 
  },
];