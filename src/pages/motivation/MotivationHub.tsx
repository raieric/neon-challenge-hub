import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import LadderSimulation from "./simulations/LadderSimulation";
import FireSimulation from "./simulations/FireSimulation";
import WallSimulation from "./simulations/WallSimulation";
import TreeSimulation from "./simulations/TreeSimulation";

const TABS = [
  { id: "ladder", label: "🪜 Ladder", component: LadderSimulation },
  { id: "fire", label: "🔥 Fire", component: FireSimulation },
  { id: "wall", label: "🧱 Wall", component: WallSimulation },
  { id: "tree", label: "🌱 Tree", component: TreeSimulation },
  { id: "future", label: "🚀 Future", component: null },
] as const;

const MotivationHub = () => {
  const [activeTab, setActiveTab] = useState("ladder");
  const active = TABS.find((t) => t.id === activeTab)!;
  const ActiveComponent = active.component;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-cyan/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-12 sm:py-20">
        {/* Back button */}
        <Link
          to="/"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 font-display text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </Link>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-3 text-glow-purple">
            ⚡ Motivation Lab
          </h1>
          <p className="font-body text-base sm:text-lg text-muted-foreground">
            Small actions. Massive consequences. Pick a metaphor and build your streak.
          </p>
          <div className="mt-6 mx-auto w-48 h-[2px] bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-60" />
        </div>

        {/* Tab selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-display text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 border ${
                activeTab === tab.id
                  ? "bg-neon-purple/20 text-neon-purple border-neon-purple/40 shadow-[0_0_15px_hsl(270_80%_60%/0.3)]"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Simulation panel */}
        <div className="w-full max-w-lg glass-panel p-6 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {ActiveComponent ? (
                <ActiveComponent />
              ) : (
                <div className="text-center py-16">
                  <p className="text-4xl mb-4">🚀</p>
                  <p className="font-display text-lg text-muted-foreground">Coming Soon</p>
                  <p className="font-body text-sm text-muted-foreground/60 mt-2">
                    More motivational metaphors are on the way.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MotivationHub;
