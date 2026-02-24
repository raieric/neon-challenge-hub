import { motion, AnimatePresence } from "framer-motion";
import { useStreakStorage } from "../hooks/useStreakStorage";

const MAX_BRICKS = 15;
const BRICK_COLORS = [
  "hsl(var(--neon-purple))",
  "hsl(var(--neon-cyan))",
  "hsl(var(--neon-blue))",
  "hsl(var(--neon-pink))",
];

const WallSimulation = () => {
  const { data, showUp, skip, reset } = useStreakStorage("wall");
  const bricks = Math.min(data.steps, MAX_BRICKS);
  const rows = Math.ceil(bricks / 3);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Wall visual */}
      <div className="relative w-60 h-72 flex flex-col-reverse items-center">
        <AnimatePresence>
          {Array.from({ length: bricks }).map((_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const offset = row % 2 === 1 ? 10 : 0;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{
                  scale: data.collapsed ? [1, 0.8, 0] : 1,
                  opacity: data.collapsed ? [1, 0.5, 0] : 1,
                  y: data.collapsed ? 100 : 0,
                  rotate: data.collapsed ? Math.random() * 30 - 15 : 0,
                }}
                exit={{ scale: 0, opacity: 0, y: 20 }}
                transition={{ duration: data.collapsed ? 0.6 : 0.3, delay: data.collapsed ? i * 0.05 : i * 0.03 }}
                className="absolute rounded-sm"
                style={{
                  width: 56,
                  height: 20,
                  left: `calc(50% - 90px + ${col * 62 + offset}px)`,
                  bottom: row * 24,
                  background: BRICK_COLORS[i % BRICK_COLORS.length],
                  opacity: 0.85,
                  boxShadow: `0 0 8px ${BRICK_COLORS[i % BRICK_COLORS.length].replace(")", " / 0.4)")}`,
                }}
              />
            );
          })}
        </AnimatePresence>

        {bricks === 0 && !data.collapsed && (
          <p className="font-body text-muted-foreground/50 text-sm">Empty foundation. Start building.</p>
        )}
      </div>

      <motion.p
        key={String(data.collapsed) + data.steps}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-body text-sm text-muted-foreground italic text-center max-w-xs"
      >
        {data.collapsed
          ? "💥 Wall collapsed. You don't see growth daily. You feel collapse instantly."
          : bricks === 0
          ? "Lay your first brick."
          : bricks < 6
          ? "Foundation forming. Keep stacking."
          : bricks < 12
          ? "Structure rising. Consistency is concrete."
          : "Fortress of habit. Nearly complete."}
      </motion.p>

      <p className="font-display text-xs text-neon-cyan tracking-widest">
        STREAK: {data.streak} | BRICKS: {bricks}/{MAX_BRICKS}
      </p>

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

export default WallSimulation;
