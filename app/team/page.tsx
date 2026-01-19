"use client"

export const dynamic = "force-dynamic";

// Added useTime and useTransform for the counter-rotation fix
import { motion, useMotionTemplate, useMotionValue, useTime, useTransform } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Image from "next/image" 
import { 
  Code2, Stethoscope, ClipboardCheck, Lightbulb, Users, Megaphone, 
  GraduationCap, Mail, Facebook, Instagram, Phone, Target, 
  HeartHandshake, Library, Milestone, Crown, Sparkles, 
  ShieldAlert, Database, Terminal, Wand2, Cpu, Heart, Share2, 
  Network, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import React from "react"
import { cn } from "@/lib/utils"

// --- ANIMATION COMPONENTS ---

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
    className="h-9 w-9 rounded-full bg-[#1C1246] border border-[#DA8CA0]/20 flex items-center justify-center text-[#CCCCD9] hover:bg-[#DA8CA0] hover:text-[#1C1246] hover:border-[#DA8CA0] transition-all duration-300 transform hover:-translate-y-1 shadow-lg group/icon"
  >
    <Icon className="h-4 w-4" />
  </a>
)

// --- NEW SIMULATION: THE SYNERGY CORE (UPDATED) ---
function SynergySimulation() {
  const time = useTime();
  
  // Calculate rotation and counter-rotation to keep icons upright
  // Orbit 1: 20s duration, clockwise
  const rotate1 = useTransform(time, [0, 20000], [0, 360], { clamp: false });
  const counterRotate1 = useTransform(time, [0, 20000], [0, -360], { clamp: false });

  // Orbit 2: 25s duration, counter-clockwise
  const rotate2 = useTransform(time, [0, 25000], [0, -360], { clamp: false });
  const counterRotate2 = useTransform(time, [0, 25000], [0, 360], { clamp: false });

  // Orbit 3: 30s duration, clockwise (starting offset 180)
  const rotate3 = useTransform(time, [0, 30000], [180, 540], { clamp: false });
  const counterRotate3 = useTransform(time, [0, 30000], [-180, -540], { clamp: false });

  return (
    <div className="relative w-full h-[400px] bg-[#1a153a] rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Central Core (The AI with Real Logo) */}
      <div className="relative z-10">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-[#DA8CA0] to-purple-600 blur-xl opacity-50 absolute inset-0"
        />
        <div className="w-32 h-32 rounded-full bg-[#1C1246] border border-[#DA8CA0]/30 flex items-center justify-center relative z-20 shadow-2xl overflow-hidden">
           {/* UPDATED: Real Logo, made larger (72px) */}
           <Image 
             src="/heal-logo.png"
             alt="Heal Her Core Logo"
             width={72} 
             height={72}
             className="animate-pulse object-contain"
           />
        </div>
      </div>

      {/* Orbiting Elements (Updated with counter-rotation) */}
      
      {/* Orbit 1: Code (Violet) */}
      <motion.div 
        className="absolute w-[250px] h-[250px] border border-violet-500/30 rounded-full"
        style={{ rotate: rotate1 }}
      >
         {/* Counter-rotate the icon container so it stays upright */}
         <motion.div 
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#1C1246] border border-violet-500 rounded-full flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
            style={{ rotate: counterRotate1 }}
         >
            <Code2 className="h-4 w-4" />
         </motion.div>
      </motion.div>

      {/* Orbit 2: Medicine (Rose) */}
      <motion.div 
        className="absolute w-[380px] h-[380px] border border-rose-500/30 rounded-full"
        style={{ rotate: rotate2 }}
      >
         <motion.div 
           className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-[#1C1246] border border-rose-500 rounded-full flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
           style={{ rotate: counterRotate2 }}
         >
            <Stethoscope className="h-4 w-4" />
         </motion.div>
      </motion.div>

      {/* Orbit 3: Community (Cyan) */}
      <motion.div 
        className="absolute w-[500px] h-[500px] border border-cyan-500/30 rounded-full"
        style={{ rotate: rotate3 }}
      >
         <motion.div 
           className="absolute top-1/2 right-0 translate-x-1/2 w-8 h-8 bg-[#1C1246] border border-cyan-500 rounded-full flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
           style={{ rotate: counterRotate3 }}
         >
            <Users className="h-4 w-4" />
         </motion.div>
      </motion.div>

      {/* Overlay Text */}
      <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
         <p className="text-xs font-mono text-[#CCCCD9]">SYSTEM: <span className="text-emerald-400">SYNERGY_ACTIVE</span></p>
      </div>
    </div>
  )
}

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Nwaka Amos Chika",
      nickname: "SLIVERBOY",
      role: "Founder & Lead Engineer",
      image: "/sliver.png", 
      bio: "The Architect. Sliverboy envisioned Heal Her as a bridge between cold logic and human warmth. He built the proprietary 'Empathy Engine' that powers our AI, ensuring it speaks not just with intelligence, but with care. His vision drives every pixel.",
      
      education: "Student - B.Sc Computer Science",
      aspiration: "Full Stack Web Developer",
      specialty: "Expert AI Prompt Engineer", 
      
      icon: Crown, 
      // UPDATED: Electric Violet / Cosmic Purple Theme
      color: "text-violet-400", 
      borderColor: "group-hover:border-violet-500", 
      isFounder: true, 
      socials: {
        instagram: "https://www.instagram.com/prism_y4?igsh=aDF4aXN3cHNrdzI1",
        facebook: "https://www.facebook.com/share/1FC78LeYK8/",
        email: "mailto:nwakaamos95@gmail.com",
        whatsapp: "https://wa.me/2349063877703",
        phone: "tel:09063877703"
      }
    },
    {
      name: "Khadija Maumda Musa",
      nickname: "HT GIRL",
      role: "Co-Founder & Medical Lead",
      image: "/khadija.jpg",
      bio: "The Heart. Khadija ensures Heal Her remains a safe space. She curates our medical database, ensuring every piece of advice is accurate, non-judgmental, and culturally sensitive for girls across Nigeria.",
      
      education: "Student - B.Sc Computer Science",
      aspiration: "Frontend Web Developer",
      
      icon: Heart,
      color: "text-rose-500",
      borderColor: "group-hover:border-rose-500", 
      isCoFounder: true,
      socials: {
        email: "mailto:khadijaganandaji26@gmail.com",
        whatsapp: "https://wa.me/2348120607103",
        phone: "tel:08120607103"
      }
    },
    {
      name: "Echezona Mbuba David",
      nickname: "DAVID FLUX", 
      role: "Community Growth Lead",
      image: "/david.jpg",
      bio: "The Amplifier. David ensures our message reaches the girls who need it most. He manages campus outreach, breaking down stigmas and encouraging students to trust digital health tools.",
      
      education: "Student - B.Sc Computer Science",
      aspiration: "Backend Web Developer",
      
      icon: Megaphone, 
      color: "text-cyan-500",
      borderColor: "group-hover:border-cyan-500", 
      socials: {
        instagram: "https://www.instagram.com/mbubadavid07?igsh=dW5tN253YnpwMzZt&utm_source=ig_contact_invite",
        facebook: "https://www.facebook.com/share/1AHJsi6NnV/?mibextid=wwXIfr",
        email: "mailto:Mbubadavid07@gmail.com",
        whatsapp: "https://wa.me/2347067100500",
        phone: "tel:07067100500"
      }
    },
    {
      name: "Udeh Collins Chimaobi",
      nickname: "CODE COLLINS",
      role: "Strategy & Partnerships",
      image: "/collins.jpg",
      bio: "The Navigator. Collins builds the bridges between Heal Her and the real world. He scouts partnerships with NGOs and schools to ensure our project is sustainable and scalable.",
      
      education: "Student - B.Sc Computer Science",
      aspiration: "Backend Web Developer",
      
      icon: Target,
      color: "text-amber-500",
      borderColor: "group-hover:border-amber-500", 
      socials: {
        email: "mailto:collinsudeh247@gmail.com",
        whatsapp: "https://wa.me/2347042788221",
        phone: "tel:07042788221"
      }
    },
    {
      name: "Ajilima Jimmy Oloche",
      nickname: "JIMMY CIPHER", 
      role: "Operations Manager",
      image: "/jimmy.png",
      bio: "The Engine. Jimmy turns chaotic ideas into structured reality. He manages timelines, documentation, and resource allocation to keep the team moving forward efficiently.",
      
      education: "Student - B.Sc Computer Science",
      aspiration: "Cyber Security Specialist",
      
      icon: ClipboardCheck, 
      color: "text-emerald-500",
      borderColor: "group-hover:border-emerald-500", 
      socials: {
        facebook: "https://www.facebook.com/profile.php?id=61579818594870",
        email: "mailto:bigjimmy328@gmail.com",
        whatsapp: "https://wa.me/2349028683255", 
        phone: "tel:09164118260"
      }
    },
  ]

  const roadmap = [
    {
      year: "Q4 2025",
      title: "Campus Pilot",
      desc: "Launching Heal Her to 2,000 female students at University of Jos to gather feedback and refine our empathy engine.",
      status: "current"
    },
    {
      year: "Q2 2026",
      title: "Mobile App Launch",
      desc: "Releasing dedicated iOS and Android apps with offline mode for girls in rural areas with poor internet.",
      status: "future"
    },
    {
      year: "Q4 2026",
      title: "Voice Chat",
      desc: "Integrating voice recognition so girls can speak to Heal Her naturally in English and Pidgin.",
      status: "future"
    },
    {
      year: "2027+",
      title: "Tele-Health",
      desc: "Partnering with hospitals to allow users to book real doctor appointments directly through the app.",
      status: "vision"
    }
  ]

  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] font-sans overflow-hidden">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 border-b border-[#DA8CA0]/10 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#DA8CA0]/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,_var(--tw-gradient-stops))] from-[#DA8CA0]/20 via-[#1C1246] to-[#1C1246]" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#DA8CA0]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#231854]/80 backdrop-blur-md border border-[#DA8CA0]/20 text-[#DA8CA0] text-xs font-mono uppercase tracking-wider mb-8 shadow-xl">
              <GraduationCap className="h-4 w-4" /> 
              <span>Built with ❤️ at Uni Jos</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-8 leading-tight">
              The Humans Behind the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] via-[#E8B4C1] to-white">
                Digital Sisterhood
              </span>
            </h1>
            
            <div className="mx-auto max-w-4xl text-lg md:text-xl text-[#CCCCD9] leading-relaxed space-y-6">
              <p>
                Heal Her is not just code. It is a promise made by a group of students who saw a gap in women's healthcare and decided to fill it.
              </p>
              <p>
                Led by <strong>Sliverboy</strong> and <strong>Khadija</strong>, we are a team of engineers, researchers, and advocates united by one mission:
              </p>
              <p className="text-white font-medium">
                To ensure no girl ever has to face a health scare alone.
              </p>
            </div>

            <div className="mt-10 flex justify-center gap-6">
               <div className="h-1 w-20 bg-gradient-to-r from-[#DA8CA0] to-purple-500 rounded-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- NEW SECTION: THE DNA OF HEAL HER (Simulation) --- */}
      <section className="py-20 bg-[#231854]/20 border-b border-[#DA8CA0]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
             >
                 <h2 className="text-3xl font-bold text-white mb-6">The Synergy</h2>
                 <p className="text-[#CCCCD9] mb-4 text-lg">
                   Heal Her is born from the collision of three worlds: 
                   <span className="text-violet-400 font-bold"> Advanced Tech</span>, 
                   <span className="text-rose-400 font-bold"> Medical Science</span>, and 
                   <span className="text-cyan-400 font-bold"> Community Love</span>.
                 </p>
                 <p className="text-[#CCCCD9] leading-relaxed">
                   We are not just developers; we are community builders. Our code is powered by medical facts, and our interface is designed with empathy. This simulation represents how our team's different skills orbit around one central goal: <strong>You.</strong>
                 </p>
             </motion.div>
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
             >
                <SynergySimulation />
             </motion.div>
           </div>
        </div>
      </section>

      {/* --- THE TEAM GRID --- */}
      <section className="py-24 bg-[#1C1246] relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Meet the Leadership</h2>
            <p className="text-[#CCCCD9] max-w-2xl mx-auto">
              The passionate minds turning this vision into reality.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {teamMembers.map((member, index) => {
              const isFounder = member.isFounder;
              const isCoFounder = member.isCoFounder;
              
              // Dynamic Styling Logic
              let cardBorder = "border-[#DA8CA0]/20";
              let cardBg = "bg-[#231854]";
              let hoverBorder = member.borderColor;
              let badgeColor = "bg-[#1C1246] border-[#DA8CA0]/30";
              let glowColor = "bg-gradient-to-b from-[#DA8CA0] to-purple-600";

              if (isFounder) {
                 // Updated to Electric Violet / Cosmic Purple
                 cardBorder = "border-violet-500/50";
                 cardBg = "bg-violet-950/20";
                 badgeColor = "bg-violet-600 border-violet-400 text-white";
                 hoverBorder = "group-hover:border-violet-400";
                 glowColor = "bg-gradient-to-b from-violet-500 to-fuchsia-600";
              } else if (isCoFounder) {
                 cardBorder = "border-rose-500/50";
                 cardBg = "bg-rose-950/20";
                 badgeColor = "bg-rose-500/90 border-rose-400 text-white";
                 hoverBorder = "group-hover:border-rose-400";
                 glowColor = "bg-gradient-to-b from-rose-500 to-pink-600";
              }
              
              return (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative w-full md:w-[calc(50%-2rem)] lg:w-[30%]"
                >
                  {/* Hover Glow */}
                  <div className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur ${glowColor}`} />
                  
                  {/* Animated Border for Founder */}
                  {isFounder && (
                     <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 rounded-2xl opacity-50 blur-sm animate-pulse" />
                  )}

                  <div className={`relative h-full flex flex-col ${cardBg} border ${cardBorder} rounded-2xl overflow-hidden hover:bg-[#231854]/90 transition-all duration-300 ${hoverBorder}`}>
                    
                    {/* Image Container */}
                    <div className="relative w-full aspect-[4/5] bg-[#1a153a] overflow-hidden border-b border-white/5 group">
                      <div className="absolute inset-0 bg-[#1a153a] flex items-center justify-center text-[#CCCCD9]">
                        <Image 
                          src={member.image} 
                          alt={member.name} 
                          fill
                          className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          quality={85}
                          priority={true} 
                        />
                      </div>
                      
                      <div className={`absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-sm border text-xs font-medium shadow-lg z-10 ${badgeColor}`}>
                        <member.icon className={`h-3 w-3 ${isFounder ? 'text-white' : 'text-white'}`} />
                        {member.role}
                      </div>

                      {isFounder && (
                        <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-bold uppercase tracking-wider shadow-xl z-10 border border-violet-400">
                           <Sparkles className="h-3 w-3" /> Visionary
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-[0.2em] mb-1 ${isFounder ? 'text-violet-400' : 'text-[#DA8CA0]'}`}>
                          {member.nickname}
                        </div>
                        <h3 className={`text-xl font-bold mb-4 transition-colors ${isFounder ? 'text-violet-200 group-hover:text-violet-300' : 'text-white group-hover:text-[#E8B4C1]'}`}>
                          {member.name}
                        </h3>
                      </div>

                      <div className={`grid grid-cols-1 gap-3 mb-5 p-4 rounded-xl border relative overflow-hidden ${isFounder ? 'bg-violet-950/40 border-violet-500/30' : 'bg-[#1C1246] border-white/5'}`}>
                          <div className="flex items-start gap-3">
                             <div className={`mt-0.5 p-1 rounded ${isFounder ? 'bg-violet-500/20' : 'bg-[#DA8CA0]/10'}`}>
                               <GraduationCap className={`h-3 w-3 ${isFounder ? 'text-violet-400' : 'text-[#DA8CA0]'}`} />
                             </div>
                             <div className="flex-1">
                                <span className="text-[#CCCCD9]/60 block text-[9px] uppercase tracking-wider font-bold">Academics</span>
                                <span className="text-[#CCCCD9] text-xs font-medium leading-tight block mt-0.5">{member.education}</span>
                             </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                             <div className={`mt-0.5 p-1 rounded ${isFounder ? 'bg-violet-500/20' : 'bg-[#DA8CA0]/10'}`}>
                               <Cpu className={`h-3 w-3 ${isFounder ? 'text-violet-400' : 'text-[#DA8CA0]'}`} />
                             </div>
                             <div className="flex-1">
                                <span className="text-[#CCCCD9]/60 block text-[9px] uppercase tracking-wider font-bold">Future Goal</span>
                                <span className={`${isFounder ? 'text-violet-300' : 'text-[#E8B4C1]'} text-xs font-bold leading-tight block mt-0.5`}>{member.aspiration}</span>
                             </div>
                          </div>

                          {member.specialty && (
                            <div className="flex items-start gap-3 pt-2 border-t border-violet-500/20 mt-1">
                               <div className="mt-0.5 p-1 rounded bg-violet-500/20">
                                 <Wand2 className="h-3 w-3 text-violet-300" />
                               </div>
                               <div className="flex-1">
                                  <span className="text-violet-500/60 block text-[9px] uppercase tracking-wider font-bold">Specialty</span>
                                  <span className="text-white text-xs font-bold leading-tight block mt-0.5">{member.specialty}</span>
                               </div>
                            </div>
                          )}
                      </div>
                      
                      <p className="text-sm text-[#CCCCD9] leading-relaxed mb-6 flex-grow border-t border-white/10 pt-4">
                        {member.bio}
                      </p>

                      <div className="flex gap-3 pt-2 mt-auto">
                        {member.socials?.whatsapp && (
                          <SocialButton icon={WhatsAppIcon} href={member.socials.whatsapp} label="WhatsApp" />
                        )}
                        {member.socials?.facebook && (
                          <SocialButton icon={Facebook} href={member.socials.facebook} label="Facebook" />
                        )}
                        {member.socials?.instagram && (
                          <SocialButton icon={Instagram} href={member.socials.instagram} label="Instagram" />
                        )}
                        {member.socials?.email && (
                          <SocialButton icon={Mail} href={member.socials.email} label="Email" />
                        )}
                        {member.socials?.phone && (
                          <SocialButton icon={Phone} href={member.socials.phone} label="Call" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- SECTION: ADVISORY BOARD --- */}
      <section className="py-24 border-y border-[#DA8CA0]/10 bg-[#231854]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-2">Our Mentors</h2>
              <p className="text-[#CCCCD9]">
                Student-led, expert-guided.
              </p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-xl bg-[#1C1246] border border-[#DA8CA0]/20 flex items-start gap-4">
                 <div className="h-12 w-12 rounded-full bg-[#DA8CA0]/10 border border-[#DA8CA0]/20 flex items-center justify-center text-[#DA8CA0]">
                    <Library className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white">Faculty Advisor</h3>
                    <p className="text-sm text-[#DA8CA0] mb-2">University of Jos, CS Dept</p>
                    <p className="text-sm text-[#CCCCD9]">Ensures our code is secure and our ethics are sound.</p>
                 </div>
              </div>
              <div className="p-6 rounded-xl bg-[#1C1246] border border-[#DA8CA0]/20 flex items-start gap-4">
                 <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                    <Stethoscope className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white">Medical Consultant</h3>
                    <p className="text-sm text-rose-400 mb-2">JUTH (Teaching Hospital)</p>
                    <p className="text-sm text-[#CCCCD9]">Reviews our health advice to make sure it's 100% accurate.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- SECTION: STRATEGIC ROADMAP --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono uppercase tracking-wider mb-4">
                <Milestone className="h-4 w-4" /> The Path Forward
              </div>
              <h2 className="text-3xl font-bold text-white">The Future of Heal Her</h2>
              <p className="text-[#CCCCD9] mt-2">From a campus project to a national movement.</p>
           </div>

           <div className="relative border-l border-[#DA8CA0]/20 ml-4 md:ml-1/2 space-y-12">
              {roadmap.map((item, index) => (
                 <div key={index} className="relative pl-8 md:pl-0">
                    <div className={`absolute left-[-5px] top-1 h-3 w-3 rounded-full border-2 ${item.status === 'current' ? 'bg-[#DA8CA0] border-[#DA8CA0] shadow-[0_0_10px_rgba(218,140,160,0.5)]' : 'bg-[#1C1246] border-[#DA8CA0]/50'} z-10`} />
                    
                    <div className="md:grid md:grid-cols-2 md:gap-16 items-center">
                        <div className={`md:text-right ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                           <span className={`text-xs font-bold px-2 py-1 rounded border ${item.status === 'current' ? 'bg-[#DA8CA0]/10 text-[#DA8CA0] border-[#DA8CA0]/30' : 'bg-[#1C1246] text-[#CCCCD9]/50 border-[#DA8CA0]/10'}`}>
                              {item.year}
                           </span>
                        </div>
                        <div className={`${index % 2 === 0 ? 'md:order-2' : 'md:order-1'} mt-2 md:mt-0`}>
                           <h3 className={`text-lg font-bold ${item.status === 'current' ? 'text-white' : 'text-[#CCCCD9]'}`}>
                              {item.title}
                           </h3>
                           <p className="text-sm text-[#CCCCD9] mt-1 max-w-sm">{item.desc}</p>
                        </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- THE EXITON --- */}
      <section className="py-28 relative overflow-hidden bg-[#231854]/20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246] via-[#231854]/20 to-[#1C1246]" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#DA8CA0] to-transparent" />
        
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="bg-[#231854]/80 backdrop-blur-xl border border-[#DA8CA0]/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#DA8CA0]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

            <div className="grid lg:grid-cols-2 gap-12 items-center">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider mb-6">
                    <HeartHandshake className="h-4 w-4" /> Partner With Us
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    Help Us Heal Her
                  </h2>
                  <p className="text-lg text-[#CCCCD9] mb-6 leading-relaxed">
                    We are looking for mentors, donors, and partners to help us reach more girls. If you believe in our mission, we want to hear from you.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg" className="bg-[#DA8CA0] hover:bg-[#E8B4C1] text-[#1C1246] rounded-full px-8 h-14 text-base font-bold shadow-lg shadow-[#DA8CA0]/20">
                      <Link href="mailto:medguardai@gmail.com">
                        <Mail className="mr-2 h-5 w-5" /> Email The Team
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-[#DA8CA0]/30 bg-transparent text-[#CCCCD9] hover:bg-[#DA8CA0]/10 hover:text-white rounded-full px-8 h-14 text-base">
                      <a href="https://wa.me/2349063877703" target="_blank" rel="noopener noreferrer">
                        <WhatsAppIcon className="mr-2 h-5 w-5" /> WhatsApp Us
                      </a>
                    </Button>
                  </div>
               </div>

               <div className="relative bg-[#1C1246] border border-[#DA8CA0]/20 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Current Focus</h3>
                  <div className="space-y-6">
                      <div>
                         <div className="flex justify-between text-sm mb-2">
                            <span className="text-[#CCCCD9]">Server Costs</span>
                            <span className="text-[#DA8CA0]">Priority 1</span>
                         </div>
                         <div className="h-2 w-full bg-[#231854] rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-[#DA8CA0] rounded-full" />
                         </div>
                      </div>
                  </div>
                  <div className="mt-8 p-4 bg-[#231854] rounded-xl border border-[#DA8CA0]/10">
                     <p className="text-sm text-[#CCCCD9] italic">
                        "Every contribution helps us keep the chat free for girls who can't afford it."
                     </p>
                     <p className="text-xs text-[#DA8CA0] mt-2 text-right">- Sliverboy, Founder</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}