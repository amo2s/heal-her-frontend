export interface Scenario {
  id: string;
  prompt: string;
  context: string;
  choices: { id: string; text: string; safe: boolean; explanation: string }[];
}

export const KIDS_SCENARIOS: Scenario[] = [
  // --- Physical Safety ---
  {
    id: "ks1",
    prompt: "A grown-up you don't know offers you candy if you come to their car to see a puppy.",
    context: "After-school pickup",
    choices: [
      { id: "a", text: "Go see the puppy quickly", safe: false, explanation: "Never go to a car with someone you don't know, even for a cute puppy. Always ask your safe grown-up first!" },
      { id: "b", text: "Say 'No thank you!' and run to your teacher", safe: true, explanation: "Great job! Saying no and finding a trusted adult right away is the safest thing to do." },
      { id: "c", text: "Stay and talk to them from a distance", safe: false, explanation: "It's best not to talk to people you don't know who are trying to get you to leave your safe spot. Walk away!" },
    ],
  },
  {
    id: "ks4",
    prompt: "You are playing at the park and a grown-up asks you to help them find their lost keys in the bushes.",
    context: "The Park",
    choices: [
      { id: "a", text: "Help them look for the keys", safe: false, explanation: "Grown-ups should ask other grown-ups for help, not kids. This is a 'Tricky Person' sign." },
      { id: "b", text: "Go find your parent or guardian immediately", safe: true, explanation: "Exactly. If a grown-up you don't know asks you for help, tell your safe adult right away." },
    ],
  },

  // --- Digital Boundaries ---
  {
    id: "ks2",
    prompt: "A friend you met in an online game asks you to keep a secret from your parents about what you talk about.",
    context: "Online Gaming",
    choices: [
      { id: "a", text: "Promise to keep the secret", safe: false, explanation: "Safe adults and friends will never ask you to keep secrets from your parents. This is a red flag!" },
      { id: "b", text: "Tell your parents and show them the message", safe: true, explanation: "Perfect! Keeping your parents in the loop about your online friends keeps you safe." },
      { id: "c", text: "Stop playing the game but don't tell anyone", safe: false, explanation: "Stopping is good, but telling a parent helps them protect you and maybe other kids too." },
    ],
  },
  {
    id: "ks7",
    prompt: "Someone in a game chat asks you for your real name and which school you go to.",
    context: "Game Chat",
    choices: [
      { id: "a", text: "Tell them your name but not your school", safe: false, explanation: "Never share your real name or where you go to school with people you meet online." },
      { id: "b", text: "Use your cool gamer nickname and don't share details", safe: true, explanation: "Smart move! Nicknames are for games; real names are for real-life friends and family." },
    ],
  },

  // --- Body Boundaries ---
  {
    id: "ks3",
    prompt: "An older cousin keeps tickling you even though you have yelled 'STOP' and 'NO'.",
    context: "Family Gathering",
    choices: [
      { id: "a", text: "Just keep laughing so they don't get mad", safe: false, explanation: "Even if it feels like a game, if you say stop, it must stop. Your body belongs to you!" },
      { id: "b", text: "Tell a trusted grown-up loudly that they won't stop", safe: true, explanation: "Yes! Using your 'Big Voice' to get help from a safe adult is the right choice." },
    ],
  },
  {
    id: "ks8",
    prompt: "A grown-up you know asks for a hug, but you don't feel like hugging right now.",
    context: "Visiting Family",
    choices: [
      { id: "a", text: "Give them a hug anyway to be polite", safe: false, explanation: "You don't have to hug anyone if you don't want to. You are the boss of your body!" },
      { id: "b", text: "Offer a high-five or a wave instead", safe: true, explanation: "Perfect. It's okay to say 'No hug, but here's a high-five!' instead." },
    ],
  },

  // --- Secrets vs. Surprises ---
  {
    id: "ks5",
    prompt: "A neighbor gives you a small toy and says, 'This is our little secret, don't tell your mom.'",
    context: "The Apartment Hallway",
    choices: [
      { id: "a", text: "Keep the toy and don't say anything", safe: false, explanation: "Remember: Surprises are happy and everyone finds out soon. Secrets that stay hidden can be unsafe." },
      { id: "b", text: "Give the toy back and tell your mom everything", safe: true, explanation: "Exactly. If someone tells you not to tell your parents, that is a secret you MUST tell." },
    ],
  },
  {
    id: "ks9",
    prompt: "Your teacher says, 'We are making a surprise card for your dad, don't tell him until Sunday!'",
    context: "At School",
    choices: [
      { id: "a", text: "This is a safe surprise", safe: true, explanation: "Correct! This is a surprise because everyone (including Dad) will know on Sunday. It's for fun!" },
      { id: "b", text: "This is a bad secret", safe: false, explanation: "Actually, this is just a fun surprise for a special day. Bad secrets are things people want you to hide forever." },
    ],
  },

  // --- Trusted Adults & Safety ---
  {
    id: "ks6",
    prompt: "You are at a friend's house and their older brother wants to show you a movie that makes you feel 'Uh-oh' in your tummy.",
    context: "Friend's House",
    choices: [
      { id: "a", text: "Watch it anyway so they don't call you a baby", safe: false, explanation: "Always listen to your 'Uh-oh' feeling. It's your body's way of telling you something isn't right." },
      { id: "b", text: "Say 'I don't like this' and go to another room", safe: true, explanation: "Great. You can also call your parents to come pick you up if you feel unsafe." },
    ],
  },
  {
    id: "ks10",
    prompt: "You get separated from your parents at the big grocery store. Who do you look for?",
    context: "Grocery Store",
    choices: [
      { id: "a", text: "Look for a worker with a name tag or a mom with kids", safe: true, explanation: "Smart thinking. Store workers and other moms are usually safe people to ask for help." },
      { id: "b", text: "Go out to the parking lot to look for your car", safe: false, explanation: "Never leave the building! Stay inside where it is safe and wait for the store to find your parents." },
    ],
  },

  // --- Personal Privacy ---
  {
    id: "ks11",
    prompt: "A grown-up at school wants to take a photo of you to post on their personal Facebook page.",
    context: "After School Club",
    choices: [
      { id: "a", text: "Smile for the photo", safe: false, explanation: "Grown-ups should always ask your parents before taking or posting your photo online." },
      { id: "b", text: "Say 'Please ask my mom first'", safe: true, explanation: "Perfect. Your photos are private, and it's okay to ask people to check with your parents first." },
    ],
  },
  {
    id: "ks12",
    prompt: "Someone asks you to show them what is under your clothes.",
    context: "The Playground",
    choices: [
      { id: "a", text: "Say 'No!' loudly and run to your safe adult", safe: true, explanation: "YES! Your private parts are private. No one should ask to see them or touch them." },
      { id: "b", text: "Do what they say so you don't get in trouble", safe: false, explanation: "You will NEVER be in trouble for saying NO to someone asking to see your private parts. Tell a safe adult immediately!" },
    ],
  },
];