"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Quote, Star, BadgeCheck, Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// TESTIMONIAL DATA (20 Highly Targeted Personas)
// ============================================================================

const testimonials = [
  {
    id: 1,
    name: "Chidera O.",
    role: "15 years old",
    badge: "Beta Tester",
    content: "I love the answers and how it doesn't judge me, but logging into a browser every time I have a question is so annoying! Please, we need an actual app for iOS and Android ASAP. The AI is great though.",
    rating: 4,
    initials: "CO",
    color: "from-pink-500 to-rose-400"
  },
  {
    id: 2,
    name: "Mrs. Folashade A.",
    role: "Working Mother of 2",
    badge: "Verified Parent",
    content: "As a banker, I am rarely home by 4 PM. Knowing my 11-year-old daughter can safely ask Heal Her questions instead of searching random, scary things on Google gives me absolute peace of mind. She is becoming so smart and self-aware.",
    rating: 5,
    initials: "FA",
    color: "from-purple-500 to-indigo-400"
  },
  {
    id: 3,
    name: "Zainab M.",
    role: "16 years old",
    badge: "Early Access",
    content: "Why are some dashboard sections still locked?! 😭 The period tracking advice is amazing but I need the mental health module NOW. Please finish building the rest of the features fast, we really need this!",
    rating: 3,
    initials: "ZM",
    color: "from-orange-500 to-amber-400"
  },
  {
    id: 4,
    name: "Mr. Emmanuel K.",
    role: "Secondary School Teacher",
    badge: "Educator",
    content: "The simplicity of the UI is highly commendable. I specifically love the quiz modules; it tests their knowledge effectively without making them feel like they are in a high-pressure classroom. A brilliant educational tool.",
    rating: 5,
    initials: "EK",
    color: "from-emerald-500 to-teal-400"
  },
  {
    id: 5,
    name: "Amaka",
    role: "10 years old",
    badge: "User",
    content: "It feels like having a big sister who knows everything about growing up. I don't feel scared about puberty anymore because the AI explains it very gently.",
    rating: 5,
    initials: "AM",
    color: "from-[#DA8CA0] to-pink-300"
  },
  {
    id: 6,
    name: "Oluwaseun F.",
    role: "14 years old",
    badge: "Beta Tester",
    content: "Typing the URL every single time I have a quick question about my body is stressful. The AI is incredibly smart and helpful, but a native mobile app would make this 100 times better.",
    rating: 4,
    initials: "OF",
    color: "from-blue-500 to-cyan-400"
  },
  {
    id: 7,
    name: "Nneka U.",
    role: "19 years old",
    badge: "Young Adult",
    content: "I'm giving this 4 stars only because the young adult dashboard is missing the advanced clinic directory. What is there right now is very accurate, but I am pleading with the devs to release the full version soon.",
    rating: 4,
    initials: "NU",
    color: "from-rose-500 to-red-400"
  },
  {
    id: 8,
    name: "Mrs. Okoro",
    role: "Mother of 1",
    badge: "Verified Parent",
    content: "My daughter used to be entirely too shy to ask me about her body changes. Now we look at the Heal Her quizzes together on weekends. It has opened up our communication beautifully.",
    rating: 5,
    initials: "MO",
    color: "from-indigo-500 to-blue-400"
  },
  {
    id: 9,
    name: "Halima S.",
    role: "13 years old",
    badge: "User",
    content: "Finally an AI that explains female health normally without using confusing medical words or making it weird. I just wish there was a dark mode for reading at night.",
    rating: 4,
    initials: "HS",
    color: "from-teal-500 to-emerald-400"
  },
  {
    id: 10,
    name: "David U.",
    role: "Single Father of 2",
    badge: "Verified Parent",
    content: "I am a single dad and sometimes I simply do not know how to explain female hygiene and health stuff to my girls. This platform's simple, educational approach has saved me so many times.",
    rating: 5,
    initials: "DU",
    color: "from-cyan-500 to-blue-400"
  },
  {
    id: 11,
    name: "Teniola",
    role: "9 years old",
    badge: "User",
    content: "I really like the colors. The AI is very nice to me when I ask questions. I learned about proper hygiene and washing my hands today. The quizzes are fun like a game.",
    rating: 5,
    initials: "TE",
    color: "from-[#DA8CA0] to-rose-300"
  },
  {
    id: 12,
    name: "Favour E.",
    role: "17 years old",
    badge: "Beta Tester",
    content: "The privacy features are excellent, but I can't access the safe community forum yet because it says 'coming soon'. Please hurry up and build it! I want to talk to other girls my age.",
    rating: 3,
    initials: "FE",
    color: "from-amber-500 to-yellow-400"
  },
  {
    id: 13,
    name: "Blessing",
    role: "15 years old",
    badge: "User",
    content: "The explanations are very clear. Much better than what they rush through in our biology class tbh. Just wish I could download it from the App Store instead of using Safari.",
    rating: 4,
    initials: "BL",
    color: "from-fuchsia-500 to-pink-400"
  },
  {
    id: 14,
    name: "Mrs. Bello",
    role: "School Counselor",
    badge: "Educator",
    content: "I recommend this to all my Junior Secondary students. The privacy features are top-notch and the language is perfect for their age group. The interface is clean and completely ad-free.",
    rating: 5,
    initials: "MB",
    color: "from-violet-500 to-purple-400"
  },
  {
    id: 15,
    name: "Chioma",
    role: "20 years old",
    badge: "Young Adult",
    content: "I thought this was just an app for kids, but the 18+ section actually answers deep questions about reproductive health. Still waiting for the full adult features to be unlocked though.",
    rating: 4,
    initials: "CH",
    color: "from-rose-600 to-pink-500"
  },
  {
    id: 16,
    name: "Aisha T.",
    role: "16 years old",
    badge: "Beta Tester",
    content: "Can we please get a widget or a mobile app? Going to the browser is too long when I need a quick answer. The AI itself is a 10/10 but the accessibility right now is a 6/10.",
    rating: 3,
    initials: "AT",
    color: "from-orange-600 to-amber-500"
  },
  {
    id: 17,
    name: "Mr. Adeleke",
    role: "Father of 1",
    badge: "Verified Parent",
    content: "It is extremely comforting to know there is no explicit content, no crazy ads, and no data selling. A very safe, smart space for my 12-year-old to satisfy her curiosity.",
    rating: 5,
    initials: "MA",
    color: "from-blue-600 to-indigo-500"
  },
  {
    id: 18,
    name: "Kelechi",
    role: "14 years old",
    badge: "User",
    content: "I use Heal Her to double-check the crazy things my friends tell me at school. Turns out a lot of those myths are totally fake lol. Good platform, but I need an app icon on my home screen.",
    rating: 4,
    initials: "KE",
    color: "from-emerald-600 to-teal-500"
  },
  {
    id: 19,
    name: "Simi O.",
    role: "15 years old",
    badge: "Early Access",
    content: "Please when is the final version coming out? The beta is way too good to be this limited. The quizzes are helpful but we want everything. Finish the code!",
    rating: 4,
    initials: "SO",
    color: "from-pink-600 to-rose-500"
  },
  {
    id: 20,
    name: "Joy",
    role: "11 years old",
    badge: "User",
    content: "It answered my question about why I get stomach aches sometimes and didn't make me feel silly for asking. It is very smart and easy to read.",
    rating: 5,
    initials: "JO",
    color: "from-[#DA8CA0] to-pink-400"
  }
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const AUTOPLAY_INTERVAL = 7000 // 7 seconds per slide

  // Handle auto-rotation
  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, AUTOPLAY_INTERVAL)

    return () => clearInterval(timer)
  }, [isPaused])

  const activeTestimonial = testimonials[activeIndex]

  return (
    <section className="relative py-32 bg-[#1C1246] overflow-hidden flex flex-col items-center justify-center min-h-[800px]">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#DA8CA0]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center mb-16 relative z-10 px-4">
        <h2 className="text-sm font-semibold tracking-widest text-[#DA8CA0] uppercase mb-4">Beta Feedback</h2>
        <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">What Our Community Says</h3>
        <p className="text-[#CCCCD9] max-w-xl mx-auto">
          Honest feedback from the girls, mothers, and educators currently testing the Heal Her platform across Nigeria.
        </p>
      </div>

      {/* Main Carousel Container */}
      <div 
        className="relative w-full max-w-4xl mx-auto px-4 z-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={() => setIsPaused(!isPaused)} // For mobile toggle
      >
        <div className="relative h-[450px] md:h-[350px] w-full perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20, rotateX: -5 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -20, rotateX: 5 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              {/* The Premium Card */}
              <div className="w-full h-full bg-[#231854]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group hover:border-[#DA8CA0]/30 transition-colors duration-500">
                
                {/* Massive Watermark Quote */}
                <Quote className="absolute -top-10 -left-10 w-64 h-64 text-white opacity-[0.03] rotate-12 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                  
                  {/* Header: Profile & Rating */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                      {/* Premium Avatar */}
                      <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg bg-gradient-to-br", activeTestimonial.color)}>
                        {activeTestimonial.initials}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-bold text-white">{activeTestimonial.name}</h4>
                          <BadgeCheck className="w-5 h-5 text-[#DA8CA0]" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium text-[#DA8CA0] bg-[#DA8CA0]/10 px-2.5 py-0.5 rounded-full border border-[#DA8CA0]/20">
                            {activeTestimonial.badge}
                          </span>
                          <span className="text-sm text-[#CCCCD9]">|</span>
                          <span className="text-sm text-[#CCCCD9]">{activeTestimonial.role}</span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating System */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-5 h-5 transition-colors",
                            star <= activeTestimonial.rating 
                              ? "fill-[#DA8CA0] text-[#DA8CA0]" 
                              : "fill-[#1C1246] text-[#2a2259]" // Empty stars for 3/4 star reviews
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Body: The Quote */}
                  <div className="flex-grow flex items-center">
                    <p className="text-xl md:text-2xl text-[#FAFAFA] leading-relaxed font-light md:leading-normal">
                      "{activeTestimonial.content}"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Custom Controls & Progress Indicator */}
        <div className="mt-8 flex items-center justify-between max-w-md mx-auto px-4">
          <div className="text-sm font-mono text-[#CCCCD9] flex items-center gap-2">
            {isPaused ? <Pause className="w-4 h-4 text-[#DA8CA0]" /> : <Play className="w-4 h-4 text-[#DA8CA0]" />}
            <span>{String(activeIndex + 1).padStart(2, '0')} / {testimonials.length}</span>
          </div>

          {/* Progress Line */}
          <div className="h-1 flex-grow mx-6 bg-[#2a2259] rounded-full overflow-hidden relative">
            <motion.div 
              key={activeIndex} // Resets animation when slide changes
              initial={{ width: "0%" }}
              animate={{ width: isPaused ? "auto" : "100%" }} // Stops growing if paused
              transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" }}
              className="absolute top-0 left-0 h-full bg-[#DA8CA0] rounded-full"
              style={{ animationPlayState: isPaused ? 'paused' : 'running' }} // CSS fallback for strict pausing
            />
          </div>

          {/* Quick Nav Dots (Optional, keeping it minimal to just prev/next click zones if needed, or mapped dots) */}
          <div className="flex gap-1.5">
             <button onClick={() => setActiveIndex((curr) => curr === 0 ? testimonials.length - 1 : curr - 1)} className="p-2 text-[#CCCCD9] hover:text-white transition">←</button>
             <button onClick={() => setActiveIndex((curr) => (curr + 1) % testimonials.length)} className="p-2 text-[#CCCCD9] hover:text-white transition">→</button>
          </div>
        </div>
      </div>
    </section>
  )
}