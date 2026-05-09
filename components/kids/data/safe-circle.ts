export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  initials: string;
  trusted: boolean;
}

export const KIDS_CONTACTS: Contact[] = [
  { 
    id: "c1", 
    name: "Mommy", 
    relation: "Mom", 
    phone: "Always nearby", 
    initials: "M", 
    trusted: true 
  },
  { 
    id: "c2", 
    name: "Aunt Lisa", 
    relation: "Aunt", 
    phone: "+1 (555) 412-9087", 
    initials: "AL", 
    trusted: true 
  },
  { 
    id: "c3", 
    name: "Mrs. Patel", 
    relation: "Teacher", 
    phone: "School line", 
    initials: "MP", 
    trusted: true 
  },
  { 
    id: "c4", 
    name: "Officer Dan", 
    relation: "School officer", 
    phone: "School line", 
    initials: "OD", 
    trusted: true 
  },
];