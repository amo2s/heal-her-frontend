"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { 
  Home, 
  School, 
  MapPin, 
  Users, 
  Heart, 
  Activity, 
  AlertTriangle, 
  Flame, 
  Zap, 
  Thermometer, 
  Bus,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Siren,        
  WifiOff,      
  Smartphone,   
  Signal,       
  Briefcase,
  Building2,
  Factory,
  Sun,
  Droplets,
  Eye,
  Pill,
  Dog,
  Car
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import React from "react"

// --- UTILS ---
const GrainOverlay = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
    }}
  />
)

export default function UseCasesPage() {
  const [activeTab, setActiveTab] = useState("campus")

  // --- 5 TABS x 4 SCENARIOS CONFIGURATION ---
  const categories = {
    campus: {
      label: "Campus Life",
      icon: School,
      description: "Tailored for the unique risks of student life at Uni Jos and beyond.",
      scenarios: [
        {
          title: "Exam Panic Attack",
          icon: Zap,
          context: "Student hyperventilating before a major exam.",
          ai_action: "Guides user through 4-7-8 breathing techniques and grounds them visually."
        },
        {
          title: "Hostel Food Poisoning",
          icon: Thermometer,
          context: "Severe stomach cramps after eating street food.",
          ai_action: "Assesses hydration, rules out appendicitis, and provides rehydration protocols."
        },
        {
          title: "Sports Injury",
          icon: Activity,
          context: "Ankle sprain during departmental football match.",
          ai_action: "Instructs on R.I.C.E protocol and helps determine if an X-ray is needed."
        },
        {
          title: "Substance Reaction",
          icon: Pill,
          context: "Student unresponsive or acting erratically after a party.",
          ai_action: "Identifies overdose signs, guides recovery position, and urges immediate help."
        }
      ]
    },
    domestic: {
      label: "Home & Family",
      icon: Home,
      description: "Everyday household emergencies where speed matters.",
      scenarios: [
        {
          title: "Kitchen Burns",
          icon: Flame,
          context: "Hot oil splash while cooking.",
          ai_action: "Immediate cooling instructions (no ice), severity grading, and dressing advice."
        },
        {
          title: "Child Choking",
          icon: AlertTriangle,
          context: "Toddler struggling to breathe while eating.",
          ai_action: "Delivers rapid, step-by-step back blow instructions adapted for children."
        },
        {
          title: "Elderly Fall",
          icon: Users,
          context: "Grandparent falls in the bathroom.",
          ai_action: "Checks for hip fractures/head trauma before moving them to prevent paralysis."
        },
        {
          title: "High Fever/Malaria",
          icon: Thermometer,
          context: "Sudden high temperature at 2 AM.",
          ai_action: "Tepid sponging guidance and dosage calculation for antipyretics based on weight."
        }
      ]
    },
    transit: {
      label: "Road & Travel",
      icon: MapPin,
      description: "Critical support for remote roads and highways.",
      scenarios: [
        {
          title: "Road Accident",
          icon: Car,
          context: "Witnessing a collision on a highway.",
          ai_action: "Scene safety check, bleeding control (tourniquet), and spine stabilization."
        },
        {
          title: "Snake Bite",
          icon: AlertTriangle,
          context: "Bitten while hiking or in a rural area.",
          ai_action: "Identifying venomous traits, limb immobilization, and keeping patient calm."
        },
        {
          title: "Heat Exhaustion",
          icon: Sun,
          context: "Dizziness while traveling in a hot bus without AC.",
          ai_action: "Cooling techniques using available water and identifying heat stroke signs."
        },
        {
          title: "Motion Sickness",
          icon: Bus,
          context: "Severe vomiting and dehydration on a long trip.",
          ai_action: "Acupressure points and hydration management strategies."
        }
      ]
    },
    workplace: {
      label: "Workplace",
      icon: Briefcase,
      description: "Occupational hazards in offices and industrial sites.",
      scenarios: [
        {
          title: "Cardiac Arrest",
          icon: Heart,
          context: "Colleague collapses in the office.",
          ai_action: "CPR beat guidance (100-120 bpm) and locating the nearest AED."
        },
        {
          title: "Chemical Eye Splash",
          icon: Eye,
          context: "Cleaning fluid splashes into eyes.",
          ai_action: "Irrigation timing protocols (15+ mins) and neutralizing advice."
        },
        {
          title: "Deep Laceration",
          icon: Factory,
          context: "Cut from machinery or broken glass.",
          ai_action: "Direct pressure techniques and determining if stitches are required."
        },
        {
          title: "Electric Shock",
          icon: Zap,
          context: "Contact with faulty wiring or generator.",
          ai_action: "Safe disengagement protocols and burn assessment."
        }
      ]
    },
    public: {
      label: "Public Spaces",
      icon: Building2,
      description: "Emergencies in markets, churches, or streets.",
      scenarios: [
        {
          title: "Fainting (Syncope)",
          icon: Activity,
          context: "Person collapses in a crowded market.",
          ai_action: "Leg elevation, airway checks, and glucose management guidance."
        },
        {
          title: "Dog Bite",
          icon: Dog,
          context: "Bitten by a stray dog on the street.",
          ai_action: "Rabies risk assessment, wound cleaning, and vaccination urgency."
        },
        {
          title: "Generator Fumes",
          icon: Droplets,
          context: "Dizziness/confusion in a poorly ventilated shop.",
          ai_action: "Carbon Monoxide poisoning identification and fresh air evacuation."
        },
        {
          title: "Seizure",
          icon: Activity,
          context: "Person seizing in a church service.",
          ai_action: "Head protection instructions and recovery position after seizure ends."
        }
      ]
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200 font-sans overflow-hidden">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/50 to-slate-950" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-wider mb-6">
              <Activity className="h-4 w-4" /> Situational Intelligence
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
              Ready for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Whatever Happens</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-400 leading-relaxed">
              Emergencies don't announce themselves. From dorm rooms to highways, MedGuard AI adapts its medical logic to your specific environment instantly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- SIMULATION DEMO --- */}
      <section className="py-24 bg-slate-900/30 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Explanation */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">See It In Action</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                When panic sets in, clarity is king. MedGuard AI cuts through the noise. It doesn't just give you a Wikipedia article; it asks triage questions and gives <strong>imperative commands</strong>.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
                    <Zap className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Instant Triage</h4>
                    <p className="text-sm text-slate-400">Within seconds, the AI assesses severity: "Is the person breathing?" "Is there severe bleeding?"</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <ShieldAlert className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Safety First</h4>
                    <p className="text-sm text-slate-400">Before treatment, MedGuard ensures the scene is safe for the responder.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Phone Simulation */}
            <div className="relative mx-auto w-full max-w-xs">
              <div className="relative border-8 border-slate-800 bg-slate-950 rounded-[3rem] h-[600px] shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20" />
                
                <div className="flex flex-col h-full pt-12 pb-4 px-4 bg-slate-950">
                  <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">MedGuard AI</div>
                      <div className="text-[10px] text-emerald-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Online
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
                    <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex justify-end">
                      <div className="bg-blue-600 text-white text-xs p-3 rounded-2xl rounded-tr-sm max-w-[85%]">
                        I burned my hand with boiling water! It hurts really bad.
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="flex justify-start">
                      <div className="bg-slate-900 border border-slate-800 text-slate-300 text-xs p-3 rounded-2xl rounded-tl-sm max-w-[90%]">
                        <strong className="text-rose-400 block mb-1">IMMEDIATE ACTION:</strong>
                        Run cool (not cold) tap water over the burn for 10-20 minutes immediately. Do NOT use ice, butter, or toothpaste.
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 1.5 }} className="flex justify-start">
                      <div className="bg-slate-900 border border-slate-800 text-slate-300 text-xs p-3 rounded-2xl rounded-tl-sm max-w-[90%]">
                        Does the burn cover an area larger than the size of your palm, or is the skin charred (black/white)?
                      </div>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 2.5 }} className="flex gap-1 ml-2">
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce delay-200" />
                    </motion.div>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 bg-blue-500/20 rounded-[3rem] blur-xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* --- NEW SECTION 1: RED FLAG PROTOCOL (Safety) --- */}
      <section className="py-24 bg-rose-950/10 border-y border-rose-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
           <div className="inline-flex items-center justify-center p-4 bg-rose-500/10 rounded-full mb-6 border border-rose-500/20">
              <Siren className="h-8 w-8 text-rose-500 animate-pulse" />
           </div>
           <h2 className="text-3xl font-bold text-white mb-6">Built-In Safety Protocols</h2>
           <p className="text-slate-400 max-w-3xl mx-auto mb-10 text-lg">
             Investors and users ask: "Is it safe?" The answer is yes. MedGuard AI is trained to recognize 
             <strong> Red Flag Keywords</strong>. It knows when to stop giving advice and start demanding emergency action.
           </p>
           
           <div className="grid md:grid-cols-3 gap-6 text-left">
              {[
                { label: "Chest Pain", desc: "Triggers immediate cardiac arrest protocols." },
                { label: "Unconsciousness", desc: "Switches to CPR/Recovery Position mode." },
                { label: "Profuse Bleeding", desc: "Prioritizes tourniquet/pressure instructions." }
              ].map((item, i) => (
                <div key={i} className="bg-slate-950 border border-rose-900/30 p-6 rounded-xl flex items-start gap-4 hover:border-rose-500/50 transition-colors">
                   <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0" />
                   <div>
                      <h4 className="text-white font-bold">{item.label}</h4>
                      <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- DYNAMIC USE CASES (5 TABS) --- */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-white mb-4">Scenarios We Cover</h2>
             <p className="text-slate-400">Explore how MedGuard adapts to different environments.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {(Object.keys(categories) as Array<keyof typeof categories>).map((key) => {
              const CategoryIcon = categories[key].icon
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border ${
                    isActive 
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25" 
                      : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <CategoryIcon className="h-4 w-4" />
                  {categories[key].label}
                </button>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-10">
                <p className="text-slate-400 text-lg">
                  {categories[activeTab as keyof typeof categories].description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories[activeTab as keyof typeof categories].scenarios.map((scenario, index) => (
                  <div 
                    key={index}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <scenario.icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{scenario.title}</h3>
                    <p className="text-slate-400 text-xs mb-3 leading-relaxed min-h-[40px]">{scenario.context}</p>
                    
                    <div className="pt-3 border-t border-slate-800">
                      <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold mb-1">Response</p>
                      <p className="text-slate-300 text-xs leading-relaxed">{scenario.ai_action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* --- NEW SECTION 2: UNIVERSAL ACCESS (FIXED SIMULATION) --- */}
      <section className="py-24 border-t border-white/5 bg-slate-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-6">
                    <Signal className="h-4 w-4" /> Built for Nigeria
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">No Data? Low Battery? <br/>No Problem.</h2>
                 <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                    We know that in emergencies, your connection might not be perfect. MedGuard AI is engineered to be extremely lightweight.
                 </p>
                 <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                       <WifiOff className="h-5 w-5 text-slate-500 mt-1" />
                       <div>
                          <strong className="text-white block">Offline First Architecture</strong>
                          <span className="text-sm text-slate-400">Core protocols load instantly even on 2G/Edge networks.</span>
                       </div>
                    </li>
                    <li className="flex items-start gap-3">
                       <Smartphone className="h-5 w-5 text-slate-500 mt-1" />
                       <div>
                          <strong className="text-white block">Works on Any Device</strong>
                          <span className="text-sm text-slate-400">Optimized for older Android phones common in student hostels.</span>
                       </div>
                    </li>
                 </ul>
              </div>
              
              {/* FIXED LOW DATA SIMULATION */}
              <div className="relative">
                 <div className="absolute -inset-2 bg-emerald-500/20 rounded-2xl blur-xl" />
                 <div className="relative bg-black border-4 border-slate-800 p-6 rounded-xl font-mono shadow-2xl">
                    {/* Retro Phone Header */}
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-4 text-emerald-500 text-xs">
                       <span>MEDGUARD LITE v1.0</span>
                       <div className="flex items-center gap-1">
                          <span>E</span>
                          <div className="flex gap-0.5 items-end h-3">
                             <div className="w-1 h-1 bg-emerald-500"/>
                             <div className="w-1 h-2 bg-emerald-500"/>
                             <div className="w-1 h-3 bg-gray-800"/>
                             <div className="w-1 h-4 bg-gray-800"/>
                          </div>
                       </div>
                    </div>
                    
                    {/* Screen Content */}
                    <div className="space-y-4 text-sm">
                       <div className="text-gray-400">&gt; Loading Protocol: BURN_TREATMENT...</div>
                       
                       {/* Animated Loading Bar */}
                       <div className="w-full h-4 border border-emerald-900 p-0.5 rounded">
                          <motion.div 
                            className="h-full bg-emerald-600"
                            initial={{ width: "0%" }}
                            whileInView={{ width: "100%" }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          />
                       </div>

                       <div className="text-white">
                          <span className="text-emerald-500">[1]</span> Cool with water (10m)<br/>
                          <span className="text-emerald-500">[2]</span> Remove jewelry<br/>
                          <span className="text-emerald-500">[3]</span> Cover with clean cloth<br/>
                       </div>

                       <div className="text-gray-400 text-xs mt-4 border-t border-gray-800 pt-2">
                          Press * for Menu <span className="animate-pulse">_</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Don't Wait for an Emergency</h2>
          <p className="text-lg text-slate-400 mb-8">
            Equip yourself with the ultimate digital first responder today. It's better to have it and not need it, than need it and not have it.
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-12 text-sm font-bold tracking-wide shadow-lg shadow-blue-600/20">
            <Link href="https://med-guard-ai.vercel.app">
              Get MedGuard Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}