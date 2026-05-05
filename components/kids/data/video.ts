export interface VideoItem {
  id: string;
  title: string;
  duration: string;
  presenter: string;
  topic: string;
  watched: number;
}

export const KIDS_VIDEOS: VideoItem[] = [
  // --- Body Safety & Boundaries ---
  { 
    id: "v1", 
    title: "The Underwear Rule (Animated)", 
    duration: "3:24", 
    presenter: "Safety Friends", 
    topic: "Body Safety", 
    watched: 100 
  },
  { 
    id: "v2", 
    title: "Consent for Kids: Can I give you a hug?", 
    duration: "4:15", 
    presenter: "Ms. Coco", 
    topic: "Boundaries", 
    watched: 85 
  },
  { 
    id: "v3", 
    title: "My Body is MINE! A Song about Autonomy", 
    duration: "2:50", 
    presenter: "Sunny Studio", 
    topic: "Body Safety", 
    watched: 0 
  },

  // --- Safe Circle & Finding Help ---
  { 
    id: "v4", 
    title: "What is a Trusted Grown-up?", 
    duration: "4:10", 
    presenter: "Ms. Coco", 
    topic: "Safe Circle", 
    watched: 50 
  },
  { 
    id: "v5", 
    title: "How to Tell a Secret That Hurts", 
    duration: "5:30", 
    presenter: "Dr. Bear", 
    topic: "Speaking Up", 
    watched: 20 
  },
  { 
    id: "v6", 
    title: "Finding Help When You're Lost", 
    duration: "4:45", 
    presenter: "Officer Dan", 
    topic: "Safe Circle", 
    watched: 0 
  },

  // --- Emotions & Well-being ---
  { 
    id: "v7", 
    title: "Big Feelings Song 🎵", 
    duration: "2:55", 
    presenter: "Sunny Studio", 
    topic: "Emotions", 
    watched: 100 
  },
  { 
    id: "v8", 
    title: "Breathing Like a Bear (Calm Down Exercise)", 
    duration: "3:40", 
    presenter: "Yoga for Little Ones", 
    topic: "Mindfulness", 
    watched: 60 
  },
  { 
    id: "v9", 
    title: "It's Okay to Be Mad (But Not Mean)", 
    duration: "5:15", 
    presenter: "Dr. Bear", 
    topic: "Emotions", 
    watched: 10 
  },

  // --- Situational Awareness ---
  { 
    id: "v10", 
    title: "Tricky People vs. Strangers", 
    duration: "5:01", 
    presenter: "Officer Bea", 
    topic: "Awareness", 
    watched: 0 
  },
  { 
    id: "v11", 
    title: "What to Do If You Get Separated", 
    duration: "4:20", 
    presenter: "Safety Friends", 
    topic: "Awareness", 
    watched: 0 
  },
  { 
    id: "v12", 
    title: "The 'Uh-Oh' Feeling in Your Tummy", 
    duration: "3:50", 
    presenter: "Ms. Coco", 
    topic: "Instincts", 
    watched: 40 
  },

  // --- Digital Basics ---
  { 
    id: "v13", 
    title: "Playing Safe on Tablets and Phones", 
    duration: "6:10", 
    presenter: "Techy Tim", 
    topic: "Digital Safety", 
    watched: 0 
  },
  { 
    id: "v14", 
    title: "Never Share Your Real Name Online", 
    duration: "4:30", 
    presenter: "Safety Friends", 
    topic: "Digital Safety", 
    watched: 0 
  },
  { 
    id: "v15", 
    title: "When a Game Asks for Money", 
    duration: "3:15", 
    presenter: "Techy Tim", 
    topic: "Digital Basics", 
    watched: 0 
  }
];