import { motion, AnimatePresence } from "framer-motion";

interface NumberCallerProps {
  currentNumber: number | null;
  calledNumbers: number[];
  totalNumbers: number;
}

const NumberCaller = ({ currentNumber, calledNumbers, totalNumbers }: NumberCallerProps) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Main called number ball */}
      <div className="flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentNumber !== null ? (
            <motion.div
              key={currentNumber}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-neon-purple via-neon-pink to-neon-cyan
                flex items-center justify-center shadow-[0_0_40px_hsl(270_80%_60%/0.4)]"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-background/90 flex items-center justify-center">
                <span className="font-display text-3xl sm:text-4xl font-black text-foreground">
                  {currentNumber}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed border-muted-foreground/30
                flex items-center justify-center"
            >
              <span className="text-muted-foreground/50 font-body text-sm">Ready</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Called numbers history chips */}
      {calledNumbers.length > 0 && (
        <div className="glass-panel p-3 max-h-24 overflow-y-auto">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {calledNumbers.map((n, i) => (
              <motion.span
                key={`${n}-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold
                  ${i === calledNumbers.length - 1
                    ? "bg-neon-purple/30 text-neon-purple border border-neon-purple/50"
                    : "bg-muted/50 text-muted-foreground border border-border/30"
                  }`}
              >
                {n}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="w-full bg-muted/30 rounded-full h-1.5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan"
          initial={{ width: 0 }}
          animate={{ width: `${(calledNumbers.length / totalNumbers) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default NumberCaller;
