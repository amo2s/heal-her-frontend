"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Quote, ShieldCheck } from "lucide-react"

// Testimonials tailored strictly to the Girls Lounge community, early testers, and parents, highlighting simulations, red-flag detection, age-gating, and security.
const testimonials = [
  { 
    quote: "The way the AI teaches my 7-year-old about her body parts and how to spot 'tricky adults' is so gentle yet effective. The age-appropriate filters are exactly what parents need.", 
    author: "Mrs. Adeola K.", 
    role: "Mother of a 7-year-old", 
    type: "Parent", 
    rating: 5 
  },
  { 
    quote: "Puberty is confusing, but the AI explains it to me like a big sister. I love that it doesn't treat me like a baby or give me information I am not ready for. Waiting for the final release!", 
    author: "Simi B.", 
    role: "Girls Lounge Member", 
    type: "Teen", 
    rating: 4 
  },
  { 
    quote: "The reproductive health vault is incredibly detailed for us older girls. It gives me facts without the scary WebMD vibes. The security architecture makes me feel totally safe using it.", 
    author: "Nneka E.", 
    role: "Early Tester", 
    type: "Young Adult", 
    rating: 5 
  },
  { 
    quote: "I pasted a conversation I was unsure about into the chat. The AI pointed out the manipulation red flags immediately and suggested exact steps on what to do next. This is revolutionary.", 
    author: "Tolu W.", 
    role: "Girls Lounge Member", 
    type: "Teen", 
    rating: 5 
  },
  { 
    quote: "The real-life simulations are crazy! It gave me a scenario about peer pressure and tested what I would do. It’s like practicing for real life before it happens.", 
    author: "Halima S.", 
    role: "Early Tester", 
    type: "Teen", 
    rating: 4 
  },
  { 
    quote: "Spotting predators is a hard topic to teach kids. The child simulations handle it brilliantly without causing fear. I am giving 4 stars until the final version drops.", 
    author: "Mr. Chuka O.", 
    role: "Parent & Lounge Sponsor", 
    type: "Parent", 
    rating: 4 
  },
  { 
    quote: "I tested the red flag feature by typing a scary message a guy sent me. The app flagged it as predatory and gave me steps to block and report. Needs a few bug fixes, but the core is solid!", 
    author: "Maryam K.", 
    role: "Early Tester", 
    type: "Young Adult", 
    rating: 3 
  },
  { 
    quote: "Security is my top priority. Knowing this app is entirely encrypted and doesn't sell data makes me confident to let my daughter use it for tracking her health.", 
    author: "Mrs. Bose O.", 
    role: "Parent", 
    type: "Parent", 
    rating: 5 
  },
  { 
    quote: "It is amazing how the AI changes its tone based on age. My little sister gets kid-friendly advice, and I get the real, detailed truth about growing up. Highly secure too.", 
    author: "Joy N.", 
    role: "Early Tester", 
    type: "Teen", 
    rating: 5 
  },
  { 
    quote: "The roleplay simulations are like a game, but you actually learn what to do in dangerous or uncomfortable situations. Waiting for them to add more levels before I give 5 stars.", 
    author: "Chioma I.", 
    role: "Girls Lounge Member", 
    type: "Pre-teen", 
    rating: 3 
  },
  { 
    quote: "Finally, a safe space for young women to learn about reproductive health. I analyzed a toxic text with the AI and its advice was spot on. The privacy features are top-notch.", 
    author: "Yewande T.", 
    role: "Lounge Mentor", 
    type: "Young Adult", 
    rating: 4 
  },
  { 
    quote: "I like how it tests you. It gave me a scenario about a stranger offering a ride and checked my response. This app will save lives when it fully launches.", 
    author: "Blessing U.", 
    role: "Girls Lounge Member", 
    type: "Teen", 
    rating: 5 
  },
  { 
    quote: "Testing the 'red flag' detector was eye-opening. It actually analyzes texts for toxic behavior. Rating 4 stars because I want even more complex scenarios added to the simulator.", 
    author: "Kehinde M.", 
    role: "Early Tester", 
    type: "Young Adult", 
    rating: 4 
  },
  { 
    quote: "It feels like a secret diary that talks back. Super secure, and no one can snoop on my reproductive health tracking. It knows exactly what a young adult needs.", 
    author: "Folake A.", 
    role: "Girls Lounge Member", 
    type: "Young Adult", 
    rating: 5 
  },
  { 
    quote: "As a mother and mentor, the way the AI restricts adult info from kids while teaching them bodily autonomy is a masterclass in software safety engineering.", 
    author: "Dr. Ogechi V.", 
    role: "Parent & Mentor", 
    type: "Parent", 
    rating: 5 
  },
  { 
    quote: "The interactive scenarios are my favorite part. It’s one thing to read advice, but practicing it in a simulation makes you confident you'll know what to say in real life.", 
    author: "Zara F.", 
    role: "Girls Lounge Member", 
    type: "Teen", 
    rating: 4 
  },
  { 
    quote: "The privacy architecture is solid. You can ask anything about puberty without fear of judgment or a data leak. Just waiting for the final UI polish to give it 5 stars.", 
    author: "Ezinne C.", 
    role: "Early Tester", 
    type: "Teen", 
    rating: 3 
  },
  { 
    quote: "I checked the kids' simulator for my niece. It actually tests them on what to do if a stranger approaches online. This app is an absolute necessity.", 
    author: "Mrs. Funke A.", 
    role: "Parent", 
    type: "Parent", 
    rating: 5 
  },
  { 
    quote: "When I had questions about reproductive health, it gave me medically backed answers without locking them behind a paywall. The data protection is a huge plus.", 
    author: "Chika N.", 
    role: "Early Tester", 
    type: "Young Adult", 
    rating: 4 
  },
  { 
    quote: "The text analysis is crazy. I submitted a scenario where a friend was pressuring me, and the AI highlighted the exact sentences that were red flags. Can't wait for launch!", 
    author: "Amina D.", 
    role: "Girls Lounge Member", 
    type: "Teen", 
    rating: 5 
  }
]

export default function Testimonial() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
      }, 8000)
      return () => clearInterval(timer)
    }
  }, [isPaused, testimonials.length])

  return (
    <section className="py-24 md:py-32 px-4 md:px-6 bg-transparent relative overflow-hidden border-t border-white/10">
      
      {/* Light Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#DA8CA0]/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-white text-center tracking-tight">Community Voices</h2>
        <p className="text-[#DA8CA0] font-bold mb-16 text-center text-sm md:text-base uppercase tracking-widest">From the Girls Lounge & Beyond</p>

        <div 
          className="relative w-full max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentTestimonial}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full" 
            >
              {/* Premium Dusty Rose Glass Card */}
              <div className="relative backdrop-blur-3xl bg-[#DA8CA0]/30 border border-white/30 rounded-[2.5rem] p-8 md:p-14 shadow-[0_15px_40px_-10px_rgba(28,18,70,0.3),inset_0_1px_0_0_rgba(255,255,255,0.4)] hover:border-white/50 hover:bg-[#DA8CA0]/40 transition-all duration-700 group overflow-hidden">
                
                {/* Giant Watermark Quote */}
                <Quote className="absolute -top-6 -left-6 w-48 h-48 text-white/[0.05] group-hover:text-white/[0.08] transition-colors duration-700 -rotate-12 pointer-events-none" />
                
                <div className="relative z-10">
                  {/* Dynamic Glowing Stars */}
                  <div className="flex gap-1.5 mb-8">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const isFilled = s <= testimonials[currentTestimonial].rating;
                      return (
                        <div key={s} className="relative">
                          {isFilled && (
                            <div className="absolute inset-0 bg-white blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
                          )}
                          <Star 
                            className={`w-5 h-5 relative z-10 transition-colors duration-500 ${
                              isFilled 
                                ? "text-white fill-white" 
                                : "text-white/30 fill-white/10"
                            }`} 
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* The Quote */}
                  <p className="text-lg md:text-2xl text-white font-medium leading-relaxed tracking-wide mb-12 min-h-[140px] md:min-h-[120px]">
                    "{testimonials[currentTestimonial].quote}"
                  </p>
                </div>

                {/* Author Block */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-8 border-t border-white/20 relative z-10">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-white to-[#fae0e6] p-[2px] shadow-[0_5px_15px_rgba(255,255,255,0.2)]">
                    <div className="w-full h-full rounded-full bg-[#1C1246] flex items-center justify-center text-white font-bold text-xl">
                        {testimonials[currentTestimonial].author.charAt(0)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white text-lg truncate">{testimonials[currentTestimonial].author}</h4>
                        <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-white/80 text-xs font-bold tracking-widest uppercase truncate mb-1">
                        {testimonials[currentTestimonial].role}
                    </div>
                  </div>

                  <div className="shrink-0 mt-2 sm:mt-0">
                    <span className="text-[10px] md:text-xs text-white border border-white/30 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full whitespace-nowrap font-bold uppercase tracking-wider shadow-sm">
                        {testimonials[currentTestimonial].type}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Sleek Progress Indicator */}
          <div className="flex justify-center gap-2 mt-12 flex-wrap px-4">
            {testimonials.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${index === currentTestimonial ? 'w-10 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2 bg-white/20 hover:bg-white/60'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}