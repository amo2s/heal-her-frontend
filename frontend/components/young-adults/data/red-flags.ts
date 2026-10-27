export interface RedFlag {
  term: string;
  category: "Manipulation" | "Pressure" | "Grooming" | "Privacy" | "Threat" | "Financial" | "Reproductive";
  riskLevel: "High" | "Critical";
  context: string;
}

export const YOUNG_ADULT_RED_FLAGS: RedFlag[] = [
  // --- Coercive Control & Isolation ---
  { 
    term: "love bombing / intense early commitment", 
    category: "Manipulation", 
    riskLevel: "High",
    context: "Overwhelming you with affection, expensive gifts, or talk of 'soulmates' and marriage within days. This creates an emotional debt that makes it harder to say 'no' later." 
  },
  { 
    term: "alienating you from your support network", 
    category: "Manipulation", 
    riskLevel: "Critical",
    context: "Subtly critiquing your friends or family until you stop seeing them. Isolation is the first step an abuser takes to ensure you have nowhere to go if things turn violent." 
  },
  { 
    term: "monitoring your live location 24/7", 
    category: "Privacy", 
    riskLevel: "Critical",
    context: "Demanding you keep 'Find My' or GPS tracking on at all times. This isn't about safety—it's about digital surveillance and removing your autonomy." 
  },

  // --- Financial & Professional Abuse ---
  { 
    term: "financial transparency / shared accounts only", 
    category: "Financial", 
    riskLevel: "High",
    context: "Demanding your paychecks be deposited into an account you can't access, or monitoring every cent you spend. Financial dependence is a trap." 
  },
  { 
    term: "career sabotage", 
    category: "Pressure", 
    riskLevel: "High",
    context: "Making you miss work, starting fights before big interviews, or pressuring you to quit your job. They want you to lose your independent income." 
  },
  { 
    term: "quid pro quo at work", 
    category: "Threat", 
    riskLevel: "Critical",
    context: "A supervisor implying that your promotion, raise, or job security is dependent on 'after-hours' social or sexual favors. This is illegal harassment." 
  },

  // --- Sexual & Reproductive Coercion ---
  { 
    term: "stealthing / condom removal", 
    category: "Threat", 
    riskLevel: "Critical",
    context: "Non-consensual removal of a condom during sex. This is a form of sexual assault that puts your health and reproductive autonomy at grave risk." 
  },
  { 
    term: "reproductive pressure", 
    category: "Reproductive", 
    riskLevel: "Critical",
    context: "Sabotaging birth control, 'poking holes' in condoms, or pressuring you to get pregnant to 'prove your love.' This is a severe form of abuse." 
  },
  { 
    term: "sexual debt / 'i paid for dinner'", 
    category: "Pressure", 
    riskLevel: "High",
    context: "Treating intimacy as a transaction. Buying dinner, rent, or gifts never creates an obligation for sexual access." 
  },

  // --- Gaslighting & Psychological Control ---
  { 
    term: "that never happened / you're misremembering", 
    category: "Manipulation", 
    riskLevel: "Critical",
    context: "Gaslighting. Deliberately distorting reality to make you doubt your own memory, perception, and sanity so you rely on their version of the truth." 
  },
  { 
    term: "weaponizing self-harm", 
    category: "Threat", 
    riskLevel: "Critical",
    context: "Threatening to hurt themselves if you break up with them or set a boundary. This is emotional blackmail and is used to keep you hostage in the relationship." 
  },
  { 
    term: "checking your phone/emails without consent", 
    category: "Privacy", 
    riskLevel: "High",
    context: "Snooping or demanding passwords under the guise of 'honesty.' Privacy is a fundamental right in a healthy adult relationship." 
  },

  // --- Threats & Revenge Tactics ---
  { 
    term: "threats of revenge porn / image leaking", 
    category: "Threat", 
    riskLevel: "Critical",
    context: "Threatening to share intimate photos or videos if you leave or don't comply with demands. This is 'image-based sexual abuse' and is a criminal offense." 
  },
  { 
    term: "physical intimidation (hitting walls, throwing objects)", 
    category: "Threat", 
    riskLevel: "Critical",
    context: "Violence against property is a precursor to violence against people. It is a calculated display of power meant to terrify you into compliance." 
  },
  { 
    term: "accusing everyone of being 'toxic' or 'crazy'", 
    category: "Manipulation", 
    riskLevel: "High",
    context: "If every one of their ex-partners and former coworkers is 'the problem,' they are the common denominator. It signals a total lack of accountability." 
  }
];