import { motion } from "framer-motion";
import { useStreakStorage } from "../hooks/useStreakStorage";

const TreeSimulation = () => {
  const { data, showUp, skip, reset } = useStreakStorage("tree");
  const growth = Math.min(data.steps, 10);
  const isDead = data.collapsed;

  const trunkHeight = 20 + growth * 12;
  const canopySize = isDead ? 0 : 20 + growth * 10;
  const leafCount = isDead ? 0 : Math.min(growth * 3, 20);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Tree visual */}
      <div className="relative w-48 h-72 flex items-end justify-center">
        {/* Ground */}
        <div className="absolute bottom-0 w-full h-4 rounded-full bg-neon-green/10" />

        {/* Trunk */}
        <motion.div
          className="absolute bottom-4 rounded-t-sm"
          animate={{
            height: trunkHeight,
            backgroundColor: isDead ? "hsl(30 20% 25%)" : "hsl(30 40% 35%)",
          }}
          style={{ width: 12 + growth, left: "50%", transform: "translateX(-50%)" }}
          transition={{ duration: 0.5 }}
        />

        {/* Canopy */}
        {!isDead && growth > 0 && (
          <motion.div
            className="absolute rounded-full"
            animate={{
              width: canopySize,
              height: canopySize,
              bottom: trunkHeight + 4,
              opacity: growth > 0 ? 1 : 0,
            }}
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              background: `radial-gradient(circle, hsl(var(--neon-green) / 0.7), hsl(var(--neon-green) / 0.3))`,
              boxShadow: `0 0 ${growth * 3}px hsl(var(--neon-green) / 0.3)`,
            }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Falling leaves when skipping */}
        {isDead && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                className="absolute text-lg"
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, 80 + i * 20],
                  x: [0, (i % 2 === 0 ? 1 : -1) * 20],
                  rotate: [0, 360],
                }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatDelay: 3 }}
                style={{ bottom: trunkHeight + 20, left: `calc(50% + ${(i - 2) * 15}px)` }}
              >
                🍂
              </motion.span>
            ))}
          </>
        )}

        {/* Dead tree indicator */}
        {isDead && (
          <motion.div
            className="absolute bottom-4 rounded-t-sm"
            animate={{ height: 30 }}
            style={{
              width: 10,
              left: "50%",
              transform: "translateX(-50%)",
              background: "hsl(30 10% 20%)",
            }}
          />
        )}
      </div>

      <motion.p
        key={String(isDead) + data.steps}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-body text-sm text-muted-foreground italic text-center max-w-xs"
      >
        {isDead
          ? "🥀 The tree has withered. Growth requires daily water."
          : growth === 0
          ? "Plant a seed. Show up."
          : growth < 4
          ? "A sapling emerges. Nurture it."
          : growth < 7
          ? "Branches reaching skyward. Keep growing."
          : "A mighty tree stands. Rooted in habit."}
      </motion.p>

      <p className="font-display text-xs text-neon-cyan tracking-widest">
        STREAK: {data.streak} | GROWTH: {growth}/10
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={showUp} disabled={isDead} className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          ✅ I Showed Up Today
        </button>
        <button onClick={skip} disabled={isDead} className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          ❌ I Skipped Today
        </button>
        <button onClick={reset} className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-all">
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default TreeSimulation;
