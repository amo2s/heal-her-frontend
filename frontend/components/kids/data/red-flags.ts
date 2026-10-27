export interface RedFlag {
  term: string;
  category: "Manipulation" | "Pressure" | "Grooming" | "Privacy" | "Threat";
  riskLevel: "High" | "Critical";
  context: string;
}

export const KIDS_RED_FLAGS: RedFlag[] = [
  // --- Manipulation & Secrecy ---
  { 
    term: "secret", 
    category: "Manipulation", 
    riskLevel: "Critical",
    context: "Safe grown-ups do not ask kids to keep secrets from their parents." 
  },
  { 
    term: "don't tell", 
    category: "Manipulation", 
    riskLevel: "Critical",
    context: "Direct instruction to hide information from a trusted guardian." 
  },
  { 
    term: "just between us", 
    category: "Manipulation", 
    riskLevel: "High",
    context: "Creating false intimacy and isolating the child from their safe circle." 
  },
  { 
    term: "our little secret", 
    category: "Grooming", 
    riskLevel: "Critical",
    context: "A classic grooming phrase used to build a hidden bond." 
  },
  { 
    term: "delete this", 
    category: "Manipulation", 
    riskLevel: "High",
    context: "Attempting to destroy evidence of inappropriate conversations." 
  },

  // --- Privacy & Danger ---
  { 
    term: "where do you live", 
    category: "Privacy", 
    riskLevel: "Critical",
    context: "Strangers attempting to gather physical location data." 
  },
  { 
    term: "are you alone", 
    category: "Privacy", 
    riskLevel: "Critical",
    context: "Checking for parental supervision to find an opportunity for harm." 
  },
  { 
    term: "send a pic", 
    category: "Privacy", 
    riskLevel: "Critical",
    context: "Pressuring a child to send images, which violates digital boundaries." 
  },

  // --- Pressure & Coercion ---
  { 
    term: "you owe me", 
    category: "Pressure", 
    riskLevel: "High",
    context: "Using guilt or transactional behavior to force a child to do something." 
  },
  { 
    term: "don't be a baby", 
    category: "Pressure", 
    riskLevel: "High",
    context: "Bullying or shaming the child into ignoring their own boundaries." 
  },
  { 
    term: "if you really loved", 
    category: "Pressure", 
    riskLevel: "Critical",
    context: "Emotional blackmail used to force compliance." 
  },
  { 
    term: "i'll hurt myself", 
    category: "Threat", 
    riskLevel: "Critical",
    context: "Extreme emotional manipulation forcing the child to take responsibility for an adult's actions." 
  },

  // --- Grooming & Boundary Testing ---
  { 
    term: "no one else understands", 
    category: "Grooming", 
    riskLevel: "High",
    context: "Isolating the child emotionally by acting as their only ally." 
  },
  { 
    term: "you're so mature", 
    category: "Grooming", 
    riskLevel: "High",
    context: "Treating a child like an adult to blur appropriate age boundaries." 
  },
  { 
    term: "special connection", 
    category: "Grooming", 
    riskLevel: "High",
    context: "Making the child feel chosen or uniquely bonded to an unsafe adult." 
  }
];