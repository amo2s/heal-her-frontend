"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useTime, useTransform, Variants, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Code2, Stethoscope, ClipboardCheck, Megaphone, 
  GraduationCap, Mail, Facebook, Instagram, Phone, Target, 
  HeartHandshake, Library, Crown, Heart, ArrowRight, Github, Briefcase
} from "lucide-react"

// Import the newly created intelligent modal component
import ExpandedTeamMember from "@/components/ui/modals/team-card"

// ============================================================================
// PREMIUM PHYSICS & UTILITIES
// ============================================================================

const premiumSmooth: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: premiumSmooth } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: premiumSmooth } 
  }
}

const GrainOverlay = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
    }}
  />
)

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
)

const SocialButton = ({ icon: Icon, href, label }: { icon: any, href: string, label: string }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#CCCCD9] hover:bg-[#DA8CA0] hover:text-[#1C1246] hover:border-[#DA8CA0] transition-all duration-300 transform hover:-translate-y-0.5"
    // Prevent the modal from opening if a user directly clicks a social link
    onClick={(e) => e.stopPropagation()} 
  >
    <Icon className="h-3.5 w-3.5" />
  </a>
)

// ============================================================================
// SIMULATION: THE REFINED SYNERGY CORE
// ============================================================================
function SynergySimulation() {
  const time = useTime();
  
  const rotate1 = useTransform(time, [0, 20000], [0, 360], { clamp: false });
  const counterRotate1 = useTransform(time, [0, 20000], [0, -360], { clamp: false });

  const rotate2 = useTransform(time, [0, 25000], [0, -360], { clamp: false });
  const counterRotate2 = useTransform(time, [0, 25000], [0, 360], { clamp: false });

  return (
    <div className="relative w-full h-[350px] md:h-[400px] bg-[#231854]/20 rounded-[2rem] border border-white/5 overflow-hidden flex items-center justify-center backdrop-blur-md">
      <div className="relative z-10">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#1C1246] border border-white/10 flex items-center justify-center relative z-20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
           <Image 
             src="/heal-logo.png"
             alt="Heal Her Core Logo"
             width={64} 
             height={64}
             className="object-contain opacity-90"
           />
        </div>
      </div>

      <motion.div 
        className="absolute w-[200px] h-[200px] md:w-[250px] md:h-[250px] border border-white/5 rounded-full"
        style={{ rotate: rotate1 }}
      >
         <motion.div 
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#1C1246] border border-white/10 rounded-full flex items-center justify-center text-[#CCCCD9]"
            style={{ rotate: counterRotate1 }}
         >
            <Code2 className="h-3.5 w-3.5" />
         </motion.div>
      </motion.div>

      <motion.div 
        className="absolute w-[300px] h-[300px] md:w-[380px] md:h-[380px] border border-[#DA8CA0]/10 rounded-full"
        style={{ rotate: rotate2 }}
      >
         <motion.div 
           className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-[#1C1246] border border-[#DA8CA0]/20 rounded-full flex items-center justify-center text-[#DA8CA0]"
           style={{ rotate: counterRotate2 }}
         >
            <Stethoscope className="h-3.5 w-3.5" />
         </motion.div>
      </motion.div>

      <div className="absolute bottom-6 left-6 flex items-center gap-2">
         <div className="h-1.5 w-1.5 rounded-full bg-[#DA8CA0] animate-pulse" />
         <p className="text-[10px] font-mono text-[#CCCCD9] uppercase tracking-widest">Active Development Node</p>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function TeamPage() {
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Disable background scrolling when modal is open for mobile optimization
  useEffect(() => {
    if (selectedMember) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto" };
  }, [selectedMember]);

  const teamMembers = [
    {
      name: "Nwaka Amos Chika",
      nickname: "Sliverboy",
      role: "Founder & Lead Engineer",
      image: "/sliver.png", 
      operationalRole: "I lead the vision and development of HEAL Her. I manage the product roadmap, coordinate the team, oversee the design and development of new features, make key product decisions, and ensure the platform stays focused on helping girls access safe, trusted, and easy-to-understand health information. I also work closely with my team to improve the platform through research, user feedback, testing, and continuous innovation.",
      personalMission: "I founded HEAL Her because I believe every girl deserves access to trusted health education, no matter where she lives or her background. I have always wanted to use technology to solve real-life problems, and I saw that many girls struggle to get safe, simple, and reliable information about their health. HEAL Her was created to empower girls with knowledge, help them make better health decisions, and protect them from misinformation and harmful situations. My mission is to build technology that saves lives, educates people, and creates a healthier future for young girls across Africa and beyond.",
      education: "Student - B.Sc Computer Science",
      aspiration: "Full Stack Website & Mobile  Developer",
      icon: Crown, 
      isFounder: true, 
      socials: {
        instagram: "https://www.instagram.com/prism_y4",
        facebook: "https://www.facebook.com/share/1FC78LeYK8/",
        email: "mailto:nwakaamos95@gmail.com",
        whatsapp: "https://wa.me/2349063877703",
        phone: "tel:09063877703",
        github: "https://github.com/amo2s",
        portfolio: "https://sliver-designs.vercel.app/sliverboy"
      }
    },
    {
      name: "Khadija Maumda Musa",
      nickname: "HT Girl",
      role: "Medical UI Lead & Co-Founder",
      image: "/khadija.jpg",
      operationalRole: "As the Co-Founder, Khadija is the emotional and operational core of Heal Her. Her primary skills lie in community leadership, health advocacy, and empathetic content curation. Her main contribution to the project is actively managing and nurturing the 'Girls Lounge'—our secure, judgment-free peer support space that already protects a growing community of over 200 young women. She meticulously oversees our health content to ensure every girl feels heard, protected, and empowered when they seek answers. As a secondary focus, Khadija applies her interactive interface design skills to ensure the platform feels intuitive and culturally sensitive. While I handle the technical architecture, she is the human anchor, ensuring that our platform always speaks with the warmth, trust, and empathy of a digital older sister.",
      personalMission: "Growing up, I witnessed firsthand how societal stigma and fear silence young women when it comes to vital health issues. Seeing girls in my immediate circles turn to unverified online forums—leaving themselves vulnerable to misinformation and predatory strangers—made me realize that existing clinical resources are too cold and intimidating for young women to trust. This is what drove me to co-found Heal Her. My mission is to ensure that no girl ever has to face a health scare or a question alone. By directly managing and growing our community of over 200 young women in the 'Girls Lounge,' I see every day the transformative power of safe, empathetic, and medically accurate support. I am fully committed to scaling Heal Her across Nigeria, bridging the gap between raw technology and human empathy to give the next generation of women the private, judgment-free education they deserve.",
      education: "Student - B.Sc Computer Science",
      aspiration: "Frontend Web Developer",
      specialty: "Interactive Interface Design",
      icon: Heart,
      isCoFounder: true,
      socials: {
        email: "mailto:khadijaganandaji26@gmail.com",
        whatsapp: "https://wa.me/2348120607103",
        phone: "tel:08120607103"
      }
    },
    {
      name: "Echezona Mbuba David",
      nickname: "David Flux", 
      role: "Community Growth Lead",
      image: "/david.jpg",
      operationalRole: "As our Community Growth Lead, David is the crucial bridge between our technology and the real world. His primary skills are in strategic ideation, public outreach, and direct user acquisition. His contribution starts behind the scenes. David works directly with me during our brainstorming sessions, taking the raw, unfiltered struggles he hears from young women on campus and helping me map out new app features that solve their exact problems. Once a feature is built, David takes it back to the community. He manages our on-the-ground campaigns, actively breaks down deep-rooted cultural stigmas face-to-face, and drives our user growth to ensure Heal Her reaches the girls who need it the most.",
      personalMission: "I have always believed that technology is only as valuable as the human crises it solves. Looking beyond my own campus, watching the news, and seeing the alarming reality facing young girls today deeply frustrated me. From young teenagers to young adults, I saw an entire generation relying on dangerous, unverified online advice and predatory strangers simply because societal stigma left them with no safe place to ask questions about their bodies. Joining Heal Her was a deliberate choice to be part of the solution. This project is personal to me because I refuse to watch the younger generation suffer in silence. By constantly brainstorming new features with our technical lead and driving our outreach directly into communities, schools, and campuses, I am dedicated to dismantling these cultural walls. I want to help build a world where every young woman has access to secure, judgment-free health education.",
      education: "Student - B.Sc Computer Science",
      aspiration: "Backend Web Developer",
      icon: Megaphone, 
      socials: {
        instagram: "https://www.instagram.com/mbubadavid07",
        facebook: "https://www.facebook.com/share/1AHJsi6NnV",
        email: "mailto:Mbubadavid07@gmail.com",
        whatsapp: "https://wa.me/2347067100500",
        phone: "tel:07067100500"
      }
    },
    {
      name: "Udeh Collins Chimaobi",
      nickname: "Code Collins",
      role: "Backend & Security Architect",
      image: "/collins.jpg",
      operationalRole: "As our Backend & Security Architect, Collins is the defensive shield of our platform. His primary skills lie in server-side architecture, data security, privacy protocols, and strategic technical brainstorming. His main contribution is working directly with me to design, build, and fortify the Heal Her backend. We constantly brainstorm the best technical approaches to new features, but his absolute focus is always on safety. Collins ensures that our zero-tracking ecosystem remains completely private and highly secure at the server level. By locking down our data infrastructure, he guarantees that every young woman who uses our app is fully protected from data breaches, tracking, and online predators. He makes sure our digital safe space stays truly safe.",
      personalMission: "I have always believed that software engineering is empty without a strict commitment to user safety. In today's digital age, privacy is a luxury that many young girls cannot afford, especially when searching for sensitive health answers online. The fact that teenagers are forced to choose between seeking vital health clarity and exposing their data to unverified tracking systems or online predators is a massive engineering flaw that I am desperate to fix. Co-building Heal Her is my way of enforcing digital safety. My personal mission on this project is to brainstorm and execute a technical architecture so secure that zero-tracking isn't just a feature, but an absolute guarantee. Working daily alongside our lead engineer to lock down the backend is deeply personal to me; I am dedicated to proving that we can build robust, highly private technology that empowers young women to learn without fear.",
      education: "Student - B.Sc Computer Science",
      aspiration: "Backend Web Developer",
      icon: Target,
      socials: {
        email: "mailto:collinsudeh247@gmail.com",
        whatsapp: "https://wa.me/2347042788221",
        phone: "tel:07042788221"
      }
    },
    {
      name: "Ajilima Jimmy Oloche",
      nickname: "Jimmy Cipher", 
      role: "Operations Manager",
      image: "/jimmy.png",
      operationalRole: "As our Operations Manager, Jimmy is the structural backbone of our team. His core skills perfectly blend agile project management, technical documentation, and operational security. His primary contribution is transforming our rapid development phases into a structured, functioning reality. Jimmy manages our deployment cycles, organizes our technical documentation, and enforces strict operational security over our project files. He acts as our internal scrum master—managing our sprints, tracking milestones, and ensuring the entire team hits our deadlines. By taking full control of our operational logistics and workflow security, Jimmy allows the engineering team to focus entirely on writing code, guaranteeing that Heal Her scales smoothly, securely, and right on schedule.",
      personalMission: "I have always believed that a brilliant idea is only as good as its execution, and in the realm of digital health, poor execution can actively put vulnerable users at risk. As someone deeply passionate about cybersecurity, it alarms me how often young women’s health data is treated as an afterthought online, leaving them exposed to tracking and digital exploitation when they are simply looking for a safe place to ask questions. I joined Heal Her because I wanted to build a fortress around this mission. My personal goal is to ensure that the digital safe space we are creating for these girls is operationally bulletproof from day one. By managing our deployment cycles, enforcing strict workflow security, and keeping our development team completely aligned, I am doing my part to ensure that Heal Her is not just a great concept, but a highly secure, unbreakable reality that millions of young women can trust.",
      education: "Student - B.Sc Computer Science",
      aspiration: "Cyber Security Specialist",
      icon: ClipboardCheck, 
      socials: {
        facebook: "https://www.facebook.com/profile.php?id=61579818594870",
        email: "mailto:bigjimmy328@gmail.com",
        whatsapp: "https://wa.me/2349028683255", 
        phone: "tel:09164118260"
      }
    },
  ]

  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] font-sans overflow-x-hidden">
      <GrainOverlay />
      <Navigation />

      {/* --- INTELLIGENT MODAL MOUNT POINT --- */}
      <AnimatePresence>
        {selectedMember && (
          <ExpandedTeamMember 
            member={selectedMember} 
            onClose={() => setSelectedMember(null)} 
          />
        )}
      </AnimatePresence>

      {/* --- SECTION 1: THE CONNECTED CIRCLE (Hero) --- */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 min-h-[90svh] flex flex-col justify-center border-b border-white/5 overflow-hidden">
        
        <div className="absolute inset-0 z-0">
          <Image
            src="/twelve-hero.png"
            alt="Core Leadership Node"
            fill
            className="object-cover object-center opacity-30 md:opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#1C1246_80%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1246]/95 via-[#1C1246]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1246] via-transparent to-[#1C1246]/60" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full text-left pt-12 md:pt-0">
           <motion.div 
             initial="hidden"
             animate="visible"
             variants={staggerContainer}
             className="max-w-2xl"
           >
              <motion.div variants={scaleIn} className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8 backdrop-blur-md">
                 <GraduationCap className="h-3.5 w-3.5 text-[#DA8CA0]" /> Built at Uni Jos
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-2xl"
              >
                The Humans Behind<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-white">The Digital Sisterhood.</span>
              </motion.h1>

              <motion.div 
                variants={fadeInUp}
                className="text-sm md:text-lg text-[#CCCCD9] leading-relaxed font-light mb-8 max-w-xl drop-shadow-lg space-y-4"
              >
                <p>We are a dedicated team of students—engineers, researchers, and advocates—united by a single belief: no girl should ever have to face a health scare alone.</p>
                <p>We don't hide behind corporate titles. We are building this from the ground up, fueled by genuine care and hard-earned skills.</p>
              </motion.div>
           </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1.2, ease: premiumSmooth }}
          className="absolute bottom-6 right-4 md:bottom-8 md:right-8 z-50 flex items-center gap-2 bg-[#1C1246]/95 backdrop-blur-xl border border-[#DA8CA0]/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-2xl"
        >
           <div className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DA8CA0] opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-[#DA8CA0]"></span>
           </div>
           <span className="text-[#DA8CA0] text-[9px] md:text-[10px] uppercase font-mono tracking-widest mt-0.5">Core Leadership // Verified</span>
        </motion.div>
      </section>

      {/* --- SECTION 2: THE DNA OF HEAL HER --- */}
      <section className="py-20 md:py-28 bg-[#1C1246] border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
             <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 1.2, ease: premiumSmooth }}
               className="order-2 lg:order-1"
             >
                 <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Honest Engineering.</h2>
                 <p className="text-[#CCCCD9] text-sm md:text-base font-light leading-relaxed mb-4">
                   Heal Her operates at the intersection of targeted technology, medical facts, and community empathy. 
                 </p>
                 <p className="text-[#CCCCD9] text-sm md:text-base font-light leading-relaxed">
                   As students, we rely on rigorous research and direct feedback from our 200+ community members. Every line of code, every design choice, and every safety protocol is built to serve the real, unfiltered needs of the young women who trust us.
                 </p>
             </motion.div>
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 1.2, ease: premiumSmooth }}
               className="order-1 lg:order-2"
             >
                <SynergySimulation />
             </motion.div>
           </div>
        </div>
      </section>

      {/* --- SECTION 3: THE TEAM GRID (Updated with Layout IDs & Click Handlers) --- */}
      <section className="py-24 md:py-32 bg-[#231854]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">The Team</h2>
            <p className="text-[#CCCCD9] text-sm md:text-lg max-w-2xl mx-auto font-light">
              Driven students turning a vision into a structured, functioning reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-center">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                layoutId={`card-container-${member.name}`}
                onClick={() => setSelectedMember(member)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.2, delay: index * 0.1, ease: premiumSmooth }}
                className="group cursor-pointer relative flex flex-col w-full h-full bg-[#1C1246] rounded-[2rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-[#DA8CA0]/30 hover:shadow-[0_20px_60px_rgba(218,140,160,0.05)]"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#DA8CA0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <motion.div 
                  layoutId={`image-container-${member.name}`}
                  className="relative w-full aspect-[4/5] bg-[#231854]/30 overflow-hidden border-b border-white/5"
                >
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    fill
                    className="object-cover object-center opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  <motion.div 
                    layoutId={`badge-${member.name}`} 
                    className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1C1246]/90 backdrop-blur-md border border-white/10 text-xs font-medium text-white shadow-xl"
                  >
                    <member.icon className="h-3.5 w-3.5 text-[#DA8CA0]" />
                    {member.role}
                  </motion.div>
                </motion.div>

                <div className="p-6 md:p-8 flex flex-col flex-grow relative z-10">
                  <div className="mb-6">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#DA8CA0] mb-2 opacity-80">
                      {member.nickname}
                    </div>
                    <motion.h3 
                      layoutId={`title-${member.name}`} 
                      className="text-xl md:text-2xl font-bold text-white group-hover:text-[#DA8CA0] transition-colors duration-300"
                    >
                      {member.name}
                    </motion.h3>
                  </div>

                  <div className="space-y-3 mb-6 p-4 rounded-2xl bg-[#231854]/40 border border-white/5">
                      <div className="flex items-start gap-3">
                         <GraduationCap className="h-4 w-4 text-[#CCCCD9] mt-0.5 opacity-60" />
                         <div>
                            <span className="block text-[10px] uppercase tracking-wider font-bold text-[#CCCCD9]/50">Current</span>
                            <span className="block text-xs font-medium text-[#FAFAFA] mt-0.5">{member.education}</span>
                         </div>
                      </div>
                      <div className="w-full h-px bg-white/5 my-1" />
                      <div className="flex items-start gap-3">
                         <Target className="h-4 w-4 text-[#DA8CA0] mt-0.5 opacity-80" />
                         <div>
                            <span className="block text-[10px] uppercase tracking-wider font-bold text-[#CCCCD9]/50">Goal</span>
                            <span className="block text-xs font-bold text-[#FAFAFA] mt-0.5">{member.aspiration}</span>
                         </div>
                      </div>
                  </div>
                  
                  {/* Truncated operational role overview for the small card */}
                  <p className="text-sm text-[#CCCCD9] font-light leading-relaxed mb-8 flex-grow line-clamp-3">
                    {member.operationalRole}
                  </p>

                  <div className="flex flex-col gap-4 mt-auto">
                    {/* Read More Trigger Text */}
                    <div className="border-t border-white/5 pt-4 flex items-center text-xs font-bold uppercase tracking-wider text-[#DA8CA0] group-hover:text-white transition-colors w-full">
                      View Full Mission & Profile 
                      <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="flex gap-2">
                      {member.socials?.email && <SocialButton icon={Mail} href={member.socials.email} label="Email" />}
                      {member.socials?.whatsapp && <SocialButton icon={WhatsAppIcon} href={member.socials.whatsapp} label="WhatsApp" />}
                      {member.socials?.phone && <SocialButton icon={Phone} href={member.socials.phone} label="Call" />}
                      {member.socials?.instagram && <SocialButton icon={Instagram} href={member.socials.instagram} label="Instagram" />}
                      {member.socials?.github && <SocialButton icon={Github} href={member.socials.github} label="GitHub" />}
                      {member.socials?.portfolio && <SocialButton icon={Briefcase} href={member.socials.portfolio} label="Portfolio" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 4: ADVISORY MENTORS --- */}
      <section className="py-20 bg-[#1C1246] border-y border-white/5">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Professional Oversight</h2>
              <p className="text-sm text-[#CCCCD9] font-light">
                Student-led, but guided by experienced institutional experts.
              </p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
                className="p-6 md:p-8 rounded-[1.5rem] bg-[#231854]/30 border border-white/5 flex items-start gap-5"
              >
                 <div className="h-12 w-12 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCCCD9]">
                    <Library className="h-5 w-5" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white">Faculty Guidance</h3>
                    <p className="text-xs font-mono text-[#DA8CA0] mb-3">University of Jos, CS Dept</p>
                    <p className="text-sm text-[#CCCCD9] font-light leading-relaxed">Ensuring our codebase, data structures, and security protocols meet rigorous academic and professional standards.</p>
                 </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }}
                className="p-6 md:p-8 rounded-[1.5rem] bg-[#231854]/30 border border-white/5 flex items-start gap-5"
              >
                 <div className="h-12 w-12 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCCCD9]">
                    <Stethoscope className="h-5 w-5" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white">Clinical Auditing</h3>
                    <p className="text-xs font-mono text-[#DA8CA0] mb-3">JUTH Medical Consultants</p>
                    <p className="text-sm text-[#CCCCD9] font-light leading-relaxed">Reviewing our core health scripts and emergency routing protocols to guarantee 100% medical accuracy and safety.</p>
                 </div>
              </motion.div>
           </div>
        </div>
      </section>

      {/* --- SECTION 5: THE EXIT --- */}
      <section className="py-24 relative overflow-hidden bg-[#231854]/20 border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#DA8CA0]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.2, ease: premiumSmooth }}
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#1C1246] border border-white/10 flex items-center justify-center mb-8 shadow-xl">
               <HeartHandshake className="h-8 w-8 text-[#DA8CA0]" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Support the Movement.
            </h2>
            <p className="text-sm md:text-lg text-[#CCCCD9] font-light leading-relaxed mb-10 px-4">
              We are actively looking for mentors, foundations, and institutional partners to help scale our server infrastructure and keep this platform free for the girls who need it most.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Link 
                 href="mailto:nwakaamos95@gmail.com"
                 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-[#1C1246] font-bold text-sm tracking-wide hover:bg-[#DA8CA0] hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
               >
                 <Mail className="h-4 w-4" /> Reach Out via Email
               </Link>
               <Link 
                 href="/contact" 
                 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors font-bold text-sm tracking-wide"
               >
                 Open Contact Portal
               </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}