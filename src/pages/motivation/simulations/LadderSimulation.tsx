import { motion, AnimatePresence } from "framer-motion";
import { useStreakStorage } from "../hooks/useStreakStorage";

const MESSAGES_UP = ["XP gained.", "Progress compiled.", "Build > Excuses.", "Momentum++", "Stack overflow of wins."];
const MESSAGES_SKIP = ["Warning: momentum decreasing.", "Entropy wins today.", "Runtime error: effort not found.", "Segfault in discipline."];

const MAX_RUNGS = 12;

const LadderSimulation = () => {
  const { data, showUp, skip, reset } = useStreakStorage("ladder");
  const rungs = Math.min(data.steps, MAX_RUNGS);
  const lastAction = data.history[data.history.length - 1];
  const msg = lastAction === "up"
    ? MESSAGES_UP[data.steps % MESSAGES_UP.length]
    : lastAction === "skip"
    ? MESSAGES_SKIP[Math.abs(data.steps) % MESSAGES_SKIP.length]
    : "Start climbing.";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Ladder visual */}
      <div className="relative w-40 h-80 flex flex-col-reverse items-center justify-start gap-0">
        {/* SUCCESS label at top */}
        <motion.div
          className="absolute -top-8 font-display text-sm font-bold tracking-widest"
          animate={{ opacity: rungs >= MAX_RUNGS ? 1 : 0.3, scale: rungs >= MAX_RUNGS ? 1.2 : 1 }}
          style={{ textShadow: rungs >= MAX_RUNGS ? "0 0 20px hsl(150 80% 50% / 0.8)" : "none", color: "hsl(var(--neon-green))" }}
        >
          ✦ SUCCESS ✦
        </motion.div>

        {/* Side rails */}
        <div className="absolute left-4 top-0 bottom-0 w-1 rounded-full bg-muted-foreground/20" />
        <div className="absolute right-4 top-0 bottom-0 w-1 rounded-full bg-muted-foreground/20" />

        {/* Rungs */}
        <AnimatePresence>
          {Array.from({ length: rungs }).map((_, i) => {
            const cracked = data.collapsed && Math.random() > 0.5;
            return (
              <motion.div
                key={i}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: cracked ? 0.6 : 1,
                  opacity: cracked ? 0.4 : 1,
                  x: data.collapsed ? [0, -3, 3, -2, 0] : 0,
                }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="w-28 h-3 rounded-sm"
                style={{
                  background: `linear-gradient(90deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)))`,
                  boxShadow: `0 0 ${8 + i * 2}px hsl(var(--neon-purple) / ${0.2 + i * 0.05})`,
                }}
              />
            );
          })}
        </AnimatePresence>

        {/* Climber */}
        {rungs > 0 && !data.collapsed && (
          <motion.div
            className="absolute text-2xl"
            animate={{ bottom: `${(rungs / MAX_RUNGS) * 85}%` }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            🧗
          </motion.div>
        )}
      </div>

      {/* Message */}
      <motion.p
        key={msg}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-body text-sm text-muted-foreground italic text-center"
      >
        {data.collapsed ? "💥 Ladder collapsed. Reset and rebuild." : msg}
      </motion.p>

      {/* Streak */}
      <p className="font-display text-xs text-neon-cyan tracking-widest">
        STREAK: {data.streak} | STEPS: {data.steps}
      </p>

      {/* Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={showUp} disabled={data.collapsed} className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          ✅ I Showed Up Today
        </button>
        <button onClick={skip} disabled={data.collapsed} className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          ❌ I Skipped Today
        </button>
        <button onClick={reset} className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-all">
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default LadderSimulation;
