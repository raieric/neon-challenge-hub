import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RapidFireChallengeProps {
  onDone: () => void;
}

const QUESTIONS = [
  "Question 1: Ready?",
  "Question 2: Ready?",
  "Question 3: Ready?",
];

const RapidFireChallenge = ({ onDone }: RapidFireChallengeProps) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);

  const nextQuestion = useCallback(() => {
    if (currentQ >= QUESTIONS.length - 1) {
      setComplete(true);
      return;
    }
    setCurrentQ((q) => q + 1);
    setTimeLeft(20);
  }, [currentQ]);

  useEffect(() => {
    if (!started || complete || timeLeft <= 0) {
      if (started && timeLeft <= 0) nextQuestion();
      return;
    }
    const t = setInterval(() => setTimeLeft((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [started, complete, timeLeft, nextQuestion]);

  const progress = timeLeft / 20;
  const isLow = timeLeft <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <div className="glass-panel px-6 sm:px-10 py-4 neon-glow-purple">
        <h3 className="font-display text-lg sm:text-2xl font-black text-foreground">
          🎯 Rapid-Fire Questions
        </h3>
      </div>

      {!started && !complete && (
        <motion.button
          onClick={() => setStarted(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 font-display text-base sm:text-lg font-black tracking-widest uppercase rounded-xl
            bg-gradient-to-r from-neon-purple to-neon-cyan text-primary-foreground border border-neon-purple/50
            hover:shadow-[0_0_30px_hsl(270_80%_60%/0.4)] transition-all"
        >
          ⚡ START RAPID FIRE
        </motion.button>
      )}

      {started && !complete && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Question counter */}
            <div className="flex gap-2">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentQ
                      ? "bg-neon-cyan scale-125 shadow-[0_0_10px_hsl(185,80%,50%)]"
                      : i < currentQ
                        ? "bg-neon-green"
                        : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Question card */}
            <div className="glass-panel px-8 sm:px-12 py-6 sm:py-8 neon-glow-cyan max-w-lg">
              <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-2">
                Question {currentQ + 1} of {QUESTIONS.length}
              </p>
              <h4 className="font-display text-xl sm:text-3xl font-black text-foreground">
                {QUESTIONS[currentQ]}
              </h4>
            </div>

            {/* Timer bar */}
            <div className="w-full max-w-md">
              <div className="w-full h-4 rounded-full bg-muted overflow-hidden border border-border">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: isLow
                      ? "hsl(0, 84%, 60%)"
                      : "linear-gradient(90deg, hsl(270, 80%, 60%), hsl(185, 80%, 50%))",
                    boxShadow: isLow ? "0 0 12px hsl(0, 84%, 60%)" : "0 0 12px hsl(270, 80%, 60%, 0.5)",
                  }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.8, ease: "linear" }}
                />
              </div>
              <span className={`font-display text-lg font-black tabular-nums mt-1 block ${isLow ? "text-destructive animate-pulse" : "text-neon-cyan"}`}>
                {timeLeft}s
              </span>
            </div>

            <button
              onClick={nextQuestion}
              className="px-6 py-2 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 transition-all"
            >
              {currentQ < QUESTIONS.length - 1 ? "NEXT →" : "FINISH"}
            </button>
          </motion.div>
        </AnimatePresence>
      )}

      {complete && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <span className="text-6xl">🏆</span>
          <h3 className="font-display text-2xl sm:text-4xl font-black text-neon-green">
            Challenge Complete!
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            All 3 questions answered!
          </p>
          <button
            onClick={onDone}
            className="mt-4 px-8 py-3 font-display text-sm font-bold tracking-widest uppercase rounded-xl border border-neon-green/50 text-neon-green hover:bg-neon-green/10 transition-all"
          >
            ✅ CONTINUE
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RapidFireChallenge;
