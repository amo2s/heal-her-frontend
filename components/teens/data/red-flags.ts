export interface RedFlag {
  term: string;
  category: "Manipulation" | "Pressure" | "Grooming" | "Privacy" | "Threat";
  riskLevel: "High" | "Critical";
  context: string;
}

export const TEENS_RED_FLAGS: RedFlag[] = [
  // --- Grooming & Age-Gap Dynamics ---
  { 
    term: "you're so mature for your age", 
    category: "Grooming", 
    riskLevel: "Critical",
    context: "A classic tactic used by older individuals to flatter you while blurring appropriate age boundaries and making you feel 'chosen'." 
  },
  { 
    term: "no one else understands you", 
    category: "Grooming", 
    riskLevel: "High",
    context: "An isolation tactic designed to make you distance yourself from friends, family, and your support system." 
  },
  { 
    term: "our little secret", 
    category: "Grooming", 
    riskLevel: "Critical",
    context: "Creating a hidden bond. Safe adults and healthy partners do not require you to keep your relationship or conversations a secret." 
  },

  // --- Digital Privacy & Control ---
  { 
    term: "delete this", 
    category: "Manipulation", 
    riskLevel: "High",
    context: "Asking you to delete chats or use vanishing mode is often an attempt to destroy evidence of crossing boundaries." 
  },
  { 
    term: "send a pic", 
    category: "Privacy", 
    riskLevel: "Critical",
    context: "Pressuring you for photos. Once an image leaves your device, you lose control over it. You never 'owe' anyone a photo." 
  },
  { 
    term: "give me your passwords", 
    category: "Privacy", 
    riskLevel: "High",
    context: "Demanding access to your accounts or phone is a major sign of controlling behavior and jealousy, not love." 
  },
  { 
    term: "who are you texting", 
    category: "Privacy", 
    riskLevel: "High",
    context: "Constant surveillance or demanding to know who you are talking to indicates a lack of trust and a need for control." 
  },

  // --- Pressure, Coercion & Guilt ---
  { 
    term: "if you really loved me", 
    category: "Pressure", 
    riskLevel: "Critical",
    context: "Emotional blackmail. Using your feelings as leverage to force you into physical intimacy or breaking your boundaries." 
  },
  { 
    term: "don't be a prude", 
    category: "Pressure", 
    riskLevel: "High",
    context: "Shaming or mocking you to invalidate your comfort zone. A healthy partner respects your 'no' without arguing." 
  },
  { 
    term: "you owe me", 
    category: "Pressure", 
    riskLevel: "High",
    context: "Relationships are not transactions. Buying you dinner, giving you gifts, or spending time with you does not buy consent." 
  },
  { 
    term: "everyone else is doing it", 
    category: "Pressure", 
    riskLevel: "High",
    context: "Peer pressure used to normalize unsafe or uncomfortable behavior to force your compliance." 
  },

  // --- Gaslighting & Extreme Threats ---
  { 
    term: "you're overreacting", 
    category: "Manipulation", 
    riskLevel: "High",
    context: "Gaslighting. Dismissing your valid feelings or making you feel 'crazy' for setting a boundary or getting upset." 
  },
  { 
    term: "i'll hurt myself", 
    category: "Threat", 
    riskLevel: "Critical",
    context: "Weaponizing self-harm to trap you in a relationship or force you to do something. You are not responsible for their actions. Report this to an adult or professional immediately." 
  },
  { 
    term: "if you leave me, i'll", 
    category: "Threat", 
    riskLevel: "Critical",
    context: "Ultimatums and threats used to instill fear. This is abusive behavior and requires immediate safe exit planning." 
  }
];