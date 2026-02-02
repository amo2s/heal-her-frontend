"use client"

import { motion } from "framer-motion"
import { Heart, Sparkles, Leaf, Moon, Sun, Droplet, Apple, Smile, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WellnessPage() {
  return (
    <div className="min-h-screen bg-[#1C1246] text-[#FAFAFA] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-soft-light" />
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-[#DA8CA0]/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-[#E8B4C1]/5 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-[#DA8CA0]" />
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-[#FAFAFA] to-[#E8B4C1] bg-clip-text text-transparent">
              Wellness Hub
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-[#CCCCD9] max-w-3xl mx-auto leading-relaxed">
            Gentle daily care • Body kindness • Mind peace • Growing with love
          </p>
        </motion.div>

        {/* Quick Wellness Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: Heart,
              title: "Body Love",
              description: "Learn how to listen to your body, care for your changing skin, and celebrate every part of you.",
              color: "#DA8CA0"
            },
            {
              icon: Moon,
              title: "Rest & Sleep",
              description: "Gentle routines to help you wind down, sleep better, and wake up feeling soft and ready.",
              color: "#E8B4C1"
            },
            {
              icon: Droplet,
              title: "Hydration & Flow",
              description: "Tips for drinking more water, understanding your cycle, and staying in tune with your body.",
              color: "#CCCCD9"
            },
            {
              icon: Smile,
              title: "Mood & Feelings",
              description: "Tools to name what you're feeling, be kind to big emotions, and find small moments of joy.",
              color: "#DA8CA0"
            },
            {
              icon: Apple,
              title: "Nourish Gently",
              description: "Simple, kind food ideas that feel good inside — no rules, just care.",
              color: "#E8B4C1"
            },
            {
              icon: BookOpen,
              title: "Learn & Grow",
              description: "Short reads, gentle facts, and stories from girls like you about growing up.",
              color: "#CCCCD9"
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group bg-[#231854]/60 backdrop-blur-sm border border-[#DA8CA0]/20 rounded-3xl p-8 hover:border-[#DA8CA0]/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(218,140,160,0.15)]"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <item.icon className="w-7 h-7" style={{ color: item.color }} />
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
              <p className="text-[#CCCCD9] leading-relaxed mb-6">{item.description}</p>
              
              <Button 
                variant="ghost" 
                className="text-[#DA8CA0] hover:text-[#E8B4C1] hover:bg-[#DA8CA0]/10 p-0 group-hover:translate-x-2 transition-transform"
              >
                Explore → 
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Daily Gentle Reminder Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-16 px-8 bg-[#231854]/40 rounded-3xl border border-[#DA8CA0]/15 mb-20"
        >
          <div className="max-w-3xl mx-auto">
            <Heart className="w-16 h-16 text-[#DA8CA0] mx-auto mb-8 opacity-80" fill="#DA8CA0" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#FAFAFA] via-[#E8B4C1] to-[#DA8CA0] bg-clip-text text-transparent">
              You are doing enough
            </h2>
            <p className="text-xl text-[#CCCCD9] leading-relaxed mb-10">
              Some days you bloom. Some days you rest. Both are part of growing. Be soft with yourself today.
            </p>
            <Button 
              size="lg"
              className="h-14 px-10 rounded-full bg-[#DA8CA0] text-[#1C1246] font-bold hover:bg-[#E8B4C1] hover:scale-105 transition-all shadow-[0_0_40px_rgba(218,140,160,0.4)]"
            >
              Start a Gentle Chat
            </Button>
          </div>
        </motion.section>

        {/* Coming Soon / Placeholder */}
        <div className="text-center text-[#CCCCD9]/70 text-lg">
          <p>More wellness tools, trackers, and gentle reminders coming soon 🌸</p>
          <p className="mt-3 text-sm">We're building this space with lots of care — just for you.</p>
        </div>
      </div>
    </div>
  )
}