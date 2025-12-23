"use client"

export const dynamic = "force-dynamic";

import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Image from "next/image" 
import { 
  Code2, 
  Stethoscope, 
  ClipboardCheck, 
  Lightbulb, 
  Users, 
  Megaphone, 
  GraduationCap,
  Mail,
  Facebook,
  Instagram,
  Phone, 
  Target,
  Rocket,
  HeartHandshake,
  Library,
  Milestone,
  Crown,
  Sparkles,
  ShieldAlert,
  Database,
  Terminal,
  Palette,
  Wand2,
  Cpu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import React, { useState } from "react"

// --- UTILS & COMPONENTS ---

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
    className="h-9 w-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group/icon"
  >
    <Icon className="h-4 w-4" />
  </a>
)

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Nwaka Amos Chika",
      nickname: "SLIVERBOY",
      role: "Founder & Lead Engineer",
      image: "/sliver.png", 
      bio: "The Visionary. As the Founder and CEO, Sliverboy bridges the gap between complex algorithmic logic and user-centric design. He drives the technical roadmap, ensuring the platform remains robust, secure, and ready for mass adoption across African universities.",
      
      education: "Student - B.Sc Computer Science",
      aspiration: "Full Stack Web Developer",
      specialty: "Expert AI Prompt Engineer", 
      
      icon: Crown, 
      color: "text-amber-400", 
      borderColor: "group-hover:border-amber-500/50", 
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
      role: "Medical Research & Content Lead",
      image: "/khadija.jpg",
      bio: "The guardian of our medical integrity. Khadija ensures that MedGuard AI is not just smart, but safe. She manages our database of medical protocols, validating every piece of advice against global health standards.",
      
      education: "Student - B.Sc Computer Science",
      aspiration: "Frontend Web Developer",
      
      icon: Stethoscope,
      color: "text-rose-500",
      borderColor: "group-hover:border-rose-500/50", 
      socials: {
        email: "mailto:khadijaganandaji26@gmail.com",
        whatsapp: "https://wa.me/2348120607103",
        phone: "tel:08120607103"
      }
    },
    {
      name: "Echezona Mbuba David",
      nickname: "DAVID FLUX", 
      role: "Growth & Awareness Coordinator",
      image: "/david.jpg",
      bio: "The amplifier. David spearheads our outreach initiatives. He is passionate about health literacy and ensures that our life-saving tool reaches the hands of every student who needs it.",
      
      education: "Student - B.Sc Computer Science",
      aspiration: "Backend Web Developer",
      
      icon: Terminal, 
      color: "text-cyan-500",
      borderColor: "group-hover:border-cyan-500/50", 
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
      role: "Product Strategy & Partnerships",
      image: "/collins.jpg",
      bio: "Our strategic navigator. Collins looks beyond the code to understand market needs. He is responsible for scouting NGO collaborations and stress-testing our APIs for scalability.",
      
      education: "Student - B.Sc Computer Science",
      aspiration: "Backend Web Developer",
      
      icon: Database,
      color: "text-amber-500",
      borderColor: "group-hover:border-amber-500/50", 
      socials: {
        email: "mailto:collinsudeh247@gmail.com",
        whatsapp: "https://wa.me/2347042788221",
        phone: "tel:07042788221"
      }
    },
    {
      name: "Ajilima Jimmy Oloche",
      nickname: "JIMMY CIPHER", 
      role: "Operations & Documentation",
      image: "/jimmy.png",
      bio: "The operational backbone. Jimmy transforms chaotic innovation into structured execution. From sprint planning to documentation, he ensures the team meets milestones on time.",
      
      education: "Student - B.Sc Computer Science",
      aspiration: "Cyber Security Specialist",
      
      icon: ShieldAlert, 
      color: "text-emerald-500",
      borderColor: "group-hover:border-emerald-500/50", 
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
      title: "Campus Beta Launch",
      desc: "Deploying MedGuard MVP to 5,000 students at University of Jos for stress testing and feedback.",
      status: "current"
    },
    {
      year: "Q2 2026",
      title: "The Mobile App",
      desc: "Launching dedicated iOS and Android applications with offline-first capabilities for rural areas.",
      status: "future"
    },
    {
      year: "Q4 2026",
      title: "National Expansion",
      desc: "Scaling infrastructure to support 5 Federal Universities and integrating with national 112 dispatch APIs.",
      status: "future"
    },
    {
      year: "2027+",
      title: "Telemedicine Integration",
      desc: "Partnering with hospitals to allow seamless hand-off from AI guidance to human doctor consultations.",
      status: "vision"
    }
  ]

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200 font-sans overflow-hidden">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/50 to-slate-950" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-blue-400 text-xs font-mono uppercase tracking-wider mb-8 shadow-xl">
              <GraduationCap className="h-4 w-4" /> 
              <span>Proudly Built at the University of Jos</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-8 leading-tight">
              We Are the Architects of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
                Next-Gen Healthcare
              </span>
            </h1>
            
            <div className="mx-auto max-w-4xl text-lg md:text-xl text-slate-400 leading-relaxed space-y-6">
              <p>
                MedGuard AI is not merely a project; it is a movement born from the convergence of medical necessity and engineering brilliance.
              </p>
              <p>
                Spearheaded by our <strong>Founder & CEO, Sliverboy</strong>, and grounded in clinical accuracy by our <strong>Medical Research Lead, Khadija</strong>, we are a cohesive unit of innovators. From <strong>Jimmy's</strong> operational rigor to <strong>Collins'</strong> strategic foresight and <strong>David's</strong> community outreach—we are united by a single, unshakeable resolve:
              </p>
              <p className="text-white font-medium">
                To democratize emergency medical guidance for every student, everywhere.
              </p>
            </div>

            <div className="mt-10 flex justify-center gap-6">
               <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION: THE CRISIS --- */}
      <section className="py-20 bg-slate-900/20 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <div>
                 <h2 className="text-3xl font-bold text-white mb-6">The Gap We Are Filling</h2>
                 <p className="text-slate-400 mb-4">
                   In Nigeria, the ratio of doctors to patients is critically low. On university campuses, clinics are often overwhelmed, leaving students vulnerable during late-night emergencies.
                 </p>
                 <p className="text-slate-400">
                   We refused to accept this status quo. MedGuard AI steps in as the <strong>digital first responder</strong>, bridging the time between symptom onset and professional care.
                 </p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
                    <div className="text-4xl font-bold text-rose-500 mb-2">1:4000</div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest">Doctor-Patient Ratio</div>
                 </div>
                 <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
                    <div className="text-4xl font-bold text-blue-500 mb-2">24/7</div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest">MedGuard Availability</div>
                 </div>
             </div>
           </div>
        </div>
      </section>

      {/* --- THE TEAM GRID (REARRANGED) --- */}
      <section className="py-24 bg-slate-950 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Meet the Leadership</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              The students converting potential into kinetic impact.
            </p>
          </div>

          {/* UPDATED CONTAINER: Flex Wrap + Justify Center for attractive layout */}
          <div className="flex flex-wrap justify-center gap-8">
            {teamMembers.map((member, index) => {
              const isFounder = member.isFounder;
              const cardBorder = isFounder ? "border-amber-500/50" : "border-slate-800";
              const cardBg = isFounder ? "bg-amber-950/10" : "bg-slate-900";
              const hoverBorder = isFounder ? "group-hover:border-amber-400" : member.borderColor;
              
              return (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  // UPDATED ITEM WIDTH: Standardized widths to create 3-2 layout on large screens
                  className="group relative w-full md:w-[calc(50%-2rem)] lg:w-[30%]"
                >
                  {/* Hover Glow */}
                  <div className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur ${isFounder ? 'bg-gradient-to-b from-amber-500 to-yellow-600' : 'bg-gradient-to-b from-slate-800 to-slate-900'}`} />
                  
                  <div className={`relative h-full flex flex-col ${cardBg} border ${cardBorder} rounded-2xl overflow-hidden hover:bg-slate-900/90 transition-all duration-300 ${hoverBorder}`}>
                    
                    {/* Image Container */}
                    <div className="relative w-full aspect-[4/5] bg-slate-950 overflow-hidden border-b border-slate-800 group">
                      <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-600">
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
                      
                      <div className={`absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-sm border text-xs font-medium text-white shadow-lg z-10 ${isFounder ? 'bg-amber-500/90 border-amber-400' : 'bg-slate-950/90 border-slate-800'}`}>
                        <member.icon className={`h-3 w-3 ${isFounder ? 'text-white' : member.color}`} />
                        {member.role}
                      </div>

                      {isFounder && (
                        <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold uppercase tracking-wider shadow-xl z-10">
                           <Sparkles className="h-3 w-3" /> Visionary
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-[0.2em] mb-1 ${isFounder ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500' : 'text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-200'}`}>
                          {member.nickname}
                        </div>
                        <h3 className={`text-xl font-bold mb-4 transition-colors ${isFounder ? 'text-amber-400 group-hover:text-amber-300' : 'text-white group-hover:text-blue-400'}`}>
                          {member.name}
                        </h3>
                      </div>

                      <div className={`grid grid-cols-1 gap-3 mb-5 p-4 rounded-xl border relative overflow-hidden ${isFounder ? 'bg-amber-950/30 border-amber-500/30' : 'bg-slate-950/50 border-slate-800'}`}>
                          <div className="flex items-start gap-3">
                             <div className={`mt-0.5 p-1 rounded ${isFounder ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                               <GraduationCap className={`h-3 w-3 ${isFounder ? 'text-amber-400' : 'text-slate-400'}`} />
                             </div>
                             <div className="flex-1">
                                <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold">Academics</span>
                                <span className="text-slate-300 text-xs font-medium leading-tight block mt-0.5">{member.education}</span>
                             </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                             <div className={`mt-0.5 p-1 rounded ${isFounder ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                               <Cpu className={`h-3 w-3 ${isFounder ? 'text-amber-400' : 'text-blue-400'}`} />
                             </div>
                             <div className="flex-1">
                                <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold">Future Tech Class</span>
                                <span className={`${isFounder ? 'text-amber-300' : 'text-blue-300'} text-xs font-bold leading-tight block mt-0.5`}>{member.aspiration}</span>
                             </div>
                          </div>

                          {member.specialty && (
                            <div className="flex items-start gap-3 pt-2 border-t border-amber-500/20 mt-1">
                               <div className="mt-0.5 p-1 rounded bg-amber-500/20">
                                 <Wand2 className="h-3 w-3 text-amber-300" />
                               </div>
                               <div className="flex-1">
                                  <span className="text-amber-500/60 block text-[9px] uppercase tracking-wider font-bold">Specialization</span>
                                  <span className="text-white text-xs font-bold leading-tight block mt-0.5">{member.specialty}</span>
                               </div>
                            </div>
                          )}
                      </div>
                      
                      <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow border-t border-slate-800/50 pt-4">
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
      <section className="py-24 border-y border-white/5 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-2">Our Advisory Board</h2>
              <p className="text-slate-400">
                While we are student-led, we are guided by seasoned professionals.
              </p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                 <div className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <Library className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white">Faculty Advisor (CS Dept)</h3>
                    <p className="text-sm text-blue-400 mb-2">University of Jos</p>
                    <p className="text-sm text-slate-400">Provides oversight on software architecture, AI ethics, and compliance with university research standards.</p>
                 </div>
              </div>
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                 <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                    <Stethoscope className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white">Medical Consultant</h3>
                    <p className="text-sm text-rose-400 mb-2">Senior Resident, JUTH</p>
                    <p className="text-sm text-slate-400">Reviews our medical datasets and triage protocols to ensure clinical accuracy and safety.</p>
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
              <h2 className="text-3xl font-bold text-white">Strategic Roadmap</h2>
              <p className="text-slate-400 mt-2">Our plan to scale from a campus project to a national utility.</p>
           </div>

           <div className="relative border-l border-slate-800 ml-4 md:ml-1/2 space-y-12">
              {roadmap.map((item, index) => (
                 <div key={index} className="relative pl-8 md:pl-0">
                    <div className={`absolute left-[-5px] top-1 h-3 w-3 rounded-full border-2 ${item.status === 'current' ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-900 border-slate-700'} z-10`} />
                    
                    <div className="md:grid md:grid-cols-2 md:gap-16 items-center">
                        <div className={`md:text-right ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                           <span className={`text-xs font-bold px-2 py-1 rounded border ${item.status === 'current' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                              {item.year}
                           </span>
                        </div>
                        <div className={`${index % 2 === 0 ? 'md:order-2' : 'md:order-1'} mt-2 md:mt-0`}>
                           <h3 className={`text-lg font-bold ${item.status === 'current' ? 'text-white' : 'text-slate-300'}`}>
                              {item.title}
                           </h3>
                           <p className="text-sm text-slate-400 mt-1 max-w-sm">{item.desc}</p>
                        </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- THE EXITON --- */}
      <section className="py-28 relative overflow-hidden bg-slate-900/20">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-950" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

            <div className="grid lg:grid-cols-2 gap-12 items-center">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider mb-6">
                    <HeartHandshake className="h-4 w-4" /> Partnership Opportunity
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    Join Forces with the Future
                  </h2>
                  <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                    We are actively seeking forward-thinking sponsors, mentors, and partners to help us scale MedGuard AI beyond the University of Jos.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Target className="h-5 w-5 text-blue-400" />
                         </div>
                         <div>
                            <h4 className="text-white font-bold">CSR Impact</h4>
                            <p className="text-xs text-slate-400">Directly impact the health & safety of Nigerian youth.</p>
                         </div>
                      </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-14 text-base font-bold shadow-lg shadow-blue-600/20">
                      <Link href="mailto:medguardai@gmail.com">
                        <Mail className="mr-2 h-5 w-5" /> Email Us Now
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white rounded-full px-8 h-14 text-base">
                      <a href="https://wa.me/2349063877703" target="_blank" rel="noopener noreferrer">
                        <WhatsAppIcon className="mr-2 h-5 w-5" /> WhatsApp Business
                      </a>
                    </Button>
                  </div>
               </div>

               <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Our Funding Goals</h3>
                  <div className="space-y-6">
                      <div>
                         <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Server Infrastructure</span>
                            <span className="text-blue-400">Priority 1</span>
                         </div>
                         <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-blue-600 rounded-full" />
                         </div>
                      </div>
                  </div>
                  <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-slate-800">
                     <p className="text-sm text-slate-300 italic">
                        "Investing in MedGuard AI is investing in a healthier, smarter Nigeria."
                     </p>
                     <p className="text-xs text-slate-500 mt-2 text-right">- Nwaka Amos Chika, Founder</p>
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
