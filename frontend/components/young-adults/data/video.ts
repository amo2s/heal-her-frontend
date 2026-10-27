export interface VideoItem {
  id: string;
  title: string;
  duration: string;
  presenter: string;
  topic: string;
  watched: number;
}

export const YOUNG_ADULT_VIDEOS: VideoItem[] = [
  { 
    id: "yv1", 
    title: "Navigating Workplace Harassment: A Legal Guide", 
    duration: "16:08", 
    presenter: "Atty. Carla Reyes", 
    topic: "Legal & Career", 
    watched: 60 
  },
  { 
    id: "yv2", 
    title: "Reproductive Rights & Healthcare Access", 
    duration: "21:32", 
    presenter: "Dr. Imani Bello", 
    topic: "Health", 
    watched: 100 
  },
  { 
    id: "yv3", 
    title: "Solo Living: Fortifying Your First Apartment", 
    duration: "12:55", 
    presenter: "Sgt. Daniels (ret.)", 
    topic: "Independence", 
    watched: 25 
  },
  { 
    id: "yv4", 
    title: "Coercive Control: Recognizing Invisible Abuse", 
    duration: "18:40", 
    presenter: "Dr. Hana Park", 
    topic: "Relationships", 
    watched: 0 
  },
  { 
    id: "yv5", 
    title: "Financial Security: Spotting Identity & Rental Scams", 
    duration: "14:15", 
    presenter: "Marcus Thorne", 
    topic: "Finance", 
    watched: 10 
  },
  { 
    id: "yv6", 
    title: "Medical Self-Advocacy: Talking to Your Doctor", 
    duration: "10:45", 
    presenter: "Sarah Jenkins, RN", 
    topic: "Wellness", 
    watched: 0 
  },
  { 
    id: "yv7", 
    title: "Digital Footprint: Privacy for the Modern Professional", 
    duration: "13:20", 
    presenter: "Leo Chen", 
    topic: "Digital Safety", 
    watched: 45 
  }
];