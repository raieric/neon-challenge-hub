import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreakStorage } from "../hooks/useStreakStorage";
import Confetti from "@/components/Confetti";

const playSound = (type: "success" | "warning") => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === "success") {
      osc.frequency.value = 523;
      gain.gain.value = 0.15;
      osc.start();
      setTimeout(() => { osc.frequency.value = 659; }, 150);
      setTimeout(() => { osc.frequency.value = 784; }, 300);
      setTimeout(() => { osc.stop(); ctx.close(); }, 600);
    } else {
      osc.type = "sawtooth";
      osc.frequency.value = 220;
      gain.gain.value = 0.12;
      osc.start();
      setTimeout(() => { osc.frequency.value = 180; }, 200);
      setTimeout(() => { osc.stop(); ctx.close(); }, 400);
    }
  } catch {}
};

const FRUIT_EMOJIS = ["🍎", "🍊", "🍋", "🍇", "🍑", "🍒"];

const TreeSimulation = () => {
  const { data, showUp, skip, reset } = useStreakStorage("tree");
  const growth = Math.min(data.steps, 10);
  const isDead = data.collapsed;
  const skipCount = data.history.filter((h) => h === "skip").length;
  const isDying = !isDead && skipCount >= 3 && growth < 4;

  const trunkHeight = isDead ? 30 : 20 + growth * 14;
  const trunkWidth = isDead ? 8 : 10 + growth * 1.5;
  const canopySize = isDead ? 0 : 20 + growth * 12;
  const hasFruits = growth >= 7 && !isDead;
  const isFullGrown = growth >= 10 && !isDead;

  const [showConfetti, setShowConfetti] = useState(false);
  const prevFullRef = useRef(false);

  useEffect(() => {
    if (isFullGrown && !prevFullRef.current) {
      playSound("success");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
    if (isDead && !prevFullRef.current) {
      playSound("warning");
    }
    prevFullRef.current = isFullGrown;
  }, [isFullGrown, isDead]);

  // Generate fruit positions around the canopy
  const fruits = hasFruits
    ? Array.from({ length: Math.min((growth - 6) * 3, 12) }, (_, i) => {
        const angle = (i / Math.min((growth - 6) * 3, 12)) * Math.PI * 2;
        const radius = canopySize * 0.3;
        return {
          id: i,
          emoji: FRUIT_EMOJIS[i % FRUIT_EMOJIS.length],
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius * 0.6,
        };
      })
    : [];

  // Branch positions
  const branches = growth >= 3 && !isDead
    ? Array.from({ length: Math.min(growth - 2, 5) }, (_, i) => ({
        id: i,
        side: i % 2 === 0 ? -1 : 1,
        y: trunkHeight * (0.4 + i * 0.12),
        length: 15 + (growth - 3) * 3,
        angle: (i % 2 === 0 ? -35 : 35),
      }))
    : [];

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <Confetti />}

      {/* Tree visual */}
      <div className="relative w-56 h-80 flex items-end justify-center">
        {/* Sky glow behind tree when full */}
        {isFullGrown && (
          <motion.div
            className="absolute rounded-full"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              width: canopySize + 60,
              height: canopySize + 60,
              bottom: trunkHeight - 10,
              left: "50%",
              transform: "translateX(-50%)",
              background: "radial-gradient(circle, hsl(var(--neon-green) / 0.15), transparent)",
            }}
          />
        )}

        {/* Ground */}
        <div
          className="absolute bottom-0 w-full h-6 rounded-full"
          style={{
            background: isDead
              ? "linear-gradient(to top, hsl(30 15% 15%), transparent)"
              : "linear-gradient(to top, hsl(120 30% 15%), transparent)",
          }}
        />
        {/* Grass blades */}
        {!isDead &&
          Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={`grass-${i}`}
              className="absolute bottom-2 rounded-t-full"
              style={{
                width: 2,
                height: 8 + Math.random() * 6,
                left: `${15 + i * 10}%`,
                background: "hsl(var(--neon-green) / 0.4)",
                transformOrigin: "bottom",
              }}
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
            />
          ))}

        {/* Roots */}
        {growth >= 2 && !isDead && (
          <>
            {[-1, 1].map((dir) => (
              <motion.div
                key={`root-${dir}`}
                className="absolute bottom-3 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{
                  width: 8 + growth * 2,
                  height: 3,
                  left: `calc(50% + ${dir * 4}px)`,
                  transformOrigin: dir === -1 ? "right" : "left",
                  background: isDying ? "hsl(30 20% 25%)" : "hsl(30 35% 30%)",
                  rotate: dir * 15,
                }}
              />
            ))}
          </>
        )}

        {/* Trunk */}
        <motion.div
          className="absolute bottom-4 rounded-t-md"
          animate={{
            height: trunkHeight,
            width: trunkWidth,
          }}
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            background: isDead
              ? "linear-gradient(to top, hsl(30 10% 15%), hsl(30 10% 20%))"
              : isDying
              ? "linear-gradient(to top, hsl(30 25% 22%), hsl(30 20% 28%))"
              : "linear-gradient(to top, hsl(25 40% 25%), hsl(30 45% 35%))",
            borderRadius: "4px 4px 2px 2px",
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Bark texture */}
          {!isDead && growth >= 4 && (
            <>
              {[0.3, 0.5, 0.7].map((pos) => (
                <div
                  key={pos}
                  className="absolute w-full"
                  style={{
                    top: `${pos * 100}%`,
                    height: 1,
                    background: "hsl(30 30% 20% / 0.5)",
                  }}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* Branches */}
        {branches.map((b) => (
          <motion.div
            key={`branch-${b.id}`}
            className="absolute"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{
              width: b.length,
              height: 3 + growth * 0.3,
              bottom: b.y + 4,
              left: "50%",
              transformOrigin: b.side === -1 ? "right center" : "left center",
              transform: `translateX(${b.side === -1 ? `-${b.length}px` : "0"}) rotate(${b.angle}deg)`,
              background: isDying ? "hsl(30 20% 25%)" : "hsl(30 40% 30%)",
              borderRadius: 2,
            }}
          />
        ))}

        {/* Canopy layers */}
        {!isDead && growth > 0 && (
          <>
            {/* Main canopy */}
            <motion.div
              className="absolute"
              animate={{
                width: canopySize,
                height: canopySize * 0.85,
                bottom: trunkHeight + 4,
                opacity: isDying ? 0.5 : 1,
              }}
              style={{
                left: "50%",
                transform: "translateX(-50%)",
                borderRadius: "50% 50% 45% 45%",
                background: isDying
                  ? "radial-gradient(ellipse, hsl(60 30% 30%), hsl(40 20% 20%))"
                  : `radial-gradient(ellipse at 40% 30%, hsl(120 50% 35%), hsl(140 45% 25%))`,
                boxShadow: isDying
                  ? "none"
                  : `inset -8px -8px 20px hsl(140 40% 15% / 0.5), 0 0 ${growth * 3}px hsl(var(--neon-green) / 0.2)`,
              }}
              transition={{ duration: 0.5 }}
            />
            {/* Highlight layer */}
            {growth >= 4 && !isDying && (
              <motion.div
                className="absolute"
                animate={{
                  width: canopySize * 0.6,
                  height: canopySize * 0.45,
                  bottom: trunkHeight + canopySize * 0.35,
                }}
                style={{
                  left: "46%",
                  transform: "translateX(-50%)",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, hsl(110 55% 42% / 0.6), transparent)",
                }}
              />
            )}

            {/* Fruits */}
            <AnimatePresence>
              {fruits.map((f) => (
                <motion.span
                  key={`fruit-${f.id}`}
                  className="absolute text-sm select-none"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0, y: 40 }}
                  transition={{ delay: f.id * 0.1, type: "spring" }}
                  style={{
                    bottom: trunkHeight + canopySize * 0.4 + f.y,
                    left: `calc(50% + ${f.x}px)`,
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                  }}
                >
                  {f.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </>
        )}

        {/* Dead tree - bare branches */}
        {isDead && (
          <>
            {[
              { x: -12, y: 20, r: -40, l: 18 },
              { x: 8, y: 25, r: 30, l: 15 },
              { x: -6, y: 15, r: -25, l: 12 },
              { x: 10, y: 18, r: 50, l: 10 },
            ].map((branch, i) => (
              <motion.div
                key={`dead-branch-${i}`}
                className="absolute"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                style={{
                  width: branch.l,
                  height: 2,
                  bottom: branch.y + 4,
                  left: `calc(50% + ${branch.x}px)`,
                  background: "hsl(30 10% 20%)",
                  transform: `rotate(${branch.r}deg)`,
                  borderRadius: 1,
                }}
              />
            ))}
            {/* Falling leaves */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={`leaf-${i}`}
                className="absolute text-base"
                initial={{ opacity: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, 80 + i * 15],
                  x: [0, (i % 2 === 0 ? 1 : -1) * 25],
                  rotate: [0, 360],
                }}
                transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity, repeatDelay: 2 }}
                style={{ bottom: trunkHeight, left: `calc(50% + ${(i - 2) * 12}px)` }}
              >
                🍂
              </motion.span>
            ))}
          </>
        )}
      </div>

      {/* Warning for dying tree */}
      {isDead && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/30"
        >
          <span className="text-lg">⚠️</span>
          <span className="font-display text-xs text-destructive tracking-wide">TREE HAS DIED — RESET TO REPLANT</span>
        </motion.div>
      )}

      <motion.p
        key={String(isDead) + data.steps}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-body text-sm text-muted-foreground italic text-center max-w-xs"
      >
        {isDead
          ? "💀 The tree has withered and died. Growth requires daily water."
          : isDying
          ? "⚠️ Your tree is struggling. Show up before it's too late."
          : growth === 0
          ? "Plant a seed. Show up."
          : growth < 4
          ? "🌱 A sapling emerges. Nurture it."
          : growth < 7
          ? "🌿 Branches reaching skyward. Keep growing."
          : growth < 10
          ? "🍎 Fruits are appearing! Consistency pays off."
          : "🌳 A magnificent tree stands tall, bearing fruit. Rooted in habit."}
      </motion.p>

      <p className="font-display text-xs text-neon-cyan tracking-widest">
        STREAK: {data.streak} | GROWTH: {growth}/10
        {hasFruits && ` | FRUITS: ${fruits.length}`}
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
