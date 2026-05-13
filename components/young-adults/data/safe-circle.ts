export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  initials: string;
  trusted: boolean;
}

export const TEENS_CONTACTS: Contact[] = [
  { 
    id: "c1", 
    name: "Mom", 
    relation: "Parent", 
    phone: "+1 (555) 220-1108", 
    initials: "M", 
    trusted: true 
  },
  { 
    id: "c2", 
    name: "Maya", 
    relation: "Best Friend", 
    phone: "+1 (555) 884-3321", 
    initials: "MA", 
    trusted: true 
  },
  { 
    id: "c3", 
    name: "School Counselor", 
    relation: "Professional Support", 
    phone: "+1 (555) 117-2240", 
    initials: "SC", 
    trusted: true 
  },
  { 
    id: "c4", 
    name: "Crisis Line", 
    relation: "24/7 Anonymous Support", 
    phone: "Text HOME to 741741", 
    initials: "CL", 
    trusted: true 
  },
];