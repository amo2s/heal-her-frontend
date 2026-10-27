export interface VideoItem {
  id: string;
  title: string;
  duration: string;
  presenter: string;
  topic: string;
  watched: number;
}

export const TEENS_VIDEOS: VideoItem[] = [
  { id: "v1", title: "How Predators Groom — and How to Spot It", duration: "11:20", presenter: "Dr. Mira Khan", topic: "Online Safety", watched: 75 },
  { id: "v2", title: "Periods Without the Awkward", duration: "8:42", presenter: "Nurse Joy", topic: "Health", watched: 100 },
  { id: "v3", title: "Healthy vs. Toxic Relationships", duration: "13:11", presenter: "Therapist Lo", topic: "Relationships", watched: 30 },
  { id: "v4", title: "Anxiety: A Survival Guide", duration: "9:47", presenter: "Dr. Owens", topic: "Mental Health", watched: 0 },
];