import { useState } from "react";
import { motion } from "framer-motion";
import CircularTimer from "./CircularTimer";

interface QuestionChallengeProps {
  onDone: () => void;
}

const QuestionChallenge = ({ onDone }: QuestionChallengeProps) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <div className="glass-panel px-6 sm:px-10 py-4 neon-glow-purple">
        <h3 className="font-display text-lg sm:text-2xl font-black text-foreground">
          👀 One Question Challenge
        </h3>
      </div>

      <p className="font-body text-sm sm:text-base text-muted-foreground">
        Pick someone to ask you one question. Answer honestly!
      </p>

      {!revealed ? (
        <motion.button
          onClick={() => setRevealed(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 font-display text-base sm:text-lg font-black tracking-widest uppercase rounded-xl
            bg-gradient-to-r from-neon-purple to-neon-pink text-primary-foreground border border-neon-purple/50
            hover:shadow-[0_0_30px_hsl(270_80%_60%/0.4)] transition-all"
        >
          🎤 REVEAL QUESTION
        </motion.button>
      ) : (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <CircularTimer seconds={30} color="hsl(270, 80%, 60%)" onComplete={onDone} />
        </motion.div>
      )}

      <button
        onClick={onDone}
        className="mt-4 px-8 py-3 font-display text-sm font-bold tracking-widest uppercase rounded-xl border border-neon-green/50 text-neon-green hover:bg-neon-green/10 transition-all"
      >
        ✅ DONE
      </button>
    </motion.div>
  );
};

export default QuestionChallenge;
