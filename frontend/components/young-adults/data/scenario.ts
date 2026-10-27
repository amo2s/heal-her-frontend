export interface Scenario {
  id: string;
  prompt: string;
  context: string;
  choices: { id: string; text: string; safe: boolean; explanation: string }[];
}

export const YOUNG_ADULT_SCENARIOS: Scenario[] = [
  // --- LEVEL 1: Basic Independence, Solo Living & Travel (1-15) ---
  {
    id: "ya1",
    prompt: "You are moving into your first solo apartment. The landlord asks for your physical keys back 'just to make a quick copy' after you've already moved in.",
    context: "Apartment Leasing",
    choices: [
      { id: "a", text: "Give them the keys to be cooperative", safe: false, explanation: "Landlords should have their own master copies. Never hand over your only set of keys once you've taken possession of the unit." },
      { id: "b", text: "Politely decline and ask why they don't have their own copy", safe: true, explanation: "Setting a firm boundary regarding access to your home is crucial. Landlords must follow legal notice periods to enter." },
      { id: "c", text: "Leave the door unlocked for them later", safe: false, explanation: "Never leave your apartment unlocked. This completely compromises your physical safety." },
    ],
  },
  {
    id: "ya2",
    prompt: "You request an Uber/Lyft late at night. A car pulls up, and the driver says, 'Get in, my app is glitching but I'm your ride.'",
    context: "Rideshare Safety",
    choices: [
      { id: "a", text: "Get in because you're tired and want to go home", safe: false, explanation: "Never get into a rideshare if the license plate, car make, or driver doesn't match the app exactly." },
      { id: "b", text: "Ask 'Who are you here for?' and verify the license plate", safe: true, explanation: "Always make the driver verify your name, and physically check the license plate before opening the door." },
      { id: "c", text: "Tell them your name to see if they say yes", safe: false, explanation: "If you give them your name, they can just agree. Make them tell YOU who they are picking up." },
    ],
  },
  {
    id: "ya3",
    prompt: "A food delivery driver messages you asking for your apartment building's master gate code 'for next time.'",
    context: "Home Deliveries",
    choices: [
      { id: "a", text: "Give it to them so future deliveries are faster", safe: false, explanation: "Never distribute building security codes. This puts you and all your neighbors at risk." },
      { id: "b", text: "Ignore the request and only buzz them in for this order", safe: true, explanation: "You should only provide access on a case-by-case basis. Do not share permanent access codes." },
      { id: "c", text: "Give them a fake code", safe: false, explanation: "Engaging or lying isn't necessary. Simply ignore the request or politely state you aren't allowed to share it." },
    ],
  },
  {
    id: "ya4",
    prompt: "You are walking alone at night and notice someone matching your pace and taking the same turns as you.",
    context: "Street Safety",
    choices: [
      { id: "a", text: "Keep your head down and walk faster to your home", safe: false, explanation: "Do not lead a follower to your home. You want to avoid revealing where you live." },
      { id: "b", text: "Cross the street, head to a well-lit public place, and call a friend", safe: true, explanation: "Changing direction verifies if they are following. A public, lit area with people is your safest destination." },
      { id: "c", text: "Turn around and confront them directly", safe: false, explanation: "Confrontation can rapidly escalate to violence. Prioritize distance and reaching a secure public area." },
    ],
  },
  {
    id: "ya5",
    prompt: "A recruiter reaches out on LinkedIn offering a high-paying remote job, but asks you to pay a $200 'onboarding equipment fee' via CashApp.",
    context: "Job Hunting Scams",
    choices: [
      { id: "a", text: "Pay it, the salary makes up for the small fee", safe: false, explanation: "Legitimate employers will never ask you to pay your own money to start working or receive equipment." },
      { id: "b", text: "Report the profile and block the sender", safe: true, explanation: "This is a classic employment scam. Blocking and reporting protects you and others." },
      { id: "c", text: "Ask if you can pay it out of your first paycheck", safe: false, explanation: "Even negotiating engages the scammer. Cut contact immediately." },
    ],
  },
  {
    id: "ya6",
    prompt: "You are at a bar and leave your drink unattended on a table to go to the restroom. When you return, the drink is exactly where you left it.",
    context: "Social Life & Nightlife",
    choices: [
      { id: "a", text: "Finish the drink since it wasn't moved", safe: false, explanation: "An unattended drink is a compromised drink. Spiking happens quickly and without obvious signs." },
      { id: "b", text: "Abandon the drink and buy a new one", safe: true, explanation: "Never consume a drink that left your line of sight. It's a small financial loss for a massive safety gain." },
      { id: "c", text: "Ask a stranger nearby if anyone touched it", safe: false, explanation: "Strangers aren't reliable monitors for your safety. Do not risk it." },
    ],
  },
  {
    id: "ya7",
    prompt: "You matched with someone on a dating app today. They immediately ask for your phone number to 'get off this app.'",
    context: "Online Dating Basics",
    choices: [
      { id: "a", text: "Give it to them; texting is easier anyway", safe: false, explanation: "Your phone number is tied to your identity, social media, and location. Don't share it until trust is established." },
      { id: "b", text: "Tell them you prefer to chat on the app for now", safe: true, explanation: "Keeping the conversation on the app protects your personal data and gives you easy blocking tools." },
      { id: "c", text: "Give them your home address instead to just meet up", safe: false, explanation: "Never give a stranger your home address. Always meet in public first." },
    ],
  },
  {
    id: "ya8",
    prompt: "You are traveling solo in a new city. A friendly local asks where you are staying.",
    context: "Solo Travel",
    choices: [
      { id: "a", text: "Tell them the exact name of your hotel and room number", safe: false, explanation: "Never reveal your exact accommodation details to strangers while traveling alone." },
      { id: "b", text: "Name a general neighborhood or say you're staying with friends", safe: true, explanation: "Giving a vague area satisfies small talk without compromising your location. Claiming to be with others deters bad actors." },
      { id: "c", text: "Show them on your phone's map", safe: false, explanation: "Showing your map reveals your exact location and requires you to hand over or display your expensive device." },
    ],
  },
  {
    id: "ya9",
    prompt: "Your new roommate insists on keeping the front door unlocked during the day because 'it's a safe neighborhood.'",
    context: "Roommate Boundaries",
    choices: [
      { id: "a", text: "Agree to avoid starting a fight early on", safe: false, explanation: "Compromising on basic physical safety to people-please is dangerous. Crime happens in all neighborhoods." },
      { id: "b", text: "Firmly state you require the door locked at all times for your safety", safe: true, explanation: "Physical security is non-negotiable. Communicate this clearly and hold the boundary." },
      { id: "c", text: "Just lock it yourself only when you are home alone", safe: false, explanation: "This leaves your belongings and your roommate vulnerable when you aren't guarding the door." },
    ],
  },
  {
    id: "ya10",
    prompt: "You receive an urgent text from 'your bank' saying your account is locked, with a link to verify your password.",
    context: "Phishing Scams",
    choices: [
      { id: "a", text: "Click the link and log in to fix it quickly", safe: false, explanation: "Banks do not send SMS links asking for passwords. Clicking the link captures your login credentials." },
      { id: "b", text: "Ignore the text and log into your bank app directly to check", safe: true, explanation: "Always bypass suspicious links. Go directly to the official app or website to verify account status." },
      { id: "c", text: "Reply to the text asking if it's real", safe: false, explanation: "Replying confirms your phone number is active to the scammer, leading to more spam." },
    ],
  },
  {
    id: "ya11",
    prompt: "A friend borrows your laptop and asks for your main password to install an update.",
    context: "Digital Security",
    choices: [
      { id: "a", text: "Give it to them, they are your friend", safe: false, explanation: "Never share your root/admin password. It gives access to your saved passwords, banking, and private files." },
      { id: "b", text: "Type the password in yourself without showing them", safe: true, explanation: "You maintain control of your device security while still helping them out." },
      { id: "c", text: "Write it down on a sticky note for them", safe: false, explanation: "Writing down passwords creates a physical vulnerability that anyone can find." },
    ],
  },
  {
    id: "ya12",
    prompt: "You are setting up a public social media profile for your new freelance business.",
    context: "Digital Footprint",
    choices: [
      { id: "a", text: "Include your personal cell number and home address", safe: false, explanation: "Mixing personal contact info with public business profiles invites stalking and harassment." },
      { id: "b", text: "Use a dedicated business email and a virtual phone number (like Google Voice)", safe: true, explanation: "Creating separate, disposable contact methods protects your private identity." },
      { id: "c", text: "Tag your current live location in every post", safe: false, explanation: "Real-time location tagging tells potential predators exactly where you are and when your home is empty." },
    ],
  },
  {
    id: "ya13",
    prompt: "You're selling a couch on Facebook Marketplace. A buyer offers to send a courier with a cashier's check for double the amount, asking you to refund the difference.",
    context: "Financial Scams",
    choices: [
      { id: "a", text: "Accept, it seems like an easy way to sell the couch", safe: false, explanation: "This is a classic overpayment scam. The check will bounce days later, and you will lose the 'refunded' money." },
      { id: "b", text: "Refuse the offer and insist on cash in a public place", safe: true, explanation: "Safe online selling requires secure payment methods (cash) and safe meeting locations." },
      { id: "c", text: "Deposit the check but wait to refund them", safe: false, explanation: "Banks can take weeks to fully clear a fraudulent check. Don't engage with the scam at all." },
    ],
  },
  {
    id: "ya14",
    prompt: "A coworker you barely know asks you to cosign a small loan because their credit is bad.",
    context: "Financial Boundaries",
    choices: [
      { id: "a", text: "Do it because you want to be seen as a team player", safe: false, explanation: "Cosigning makes you 100% legally responsible for the debt. Never mix finances with coworkers." },
      { id: "b", text: "Politely but firmly decline, stating you don't mix personal finances with work", safe: true, explanation: "A clear, uncompromising boundary protects your credit score and financial future." },
      { id: "c", text: "Give them the money directly instead", safe: false, explanation: "While safer for your credit, loaning money to coworkers creates toxic power dynamics and you likely won't get it back." },
    ],
  },
  {
    id: "ya15",
    prompt: "You are moving out of your apartment. The landlord says you don't need a move-out inspection, they will just mail you the deposit.",
    context: "Renter's Rights",
    choices: [
      { id: "a", text: "Agree, it saves you time", safe: false, explanation: "Without documentation, the landlord can claim false damages and keep your entire deposit." },
      { id: "b", text: "Insist on a walk-through and take detailed videos/photos of every room", safe: true, explanation: "Visual evidence is your only defense against wrongful deposit deductions. Always document the condition." },
      { id: "c", text: "Leave the keys on the counter and block their number", safe: false, explanation: "You must follow lease terms for surrendering the property, or you could face legal or financial penalties." },
    ],
  },

  // --- LEVEL 2: Early Career, Dating Apps & Social Norms (16-30) ---
  {
    id: "ya16",
    prompt: "During a job interview, the hiring manager asks if you plan on having children soon.",
    context: "Workplace Rights",
    choices: [
      { id: "a", text: "Answer honestly to show you have nothing to hide", safe: false, explanation: "This is an illegal interview question in many jurisdictions, designed to discriminate based on family status." },
      { id: "b", text: "Pivot politely: 'I'm fully committed to focusing on my career and this role right now.'", safe: true, explanation: "Pivoting keeps the tone professional while refusing to answer an inappropriate, potentially discriminatory question." },
      { id: "c", text: "Yell at them for breaking the law", safe: false, explanation: "While they are in the wrong, aggressive confrontation burns bridges. Pivot, then reconsider if you want to work there." },
    ],
  },
  {
    id: "ya17",
    prompt: "You match with someone on Tinder. After a few messages, they ask you to send a compromising/intimate photo.",
    context: "Digital Intimacy",
    choices: [
      { id: "a", text: "Send it so they don't lose interest", safe: false, explanation: "Never send intimate photos to strangers. This is a common setup for sextortion (blackmail)." },
      { id: "b", text: "Unmatch and block them immediately", safe: true, explanation: "Early pressure for sexual content shows a lack of respect for boundaries. Blocking is the safest response." },
      { id: "c", text: "Send a picture of someone else", safe: false, explanation: "Engaging in deception can escalate the situation. Cut contact entirely." },
    ],
  },
  {
    id: "ya18",
    prompt: "You are preparing for a first date with someone you met online. They offer to pick you up at your house to be romantic.",
    context: "First Dates",
    choices: [
      { id: "a", text: "Accept the ride; it's chivalrous and saves money", safe: false, explanation: "Never let a stranger know where you live. If the date goes badly, they have your home address." },
      { id: "b", text: "Decline, arrange your own transport, and meet them in a public place", safe: true, explanation: "Meeting in public gives you an easy exit strategy and protects your private address." },
      { id: "c", text: "Tell them to pick you up at a neighbor's house instead", safe: false, explanation: "This still reveals your general location and puts your neighbors at risk." },
    ],
  },
  {
    id: "ya19",
    prompt: "Your boss frequently texts you about non-urgent work tasks at 11:00 PM on weekends.",
    context: "Professional Boundaries",
    choices: [
      { id: "a", text: "Reply immediately to show dedication", safe: false, explanation: "Responding trains them that you are available 24/7, leading to burnout and erased boundaries." },
      { id: "b", text: "Ignore the texts until Monday morning, then reply during work hours", safe: true, explanation: "Silently enforcing your off-hours sets a professional boundary without needing a confrontation." },
      { id: "c", text: "Text back telling them to leave you alone", safe: false, explanation: "Hostility is unprofessional. Set the boundary with your actions by simply not responding until business hours." },
    ],
  },
  {
    id: "ya20",
    prompt: "A new friend constantly pressures you to split expensive restaurant bills evenly, even though you only order water and a side salad.",
    context: "Financial Boundaries",
    choices: [
      { id: "a", text: "Pay it so you don't look cheap", safe: false, explanation: "Financial peer pressure is toxic. You should not subsidize other people's expensive lifestyles." },
      { id: "b", text: "Speak up before ordering: 'I'm on a budget, so I'll just be paying for what I order today.'", safe: true, explanation: "Setting expectations proactively prevents awkwardness at the end and protects your finances." },
      { id: "c", text: "Just stop hanging out with them entirely without saying why", safe: false, explanation: "While an option, learning to assert financial boundaries is a vital adult skill worth practicing." },
    ],
  },
  {
    id: "ya21",
    prompt: "You are at a networking event. A senior executive offers you a career-changing opportunity, but suggests discussing it over drinks in their hotel room.",
    context: "Professional Safety",
    choices: [
      { id: "a", text: "Go to the room; you don't want to miss the opportunity", safe: false, explanation: "Professional meetings never happen in private hotel rooms. This is a severe red flag for harassment or assault." },
      { id: "b", text: "Decline the room, suggest the hotel lobby coffee shop instead", safe: true, explanation: "Redirecting to a public space tests their intentions. If it's strictly professional, the lobby is fine." },
      { id: "c", text: "Go, but keep the door cracked open", safe: false, explanation: "A cracked door does not guarantee safety in a private environment. Do not go." },
    ],
  },
  {
    id: "ya22",
    prompt: "Someone you are dating casually asks to look through your phone 'because they have trust issues from a past ex.'",
    context: "Privacy & Boundaries",
    choices: [
      { id: "a", text: "Let them look to prove you are loyal", safe: false, explanation: "Giving up your privacy to soothe their insecurity establishes a dynamic of control and surveillance." },
      { id: "b", text: "Refuse gently but firmly: 'My phone is private. I understand your past, but I need trust in this relationship.'", safe: true, explanation: "Healthy relationships require mutual trust, not constant verification. Guarding your digital privacy is your right." },
      { id: "c", text: "Demand to look through their phone in return", safe: false, explanation: "Mutual surveillance is toxic. The goal is trust, not mutually assured destruction." },
    ],
  },
  {
    id: "ya23",
    prompt: "You tell your partner you don't want to have sex tonight. They sigh heavily, roll over, and give you the silent treatment for hours.",
    context: "Consent & Coercion",
    choices: [
      { id: "a", text: "Give in and have sex so they stop being mad", safe: false, explanation: "Consent given under emotional pressure, guilt, or fear of anger is not true consent. It's coercion." },
      { id: "b", text: "Recognize this as manipulative behavior and hold your boundary", safe: true, explanation: "Pouting or punishing you for saying 'no' is a massive red flag. Your body is yours." },
      { id: "c", text: "Apologize for ruining their night", safe: false, explanation: "You have nothing to apologize for. You are never obligated to provide intimacy." },
    ],
  },
  {
    id: "ya24",
    prompt: "A coworker makes a sexually explicit joke near your desk. It makes you deeply uncomfortable.",
    context: "Workplace Harassment",
    choices: [
      { id: "a", text: "Laugh along so you aren't labeled a 'prude'", safe: false, explanation: "Laughing validates the behavior and encourages them to push boundaries further." },
      { id: "b", text: "Document the incident (time, date, what was said) and firmly tell them it's inappropriate", safe: true, explanation: "Documentation is crucial for HR. Speaking up directly establishes a paper trail that the behavior was unwelcome." },
      { id: "c", text: "Quit your job immediately", safe: false, explanation: "You have a right to a safe workplace. Use internal reporting structures before abandoning your livelihood." },
    ],
  },
  {
    id: "ya25",
    prompt: "You and a new partner are about to be intimate. You ask them to use a condom, and they say, 'It doesn't feel good, I promise I'm clean.'",
    context: "Sexual Health",
    choices: [
      { id: "a", text: "Agree to skip it this one time to avoid ruining the mood", safe: false, explanation: "Never compromise your physical health for someone else's temporary pleasure. 'Promises' do not prevent STIs or pregnancy." },
      { id: "b", text: "Stop everything. 'No condom, no sex. That's my boundary.'", safe: true, explanation: "Your health is paramount. A partner who argues against your safety boundaries does not respect you." },
      { id: "c", text: "Ask if they have recent test results on their phone", safe: false, explanation: "Even with tests, condoms prevent pregnancy and newer infections. Do not negotiate a hard boundary." },
    ],
  },
  {
    id: "ya26",
    prompt: "You are signing a lease with a friend. They ask you to put all the utilities in your name because 'it's easier.'",
    context: "Roommate Finances",
    choices: [
      { id: "a", text: "Do it. You trust them to pay you back every month", safe: false, explanation: "If they stop paying, your credit score is ruined and you are legally liable for the debt." },
      { id: "b", text: "Insist on splitting the accounts: you take electricity, they take internet and water", safe: true, explanation: "Distributing the utility accounts distributes the financial and legal risk equally between roommates." },
      { id: "c", text: "Put them in your parents' names", safe: false, explanation: "This just transfers the risk to your parents. Take equal responsibility with your roommate." },
    ],
  },
  {
    id: "ya27",
    prompt: "You post a photo online and a stranger leaves an abusive, threatening comment.",
    context: "Cyberbullying",
    choices: [
      { id: "a", text: "Reply to them aggressively to defend yourself", safe: false, explanation: "Engaging feeds trolls and can escalate the harassment. It rewards them with attention." },
      { id: "b", text: "Screenshot the comment, then block and report the user", safe: true, explanation: "Documentation is good if it escalates to real-world threats. Blocking starves them of attention." },
      { id: "c", text: "Delete your whole account to be safe", safe: false, explanation: "Don't let bullies force you off platforms. Use the block and report features built into the app." },
    ],
  },
  {
    id: "ya28",
    prompt: "You realize your new partner refers to all of their exes as 'crazy' or 'toxic.'",
    context: "Relationship Red Flags",
    choices: [
      { id: "a", text: "Feel special that you are the 'sane' one", safe: false, explanation: "If everyone in their past is 'crazy,' they are the common denominator. It's a massive red flag for lack of accountability." },
      { id: "b", text: "Proceed with extreme caution; note how they take responsibility for past conflicts", safe: true, explanation: "Labeling all exes 'crazy' often masks their own abusive or manipulative behavior. Watch their actions closely." },
      { id: "c", text: "Message their exes to ask what happened", safe: false, explanation: "This violates privacy and inserts you into past drama. Just use the red flag to re-evaluate the relationship." },
    ],
  },
  {
    id: "ya29",
    prompt: "Your manager asks you to work off-the-clock for a few hours 'just to get this project over the line.'",
    context: "Labor Rights",
    choices: [
      { id: "a", text: "Do it to prove you are a team player", safe: false, explanation: "Working off-the-clock is wage theft. It devalues your labor and sets a precedent that you can be exploited." },
      { id: "b", text: "Reply in writing: 'I'd be happy to help! Should I log these as overtime hours?'", safe: true, explanation: "This politely forces them to acknowledge the request in writing and reminds them you must be paid for your time." },
      { id: "c", text: "Clock out and work, but do a bad job", safe: false, explanation: "This hurts your professional reputation while still giving them free labor." },
    ],
  },
  {
    id: "ya30",
    prompt: "A casual date unexpectedly shows up at your workplace with lunch to 'surprise' you.",
    context: "Stalking Boundaries",
    choices: [
      { id: "a", text: "Find it romantic and eat with them", safe: false, explanation: "Showing up uninvited to a workplace early in dating is boundary-crossing behavior, not romance." },
      { id: "b", text: "Ask them to leave, and explicitly state that uninvited visits to your job are unacceptable", safe: true, explanation: "Firmly establish that your workplace is off-limits. If they react with anger, cut ties immediately." },
      { id: "c", text: "Hide in the bathroom until they leave", safe: false, explanation: "Avoiding the issue doesn't set a boundary. Be direct so there is no confusion." },
    ],
  },

  // --- LEVEL 3: Complex Consent, Reproductive Health & Independence (31-45) ---
  {
    id: "ya31",
    prompt: "You and a partner agreed to film an intimate video. Now that the relationship is ending, you ask them to delete it. They say no.",
    context: "Digital Consent",
    choices: [
      { id: "a", text: "Accept it since you consented to filming it originally", safe: false, explanation: "Consent to film is NOT consent to keep forever or distribute. Consent can be withdrawn." },
      { id: "b", text: "State firmly that they must delete it. If they threaten to share it, contact law enforcement immediately", safe: true, explanation: "Revenge porn is a crime in many areas. Keep records of your request to delete it and any threats they make." },
      { id: "c", text: "Steal their phone to delete it yourself", safe: false, explanation: "This is illegal and can escalate to physical danger. Use legal channels." },
    ],
  },
  {
    id: "ya32",
    prompt: "During an annual checkup, a doctor dismisses your severe pain as 'just anxiety' without doing any tests.",
    context: "Medical Self-Advocacy",
    choices: [
      { id: "a", text: "Accept their word; they are the medical professional", safe: false, explanation: "Medical gaslighting is real. You know your body best. Severe pain requires investigation." },
      { id: "b", text: "Say: 'I would like you to document in my chart that you are refusing to run tests for my pain.'", safe: true, explanation: "Asking a doctor to document their refusal often forces them to reconsider and take your concerns seriously." },
      { id: "c", text: "Leave and try to self-medicate", safe: false, explanation: "Self-medicating can be dangerous. Seek a second opinion from a different doctor." },
    ],
  },
  {
    id: "ya33",
    prompt: "You discover your partner has been secretly removing the condom during sex (stealthing).",
    context: "Sexual Assault",
    choices: [
      { id: "a", text: "Tell them to put it back on and continue", safe: false, explanation: "Stealthing is a severe violation of consent and, in many jurisdictions, classified as sexual assault." },
      { id: "b", text: "Stop immediately, leave, and seek medical advice for STI/pregnancy prevention. End the relationship.", safe: true, explanation: "This is an act of abuse. Protect your physical health immediately and cut ties with the abuser." },
      { id: "c", text: "Wait to see if you get sick before confronting them", safe: false, explanation: "Time is critical for emergency contraception and post-exposure prophylaxis (PEP). Act immediately." },
    ],
  },
  {
    id: "ya34",
    prompt: "Your friend gets blackout drunk at a party. A person they just met is trying to lead them into a bedroom.",
    context: "Bystander Intervention",
    choices: [
      { id: "a", text: "Assume your friend knows what they are doing", safe: false, explanation: "A blackout drunk person legally and practically cannot consent to sexual activity." },
      { id: "b", text: "Intervene immediately. Say 'Hey, it's time for us to go home,' and physically guide your friend away", safe: true, explanation: "Direct intervention prevents assault. You must protect vulnerable friends when they cannot protect themselves." },
      { id: "c", text: "Wait outside the door just in case", safe: false, explanation: "Waiting outside does not prevent an assault from occurring inside. Stop it before it starts." },
    ],
  },
  {
    id: "ya35",
    prompt: "You are negotiating a salary for a new job. They offer you exactly what you made at your last job, which is below market rate.",
    context: "Career Financial Independence",
    choices: [
      { id: "a", text: "Accept it gratefully so they don't retract the offer", safe: false, explanation: "Accepting lowball offers compounds over your career, leading to massive lost wages. Always negotiate." },
      { id: "b", text: "Counter-offer based on your market research, highlighting the value you bring to this specific role", safe: true, explanation: "Professional negotiation is expected. Basing your counter on market data, not your past salary, is the right strategy." },
      { id: "c", text: "Lie and say you have a higher offer from someone else", safe: false, explanation: "Lying can backfire if they call your bluff. Negotiate based on your actual market value." },
    ],
  },
  {
    id: "ya36",
    prompt: "A partner insists you share your live GPS location 24/7 on an app so they 'know you are safe.'",
    context: "Digital Control",
    choices: [
      { id: "a", text: "Share it; you have nothing to hide", safe: false, explanation: "Constant monitoring is a hallmark of coercive control and abuse, not love or safety." },
      { id: "b", text: "Refuse. State that you value your privacy and autonomy", safe: true, explanation: "Healthy adults do not need to track each other constantly. Refusing this establishes a vital boundary." },
      { id: "c", text: "Turn it on but leave your phone at home when you go out", safe: false, explanation: "Sneaking around avoids the core issue. If you feel you must hide, the relationship is already toxic." },
    ],
  },
  {
    id: "ya37",
    prompt: "You are prescribing birth control. Your partner gets angry and demands you stop taking it so you can 'prove you are committed' by having a baby.",
    context: "Reproductive Coercion",
    choices: [
      { id: "a", text: "Stop taking it to reassure them of your love", safe: false, explanation: "Pressuring someone to get pregnant is reproductive coercion, a severe form of abuse." },
      { id: "b", text: "Maintain your birth control. Recognize this as abusive control and seek help to safely exit the relationship", safe: true, explanation: "You alone control your reproductive choices. This demand signals a dangerous level of control." },
      { id: "c", text: "Pretend to stop taking it but keep taking it secretly", safe: false, explanation: "While this protects your body temporarily, you are still in a dangerous environment. You need a safe exit plan." },
    ],
  },
  {
    id: "ya38",
    prompt: "You suspect you have an STI but feel too embarrassed to go to the clinic because the staff might judge you.",
    context: "Sexual Health Stigma",
    choices: [
      { id: "a", text: "Wait a few weeks to see if the symptoms go away on their own", safe: false, explanation: "Untreated STIs can lead to permanent damage, including infertility. Symptoms disappearing does not mean the infection is gone." },
      { id: "b", text: "Go to the clinic immediately. Medical professionals deal with this daily and are there to treat, not judge", safe: true, explanation: "Healthcare providers are bound by confidentiality. Prioritize your health over temporary embarrassment." },
      { id: "c", text: "Buy an unverified herbal remedy online", safe: false, explanation: "Unverified treatments do not cure bacterial or viral STIs. You need scientific medical care." },
    ],
  },
  {
    id: "ya39",
    prompt: "Your landlord enters your apartment without notice while you are in the shower.",
    context: "Tenant Privacy Rights",
    choices: [
      { id: "a", text: "Assume it was an emergency and say nothing", safe: false, explanation: "Unless there is a literal fire or flood, landlords cannot enter without 24-48 hours written notice." },
      { id: "b", text: "Tell them to leave immediately. Follow up with a written email stating they violated your right to quiet enjoyment", safe: true, explanation: "You must document illegal entry immediately. Creating a paper trail protects you if you need to break the lease." },
      { id: "c", text: "Stop paying rent as punishment", safe: false, explanation: "Withholding rent is illegal in many places and can get you evicted. Use legal channels." },
    ],
  },
  {
    id: "ya40",
    prompt: "You want to break up with someone you've dated for a month. They say, 'If you leave me, I'll kill myself.'",
    context: "Emotional Blackmail",
    choices: [
      { id: "a", text: "Stay with them to keep them safe", safe: false, explanation: "This is emotional blackmail and abuse. You cannot be held hostage by threats of self-harm." },
      { id: "b", text: "Leave. Contact their friends, family, or emergency services to check on them", safe: true, explanation: "You are not responsible for their actions. Handing their safety over to professionals/family is the right move." },
      { id: "c", text: "Yell at them for being manipulative", safe: false, explanation: "Engaging in conflict with someone making severe threats can be dangerous. Disengage and notify authorities." },
    ],
  },
  {
    id: "ya41",
    prompt: "You are out with friends and notice a stranger taking photos of you and your group from across the room.",
    context: "Public Privacy",
    choices: [
      { id: "a", text: "Ignore it; you are in a public place so it's legal", safe: false, explanation: "While it may be legally permissible in public, targeted photography by strangers is a safety concern." },
      { id: "b", text: "Alert your friends, move to a different area or block their view, and notify staff if they follow", safe: true, explanation: "Prioritizing your physical safety and creating distance is the best response to creepy behavior." },
      { id: "c", text: "Walk over and grab their phone", safe: false, explanation: "Physical escalation is dangerous. Rely on distance and venue security." },
    ],
  },
  {
    id: "ya42",
    prompt: "A friend keeps making racist microaggressions disguised as 'jokes.'",
    context: "Social Boundaries",
    choices: [
      { id: "a", text: "Laugh uncomfortably to avoid ruining the vibe", safe: false, explanation: "Silence is complicity. Tolerating bigotry damages your integrity and harms marginalized people." },
      { id: "b", text: "Call it out directly: 'That's not funny, and it's actually really offensive.'", safe: true, explanation: "Setting clear boundaries around acceptable language is a core part of adult friendships." },
      { id: "c", text: "Wait until later to text them about it", safe: false, explanation: "In-the-moment correction is much more effective at stopping the behavior than retroactive texts." },
    ],
  },
  {
    id: "ya43",
    prompt: "You receive a job offer, but the contract requires you to sign a 'Non-Compete' preventing you from working in your entire industry for 5 years if you leave.",
    context: "Employment Contracts",
    choices: [
      { id: "a", text: "Sign it, you need the job", safe: false, explanation: "An overly broad non-compete can ruin your career trajectory and trap you in a toxic job." },
      { id: "b", text: "Consult an employment lawyer or push back to severely narrow the scope and time limit", safe: true, explanation: "Never sign away your future right to work. Contracts are negotiable; seek professional advice." },
      { id: "c", text: "Sign it, assuming they won't actually enforce it", safe: false, explanation: "Assume all contracts will be enforced. Never sign something you aren't prepared to abide by." },
    ],
  },
  {
    id: "ya44",
    prompt: "Your partner insists on being the only one who drives you to work, hangs out with your friends, or runs errands with you.",
    context: "Isolation Tactics",
    choices: [
      { id: "a", text: "View it as them being extremely loving and protective", safe: false, explanation: "This is isolation, a primary tactic of abusers to cut you off from support networks so you depend entirely on them." },
      { id: "b", text: "Recognize this as controlling behavior. Insist on doing things alone and reconnect with friends", safe: true, explanation: "Maintaining independence is vital. If they react with anger to your autonomy, it is abuse." },
      { id: "c", text: "Start sneaking out to do things alone", safe: false, explanation: "Sneaking around means you already know you are in danger. You need to plan a safe exit." },
    ],
  },
  {
    id: "ya45",
    prompt: "You are pulled over by an unmarked police car on a dark, deserted road.",
    context: "Police Encounters",
    choices: [
      { id: "a", text: "Pull over immediately in the dark", safe: false, explanation: "Unmarked cars in dark areas pose a risk of impersonation." },
      { id: "b", text: "Turn on your hazards, drive slowly to a well-lit, populated area (like a gas station), and call emergency dispatch to verify the officer", safe: true, explanation: "Hazards acknowledge the officer. Seeking light and verifying with 911 protects you from fake police." },
      { id: "c", text: "Speed up to try and lose them", safe: false, explanation: "Fleeing will lead to a dangerous high-speed pursuit and felony charges." },
    ],
  },

  // --- LEVEL 4: Advanced Professional, Social, and Interpersonal Nuance (46-60) ---
  {
    id: "ya46",
    prompt: "Your HR representative tells you they can't investigate your harassment claim unless you confront the harasser face-to-face first.",
    context: "HR & Harassment",
    choices: [
      { id: "a", text: "Agree to the meeting to prove you are serious", safe: false, explanation: "You are never required to face an abuser or harasser. HR is trying to avoid doing their job." },
      { id: "b", text: "Refuse the meeting in writing, citing safety/retaliation concerns, and remind them of their legal duty to investigate", safe: true, explanation: "Creating a paper trail of HR's failure to act protects you legally and forces them into compliance." },
      { id: "c", text: "Drop the claim entirely", safe: false, explanation: "Dropping the claim allows the harasser to continue and leaves you unprotected." },
    ],
  },
  {
    id: "ya47",
    prompt: "You find out a close friend has been sexually assaulting other people in your social circle.",
    context: "Accountability & Complicity",
    choices: [
      { id: "a", text: "Stay out of it; it doesn't involve you directly", safe: false, explanation: "Remaining neutral protects abusers. Your silence puts others in danger." },
      { id: "b", text: "Cut ties with the friend immediately and support the survivors privately", safe: true, explanation: "You must remove abusers from your life. Supporting survivors validates their experience and promotes safety." },
      { id: "c", text: "Confront the friend and demand they apologize", safe: false, explanation: "An apology does not undo assault. Focus on protecting the community, not rehabilitating the abuser." },
    ],
  },
  {
    id: "ya48",
    prompt: "A partner constantly critiques your clothing choices, saying things like, 'You're really going to wear that outside?'",
    context: "Emotional Abuse",
    choices: [
      { id: "a", text: "Change your clothes to make them happy", safe: false, explanation: "Slowly eroding your self-esteem and controlling your appearance is a form of emotional abuse." },
      { id: "b", text: "Tell them firmly: 'I dress for myself, and I don't welcome comments on my body or clothes.'", safe: true, explanation: "Establish a hard boundary. If they continue, it demonstrates a complete lack of respect for you." },
      { id: "c", text: "Start critiquing their clothes back", safe: false, explanation: "Retaliation creates a toxic cycle. Address the behavior directly." },
    ],
  },
  {
    id: "ya49",
    prompt: "You are an independent contractor (freelancer). A client hasn't paid your invoice for 60 days despite multiple emails.",
    context: "Freelance Rights",
    choices: [
      { id: "a", text: "Keep working for them and hope they pay eventually", safe: false, explanation: "Never continue providing free labor to someone who has breached a contract." },
      { id: "b", text: "Halt all work immediately and send a formal 'Demand for Payment' letter detailing legal next steps", safe: true, explanation: "Stopping work limits your losses. Formal legal language often prompts immediate payment." },
      { id: "c", text: "Trash their company on social media", safe: false, explanation: "Public defamation can result in you being sued. Use professional legal channels (small claims court)." },
    ],
  },
  {
    id: "ya50",
    prompt: "You discover your partner is hiding significant debt (like gambling or secret loans) while you share a joint bank account.",
    context: "Financial Infidelity",
    choices: [
      { id: "a", text: "Help them pay it off using your joint funds", safe: false, explanation: "Using joint funds to bail out secret debt enables the behavior and drains your own resources." },
      { id: "b", text: "Immediately separate your finances, remove your money from the joint account, and reassess the relationship", safe: true, explanation: "Financial infidelity destroys trust. You must protect your own assets immediately from their hidden liabilities." },
      { id: "c", text: "Ignore it as long as they promise to stop", safe: false, explanation: "Promises do not fix addictive financial behavior. Protect yourself legally and financially first." },
    ],
  },
  {
    id: "ya51",
    prompt: "You tell your partner a story about something hurtful they did yesterday. They reply, 'That never happened. You're imagining things.'",
    context: "Gaslighting",
    choices: [
      { id: "a", text: "Apologize and assume your memory is failing", safe: false, explanation: "This is classic gaslighting: an abuse tactic designed to make you doubt your own sanity and reality." },
      { id: "b", text: "Trust your memory. Recognize this as a manipulation tactic to avoid accountability", safe: true, explanation: "Do not debate reality with a gaslighter. Note the tactic and distance yourself from the toxicity." },
      { id: "c", text: "Argue until they admit they remember it", safe: false, explanation: "A gaslighter will never admit it. Arguing only drains your energy." },
    ],
  },
  {
    id: "ya52",
    prompt: "You are offered a promotion, but the new salary is barely an increase while the workload doubles.",
    context: "Career Advancement",
    choices: [
      { id: "a", text: "Take it for the new title on your resume", safe: false, explanation: "Titles don't pay bills. Taking massive new responsibilities without compensation leads to rapid burnout." },
      { id: "b", text: "Negotiate for a salary that matches the new responsibilities, and be prepared to decline if they refuse", safe: true, explanation: "A promotion without a matching raise is exploitation. Protect your time and value." },
      { id: "c", text: "Take it but quietly quit by doing the bare minimum", safe: false, explanation: "This damages your professional reputation. Advocate for yourself directly." },
    ],
  },
  {
    id: "ya53",
    prompt: "You want to attend therapy, but your partner says, 'Why do you need a therapist? You can tell me anything. Therapy is a waste of money.'",
    context: "Mental Health Sabotage",
    choices: [
      { id: "a", text: "Cancel the appointment to save the relationship", safe: false, explanation: "Partners who discourage you from seeking independent professional help often want to control your worldview." },
      { id: "b", text: "Go to therapy anyway. Your mental health care is a personal medical decision", safe: true, explanation: "A partner is not a substitute for a trained professional. Prioritize your own care." },
      { id: "c", text: "Tell the therapist what your partner said", safe: true, explanation: "This is also safe. A good therapist will help you recognize this as a controlling behavior." },
    ],
  },
  {
    id: "ya54",
    prompt: "A friend pressures you to try a drug you are uncomfortable with, saying 'everyone is doing it, don't be boring.'",
    context: "Peer Pressure & Substances",
    choices: [
      { id: "a", text: "Try a little bit to get them to stop nagging", safe: false, explanation: "Never consume substances to please someone else. This violates your bodily autonomy." },
      { id: "b", text: "Say 'No, I'm good,' and leave the situation if they keep pushing", safe: true, explanation: "True friends respect a 'no' the first time. Leaving removes their power." },
      { id: "c", text: "Pretend to take it but throw it away", safe: false, explanation: "Deception doesn't solve the core issue: this person does not respect your boundaries." },
    ],
  },
  {
    id: "ya55",
    prompt: "Your manager frequently takes credit for your successful projects during meetings with higher-ups.",
    context: "Workplace Credit",
    choices: [
      { id: "a", text: "Stay quiet; the manager writes your performance review", safe: false, explanation: "Allowing them to steal credit stunts your career growth and prevents you from getting promotions." },
      { id: "b", text: "Speak up professionally in meetings: 'I'm so glad the strategy I designed worked out well.'", safe: true, explanation: "Publicly (and politely) reclaiming your work in the moment ensures leadership knows who did the actual work." },
      { id: "c", text: "Sabotage the next project so they look bad", safe: false, explanation: "Sabotage gets you fired. Document your contributions and advocate for yourself." },
    ],
  },
  {
    id: "ya56",
    prompt: "You notice a coworker is being consistently excluded, talked over, and assigned menial tasks by the rest of the team.",
    context: "Workplace Mobbing/Bullying",
    choices: [
      { id: "a", text: "Join in so you don't become the next target", safe: false, explanation: "Participating in workplace bullying makes you complicit in creating a toxic, hostile environment." },
      { id: "b", text: "Actively make space for them in meetings and privately offer your support", safe: true, explanation: "Disrupting the mobbing dynamic by showing professional respect is powerful and creates a safer environment." },
      { id: "c", text: "Report everyone to HR immediately without talking to the victim", safe: false, explanation: "The victim might face retaliation. Ask them how they want to proceed before escalating." },
    ],
  },
  {
    id: "ya57",
    prompt: "A partner gets furious and punches a hole in the wall next to your head during an argument.",
    context: "Physical Intimidation",
    choices: [
      { id: "a", text: "Forgive them; they didn't actually hit you", safe: false, explanation: "Hitting objects near you is a severe threat of violence. It is designed to induce terror." },
      { id: "b", text: "Leave immediately. This is a severe escalation of domestic violence. Seek safe shelter", safe: true, explanation: "Violence against property during anger almost always escalates to violence against you. Get out safely." },
      { id: "c", text: "Try to calm them down and clean up the mess", safe: false, explanation: "Placating an abuser keeps you in the danger zone. Your only priority is escaping." },
    ],
  },
  {
    id: "ya58",
    prompt: "You break up with someone, and they threaten to post private, embarrassing information about you online if you don't take them back.",
    context: "Extortion / Blackmail",
    choices: [
      { id: "a", text: "Take them back temporarily to calm them down", safe: false, explanation: "Giving in to blackmail guarantees they will use the threat forever. It never ends." },
      { id: "b", text: "Do not comply. Document the threats via screenshots and contact law enforcement or a lawyer", safe: true, explanation: "Extortion is a crime. Documenting the threat provides you with legal leverage to stop them." },
      { id: "c", text: "Threaten to post their secrets in retaliation", safe: false, explanation: "Escalating creates a mutual combat situation legally, which can hurt your case if you need a restraining order." },
    ],
  },
  {
    id: "ya59",
    prompt: "You're at a doctor's appointment and the physician begins asking highly personal, non-medical questions about your sex life.",
    context: "Medical Boundaries",
    choices: [
      { id: "a", text: "Answer them because doctors need to know everything", safe: false, explanation: "If the questions do not pertain to your medical care (e.g., asking for explicit details rather than risk factors), it is inappropriate." },
      { id: "b", text: "Ask: 'Can you explain how this relates to my medical treatment today?'", safe: true, explanation: "This forces the provider to justify their questioning. If they can't, you have established a firm professional boundary." },
      { id: "c", text: "Lie to end the conversation quickly", safe: false, explanation: "Lying to doctors can affect your care. Establish the boundary instead." },
    ],
  },
  {
    id: "ya60",
    prompt: "Your friend asks you to lie to their partner and say they were with you last night, when they weren't.",
    context: "Enabling & Ethics",
    choices: [
      { id: "a", text: "Cover for them; that's what friends do", safe: false, explanation: "Covering up deception makes you complicit in their betrayal and damages your own integrity." },
      { id: "b", text: "Refuse. 'I value our friendship, but I will not lie to your partner for you.'", safe: true, explanation: "A true friend will not ask you to compromise your morals. Setting this boundary protects your peace." },
      { id: "c", text: "Tell their partner the truth immediately", safe: false, explanation: "While ethical, inserting yourself into their relationship drama can be dangerous or messy. Simply refuse to participate." },
    ],
  },

  // --- LEVEL 5: Severe Coercion, Deep Financial Abuse & High-Stakes Safety (61-70) ---
  {
    id: "ya61",
    prompt: "Your partner insists that your paychecks be deposited directly into an account only they have the login for, to 'manage the budget.'",
    context: "Financial Coercion",
    choices: [
      { id: "a", text: "Agree, it removes the stress of paying bills", safe: false, explanation: "This is severe financial abuse. You are being completely stripped of your resources and trapped." },
      { id: "b", text: "Refuse. Ensure your income goes into a private account in your name only", safe: true, explanation: "You must retain access to your own money to maintain independence and the ability to leave." },
      { id: "c", text: "Agree, but ask for an allowance", safe: false, explanation: "Adults do not get 'allowances' of their own earned money. Keep your finances under your control." },
    ],
  },
  {
    id: "ya62",
    prompt: "You discover a hidden camera in the bedroom of an Airbnb or rental property.",
    context: "Surveillance Crimes",
    choices: [
      { id: "a", text: "Unplug it and stay for the rest of your trip", safe: false, explanation: "If there is one camera, there are likely others. Your privacy has been criminally violated." },
      { id: "b", text: "Leave immediately, contact the platform (Airbnb), and file a police report", safe: true, explanation: "Recording people in private spaces without consent is a crime. Leave immediately to ensure your safety." },
      { id: "c", text: "Confront the host directly to demand a refund", safe: false, explanation: "Confronting someone who commits surveillance crimes is dangerous. Let the police handle it." },
    ],
  },
  {
    id: "ya63",
    prompt: "Your long-term partner begins subtly cutting down your friends, saying they 'don't care about you like I do' and manufacturing drama to keep you away from them.",
    context: "Emotional Isolation",
    choices: [
      { id: "a", text: "Distance yourself from your friends to focus on the relationship", safe: false, explanation: "This is textbook abusive isolation. Abusers eliminate your support system so you cannot escape them." },
      { id: "b", text: "Recognize the manipulation, maintain your friendships, and consult a domestic abuse resource", safe: true, explanation: "Identifying isolation tactics is critical. Holding onto your external support network is your lifeline." },
      { id: "c", text: "Argue with your partner to defend your friends", safe: false, explanation: "Arguing feeds the abuser's desire for conflict and allows them to play the victim. Keep your friends quietly." },
    ],
  },
  {
    id: "ya64",
    prompt: "You are trying to leave an abusive relationship. The abuser has access to your phone plan, iCloud/Google account, and bank.",
    context: "Exit Planning Strategy",
    choices: [
      { id: "a", text: "Pack your bags and announce you are leaving right now", safe: false, explanation: "The most dangerous time for a victim is when they try to leave. Spontaneous exits without securing digital/financial assets are highly risky." },
      { id: "b", text: "Secretly buy a burner phone, open a new private bank account, and coordinate with a DV shelter before leaving silently", safe: true, explanation: "Safe exits require meticulous, secret planning. Securing untrackable communication and money is step one." },
      { id: "c", text: "Wait until they are in a good mood to ask for a breakup", safe: false, explanation: "Abusers do not grant 'permission' to leave. You must orchestrate your own escape." },
    ],
  },
  {
    id: "ya65",
    prompt: "A supervisor implies you will be fired unless you go on a date with them.",
    context: "Quid Pro Quo Harassment",
    choices: [
      { id: "a", text: "Go on one date to keep your job, but refuse a second", safe: false, explanation: "This is illegal 'quid pro quo' sexual harassment. Giving in once only invites escalating demands." },
      { id: "b", text: "Refuse, document the threat meticulously, and report directly to HR and the labor board", safe: true, explanation: "This is a severe violation of labor laws. Documentation and external reporting are your strongest shields." },
      { id: "c", text: "Flirt back to buy time", safe: false, explanation: "Playing along can be used against you later to claim the interaction was consensual." },
    ],
  },
  {
    id: "ya66",
    prompt: "Your partner sabotages your birth control (e.g., throwing away pills, poking holes in condoms) without your knowledge.",
    context: "Reproductive Coercion/Assault",
    choices: [
      { id: "a", text: "Forgive them; they just really want a family", safe: false, explanation: "Sabotaging birth control is a form of sexual assault and reproductive coercion. It is a massive betrayal of bodily autonomy." },
      { id: "b", text: "Seek emergency contraception immediately, secure your documents, and safely exit the relationship", safe: true, explanation: "This is a dangerous abuser trying to trap you. Protect your body medically and leave safely." },
      { id: "c", text: "Start hiding your pills better", safe: false, explanation: "If you have to hide your medication from your partner, you are in grave danger. Hiding is not a long-term solution." },
    ],
  },
  {
    id: "ya67",
    prompt: "You discover your identity has been used to open multiple credit cards by a family member.",
    context: "Familial Fraud",
    choices: [
      { id: "a", text: "Pay off the debt yourself to protect the family member from jail", safe: false, explanation: "You are enabling a felony and destroying your own financial future. You are not responsible for their crimes." },
      { id: "b", text: "Freeze your credit, file a police report for identity theft, and dispute the charges with the bureaus", safe: true, explanation: "You must file a police report to legally clear your name of the debt, regardless of who committed the fraud." },
      { id: "c", text: "Ask them nicely to pay it back over time", safe: false, explanation: "They committed fraud; they cannot be trusted to pay. This leaves the legal liability solely on your shoulders." },
    ],
  },
  {
    id: "ya68",
    prompt: "An ex-partner refuses to return your pet and threatens to harm the animal if you don't come over alone to 'talk.'",
    context: "Coercive Control via Pets",
    choices: [
      { id: "a", text: "Go over alone; you have to save your pet", safe: false, explanation: "This is a classic trap to lure victims into isolated, dangerous situations. Do not go alone." },
      { id: "b", text: "Do not go alone. Contact the police to request a 'civil standby' to retrieve your property/pet safely", safe: true, explanation: "Law enforcement can escort you to safely retrieve belongings. Threatening an animal is a massive escalation." },
      { id: "c", text: "Break into their house while they are at work", safe: false, explanation: "Breaking and entering is a crime and can result in your arrest, giving the abuser leverage over you." },
    ],
  },
  {
    id: "ya69",
    prompt: "You are served with a lawsuit/subpoena that you believe is completely baseless and meant to intimidate you (SLAPP suit).",
    context: "Legal Abuse",
    choices: [
      { id: "a", text: "Ignore the paperwork because you know you are innocent", safe: false, explanation: "Ignoring a lawsuit guarantees you will lose by default, resulting in financial ruin. You must respond." },
      { id: "b", text: "Do not ignore it. Hire a lawyer immediately to file a motion to dismiss", safe: true, explanation: "Legal abuse must be fought in court. A lawyer can often get baseless intimidation suits thrown out quickly." },
      { id: "c", text: "Call the person suing you and yell at them", safe: false, explanation: "Anything you say can be used against you in court. Route all communication through an attorney." },
    ],
  },
  {
    id: "ya70",
    prompt: "You've successfully left an abusive relationship. Weeks later, the abuser sends a calm, apologetic message saying they 'finally understand' and want closure.",
    context: "Hoovering / Post-Separation Abuse",
    choices: [
      { id: "a", text: "Meet them in a public place just for closure", safe: false, explanation: "'Closure' is a myth used by abusers to re-establish contact and control. (This tactic is called 'hoovering')." },
      { id: "b", text: "Do not respond. Maintain absolute zero contact and block the new number", safe: true, explanation: "No contact must be absolute. Any response, even a negative one, proves they can still command your attention." },
      { id: "c", text: "Reply to tell them you never want to speak to them again", safe: false, explanation: "Replying breaks no-contact and gives them the engagement they are seeking. Silence is your best defense." },
    ],
  },
];