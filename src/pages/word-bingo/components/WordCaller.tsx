import { motion, AnimatePresence } from "framer-motion";

interface WordCallerProps {
  currentWord: string | null;
  calledWords: string[];
  totalWords: number;
}

const WordCaller = ({ currentWord, calledWords, totalWords }: WordCallerProps) => {
  return (
    <div className="text-center space-y-3">
      <p className="text-xs sm:text-sm text-muted-foreground font-body uppercase tracking-wider">
        Called: {calledWords.length} / {totalWords}
      </p>
      <div className="min-h-[72px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentWord ? (
            <motion.div
              key={currentWord}
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="px-6 py-3 rounded-xl bg-neon-purple/20 border border-neon-purple/40 shadow-[0_0_25px_hsl(270_80%_60%/0.3)]"
            >
              <span className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-foreground text-glow-purple">
                {currentWord}
              </span>
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground font-body text-lg"
            >
              Waiting to start...
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      {calledWords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center max-h-24 overflow-y-auto px-2">
          {calledWords.slice(0, -1).reverse().map((w, i) => (
            <span key={i} className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-body">
              {w}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default WordCaller;
