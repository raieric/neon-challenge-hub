import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/Confetti";

interface ResultModalProps {
  timeElapsed: number;
  wordsCalledCount: number;
  mistakes: number;
  onRestart: () => void;
  onChangeCategory: () => void;
}

const ResultModal = ({ timeElapsed, wordsCalledCount, mistakes, onRestart, onChangeCategory }: ResultModalProps) => {
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <>
      <Confetti />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="glass-panel p-8 sm:p-10 max-w-md w-full text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-6xl sm:text-7xl"
          >
            🎉
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground text-glow-purple">
            BINGO!
          </h2>
          <div className="space-y-2 text-muted-foreground font-body text-sm">
            <p>⏱ Time: <span className="text-foreground font-semibold">{formatTime(timeElapsed)}</span></p>
            <p>📢 Words Called: <span className="text-foreground font-semibold">{wordsCalledCount}</span></p>
            <p>❌ Mistakes: <span className="text-foreground font-semibold">{mistakes}</span></p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onRestart} className="font-display tracking-wider">
              🔄 Restart Game
            </Button>
            <Button variant="outline" onClick={onChangeCategory} className="font-display tracking-wider">
              📚 Change Category
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default ResultModal;
