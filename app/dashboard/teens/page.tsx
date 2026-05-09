"use client";

import { motion } from "framer-motion";
import { useHeal } from "@/store/heal";
import { HealChat } from "@/components/kids/HealChat";
import { LessonsRow, VideosRow } from "@/components/kids/LearnWatch";
import { ScenarioCard } from "@/components/kids/ScenarioCard";
import { SafeCircle } from "@/components/kids/SafeCircle";
import { RedFlagDetector } from "@/components/kids/RedFlagDetector";
import { SCENARIOS } from "@/data/heal";
import { Shield, Heart, Users, BookOpen } from "lucide-react";

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

function SafetyScore({ score = 92 }: { score?: number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl glass p-4">
      <div className="relative grid h-16 w-16 place-items-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" stroke="hsl(var(--muted))" strokeWidth="4" fill="none" />
          <circle
            cx="30" cy="30" r="26"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={163}
            strokeDashoffset={163 - (score / 100) * 163}
          />
        </svg>
        <span className="font-display text-lg font-bold">{score}</span>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Safety Score</div>
        <div className="text-sm font-medium">You&apos;re doing great!</div>
      </div>
    </div>
  );
}

export default function TeensDashboardPage() {
  const { nickname } = useHeal();
  
  return (
    <motion.section variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.header variants={fadeUp} className="glass relative overflow-hidden rounded-[2rem] p-6 shadow-soft">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
              💜 Keep going
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight md:text-4xl">
              Hey {nickname}! <br/>
              <span className="gradient-text">You&apos;ve got this.</span>
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Real talk about boundaries, consent, and staying safe — online and IRL.
            </p>
          </div>
          <SafetyScore />
        </div>
      </motion.header>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Shield, label: "Boundaries", color: "bg-primary/20 text-primary" },
          { icon: Heart, label: "Consent", color: "bg-secondary/20 text-secondary" },
          { icon: Users, label: "Safe Circle", color: "bg-accent/20 text-accent" },
          { icon: BookOpen, label: "Resources", color: "bg-muted text-muted-foreground" },
        ].map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`flex flex-col items-center gap-2 rounded-2xl p-4 ${item.color} transition-colors`}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-semibold">{item.label}</span>
          </motion.button>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-6 lg:grid-cols-2">
        <HealChat mascot="💜" />
        <ScenarioCard scenario={SCENARIOS.teens[0]} />
      </motion.div>

      <motion.div variants={fadeUp}><LessonsRow /></motion.div>
      <motion.div variants={fadeUp}><VideosRow /></motion.div>
      <motion.div variants={fadeUp}><SafeCircle /></motion.div>
      <motion.div variants={fadeUp}><RedFlagDetector /></motion.div>
    </motion.section>
  );
}
