"use client"

import React, { ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks" // Ensures chat formatting doesn't break
import { motion } from "framer-motion"
import { Copy, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarkdownProps {
  content: string
  className?: string
}

// --- INTERACTIVE SUB-COMPONENTS ---

// 1. The Animated List Item
// Makes each bullet point "pop" in smoothly.
const AnimatedLi = ({ children, ...props }: { children: ReactNode }) => (
  <motion.li
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className="flex items-start gap-2 mb-2 group cursor-default"
    {...props}
  >
    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#DA8CA0] group-hover:scale-150 group-hover:bg-purple-400 transition-all shadow-[0_0_8px_rgba(218,140,160,0.8)] flex-shrink-0" />
    <span className="text-[#CCCCD9] group-hover:text-white transition-colors">{children}</span>
  </motion.li>
)

export function MarkdownRenderer({ content, className }: MarkdownProps) {
  
  // ELITE TRICK: Pre-process the text to wrap emojis in a "3D" styling span
  // This avoids heavy external 3D libraries while making standard emojis pop off the screen.
  const processEmojis = (text: string) => {
    const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
    return text.replace(emojiRegex, (match) => `🎫${match}🎫`);
  }

  // We temporarily wrap emojis in tickets 🎫 to easily target them in the renderer, 
  // without breaking the markdown AST parser.
  const processedContent = processEmojis(content);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      className={cn("text-[15px] leading-relaxed break-words space-y-4", className)}
      components={{
        
        // 1. DYNAMIC TEXT & "3D" EMOJIS
        p: ({ children, ...props }) => {
          // Intercept the text to apply the 3D emoji effect
          const renderChildren = React.Children.map(children, (child) => {
            if (typeof child === 'string') {
              return child.split('🎫').map((part, i) => {
                // If it's an odd index, it's our emoji
                if (i % 2 !== 0) {
                  return (
                    <motion.span 
                      key={i}
                      whileHover={{ scale: 1.2, rotate: [-5, 5, -5, 0] }}
                      className="inline-block mx-0.5 drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] cursor-pointer text-lg"
                    >
                      {part}
                    </motion.span>
                  )
                }
                return part;
              });
            }
            return child;
          });

          return <p className="last:mb-0 inline-block w-full text-[#E5E5EB]" {...props}>{renderChildren}</p>;
        },

        // 2. THE GRADIENT POWER-WORDS (Bold)
        strong: ({ node, ...props }) => (
          <motion.strong 
            whileHover={{ scale: 1.05 }}
            className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-purple-400 drop-shadow-sm inline-block cursor-default" 
            {...props} 
          />
        ),

        // 3. INTERACTIVE LISTS
        ul: ({ node, ...props }) => <ul className="my-3 ml-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-3 ml-2 text-[#DA8CA0] font-bold space-y-2" {...props} />,
        li: ({ node, ...props }) => <AnimatedLi {...props} />,

        // 4. SMART LINKS
        a: ({ node, ...props }) => (
          <a 
            className="text-[#DA8CA0] font-semibold underline underline-offset-4 decoration-[#DA8CA0]/40 decoration-dashed hover:decoration-solid hover:text-purple-400 transition-all cursor-pointer" 
            target="_blank" 
            rel="noopener noreferrer" 
            {...props} 
          />
        ),

        // 5. THE "BIG SISTER" GLOWING BLOCKQUOTE
        blockquote: ({ node, ...props }) => (
          <div className="relative my-4 pl-5 py-2 group">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 w-1.5 rounded-full bg-gradient-to-b from-[#DA8CA0] to-purple-600"
              initial={{ opacity: 0.5 }}
              whileHover={{ opacity: 1, boxShadow: "0 0 15px rgba(218,140,160,0.6)" }}
            />
            <blockquote className="italic text-white/90 font-medium group-hover:text-white transition-colors" {...props} />
          </div>
        ),

        // 6. COPYABLE CODE SNIPPETS
        code: ({ node, inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '')
          const codeString = String(children).replace(/\n$/, '')
          
          if (!inline) {
            return (
              <div className="relative group my-4 rounded-xl overflow-hidden bg-[#130C2E] border border-white/10">
                <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold">
                    {match?.[1] || "Snippet"}
                  </span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(codeString)}
                    className="text-white/40 hover:text-[#DA8CA0] transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-4 overflow-x-auto text-sm text-purple-200 font-mono">
                  <code {...props}>{children}</code>
                </div>
              </div>
            )
          }
          // Inline code styling
          return (
            <code className="bg-white/10 text-[#DA8CA0] px-1.5 py-0.5 rounded-md font-mono text-xs border border-white/5 shadow-sm inline-block" {...props}>
              {children}
            </code>
          )
        }
      }}
    >
      {processedContent}
    </ReactMarkdown>
  )
}