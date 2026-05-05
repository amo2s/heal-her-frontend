export type AgeGroup = "kids" | "teens" | "ya";

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  progress: number;
  category: string;
  emoji: string;
}

export interface Scenario {
  id: string;
  prompt: string;
  context: string;
  choices: { id: string; text: string; safe: boolean; explanation: string }[];
}

export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  initials: string;
  trusted: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

export interface VideoItem {
  id: string;
  title: string;
  duration: string;
  presenter: string;
  topic: string;
  watched: number;
}

export const AGE_LABELS: Record<AgeGroup, string> = {
  kids: "Little Explorer",
  teens: "Bright Spark",
  ya: "Independent",
};

export const themeClass = (g: AgeGroup) =>
  g === "kids" ? "theme-kids" : g === "teens" ? "theme-teens" : "theme-ya";

/* ============== LESSONS ============== */
export const LESSONS: Record<AgeGroup, Lesson[]> = {
  kids: [
    { id: "k1", title: "My Body Belongs to Me", duration: "4 min", progress: 100, category: "Body Safety", emoji: "🧸" },
    { id: "k2", title: "Safe Touches & Unsafe Touches", duration: "6 min", progress: 60, category: "Awareness", emoji: "🤗" },
    { id: "k3", title: "Who Are My Trusted Grown-ups?", duration: "5 min", progress: 30, category: "Safe Circle", emoji: "👨‍👩‍👧" },
    { id: "k4", title: "Big Feelings Are Okay", duration: "3 min", progress: 0, category: "Emotions", emoji: "🌈" },
    { id: "k5", title: "Saying NO is Brave", duration: "4 min", progress: 0, category: "Confidence", emoji: "🦁" },
  ],
  teens: [
    { id: "t1", title: "Boundaries: Online & In Real Life", duration: "8 min", progress: 80, category: "Digital Safety", emoji: "🛡️" },
    { id: "t2", title: "Understanding Consent (Really)", duration: "10 min", progress: 45, category: "Relationships", emoji: "💬" },
    { id: "t3", title: "Your Cycle, Decoded", duration: "12 min", progress: 100, category: "Health", emoji: "🌙" },
    { id: "t4", title: "Spotting Manipulation in DMs", duration: "9 min", progress: 20, category: "Online Safety", emoji: "🔍" },
    { id: "t5", title: "Mental Health Toolkit", duration: "11 min", progress: 0, category: "Wellbeing", emoji: "🧠" },
  ],
  ya: [
    { id: "y1", title: "Workplace Harassment: Know Your Rights", duration: "14 min", progress: 65, category: "Workplace", emoji: "⚖️" },
    { id: "y2", title: "Reproductive Health Decisions", duration: "16 min", progress: 90, category: "Health", emoji: "🩺" },
    { id: "y3", title: "Financial Independence Basics", duration: "18 min", progress: 40, category: "Independence", emoji: "💼" },
    { id: "y4", title: "Recognizing Coercive Control", duration: "13 min", progress: 25, category: "Relationships", emoji: "🚩" },
    { id: "y5", title: "Safe Solo Travel Playbook", duration: "12 min", progress: 0, category: "Independence", emoji: "🗺️" },
  ],
};

/* ============== SCENARIOS ============== */
export const SCENARIOS: Record<AgeGroup, Scenario[]> = {
  kids: [
    {
      id: "ks1",
      prompt: "A grown-up you don't know offers you candy if you come to their car.",
      context: "After-school pickup",
      choices: [
        { id: "a", text: "Take the candy quickly", safe: false, explanation: "Strangers offering treats to lure you is a warning sign. Always say no and find a trusted adult." },
        { id: "b", text: "Say 'No thank you!' and run to a trusted grown-up", safe: true, explanation: "Yes! Saying no loud and clear, then finding help, keeps you safe." },
        { id: "c", text: "Just smile and stay quiet", safe: false, explanation: "Staying silent can feel safer but it isn't. Use your big voice and walk away." },
      ],
    },
    {
      id: "ks2",
      prompt: "Someone online you don't know asks you to keep a secret from your mom.",
      context: "On a game chat",
      choices: [
        { id: "a", text: "Promise to keep the secret", safe: false, explanation: "Trusted grown-ups never ask kids to hide things from family. Tell mom right away." },
        { id: "b", text: "Block them and tell a parent", safe: true, explanation: "Perfect! Telling a parent and blocking the user is the safest choice." },
        { id: "c", text: "Just log off and forget it", safe: false, explanation: "Logging off helps, but the grown-up needs to know so they can help." },
      ],
    },
    {
      id: "ks3",
      prompt: "Your cousin keeps tickling you even after you said stop.",
      context: "Family gathering",
      choices: [
        { id: "a", text: "Laugh it off so no one's upset", safe: false, explanation: "When you say stop, it should stop. Your body, your rules." },
        { id: "b", text: "Tell a trusted grown-up loudly", safe: true, explanation: "You did great. 'No' means no, even with family." },
        { id: "c", text: "Hide somewhere alone", safe: false, explanation: "Hiding doesn't fix it. Speak up to a safe grown-up." },
      ],
    },
  ],
  teens: [
    {
      id: "ts1",
      prompt: "Someone you've been chatting with for two weeks asks for a private photo.",
      context: "Instagram DMs",
      choices: [
        { id: "a", text: "Send it — they promised to delete it", safe: false, explanation: "Once a photo leaves your device, you lose all control. 'Promises' are a classic pressure tactic." },
        { id: "b", text: "Decline, screenshot, block, report", safe: true, explanation: "Spot on. Saying no, documenting, and reporting protects you and warns the platform." },
        { id: "c", text: "Send a 'fake' photo to be polite", safe: false, explanation: "You don't owe anyone a photo. Polite refusal is enough — your no is complete." },
      ],
    },
    {
      id: "ts2",
      prompt: "Your partner gets angry every time you hang out with friends without them.",
      context: "Three months in",
      choices: [
        { id: "a", text: "Stop seeing friends to keep the peace", safe: false, explanation: "Isolation is a major red flag of controlling behavior. You deserve a full life." },
        { id: "b", text: "Talk openly, set a boundary, watch the response", safe: true, explanation: "How they react to a boundary tells you everything. Healthy partners respect them." },
        { id: "c", text: "Hide your plans from them", safe: false, explanation: "Hiding feeds the dynamic. Honest boundaries — and a trusted adult if needed — are safer." },
      ],
    },
    {
      id: "ts3",
      prompt: "An older student offers you a ride home alone after a party.",
      context: "Late night, no other rides",
      choices: [
        { id: "a", text: "Accept, you've seen them around", safe: false, explanation: "Familiarity isn't safety. Most harm comes from people we 'sort of' know." },
        { id: "b", text: "Call a parent or use a rideshare with location shared", safe: true, explanation: "Smart. Sharing live location with someone you trust is a power move." },
        { id: "c", text: "Walk home alone instead", safe: false, explanation: "Walking alone late isn't ideal either. Always have a backup plan before you go out." },
      ],
    },
  ],
  ya: [
    {
      id: "ya1",
      prompt: "A senior coworker keeps making 'jokes' about your appearance in meetings.",
      context: "Workplace",
      choices: [
        { id: "a", text: "Laugh it off to keep the peace", safe: false, explanation: "Tolerating it normalizes the behavior. You have legal protections — use them." },
        { id: "b", text: "Document each instance with dates, then report to HR", safe: true, explanation: "Documentation is your strongest tool. Pair it with a formal report and consider external counsel." },
        { id: "c", text: "Confront them publicly", safe: false, explanation: "Public confrontation can be twisted against you. Document first, then escalate formally." },
      ],
    },
    {
      id: "ya2",
      prompt: "Your partner controls all finances and gives you an 'allowance.'",
      context: "Long-term relationship",
      choices: [
        { id: "a", text: "Accept it — they earn more", safe: false, explanation: "Financial control is a recognized form of abuse, regardless of who earns more." },
        { id: "b", text: "Open a private account, contact a DV resource line", safe: true, explanation: "Building a secret financial cushion and talking to a hotline is a textbook safe-exit step." },
        { id: "c", text: "Confront them and demand access", safe: false, explanation: "Direct confrontation before you have an exit plan can escalate the situation. Plan first." },
      ],
    },
    {
      id: "ya3",
      prompt: "A date you met online insists on picking you up at home for the first meeting.",
      context: "First date",
      choices: [
        { id: "a", text: "Share your address — they seem nice", safe: false, explanation: "Pushing past your stated preference on a first meeting is itself a warning sign." },
        { id: "b", text: "Meet in public, share live location with a friend", safe: true, explanation: "Public meeting + live location + a check-in time is the gold standard for first dates." },
        { id: "c", text: "Cancel and never date again", safe: false, explanation: "Caution is great; isolation isn't. Set boundaries, don't shut down your life." },
      ],
    },
  ],
};

/* ============== SAFE CIRCLE ============== */
export const CONTACTS: Record<AgeGroup, Contact[]> = {
  kids: [
    { id: "c1", name: "Mommy", relation: "Mom", phone: "Always nearby", initials: "M", trusted: true },
    { id: "c2", name: "Aunt Lisa", relation: "Aunt", phone: "+1 (555) 412-9087", initials: "AL", trusted: true },
    { id: "c3", name: "Mrs. Patel", relation: "Teacher", phone: "School line", initials: "MP", trusted: true },
    { id: "c4", name: "Officer Dan", relation: "School officer", phone: "School line", initials: "OD", trusted: true },
  ],
  teens: [
    { id: "c1", name: "Mom", relation: "Parent", phone: "+1 (555) 220-1108", initials: "M", trusted: true },
    { id: "c2", name: "Maya", relation: "Best friend", phone: "+1 (555) 884-3321", initials: "MA", trusted: true },
    { id: "c3", name: "Coach Reyes", relation: "Mentor", phone: "+1 (555) 117-2240", initials: "CR", trusted: true },
    { id: "c4", name: "Crisis Text Line", relation: "Hotline", phone: "Text HOME to 741741", initials: "CT", trusted: true },
  ],
  ya: [
    { id: "c1", name: "Priya Sharma", relation: "Sister", phone: "+1 (555) 902-7714", initials: "PS", trusted: true },
    { id: "c2", name: "Dr. Alvarez", relation: "OB-GYN", phone: "+1 (555) 660-2218", initials: "DA", trusted: true },
    { id: "c3", name: "Jordan Kim", relation: "Lawyer (employment)", phone: "+1 (555) 305-9920", initials: "JK", trusted: true },
    { id: "c4", name: "Nat'l DV Hotline", relation: "24/7 hotline", phone: "1-800-799-7233", initials: "DV", trusted: true },
  ],
};

/* ============== CHAT HISTORY (Consent example) ============== */
export const CHATS: Record<AgeGroup, ChatMessage[]> = {
  kids: [
    { id: "1", role: "assistant", text: "Hi friend! 🌟 Want to learn a really cool word today? It's called CONSENT.", time: "9:01 AM" },
    { id: "2", role: "user", text: "What is consent?", time: "9:01 AM" },
    { id: "3", role: "assistant", text: "Consent means asking first AND getting a happy 'yes!' before touching someone — even a hug! 🤗", time: "9:02 AM" },
    { id: "4", role: "user", text: "What if I don't want a hug?", time: "9:02 AM" },
    { id: "5", role: "assistant", text: "Then you can say 'No thank you!' Your body is YOURS. A high-five works too! ✋✨", time: "9:03 AM" },
  ],
  teens: [
    { id: "1", role: "assistant", text: "Hey Sarah 💜 You asked about consent earlier — want to go a little deeper today?", time: "10:14 AM" },
    { id: "2", role: "user", text: "yeah. like what counts as real consent?", time: "10:14 AM" },
    { id: "3", role: "assistant", text: "Real consent is FRIES: Freely given, Reversible, Informed, Enthusiastic, Specific. If any of those is missing — it isn't consent.", time: "10:15 AM" },
    { id: "4", role: "user", text: "what if someone says yes but seems unsure?", time: "10:15 AM" },
    { id: "5", role: "assistant", text: "Trust the unsure feeling. A hesitant yes isn't a real yes. Pause, check in, and it's always okay to stop.", time: "10:16 AM" },
  ],
  ya: [
    { id: "1", role: "assistant", text: "Good morning. You logged a question about consent in long-term relationships — want to explore it?", time: "08:32" },
    { id: "2", role: "user", text: "Yes. Does consent reset every time?", time: "08:32" },
    { id: "3", role: "assistant", text: "Yes — consent is ongoing and specific. Past agreement doesn't imply current or future consent. It can also be withdrawn at any moment without justification.", time: "08:33" },
    { id: "4", role: "user", text: "What about when intoxicated?", time: "08:33" },
    { id: "5", role: "assistant", text: "Legally and ethically, a person impaired by alcohol or drugs cannot give valid consent. If you're unsure, the answer is to wait.", time: "08:34" },
  ],
};

/* ============== VIDEOS ============== */
export const VIDEOS: Record<AgeGroup, VideoItem[]> = {
  kids: [
    { id: "v1", title: "The Underwear Rule (Animated)", duration: "3:24", presenter: "Safety Friends", topic: "Body Safety", watched: 100 },
    { id: "v2", title: "What is a Trusted Grown-up?", duration: "4:10", presenter: "Ms. Coco", topic: "Safe Circle", watched: 50 },
    { id: "v3", title: "Big Feelings Song 🎵", duration: "2:55", presenter: "Sunny Studio", topic: "Emotions", watched: 0 },
    { id: "v4", title: "Tricky People vs. Strangers", duration: "5:01", presenter: "Officer Bea", topic: "Awareness", watched: 0 },
  ],
  teens: [
    { id: "v1", title: "How Predators Groom — and How to Spot It", duration: "11:20", presenter: "Dr. Mira Khan", topic: "Online Safety", watched: 75 },
    { id: "v2", title: "Periods Without the Awkward", duration: "8:42", presenter: "Nurse Joy", topic: "Health", watched: 100 },
    { id: "v3", title: "Healthy vs. Toxic Relationships", duration: "13:11", presenter: "Therapist Lo", topic: "Relationships", watched: 30 },
    { id: "v4", title: "Anxiety: A Survival Guide", duration: "9:47", presenter: "Dr. Owens", topic: "Mental Health", watched: 0 },
  ],
  ya: [
    { id: "v1", title: "Filing a Workplace Harassment Complaint", duration: "16:08", presenter: "Atty. Carla Reyes", topic: "Legal", watched: 60 },
    { id: "v2", title: "Reproductive Rights: Country by Country", duration: "21:32", presenter: "Dr. Imani Bello", topic: "Health", watched: 100 },
    { id: "v3", title: "Building a Safe Solo Apartment", duration: "12:55", presenter: "Sgt. Daniels (ret.)", topic: "Independence", watched: 25 },
    { id: "v4", title: "Coercive Control: The Invisible Abuse", duration: "18:40", presenter: "Dr. Hana Park", topic: "Relationships", watched: 0 },
  ],
};

/* ============== RED FLAG ANALYZER ============== */
export const RED_FLAG_TERMS = [
  { term: "secret", category: "Manipulation" },
  { term: "don't tell", category: "Manipulation" },
  { term: "just between us", category: "Manipulation" },
  { term: "you owe me", category: "Pressure" },
  { term: "if you really loved", category: "Pressure" },
  { term: "no one else understands", category: "Grooming" },
  { term: "you're so mature", category: "Grooming" },
  { term: "send a pic", category: "Pressure" },
  { term: "delete this", category: "Manipulation" },
  { term: "i'll hurt myself", category: "Pressure" },
  { term: "special connection", category: "Grooming" },
  { term: "our little secret", category: "Grooming" },
];
