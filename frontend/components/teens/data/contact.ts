export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  initials: string;
  trusted: boolean;
  description: string;
}

export const KIDS_CONTACTS: Contact[] = [
  // --- Immediate Family ---
  { 
    id: "c1", 
    name: "Mommy", 
    relation: "Mom", 
    phone: "Always nearby", 
    initials: "M", 
    trusted: true,
    description: "Your number one safe grown-up. Tell her anything, anytime."
  },
  { 
    id: "c2", 
    name: "Daddy", 
    relation: "Dad", 
    phone: "+234 (0) 800-000-0000", 
    initials: "D", 
    trusted: true,
    description: "Call him if you feel unsafe or need someone to pick you up quickly."
  },
  { 
    id: "c3", 
    name: "Auntie Sarah", 
    relation: "Aunt", 
    phone: "+234 (0) 801-111-1111", 
    initials: "AS", 
    trusted: true,
    description: "Mommy's sister. A great safe grown-up if Mom and Dad are busy."
  },

  // --- School & Community Support ---
  { 
    id: "c4", 
    name: "Mrs. Patel", 
    relation: "Class Teacher", 
    phone: "School Office", 
    initials: "MP", 
    trusted: true,
    description: "Your teacher at school. Tell her if someone is being mean or tricky."
  },
  { 
    id: "c5", 
    name: "Nurse Joy", 
    relation: "School Nurse", 
    phone: "School Clinic", 
    initials: "NJ", 
    trusted: true,
    description: "Go to her if your tummy feels 'uh-oh' or if your body hurts."
  },
  { 
    id: "c6", 
    name: "Coach David", 
    relation: "Sports Coach", 
    phone: "After-school Club", 
    initials: "CD", 
    trusted: true,
    description: "A safe grown-up during after-school games and practice."
  },

  // --- Emergency & Official Help ---
  { 
    id: "c7", 
    name: "Child Helpline", 
    relation: "Emergency Safety", 
    phone: "116", 
    initials: "CH", 
    trusted: true,
    description: "A free number you can call anytime to talk to safe grown-ups who protect kids."
  },
  { 
    id: "c8", 
    name: "Local Police / Emergency", 
    relation: "Police", 
    phone: "112", 
    initials: "911", 
    trusted: true,
    description: "Only for big emergencies when you need help right away."
  }
];