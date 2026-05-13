export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  initials: string;
  trusted: boolean;
  description: string;
}

export const YOUNG_ADULT_CONTACTS: Contact[] = [
  // --- Family & Next of Kin ---
  { 
    id: "c1", 
    name: "Mom", 
    relation: "Primary Emergency Contact", 
    phone: "+234 (0) 800-000-0000", 
    initials: "M", 
    trusted: true,
    description: "First point of contact for major medical emergencies or severe personal crises."
  },
  { 
    id: "c2", 
    name: "Jessica (Roommate)", 
    relation: "Trusted Peer", 
    phone: "+234 (0) 801-111-1111", 
    initials: "J", 
    trusted: true,
    description: "Immediate local contact for day-to-day safety checks, late-night pickups, or lockouts."
  },

  // --- Health & Wellness Support ---
  { 
    id: "c3", 
    name: "Dr. Emily Chen", 
    relation: "Therapist / Counselor", 
    phone: "Clinic Office", 
    initials: "EC", 
    trusted: true,
    description: "Professional, confidential support for managing mental health, anxiety, and navigating adult stressors."
  },
  { 
    id: "c4", 
    name: "Women's Wellness Clinic", 
    relation: "Healthcare Provider", 
    phone: "+234 (0) 802-222-2222", 
    initials: "WC", 
    trusted: true,
    description: "Confidential reproductive health services, general wellness exams, and consultations."
  },
  { 
    id: "c5", 
    name: "Prof. Sarah Jenkins", 
    relation: "Academic Advisor / Mentor", 
    phone: "University Dept.", 
    initials: "SJ", 
    trusted: true,
    description: "Support for academic stress, career guidance, and connecting with institutional resources."
  },

  // --- Crisis & Emergency Services ---
  { 
    id: "c6", 
    name: "National Crisis Helpline", 
    relation: "24/7 Mental Health Crisis", 
    phone: "116", 
    initials: "CH", 
    trusted: true,
    description: "Free, confidential hotline for severe emotional distress, anxiety attacks, or depression."
  },
  { 
    id: "c7", 
    name: "Sexual Assault Support Network", 
    relation: "Specialized Advocacy", 
    phone: "Local SART number", 
    initials: "SN", 
    trusted: true,
    description: "Confidential crisis intervention, legal guidance, and medical advocacy for relationship abuse or assault."
  },
  { 
    id: "c8", 
    name: "Local Police / Emergency Dispatch", 
    relation: "Emergency Services", 
    phone: "112", 
    initials: "911", 
    trusted: true,
    description: "Immediate dispatch for physical threats, severe accidents, or urgent safety concerns."
  }
];