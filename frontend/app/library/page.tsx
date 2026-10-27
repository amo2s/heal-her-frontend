"use client"

import { motion } from "framer-motion"
import { BookOpen, Sparkles, Heart, Clock, Star, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-[#1C1246] text-[#FAFAFA] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-soft-light" />
        <div className="absolute top-[-30%] right-[-20%] w-[900px] h-[900px] bg-[#DA8CA0]/8 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[800px] h-[800px] bg-[#E8B4C1]/6 rounded-full blur-[160px]" />
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
            <BookOpen className="w-9 h-9 text-[#DA8CA0]" />
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-[#FAFAFA] to-[#E8B4C1] bg-clip-text text-transparent">
              Your Library
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-[#CCCCD9] max-w-3xl mx-auto leading-relaxed">
            Gentle reads, saved chats, and everything you want to come back to — all in one soft place.
          </p>
        </motion.div>

        {/* Saved Articles Grid */}
        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Bookmark className="w-7 h-7 text-[#DA8CA0]" />
              Saved Articles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Why Your Skin Changes (And Why It's Okay)", time: "6 min", tag: "Skin & Body" },
                { title: "Understanding Your First Period: A Soft Guide", time: "8 min", tag: "Periods" },
                { title: "When Mood Swings Feel Too Big", time: "5 min", tag: "Feelings" },
                { title: "How to Talk to Your Mom About Growing Up", time: "7 min", tag: "Family" },
                { title: "Simple Ways to Feel Calm Before Bed", time: "4 min", tag: "Sleep" },
                { title: "What Is Self-Love? (And How to Start)", time: "9 min", tag: "Confidence" },
              ].map((article, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-[#231854]/50 backdrop-blur-sm border border-[#DA8CA0]/20 rounded-3xl p-6 hover:border-[#DA8CA0]/50 transition-all cursor-pointer hover:shadow-[0_0_40px_rgba(218,140,160,0.15)]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono text-[#DA8CA0] bg-[#DA8CA0]/10 px-3 py-1 rounded-full">
                      {article.tag}
                    </span>
                    <Star className="w-5 h-5 text-[#DA8CA0] fill-[#DA8CA0]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#E8B4C1] transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[#CCCCD9] text-sm">
                    <Clock className="w-4 h-4" />
                    {article.time} read
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Saved Chats */}
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Heart className="w-7 h-7 text-[#E8B4C1]" fill="#E8B4C1" />
              Saved Chats
            </h2>

            <div className="space-y-4">
              {[
                { preview: "That time I felt really sad for no reason...", date: "Jan 28" },
                { preview: "About cramps and what helps...", date: "Jan 15" },
                { preview: "When I got my first period at school", date: "Dec 22" },
                { preview: "Feeling pretty today 💕", date: "Dec 10" },
              ].map((chat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#231854]/40 border border-[#DA8CA0]/15 rounded-2xl p-5 flex items-center justify-between hover:border-[#DA8CA0]/40 transition-all group cursor-pointer"
                >
                  <div>
                    <p className="text-white font-medium group-hover:text-[#E8B4C1] transition-colors">
                      {chat.preview}
                    </p>
                    <p className="text-xs text-[#CCCCD9] mt-1">{chat.date}</p>
                  </div>
                  <Sparkles className="w-5 h-5 text-[#DA8CA0] opacity-60 group-hover:opacity-100" />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Empty State Message */}
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#DA8CA0]/10 mb-6">
              <Heart className="w-10 h-10 text-[#DA8CA0]" />
            </div>
            <p className="text-[#CCCCD9] text-lg max-w-md mx-auto">
              Everything you save appears here — like a little diary of your journey.
            </p>
            <p className="text-[#CCCCD9]/70 text-sm mt-3">
              Keep chatting, keep saving, keep growing 🌸
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}