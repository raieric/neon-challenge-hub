import { motion } from "framer-motion";
import CircularTimer from "./CircularTimer";

interface DuelChallengeProps {
  onDone: () => void;
}

const DuelChallenge = ({ onDone }: DuelChallengeProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-col items-center gap-6 text-center"
  >
    <div className="glass-panel px-6 sm:px-10 py-4 neon-glow-pink">
      <h3 className="font-display text-lg sm:text-2xl font-black text-foreground">
        🎲 Student Duel
      </h3>
    </div>

    {/* Duel-style UI */}
    <div className="flex items-center gap-6 sm:gap-12">
      <motion.div
        className="glass-panel p-4 sm:p-6 flex flex-col items-center gap-2 neon-glow-cyan"
        animate={{ x: [0, -5, 5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="text-4xl sm:text-5xl">🧑‍💻</span>
        <span className="font-display text-xs sm:text-sm font-bold text-neon-cyan">YOU</span>
      </motion.div>

      <motion.span
        className="font-display text-3xl sm:text-5xl font-black text-neon-pink"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        ⚔️
      </motion.span>

      <motion.div
        className="glass-panel p-4 sm:p-6 flex flex-col items-center gap-2 neon-glow-pink"
        animate={{ x: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="text-4xl sm:text-5xl">🎯</span>
        <span className="font-display text-xs sm:text-sm font-bold text-neon-pink">CHALLENGER</span>
      </motion.div>
    </div>

    <p className="font-display text-base sm:text-lg font-bold text-foreground tracking-wider">
      Choose your challenger.
    </p>

    <button
      className="px-6 py-3 font-display text-sm font-bold tracking-widest uppercase rounded-xl border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 transition-all"
    >
      🎲 RANDOMLY PICK
    </button>

    <CircularTimer seconds={60} color="hsl(320, 80%, 58%)" onComplete={onDone} />

    <button
      onClick={onDone}
      className="mt-2 px-8 py-3 font-display text-sm font-bold tracking-widest uppercase rounded-xl border border-neon-green/50 text-neon-green hover:bg-neon-green/10 transition-all"
    >
      ✅ COMPLETE
    </button>
  </motion.div>
);

export default DuelChallenge;
