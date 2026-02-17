import { motion } from "framer-motion";
import CircularTimer from "./CircularTimer";

interface PartnerChallengeProps {
  onDone: () => void;
}

const PartnerChallenge = ({ onDone }: PartnerChallengeProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-col items-center gap-6 text-center"
  >
    <div className="glass-panel px-6 sm:px-10 py-4 neon-glow-cyan">
      <h3 className="font-display text-lg sm:text-2xl font-black text-foreground">
        🤝 Partner Explanation
      </h3>
    </div>

    <p className="font-display text-base sm:text-xl font-bold text-neon-cyan animate-pulse tracking-wider">
      Select your partner now.
    </p>

    <CircularTimer seconds={60} color="hsl(185, 80%, 50%)" onComplete={onDone} />

    <button
      onClick={onDone}
      className="mt-4 px-8 py-3 font-display text-sm font-bold tracking-widest uppercase rounded-xl border border-neon-green/50 text-neon-green hover:bg-neon-green/10 transition-all"
    >
      ✅ COMPLETE
    </button>
  </motion.div>
);

export default PartnerChallenge;
