import { motion } from "framer-motion";
import { useStreakStorage } from "../hooks/useStreakStorage";

const FireSimulation = () => {
  const { data, showUp, skip, reset } = useStreakStorage("fire");
  const intensity = Math.min(data.steps, 10);
  const extinguished = data.collapsed;

  const flameScale = extinguished ? 0 : 0.3 + intensity * 0.15;
  const glowRadius = extinguished ? 0 : 5 + intensity * 4;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Fire visual */}
      <div className="relative w-48 h-64 flex items-end justify-center">
        {/* Base glow */}
        <motion.div
          className="absolute bottom-8 w-32 h-32 rounded-full"
          animate={{
            opacity: extinguished ? 0 : 0.3 + intensity * 0.05,
            scale: flameScale,
          }}
          style={{
            background: `radial-gradient(circle, hsl(30 100% 60% / 0.6), hsl(0 100% 50% / 0.3), transparent)`,
            filter: `blur(${glowRadius}px)`,
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Flame emoji stack */}
        <motion.div
          className="relative text-center"
          animate={{
            scale: flameScale,
            opacity: extinguished ? 0.15 : 1,
          }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <motion.span
            className="text-7xl block"
            animate={extinguished ? {} : { y: [0, -5, 0], rotate: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            🔥
          </motion.span>
          {intensity > 3 && !extinguished && (
            <motion.span
              className="text-4xl absolute -top-6 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7, y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              🔥
            </motion.span>
          )}
          {intensity > 7 && !extinguished && (
            <motion.span
              className="text-3xl absolute -top-10 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5, y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              🔥
            </motion.span>
          )}
        </motion.div>

        {/* Smoke when extinguished */}
        {extinguished && (
          <motion.span
            className="absolute bottom-16 text-4xl"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.6, 0], y: -40 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💨
          </motion.span>
        )}
      </div>

      {/* Message */}
      <motion.p
        key={String(extinguished) + data.steps}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-body text-sm text-muted-foreground italic text-center max-w-xs"
      >
        {extinguished
          ? "The flame has died. Discipline is fuel. Neglect is wind."
          : intensity === 0
          ? "A spark awaits. Show up to ignite it."
          : intensity < 4
          ? "A small flame flickers. Keep feeding it."
          : intensity < 8
          ? "The fire roars. Discipline is fuel."
          : "An inferno of resolve. Unstoppable."}
      </motion.p>

      <p className="font-display text-xs text-neon-cyan tracking-widest">
        STREAK: {data.streak} | INTENSITY: {intensity}/10
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={showUp} disabled={extinguished} className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          ✅ I Showed Up Today
        </button>
        <button onClick={skip} disabled={extinguished} className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          ❌ I Skipped Today
        </button>
        <button onClick={reset} className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-all">
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default FireSimulation;
