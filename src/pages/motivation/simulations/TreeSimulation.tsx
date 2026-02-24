import { useState, useRef, useEffect, useMemo } from "react";
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

// Seeded random for consistent positions
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const TreeSimulation = () => {
  const { data, showUp, skip, reset } = useStreakStorage("tree");
  const growth = Math.min(data.steps, 10);
  const isDead = data.collapsed;
  const skipCount = data.history.filter((h) => h === "skip").length;
  const isDying = !isDead && skipCount >= 3 && growth < 4;

  const hasFruits = growth >= 7 && !isDead;
  const isFullGrown = growth >= 10 && !isDead;

  const [showConfetti, setShowConfetti] = useState(false);
  const prevFullRef = useRef(false);
  const prevDeadRef = useRef(false);

  useEffect(() => {
    if (isFullGrown && !prevFullRef.current) {
      playSound("success");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
    prevFullRef.current = isFullGrown;
  }, [isFullGrown]);

  useEffect(() => {
    if (isDead && !prevDeadRef.current) {
      playSound("warning");
    }
    prevDeadRef.current = isDead;
  }, [isDead]);

  // SVG dimensions
  const W = 240;
  const H = 320;
  const groundY = H - 20;

  // Tree proportions based on growth
  const trunkH = 30 + growth * 14;
  const trunkBottomW = 6 + growth * 1.2;
  const trunkTopW = 3 + growth * 0.5;
  const cx = W / 2;
  const trunkBase = groundY;
  const trunkTop = groundY - trunkH;

  // Canopy clusters — multiple overlapping ellipses for realistic look
  const canopyClusters = useMemo(() => {
    if (isDead || growth === 0) return [];
    const count = Math.min(3 + growth, 9);
    const baseRadius = 12 + growth * 5;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const spread = baseRadius * 0.5;
      const rx = baseRadius * (0.6 + seededRandom(i * 3) * 0.5);
      const ry = baseRadius * (0.5 + seededRandom(i * 7) * 0.4);
      return {
        id: i,
        cx: cx + Math.cos(angle) * spread * (i === 0 ? 0 : 1),
        cy: trunkTop - baseRadius * 0.2 + Math.sin(angle) * spread * 0.6,
        rx,
        ry,
      };
    });
  }, [growth, isDead, trunkTop, cx]);

  // Branches
  const branchPaths = useMemo(() => {
    if (growth < 2 || isDead) return [];
    const count = Math.min(growth - 1, 6);
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const startY = trunkBase - trunkH * (0.35 + i * 0.1);
      const len = 12 + growth * 3 + seededRandom(i * 11) * 10;
      const curve = 15 + seededRandom(i * 17) * 10;
      const endX = cx + side * len;
      const endY = startY - curve;
      const cpX = cx + side * len * 0.6;
      const cpY = startY - curve * 0.3;
      return {
        id: i,
        d: `M ${cx} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`,
        thickness: 2 + (growth - i) * 0.3,
      };
    });
  }, [growth, isDead, trunkH, trunkBase, cx]);

  // Fruit positions on canopy
  const fruits = useMemo(() => {
    if (!hasFruits || canopyClusters.length === 0) return [];
    const count = Math.min((growth - 6) * 3, 12);
    return Array.from({ length: count }, (_, i) => {
      const cluster = canopyClusters[i % canopyClusters.length];
      const angle = seededRandom(i * 13 + 5) * Math.PI * 2;
      const dist = 0.5 + seededRandom(i * 19) * 0.4;
      return {
        id: i,
        emoji: FRUIT_EMOJIS[i % FRUIT_EMOJIS.length],
        x: cluster.cx + Math.cos(angle) * cluster.rx * dist,
        y: cluster.cy + Math.sin(angle) * cluster.ry * dist,
      };
    });
  }, [hasFruits, growth, canopyClusters]);

  // Root paths
  const roots = useMemo(() => {
    if (growth < 2 || isDead) return [];
    return [-1, 0, 1].map((dir, i) => {
      const endX = cx + dir * (10 + growth * 3);
      const endY = groundY + 6 + seededRandom(i * 23) * 8;
      return {
        id: i,
        d: `M ${cx} ${groundY - 2} Q ${cx + dir * 5} ${groundY + 3} ${endX} ${endY}`,
      };
    });
  }, [growth, isDead, cx, groundY]);

  // Dead branches
  const deadBranches = useMemo(() => {
    if (!isDead) return [];
    return [
      { d: `M ${cx} ${trunkTop + 5} Q ${cx - 20} ${trunkTop - 5} ${cx - 30} ${trunkTop + 2}` },
      { d: `M ${cx} ${trunkTop + 10} Q ${cx + 18} ${trunkTop} ${cx + 28} ${trunkTop + 8}` },
      { d: `M ${cx} ${trunkTop + 2} Q ${cx - 8} ${trunkTop - 15} ${cx - 5} ${trunkTop - 22}` },
      { d: `M ${cx} ${trunkTop + 8} Q ${cx + 12} ${trunkTop - 8} ${cx + 18} ${trunkTop - 15}` },
    ];
  }, [isDead, cx, trunkTop]);

  const healthyGreen1 = "hsl(120, 45%, 32%)";
  const healthyGreen2 = "hsl(135, 50%, 28%)";
  const healthyGreen3 = "hsl(110, 55%, 38%)";
  const dyingYellow = "hsl(50, 40%, 35%)";
  const dyingBrown = "hsl(35, 30%, 25%)";

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <Confetti />}

      {/* SVG Tree */}
      <motion.svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <defs>
          <radialGradient id="canopyGrad" cx="40%" cy="30%">
            <stop offset="0%" stopColor={isDying ? dyingYellow : healthyGreen3} />
            <stop offset="60%" stopColor={isDying ? dyingBrown : healthyGreen1} />
            <stop offset="100%" stopColor={isDying ? dyingBrown : healthyGreen2} />
          </radialGradient>
          <linearGradient id="trunkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDead ? "hsl(30, 10%, 20%)" : isDying ? "hsl(30, 20%, 26%)" : "hsl(30, 45%, 32%)"} />
            <stop offset="100%" stopColor={isDead ? "hsl(30, 8%, 14%)" : isDying ? "hsl(30, 15%, 18%)" : "hsl(25, 40%, 22%)"} />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDead ? "hsl(30, 15%, 18%)" : "hsl(100, 30%, 18%)"} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          {isFullGrown && (
            <radialGradient id="glowGrad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="hsl(120, 60%, 50%)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          )}
          <filter id="canopyShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.3)" />
          </filter>
        </defs>

        {/* Ground */}
        <ellipse cx={cx} cy={groundY + 2} rx={100} ry={10} fill="url(#groundGrad)" />

        {/* Glow behind full tree */}
        {isFullGrown && (
          <motion.circle
            cx={cx}
            cy={trunkTop - 20}
            r={80}
            fill="url(#glowGrad)"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}

        {/* Roots */}
        {roots.map((r) => (
          <motion.path
            key={`root-${r.id}`}
            d={r.d}
            stroke={isDying ? "hsl(30, 15%, 22%)" : "hsl(30, 35%, 28%)"}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
          />
        ))}

        {/* Trunk — tapered shape using path */}
        <motion.path
          d={`M ${cx - trunkBottomW} ${trunkBase}
              L ${cx - trunkTopW} ${trunkTop}
              Q ${cx} ${trunkTop - 4} ${cx + trunkTopW} ${trunkTop}
              L ${cx + trunkBottomW} ${trunkBase} Z`}
          fill="url(#trunkGrad)"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          style={{ transformOrigin: `${cx}px ${trunkBase}px` }}
          transition={{ duration: 0.6 }}
        />

        {/* Bark texture lines */}
        {!isDead && growth >= 3 && [0.25, 0.45, 0.65, 0.8].map((t) => {
          const y = trunkBase - trunkH * t;
          const w = trunkBottomW - (trunkBottomW - trunkTopW) * t;
          return (
            <line
              key={`bark-${t}`}
              x1={cx - w * 0.7}
              y1={y}
              x2={cx + w * 0.5}
              y2={y + 1}
              stroke="hsl(30, 25%, 18%)"
              strokeWidth={0.8}
              opacity={0.4}
            />
          );
        })}

        {/* Branches */}
        {branchPaths.map((b) => (
          <motion.path
            key={`branch-${b.id}`}
            d={b.d}
            stroke={isDying ? "hsl(30, 20%, 24%)" : "hsl(30, 40%, 28%)"}
            strokeWidth={b.thickness}
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: b.id * 0.1 }}
          />
        ))}

        {/* Canopy clusters */}
        {canopyClusters.map((c, i) => (
          <motion.ellipse
            key={`canopy-${c.id}`}
            cx={c.cx}
            cy={c.cy}
            initial={{ rx: 0, ry: 0, opacity: 0 }}
            animate={{
              rx: c.rx,
              ry: c.ry,
              opacity: isDying ? 0.5 : 0.85,
            }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            fill="url(#canopyGrad)"
            filter={i === 0 ? "url(#canopyShadow)" : undefined}
          />
        ))}

        {/* Leaf detail bumps on canopy edge */}
        {!isDead && !isDying && growth >= 5 && canopyClusters.slice(1).map((c, i) => {
          const bumpAngle = seededRandom(i * 31) * Math.PI * 2;
          return (
            <motion.circle
              key={`bump-${i}`}
              cx={c.cx + Math.cos(bumpAngle) * c.rx * 0.9}
              cy={c.cy + Math.sin(bumpAngle) * c.ry * 0.9}
              r={4 + growth * 0.5}
              fill={healthyGreen3}
              opacity={0.6}
              initial={{ r: 0 }}
              animate={{ r: 4 + growth * 0.5 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            />
          );
        })}

        {/* Fruits */}
        <AnimatePresence>
          {fruits.map((f) => (
            <motion.g key={`fruit-${f.id}`}>
              {/* Fruit shadow */}
              <motion.ellipse
                cx={f.x}
                cy={f.y + 6}
                rx={4}
                ry={2}
                fill="rgba(0,0,0,0.15)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: f.id * 0.1 }}
              />
              {/* Fruit body */}
              <motion.circle
                cx={f.x}
                cy={f.y}
                r={5}
                fill={
                  f.emoji === "🍎" ? "hsl(0, 70%, 45%)" :
                  f.emoji === "🍊" ? "hsl(30, 80%, 50%)" :
                  f.emoji === "🍋" ? "hsl(55, 80%, 55%)" :
                  f.emoji === "🍇" ? "hsl(280, 50%, 40%)" :
                  f.emoji === "🍑" ? "hsl(20, 70%, 60%)" :
                  "hsl(0, 65%, 42%)"
                }
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: f.id * 0.1, type: "spring" }}
              />
              {/* Fruit highlight */}
              <motion.circle
                cx={f.x - 1.5}
                cy={f.y - 1.5}
                r={1.8}
                fill="white"
                opacity={0.35}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: f.id * 0.1 + 0.1 }}
              />
              {/* Fruit stem */}
              <motion.line
                x1={f.x}
                y1={f.y - 5}
                x2={f.x + 1}
                y2={f.y - 8}
                stroke="hsl(30, 40%, 25%)"
                strokeWidth={1}
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: f.id * 0.1 }}
              />
            </motion.g>
          ))}
        </AnimatePresence>

        {/* Dead tree — bare gnarly branches */}
        {isDead && deadBranches.map((b, i) => (
          <motion.path
            key={`dead-b-${i}`}
            d={b.d}
            stroke="hsl(30, 10%, 22%)"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          />
        ))}

        {/* Falling leaves when dead */}
        {isDead && [0, 1, 2, 3, 4].map((i) => (
          <motion.text
            key={`fall-${i}`}
            fontSize={12}
            initial={{ opacity: 0, y: trunkTop, x: cx + (i - 2) * 12 }}
            animate={{
              opacity: [0, 1, 0],
              y: [trunkTop, groundY - 10],
              x: [cx + (i - 2) * 12, cx + (i - 2) * 12 + (i % 2 === 0 ? 20 : -20)],
              rotate: [0, 360],
            }}
            transition={{ duration: 2.5, delay: i * 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            🍂
          </motion.text>
        ))}

        {/* Small grass tufts */}
        {!isDead && Array.from({ length: 6 }, (_, i) => {
          const gx = 40 + i * 32;
          return (
            <motion.path
              key={`grass-${i}`}
              d={`M ${gx} ${groundY} Q ${gx - 2} ${groundY - 8} ${gx - 4} ${groundY - 12}
                  M ${gx} ${groundY} Q ${gx + 1} ${groundY - 10} ${gx + 3} ${groundY - 13}
                  M ${gx} ${groundY} Q ${gx + 3} ${groundY - 6} ${gx + 6} ${groundY - 10}`}
              stroke="hsl(120, 40%, 30%)"
              strokeWidth={1.2}
              fill="none"
              strokeLinecap="round"
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 2 + i * 0.2, repeat: Infinity }}
              style={{ transformOrigin: `${gx}px ${groundY}px` }}
            />
          );
        })}
      </motion.svg>

      {/* Warning for dead tree */}
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
