export interface Scenario {
  id: string;
  prompt: string;
  context: string;
  choices: { id: string; text: string; safe: boolean; explanation: string }[];
}

export const TEENS_SCENARIOS: Scenario[] = [
  // --- Online Safety & Privacy (1-14) ---
  {
    id: "ts1",
    prompt: "Someone you've been chatting with for two weeks asks for a private photo.",
    context: "Instagram DMs",
    choices: [
      { id: "a", text: "Send it — they promised to delete it", safe: false, explanation: "Once a photo leaves your device, you lose all control. 'Promises' are a classic pressure tactic." },
      { id: "b", text: "Decline, screenshot, block, report", safe: true, explanation: "Spot on. Saying no, documenting, and reporting protects you and warns the platform." },
      { id: "c", text: "Send a 'fake' photo to be polite", safe: false, explanation: "You don't owe anyone a photo. Polite refusal is enough." },
    ],
  },
  {
    id: "ts2",
    prompt: "A gaming friend asks for your login to help you level up.",
    context: "Discord",
    choices: [
      { id: "a", text: "Give it, they seem pro", safe: false, explanation: "Never share passwords. They could steal your account or personal info." },
      { id: "b", text: "Say no and keep your info private", safe: true, explanation: "Account security is non-negotiable. Real friends don't need your passwords." },
      { id: "c", text: "Use a temporary password and give it", safe: false, explanation: "Even temporary access gives them control over your connected emails and data." },
    ],
  },
  {
    id: "ts3",
    prompt: "An online friend wants to switch from a public chat to a 'secret' messaging app.",
    context: "Gaming Chat",
    choices: [
      { id: "a", text: "Switch, it sounds fun", safe: false, explanation: "Moving to encrypted/secret apps is a common grooming tactic to hide conversations." },
      { id: "b", text: "Refuse and stay on the public platform", safe: true, explanation: "Staying on platforms with moderation keeps a paper trail and protects you." },
      { id: "c", text: "Give them your actual phone number instead", safe: false, explanation: "Sharing your number gives them a direct line to you outside the app's safety nets." },
    ],
  },
  {
    id: "ts4",
    prompt: "A recruiter on LinkedIn asks for your home address for 'swag'.",
    context: "Professional Networking",
    choices: [
      { id: "a", text: "Give it, free stuff!", safe: false, explanation: "Never give your home address to unverified contacts online." },
      { id: "b", text: "Ask them to send it to your school/office", safe: true, explanation: "Using a public or institutional address protects your private residence." },
      { id: "c", text: "Give your friend's address", safe: false, explanation: "Don't compromise a friend's privacy either." },
    ],
  },
  {
    id: "ts5",
    prompt: "You get a text from an unknown number saying 'Hey, it's me, I lost my phone. Need $20.'",
    context: "SMS / Text",
    choices: [
      { id: "a", text: "Send the money immediately", safe: false, explanation: "This is a classic phishing scam." },
      { id: "b", text: "Call the friend's original number to verify", safe: true, explanation: "Always verify through a known secondary channel before sending money." },
      { id: "c", text: "Reply asking for their name", safe: false, explanation: "Replying confirms your number is active to scammers." },
    ],
  },
  {
    id: "ts6",
    prompt: "A site asks for your location data to 'improve experience'.",
    context: "Web Browsing",
    choices: [
      { id: "a", text: "Allow always", safe: false, explanation: "Constant tracking builds a profile of your daily habits." },
      { id: "b", text: "Deny or Allow Once if strictly needed", safe: true, explanation: "Minimizing location sharing protects your physical safety." },
      { id: "c", text: "Ignore the popup", safe: false, explanation: "Ignoring it might leave default permissions active. Explicitly deny." },
    ],
  },
  {
    id: "ts7",
    prompt: "Someone threatens to post an embarrassing photo of you unless you do what they say.",
    context: "Sextortion / Blackmail",
    choices: [
      { id: "a", text: "Comply so they don't post it", safe: false, explanation: "Complying never stops blackmail; it only leads to more demands." },
      { id: "b", text: "Stop contact, take screenshots, tell a trusted adult", safe: true, explanation: "Blackmail is a crime. Do not pay or comply. Report it immediately." },
      { id: "c", text: "Threaten them back", safe: false, explanation: "Escalating the situation is dangerous. Cut contact and report." },
    ],
  },
  {
    id: "ts8",
    prompt: "A popular influencer runs a giveaway asking for your bank routing number.",
    context: "Social Media",
    choices: [
      { id: "a", text: "Give it to win", safe: false, explanation: "Legit giveaways don't need routing numbers. This is financial fraud." },
      { id: "b", text: "Report the post as a scam", safe: true, explanation: "Reporting protects you and others from financial theft." },
      { id: "c", text: "DM them asking if it's real", safe: false, explanation: "Scammers will always lie and say it's real." },
    ],
  },
  {
    id: "ts9",
    prompt: "You notice a friend posting unusually dark, cryptic messages online.",
    context: "Social Media Feed",
    choices: [
      { id: "a", text: "Comment 'mood'", safe: false, explanation: "Dismissing potential cries for help can be dangerous." },
      { id: "b", text: "Reach out privately and ask if they are okay", safe: true, explanation: "Direct, private support shows you care without public pressure." },
      { id: "c", text: "Screenshot and make fun of it", safe: false, explanation: "Cyberbullying worsens mental health crises." },
    ],
  },
  {
    id: "ts10",
    prompt: "An app you downloaded requires access to your microphone and camera to play a puzzle game.",
    context: "App Permissions",
    choices: [
      { id: "a", text: "Grant access to play", safe: false, explanation: "Puzzle games don't need camera/mic access. This is spyware." },
      { id: "b", text: "Deny access and uninstall", safe: true, explanation: "If an app demands unnecessary permissions, it's not safe to use." },
      { id: "c", text: "Grant it but cover the camera", safe: false, explanation: "They can still record your audio. Just delete the app." },
    ],
  },
  {
    id: "ts11",
    prompt: "A stranger sends you a link saying 'Is this a picture of you?'",
    context: "Phishing Link",
    choices: [
      { id: "a", text: "Click to see what it is", safe: false, explanation: "Clicking unknown links can install malware or steal your IP." },
      { id: "b", text: "Delete the message and block", safe: true, explanation: "Ignoring and blocking malicious links is the safest defense." },
      { id: "c", text: "Forward it to a friend", safe: false, explanation: "Now you're putting your friend's device at risk." },
    ],
  },
  {
    id: "ts12",
    prompt: "You are setting up a new social media profile. What privacy setting do you choose?",
    context: "Account Creation",
    choices: [
      { id: "a", text: "Public, to get more followers", safe: false, explanation: "Public profiles expose you to predators and data scrapers." },
      { id: "b", text: "Private, only approving people I know IRL", safe: true, explanation: "Keeping a tight circle protects your digital footprint." },
      { id: "c", text: "Private, but accept everyone who requests", safe: false, explanation: "Accepting strangers defeats the purpose of a private account." },
    ],
  },
  {
    id: "ts13",
    prompt: "A friend uses your phone and leaves their account logged in.",
    context: "Physical Device Safety",
    choices: [
      { id: "a", text: "Snoop through their messages", safe: false, explanation: "Invading privacy breaks trust and boundaries." },
      { id: "b", text: "Log them out immediately", safe: true, explanation: "Respecting digital privacy is a sign of a good friend." },
      { id: "c", text: "Post a funny status from their account", safe: false, explanation: "Even as a joke, this violates their digital consent." },
    ],
  },
  {
    id: "ts14",
    prompt: "You get an email saying your account will be deleted in 24 hours unless you log in via the link.",
    context: "Email Security",
    choices: [
      { id: "a", text: "Click the link and log in fast", safe: false, explanation: "Urgency is a manipulation tactic used in phishing." },
      { id: "b", text: "Go to the official website separately to check", safe: true, explanation: "Always verify claims by going directly to the source, not through links." },
      { id: "c", text: "Reply to the email asking for proof", safe: false, explanation: "Replying confirms your email is active for scammers." },
    ],
  },

  // --- Relationships & Dating (15-28) ---
  {
    id: "ts15",
    prompt: "Your partner gets angry every time you hang out with friends without them.",
    context: "Three months in",
    choices: [
      { id: "a", text: "Stop seeing friends to keep the peace", safe: false, explanation: "Isolation is a major red flag of controlling behavior. You deserve a full life." },
      { id: "b", text: "Talk openly, set a boundary, watch the response", safe: true, explanation: "How they react to a boundary tells you everything. Healthy partners respect them." },
      { id: "c", text: "Hide your plans from them", safe: false, explanation: "Hiding feeds the dynamic. Honest boundaries — and a trusted adult if needed — are safer." },
    ],
  },
  {
    id: "ts16",
    prompt: "Your date insists on paying for dinner and says 'Now you owe me a kiss.'",
    context: "First Date",
    choices: [
      { id: "a", text: "Give them a kiss to be polite", safe: false, explanation: "Affection is not a currency. You never owe anyone physical contact." },
      { id: "b", text: "Say no, pay your half, and leave", safe: true, explanation: "Setting a firm boundary against transactional affection is crucial." },
      { id: "c", text: "Laugh awkwardly and stay", safe: false, explanation: "Staying gives them room to keep pressing the boundary." },
    ],
  },
  {
    id: "ts17",
    prompt: "Your partner asks for your phone passcode to 'prove you trust them.'",
    context: "Relationship Trust",
    choices: [
      { id: "a", text: "Give it to them to avoid a fight", safe: false, explanation: "Demanding access to your private device is controlling, not loving." },
      { id: "b", text: "Refuse, explaining that privacy doesn't mean secrecy", safe: true, explanation: "Healthy relationships respect individual privacy." },
      { id: "c", text: "Ask for theirs in return", safe: false, explanation: "Mutual invasion of privacy is still toxic." },
    ],
  },
  {
    id: "ts18",
    prompt: "Someone you're seeing constantly criticizes your outfits and hair.",
    context: "Emotional Boundaries",
    choices: [
      { id: "a", text: "Change your style to make them happy", safe: false, explanation: "Changing yourself to avoid criticism destroys self-esteem." },
      { id: "b", text: "Tell them to stop, and leave if they don't", safe: true, explanation: "A good partner uplifts you. Constant criticism is emotional abuse." },
      { id: "c", text: "Start criticizing them back", safe: false, explanation: "Retaliation creates a toxic cycle. Walk away instead." },
    ],
  },
  {
    id: "ts19",
    prompt: "Your partner threatens to break up with you if you don't sleep with them.",
    context: "Sexual Coercion",
    choices: [
      { id: "a", text: "Do it to save the relationship", safe: false, explanation: "Coercion is not consent. A relationship built on threats isn't worth saving." },
      { id: "b", text: "Accept the breakup and walk away", safe: true, explanation: "Anyone who threatens you over boundaries doesn't care about your wellbeing." },
      { id: "c", text: "Negotiate for something less extreme", safe: false, explanation: "You should never have to negotiate your bodily autonomy." },
    ],
  },
  {
    id: "ts20",
    prompt: "After a fight, your partner gives you the silent treatment for days.",
    context: "Conflict Resolution",
    choices: [
      { id: "a", text: "Beg them to talk to you", safe: false, explanation: "The silent treatment is a manipulative tactic to gain control." },
      { id: "b", text: "Give them space, but recognize this is toxic communication", safe: true, explanation: "Healthy couples communicate. Withholding affection as punishment is a red flag." },
      { id: "c", text: "Spam them with apologies", safe: false, explanation: "Apologizing when you did nothing wrong reinforces their control." },
    ],
  },
  {
    id: "ts21",
    prompt: "Your partner makes fun of your dreams and career goals.",
    context: "Support Systems",
    choices: [
      { id: "a", text: "Give up on your goals", safe: false, explanation: "Never shrink your ambitions for someone else." },
      { id: "b", text: "Re-evaluate the relationship; they should support you", safe: true, explanation: "Partners should be your biggest cheerleaders, not your critics." },
      { id: "c", text: "Keep your goals a secret", safe: false, explanation: "Hiding parts of yourself means the relationship isn't safe." },
    ],
  },
  {
    id: "ts22",
    prompt: "Your ex keeps showing up at your job uninvited after you asked them not to.",
    context: "Stalking",
    choices: [
      { id: "a", text: "Talk to them to calm them down", safe: false, explanation: "Engaging rewards their stalking behavior with attention." },
      { id: "b", text: "Notify your boss/security and document the visits", safe: true, explanation: "Stalking is dangerous. Build a paper trail and involve security." },
      { id: "c", text: "Quit your job", safe: false, explanation: "You shouldn't lose your livelihood. Escalate to authorities first." },
    ],
  },
  {
    id: "ts23",
    prompt: "Your date drinks too much and insists on driving you home.",
    context: "Physical Safety",
    choices: [
      { id: "a", text: "Get in, you live close by", safe: false, explanation: "Never get in a car with an impaired driver, no matter the distance." },
      { id: "b", text: "Refuse, call a rideshare, and offer to call them one too", safe: true, explanation: "Prioritize your life. Don't let them drive either if you can help it." },
      { id: "c", text: "Offer to drive their car, even if you don't have a license", safe: false, explanation: "Driving without a license/insurance carries heavy legal risks." },
    ],
  },
  {
    id: "ts24",
    prompt: "You want to say 'I love you', but your partner says they aren't ready.",
    context: "Pacing",
    choices: [
      { id: "a", text: "Pressure them until they say it back", safe: false, explanation: "Pressuring someone invalidates their feelings and boundaries." },
      { id: "b", text: "Respect their timeline and communicate openly", safe: true, explanation: "People move at different speeds. Respect is key." },
      { id: "c", text: "Break up immediately", safe: false, explanation: "Differing timelines don't mean the relationship is doomed, just communicate." },
    ],
  },
  {
    id: "ts25",
    prompt: "Your partner often texts 'Who are you with?' multiple times an hour.",
    context: "Digital Control",
    choices: [
      { id: "a", text: "Send photo proof every time to calm them", safe: false, explanation: "Catering to paranoia encourages controlling behavior." },
      { id: "b", text: "Set a boundary about constant check-ins", safe: true, explanation: "You are allowed to exist without reporting your every move." },
      { id: "c", text: "Lie and say you're alone", safe: false, explanation: "Lying complicates things and keeps you trapped in a toxic dynamic." },
    ],
  },
  {
    id: "ts26",
    prompt: "A new person you're dating wants to move in together after two weeks.",
    context: "Love Bombing",
    choices: [
      { id: "a", text: "Do it, it feels like a movie", safe: false, explanation: "Extreme rushing is a tactic called love bombing, often used by abusers." },
      { id: "b", text: "Pump the brakes and enforce a healthy pace", safe: true, explanation: "Healthy relationships take time to build trust. Rushing is a red flag." },
      { id: "c", text: "Say yes but secretly keep your old place", safe: false, explanation: "Avoid the situation entirely rather than living a double life." },
    ],
  },
  {
    id: "ts27",
    prompt: "Your partner blames you when they have a bad day at work.",
    context: "Blame Shifting",
    choices: [
      { id: "a", text: "Apologize and try to fix their mood", safe: false, explanation: "You are not responsible for regulating a grown person's emotions." },
      { id: "b", text: "Refuse to take the blame for things outside your control", safe: true, explanation: "Setting emotional boundaries protects your mental health." },
      { id: "c", text: "Yell back at them", safe: false, explanation: "Escalation rarely solves the core issue of blame-shifting." },
    ],
  },
  {
    id: "ts28",
    prompt: "You find out your partner lied about their age by several years.",
    context: "Deception",
    choices: [
      { id: "a", text: "Ignore it, age is just a number", safe: false, explanation: "Lying about core identity facts is a massive breach of trust and a safety risk." },
      { id: "b", text: "End the relationship due to the deception", safe: true, explanation: "If they lie about their age, they will lie about other important things." },
      { id: "c", text: "Keep dating but don't trust them", safe: false, explanation: "A relationship without trust is inherently damaging." },
    ],
  },

  // --- Peer Pressure & Social Dynamics (29-42) ---
  {
    id: "ts29",
    prompt: "An older student offers you a ride home alone after a party.",
    context: "Late night, no other rides",
    choices: [
      { id: "a", text: "Accept, you've seen them around", safe: false, explanation: "Familiarity isn't safety. Most harm comes from people we 'sort of' know." },
      { id: "b", text: "Call a parent or use a rideshare with location shared", safe: true, explanation: "Smart. Sharing live location with someone you trust is a power move." },
      { id: "c", text: "Walk home alone instead", safe: false, explanation: "Walking alone late isn't ideal either. Always have a backup plan." },
    ],
  },
  {
    id: "ts30",
    prompt: "Friends try to convince you to shoplift 'just something small.'",
    context: "At the mall",
    choices: [
      { id: "a", text: "Do it so they don't call you a coward", safe: false, explanation: "A criminal record isn't worth impressing toxic friends." },
      { id: "b", text: "Say no firmly and walk out of the store", safe: true, explanation: "Walking away removes you from guilt by association and legal risk." },
      { id: "c", text: "Act as the lookout instead", safe: false, explanation: "Being a lookout still makes you an accomplice to the crime." },
    ],
  },
  {
    id: "ts31",
    prompt: "At a party, someone hands you a cup but you didn't see them pour the drink.",
    context: "Substance Safety",
    choices: [
      { id: "a", text: "Drink it to be polite", safe: false, explanation: "Never accept an open drink you didn't watch being poured." },
      { id: "b", text: "Pretend to sip, then 'accidentally' spill it or throw it away", safe: true, explanation: "Dumping an unknown drink is the safest move if you feel pressured." },
      { id: "c", text: "Give it to someone else", safe: false, explanation: "Don't pass a potentially spiked drink to another person." },
    ],
  },
  {
    id: "ts32",
    prompt: "Your friends are mocking a classmate in a group chat and want you to join in.",
    context: "Cyberbullying",
    choices: [
      { id: "a", text: "Send a laugh emoji to blend in", safe: false, explanation: "Passive agreement enables the bullying." },
      { id: "b", text: "Tell them it's uncool or simply leave the chat", safe: true, explanation: "Refusing to participate breaks the bystander effect." },
      { id: "c", text: "Screenshot and post it publicly", safe: false, explanation: "Public exposure might escalate the drama and harm the victim more." },
    ],
  },
  {
    id: "ts33",
    prompt: "A friend asks you to lie to their parents about where they were last night.",
    context: "Covering up",
    choices: [
      { id: "a", text: "Lie for them, bros before everyone", safe: false, explanation: "Covering up dangerous behavior makes you liable if something goes wrong." },
      { id: "b", text: "Tell them you won't lie, keep me out of it", safe: true, explanation: "Setting boundaries on lying protects your own integrity." },
      { id: "c", text: "Blackmail them for a favor", safe: false, explanation: "Using a friend's secret against them is manipulative." },
    ],
  },
  {
    id: "ts34",
    prompt: "You're studying for finals and a friend begs for your answers.",
    context: "Academic Integrity",
    choices: [
      { id: "a", text: "Give the answers to be helpful", safe: false, explanation: "Cheating can get both of you expelled or suspended." },
      { id: "b", text: "Offer to study together instead", safe: true, explanation: "Offering real help protects your integrity while still being a friend." },
      { id: "c", text: "Give them the wrong answers", safe: false, explanation: "Sabotage is cruel. Just set a firm boundary." },
    ],
  },
  {
    id: "ts35",
    prompt: "A group dares you to trespass into an abandoned building at night.",
    context: "Physical Danger",
    choices: [
      { id: "a", text: "Go in, you want the adrenaline", safe: false, explanation: "Trespassing is illegal and abandoned buildings are structurally unsafe." },
      { id: "b", text: "Refuse the dare and suggest something else", safe: true, explanation: "Real friends won't force you into dangerous, illegal situations." },
      { id: "c", text: "Wait outside for them", safe: false, explanation: "You could still be charged with trespassing or accessory if police arrive." },
    ],
  },
  {
    id: "ts36",
    prompt: "Your friend wants to drive home but is visibly intoxicated.",
    context: "DUI Prevention",
    choices: [
      { id: "a", text: "Let them, they drive better drunk anyway", safe: false, explanation: "Drunk driving is lethal. Never enable it." },
      { id: "b", text: "Take their keys and order a rideshare", safe: true, explanation: "Taking action saves lives. A temporary fight is better than a funeral." },
      { id: "c", text: "Just make sure you don't ride with them", safe: false, explanation: "You protect yourself, but let them risk their life and others." },
    ],
  },
  {
    id: "ts37",
    prompt: "Friends are sharing a vape in the bathroom and hand it to you.",
    context: "Substance Pressure",
    choices: [
      { id: "a", text: "Hit it once to look cool", safe: false, explanation: "Nicotine is highly addictive. One hit can lead to a habit." },
      { id: "b", text: "Pass it on and say 'not my thing'", safe: true, explanation: "A casual but firm 'no' is highly effective in peer pressure scenarios." },
      { id: "c", text: "Lecture them on lung cancer", safe: false, explanation: "Lecturing usually creates hostility. Just decline and leave." },
    ],
  },
  {
    id: "ts38",
    prompt: "Your group is ignoring one specific person to 'teach them a lesson.'",
    context: "Social Exclusion",
    choices: [
      { id: "a", text: "Join the silent treatment", safe: false, explanation: "Social exclusion is a form of emotional bullying." },
      { id: "b", text: "Reach out to the person privately to check in", safe: true, explanation: "Showing empathy disrupts toxic groupthink." },
      { id: "c", text: "Start a fight with the group leader", safe: false, explanation: "Direct conflict might not help the victim; support the victim first." },
    ],
  },
  {
    id: "ts39",
    prompt: "A friend pressures you to skip school to go to a concert.",
    context: "Truancy",
    choices: [
      { id: "a", text: "Skip, you only live once", safe: false, explanation: "Skipping has academic and disciplinary consequences." },
      { id: "b", text: "Say you can't afford to miss classes right now", safe: true, explanation: "Blaming your own goals/schedule is an easy way to decline." },
      { id: "c", text: "Snitch on them to the principal", safe: false, explanation: "Unnecessary escalation. Just manage your own choices." },
    ],
  },
  {
    id: "ts40",
    prompt: "Everyone is taking a dangerous viral challenge on TikTok.",
    context: "Social Media Trends",
    choices: [
      { id: "a", text: "Do it for the views", safe: false, explanation: "Viral challenges often result in severe injury or death." },
      { id: "b", text: "Scroll past and ignore the hype", safe: true, explanation: "Your physical safety is worth more than fleeting internet points." },
      { id: "c", text: "Fake the video using editing", safe: false, explanation: "Faking it still promotes the dangerous trend to others." },
    ],
  },
  {
    id: "ts41",
    prompt: "Your friend constantly borrows money and 'forgets' to pay you back.",
    context: "Financial Boundaries",
    choices: [
      { id: "a", text: "Keep giving it to avoid awkwardness", safe: false, explanation: "You are being financially taken advantage of." },
      { id: "b", text: "Stop lending them money and explain why", safe: true, explanation: "Boundaries apply to money too. Real friends respect that." },
      { id: "c", text: "Steal something of theirs to make it even", safe: false, explanation: "Theft is a crime, regardless of who owes who." },
    ],
  },
  {
    id: "ts42",
    prompt: "A friend asks you to hold onto a suspicious package in your locker.",
    context: "Contraband",
    choices: [
      { id: "a", text: "Hold it, you owe them a favor", safe: false, explanation: "If it's illegal drugs or weapons, YOU will take the legal fall." },
      { id: "b", text: "Absolutely refuse; your locker is your responsibility", safe: true, explanation: "Never take possession of unknown or suspicious items." },
      { id: "c", text: "Take it but throw it in the trash", safe: false, explanation: "You still took possession of it, putting yourself at risk." },
    ],
  },

  // --- Mental Health, Self-Advocacy & Support (43-56) ---
  {
    id: "ts43",
    prompt: "You feel completely overwhelmed by school, work, and family drama.",
    context: "Burnout",
    choices: [
      { id: "a", text: "Keep pushing until you crash", safe: false, explanation: "Ignoring burnout leads to severe mental and physical health drops." },
      { id: "b", text: "Talk to a counselor and ask to drop a non-essential activity", safe: true, explanation: "Asking for help and reducing your load is self-advocacy." },
      { id: "c", text: "Just stop showing up to things without telling anyone", safe: false, explanation: "Ghosting responsibilities creates more stress later. Communicate." },
    ],
  },
  {
    id: "ts44",
    prompt: "A friend confides they are having thoughts of self-harm but asks you to keep it a secret.",
    context: "Crisis Support",
    choices: [
      { id: "a", text: "Keep the secret to maintain trust", safe: false, explanation: "Safety overrides secrecy. You cannot manage a life-threatening crisis alone." },
      { id: "b", text: "Tell a trusted adult or school counselor immediately", safe: true, explanation: "It's better to have a mad friend than a dead friend. Get professional help." },
      { id: "c", text: "Try to act as their therapist", safe: false, explanation: "You are not trained for this and it will damage your own mental health." },
    ],
  },
  {
    id: "ts45",
    prompt: "You are experiencing a panic attack in the middle of class.",
    context: "Anxiety",
    choices: [
      { id: "a", text: "Hold your breath and try to hide it", safe: false, explanation: "Suppressing a panic attack usually makes the physical symptoms worse." },
      { id: "b", text: "Quietly ask to use the restroom to do grounding exercises", safe: true, explanation: "Removing yourself from the stimulus and breathing helps reset your nervous system." },
      { id: "c", text: "Run out of the room screaming", safe: false, explanation: "While panic is terrifying, try to use an exit strategy that keeps you safe." },
    ],
  },
  {
    id: "ts46",
    prompt: "A friend constantly vents to you for hours, draining your energy.",
    context: "Emotional Dumping",
    choices: [
      { id: "a", text: "Listen forever, that's what friends do", safe: false, explanation: "Being a friend doesn't mean being an emotional dumping ground 24/7." },
      { id: "b", text: "Set a boundary: 'I care, but I don't have the mental space right now'", safe: true, explanation: "Protecting your peace is necessary so you don't burn out." },
      { id: "c", text: "Ignore their texts completely", safe: false, explanation: "Ghosting hurts. Clear communication of boundaries is kinder." },
    ],
  },
  {
    id: "ts47",
    prompt: "You receive a test grade much lower than you expected and feel like a failure.",
    context: "Academic Setback",
    choices: [
      { id: "a", text: "Tear up the test and give up on the class", safe: false, explanation: "One grade does not define your intelligence or future." },
      { id: "b", text: "Review the mistakes and ask the teacher for help", safe: true, explanation: "Growth mindset. Use failure as data to improve." },
      { id: "c", text: "Blame the teacher entirely", safe: false, explanation: "Deflecting blame prevents you from learning the material." },
    ],
  },
  {
    id: "ts48",
    prompt: "Someone makes a 'joke' about your body weight in front of others.",
    context: "Body Shaming",
    choices: [
      { id: "a", text: "Laugh along so you don't seem sensitive", safe: false, explanation: "Laughing validates their disrespect of your body." },
      { id: "b", text: "Say 'That's not funny' and change the subject", safe: true, explanation: "A calm, direct shut-down removes their power without causing a screaming match." },
      { id: "c", text: "Insult their body in return", safe: false, explanation: "Sinking to their level just creates a toxic environment." },
    ],
  },
  {
    id: "ts49",
    prompt: "You notice you are spending 8 hours a day scrolling social media.",
    context: "Digital Wellbeing",
    choices: [
      { id: "a", text: "Accept that it's just how life is now", safe: false, explanation: "Excessive screen time is linked to depression and anxiety." },
      { id: "b", text: "Set app limits and schedule screen-free time", safe: true, explanation: "Proactive limits help you regain control of your attention." },
      { id: "c", text: "Smash your phone", safe: false, explanation: "Destruction isn't a sustainable habit-building technique." },
    ],
  },
  {
    id: "ts50",
    prompt: "You're feeling depressed but are afraid to tell your parents they might overreact.",
    context: "Seeking Help",
    choices: [
      { id: "a", text: "Keep it hidden and hope it passes", safe: false, explanation: "Depression often requires treatment to improve. Don't suffer alone." },
      { id: "b", text: "Talk to a school counselor first to help bridge the gap", safe: true, explanation: "Counselors can help mediate the conversation with parents." },
      { id: "c", text: "Self-medicate with alcohol or drugs", safe: false, explanation: "Substances worsen depression and create entirely new crises." },
    ],
  },
  {
    id: "ts51",
    prompt: "You start restricting your food intake to look like influencers online.",
    context: "Eating Habits",
    choices: [
      { id: "a", text: "Keep going, discipline is good", safe: false, explanation: "Starving yourself leads to severe medical issues, not health." },
      { id: "b", text: "Unfollow triggering accounts and talk to a doctor", safe: true, explanation: "Curating your feed and getting medical advice builds real health." },
      { id: "c", text: "Try diet pills instead", safe: false, explanation: "Unregulated supplements are dangerous and ineffective." },
    ],
  },
  {
    id: "ts52",
    prompt: "A friend apologizes for hurting you, but does the exact same thing the next day.",
    context: "Forgiveness",
    choices: [
      { id: "a", text: "Forgive them again, they said sorry", safe: false, explanation: "An apology without changed behavior is just manipulation." },
      { id: "b", text: "Distance yourself; words must match actions", safe: true, explanation: "Protecting yourself from repeated harm is healthy." },
      { id: "c", text: "Hold a grudge but stay close to them", safe: false, explanation: "Resentment breeds toxicity. Better to walk away." },
    ],
  },
  {
    id: "ts53",
    prompt: "You are struggling to sleep because your mind won't stop racing.",
    context: "Insomnia",
    choices: [
      { id: "a", text: "Stay on your phone all night", safe: false, explanation: "Blue light suppresses melatonin, keeping you awake longer." },
      { id: "b", text: "Do a brain-dump in a journal and read a book", safe: true, explanation: "Getting thoughts on paper clears the mind, and reading offline induces sleep." },
      { id: "c", text: "Take sleeping pills meant for an adult", safe: false, explanation: "Never take unprescribed medication." },
    ],
  },
  {
    id: "ts54",
    prompt: "You feel jealous seeing your friends hang out without you on Snapchat.",
    context: "FOMO",
    choices: [
      { id: "a", text: "Post passive-aggressive stories about fake friends", safe: false, explanation: "Vaguebooking creates drama and pushes people away." },
      { id: "b", text: "Mute the story, focus on your own hobbies, and plan your own outing later", safe: true, explanation: "Taking control of your reaction and your own plans beats wallowing." },
      { id: "c", text: "Text them demanding to know why you weren't invited", safe: false, explanation: "Demanding inclusion usually makes people defensive." },
    ],
  },
  {
    id: "ts55",
    prompt: "You realize a hobby you used to love now feels like a chore.",
    context: "Loss of Interest",
    choices: [
      { id: "a", text: "Force yourself to do it anyway", safe: false, explanation: "Forcing it can increase burnout." },
      { id: "b", text: "Take a break. If apathy persists, talk to a doctor (could be depression)", safe: true, explanation: "Loss of interest (anhedonia) is a key sign to check your mental health." },
      { id: "c", text: "Sell all your equipment immediately", safe: false, explanation: "Don't make permanent decisions during a temporary funk." },
    ],
  },
  {
    id: "ts56",
    prompt: "Your sibling reads your diary and mocks you for it.",
    context: "Home Privacy",
    choices: [
      { id: "a", text: "Read their texts to get revenge", safe: false, explanation: "Revenge creates an endless cycle of boundary violations." },
      { id: "b", text: "Get a lockbox and tell parents about the privacy breach", safe: true, explanation: "Securing your items and involving authority establishes firm limits." },
      { id: "c", text: "Stop writing in it entirely", safe: false, explanation: "Don't give up your coping mechanisms because someone else misbehaved." },
    ],
  },

  // --- Boundaries with Authority & Workplace (57-70) ---
  {
    id: "ts57",
    prompt: "A senior coworker keeps making 'jokes' about your appearance in meetings.",
    context: "Workplace",
    choices: [
      { id: "a", text: "Laugh it off to keep the peace", safe: false, explanation: "Tolerating it normalizes the behavior. You have rights." },
      { id: "b", text: "Document each instance with dates, then report to HR", safe: true, explanation: "Documentation is your strongest tool. Formal reports stop harassment." },
      { id: "c", text: "Confront them publicly", safe: false, explanation: "Public confrontation can be twisted against you. Document first." },
    ],
  },
  {
    id: "ts58",
    prompt: "Your manager asks you to work off the clock without pay to 'show dedication'.",
    context: "Labor Rights",
    choices: [
      { id: "a", text: "Do it so you don't get fired", safe: false, explanation: "Working off the clock is wage theft and illegal." },
      { id: "b", text: "State that you only work clocked-in hours", safe: true, explanation: "Setting firm professional boundaries prevents exploitation." },
      { id: "c", text: "Steal from the register to make up for it", safe: false, explanation: "Never commit a crime to balance out an injustice." },
    ],
  },
  {
    id: "ts59",
    prompt: "A teacher follows you on your private Instagram account.",
    context: "School Boundaries",
    choices: [
      { id: "a", text: "Accept it, it might get you a better grade", safe: false, explanation: "Blurring personal and professional boundaries with teachers is unsafe." },
      { id: "b", text: "Decline the request or block them", safe: true, explanation: "Teachers should not be in your private social media space." },
      { id: "c", text: "Follow them back and DM them", safe: false, explanation: "This crosses lines and puts you both in a compromising position." },
    ],
  },
  {
    id: "ts60",
    prompt: "An adult coach texts you late at night about non-sports topics.",
    context: "Inappropriate Communication",
    choices: [
      { id: "a", text: "Chat with them, they are just friendly", safe: false, explanation: "Late-night, off-topic texting from an adult authority is a major red flag for grooming." },
      { id: "b", text: "Show the texts to your parents and report to the league", safe: true, explanation: "Involving safe adults protects you and stops potential abuse." },
      { id: "c", text: "Tell them to stop but keep it a secret", safe: false, explanation: "Secrets protect predators. Always tell someone." },
    ],
  },
  {
    id: "ts61",
    prompt: "Your boss yells and curses at you in front of customers.",
    context: "Verbal Abuse at Work",
    choices: [
      { id: "a", text: "Accept it as part of having a job", safe: false, explanation: "No paycheck is worth verbal abuse." },
      { id: "b", text: "Quit if possible, or report to higher management", safe: true, explanation: "A toxic workplace will destroy your mental health. Plan an exit." },
      { id: "c", text: "Yell and curse back", safe: false, explanation: "Losing your temper gives them a reason to fire you 'for cause'." },
    ],
  },
  {
    id: "ts62",
    prompt: "A doctor examines you but makes you uncomfortable and doesn't explain what they are doing.",
    context: "Medical Autonomy",
    choices: [
      { id: "a", text: "Stay quiet, doctors know best", safe: false, explanation: "You always have the right to know what is happening to your body." },
      { id: "b", text: "Ask them to stop and explain, or request a chaperone", safe: true, explanation: "Advocating for your bodily autonomy in medical settings is your right." },
      { id: "c", text: "Run out of the clinic", safe: false, explanation: "Use your voice first. 'Stop' is a complete sentence." },
    ],
  },
  {
    id: "ts63",
    prompt: "A counselor pressures you to talk about a trauma you aren't ready to discuss.",
    context: "Therapy Boundaries",
    choices: [
      { id: "a", text: "Force yourself to talk and get re-traumatized", safe: false, explanation: "Therapy should move at a pace that feels safe for you." },
      { id: "b", text: "Say 'I'm not ready to discuss that yet'", safe: true, explanation: "A good professional will respect your pacing." },
      { id: "c", text: "Lie and make up a fake story", safe: false, explanation: "Lying defeats the purpose of therapy. Just assert your boundary." },
    ],
  },
  {
    id: "ts64",
    prompt: "You are asked to sign a contract for a gig but you don't understand the terms.",
    context: "Legal & Financial",
    choices: [
      { id: "a", text: "Sign it anyway to secure the job", safe: false, explanation: "Never sign a legal document you don't understand." },
      { id: "b", text: "Ask for time to review it with a parent or mentor", safe: true, explanation: "Taking time to review contracts protects you from exploitation." },
      { id: "c", text: "Refuse the job immediately", safe: false, explanation: "It might be fine, you just need to read it first." },
    ],
  },
  {
    id: "ts65",
    prompt: "A family member demands you give them access to your new bank account.",
    context: "Financial Independence",
    choices: [
      { id: "a", text: "Give it to them out of respect", safe: false, explanation: "Financial control is a form of abuse. Your money is yours." },
      { id: "b", text: "Keep your account private and secure", safe: true, explanation: "Setting financial boundaries is key to independence." },
      { id: "c", text: "Empty the account to hide the money", safe: false, explanation: "Banks are safer than holding cash. Just say no to access." },
    ],
  },
  {
    id: "ts66",
    prompt: "An adult family friend offers you alcohol at a family BBQ when your parents aren't looking.",
    context: "Adult Pressure",
    choices: [
      { id: "a", text: "Take it to show you are grown up", safe: false, explanation: "Adults who push boundaries with minors are not safe people." },
      { id: "b", text: "Say 'No thanks' and move to a different area", safe: true, explanation: "Declining and removing yourself from their vicinity protects you." },
      { id: "c", text: "Take it but pour it out", safe: false, explanation: "Accepting it signals to them that their boundary-crossing is okay." },
    ],
  },
  {
    id: "ts67",
    prompt: "Your boss schedules you for shifts during your mandatory school hours.",
    context: "Work/Life Balance",
    choices: [
      { id: "a", text: "Skip school to keep the job", safe: false, explanation: "Education must come first. Child labor laws protect student hours." },
      { id: "b", text: "Remind them of your availability in writing", safe: true, explanation: "Clear, written communication leaves a paper trail of your boundaries." },
      { id: "c", text: "Just don't show up", safe: false, explanation: "No-call no-showing is unprofessional. Communicate the error instead." },
    ],
  },
  {
    id: "ts68",
    prompt: "A police officer stops you and demands to search your backpack without giving a reason.",
    context: "Civil Rights",
    choices: [
      { id: "a", text: "Fight them to protect your rights", safe: false, explanation: "Physically resisting law enforcement is highly dangerous." },
      { id: "b", text: "Say 'I do not consent to searches' but do not physically resist", safe: true, explanation: "Verbally stating non-consent protects your legal rights in court." },
      { id: "c", text: "Run away", safe: false, explanation: "Running will escalate the situation and can lead to charges." },
    ],
  },
  {
    id: "ts69",
    prompt: "A college recruiter tells you to lie on your financial aid application to get more money.",
    context: "Fraud",
    choices: [
      { id: "a", text: "Do it, college is expensive", safe: false, explanation: "Lying on federal or institutional forms is fraud and carries severe penalties." },
      { id: "b", text: "Fill it out truthfully and look for legitimate scholarships", safe: true, explanation: "Integrity keeps you out of legal and financial trouble." },
      { id: "c", text: "Report the recruiter to the police", safe: false, explanation: "Start by just refusing. You can report them to the institution later." },
    ],
  },
  {
    id: "ts70",
    prompt: "A driving instructor touches your leg while 'correcting' your steering.",
    context: "Inappropriate Contact",
    choices: [
      { id: "a", text: "Ignore it, you need to pass the test", safe: false, explanation: "Your physical safety is more important than a driving test." },
      { id: "b", text: "Tell them to stop touching you, end the lesson, and report them", safe: true, explanation: "Unwanted physical contact from an instructor is assault. Report it." },
      { id: "c", text: "Swerve the car on purpose", safe: false, explanation: "Causing an accident puts your life at immediate physical risk." },
    ],
  }
];