import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreakStorage } from "../hooks/useStreakStorage";
import Confetti from "@/components/Confetti";

const POSITIVE_TAGS = [
  "Communication", "Coding", "Discipline", "Fitness", "Focus",
  "Creativity", "Music", "Leadership", "Study", "Confidence",
  "Resilience", "Patience", "Empathy", "Gratitude", "Courage",
];

const NEGATIVE_TAGS = [
  "Self-doubt", "Laziness", "Fear", "Procrastination", "Anger",
  "Jealousy", "Weakness", "Negativity", "Apathy", "Excuses",
];

const MICROCOPY_POSITIVE = [
  "Replace, don't fight.",
  "Skills displace weakness.",
  "Growth leaves no room for doubt.",
  "Overflow with value.",
  "What you pour in defines you.",
];

const MICROCOPY_NEGATIVE = [
  "What you feed grows.",
  "Negativity multiplies when reinforced.",
  "Darkness fills unguarded minds.",
  "Every excuse costs clarity.",
];

const playSound = (type: "pour" | "dark") => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === "pour") {
      osc.type = "sine";
      osc.frequency.value = 440;
      gain.gain.value = 0.08;
      osc.start();
      setTimeout(() => { osc.frequency.value = 520; }, 80);
      setTimeout(() => { osc.frequency.value = 660; }, 160);
      setTimeout(() => { osc.stop(); ctx.close(); }, 300);
    } else {
      osc.type = "triangle";
      osc.frequency.value = 200;
      gain.gain.value = 0.1;
      osc.start();
      setTimeout(() => { osc.frequency.value = 150; }, 120);
      setTimeout(() => { osc.stop(); ctx.close(); }, 250);
    }
  } catch {}
};

interface FloatingTag {
  id: number;
  text: string;
  x: number;
  type: "positive" | "negative";
}

const WaterSimulation = () => {
  const { data, showUp, skip, reset } = useStreakStorage("water");

  // Clarity: 0–100, derived from steps vs skips
  const totalActions = data.history.length;
  const positiveCount = data.history.filter((h) => h === "up").length;
  const negativeCount = data.history.filter((h) => h === "skip").length;

  const clarity = useMemo(() => {
    if (totalActions === 0) return 50;
    return Math.max(0, Math.min(100, Math.round((positiveCount / totalActions) * 100)));
  }, [positiveCount, totalActions]);

  const negativity = 100 - clarity;
  const isFullClarity = clarity >= 100;
  const isFullDark = clarity <= 0;

  const [floatingTags, setFloatingTags] = useState<FloatingTag[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [message, setMessage] = useState("Pour positivity to clear your mind.");
  const tagIdRef = useRef(0);
  const prevClarityRef = useRef(clarity);

  useEffect(() => {
    if (isFullClarity && prevClarityRef.current < 100) {
      setShowConfetti(true);
      playSound("pour");
      setTimeout(() => setShowConfetti(false), 4000);
    }
    prevClarityRef.current = clarity;
  }, [isFullClarity, clarity]);

  const handlePositive = useCallback(() => {
    showUp();
    playSound("pour");
    const tag = POSITIVE_TAGS[Math.floor(Math.random() * POSITIVE_TAGS.length)];
    const id = tagIdRef.current++;
    setFloatingTags((prev) => [...prev.slice(-6), { id, text: tag, x: 20 + Math.random() * 60, type: "positive" }]);
    setMessage(MICROCOPY_POSITIVE[Math.floor(Math.random() * MICROCOPY_POSITIVE.length)]);
    setTimeout(() => setFloatingTags((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, [showUp]);

  const handleNegative = useCallback(() => {
    skip();
    playSound("dark");
    const tag = NEGATIVE_TAGS[Math.floor(Math.random() * NEGATIVE_TAGS.length)];
    const id = tagIdRef.current++;
    setFloatingTags((prev) => [...prev.slice(-6), { id, text: tag, x: 20 + Math.random() * 60, type: "negative" }]);
    setMessage(MICROCOPY_NEGATIVE[Math.floor(Math.random() * MICROCOPY_NEGATIVE.length)]);
    setTimeout(() => setFloatingTags((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, [skip]);

  const handleReset = useCallback(() => {
    setFloatingTags([]);
    setShowConfetti(false);
    setMessage("Pour positivity to clear your mind.");
    reset();
  }, [reset]);

  // Water fill level (0–1)
  const fillLevel = totalActions === 0 ? 0.5 : Math.min(1, 0.3 + (totalActions / 30) * 0.7);

  // Glass dimensions
  const GW = 140;
  const GH = 220;
  const GX = 80 - GW / 2;
  const GY = 30;
  const GLASS_BOTTOM = GY + GH;
  const WATER_HEIGHT = GH * fillLevel;
  const WATER_TOP = GLASS_BOTTOM - WATER_HEIGHT;

  // Murky color interpolation
  const waterColor = useMemo(() => {
    if (clarity >= 90) return "rgba(100, 200, 255, 0.7)";
    if (clarity >= 70) return "rgba(80, 170, 220, 0.6)";
    if (clarity >= 50) return "rgba(100, 140, 160, 0.55)";
    if (clarity >= 30) return "rgba(80, 90, 100, 0.6)";
    if (clarity >= 10) return "rgba(50, 55, 60, 0.7)";
    return "rgba(30, 30, 35, 0.85)";
  }, [clarity]);

  const waterColorTop = useMemo(() => {
    if (clarity >= 90) return "rgba(140, 220, 255, 0.5)";
    if (clarity >= 70) return "rgba(110, 190, 240, 0.4)";
    if (clarity >= 50) return "rgba(100, 130, 150, 0.4)";
    if (clarity >= 30) return "rgba(70, 75, 85, 0.45)";
    return "rgba(40, 40, 45, 0.6)";
  }, [clarity]);

  const glowOpacity = isFullClarity ? 0.6 : clarity > 80 ? 0.25 : 0;

  return (
    <div className="flex flex-col items-center gap-5">
      {showConfetti && <Confetti />}

      {/* Label */}
      <p className="font-display text-sm tracking-widest text-muted-foreground uppercase">Your Mind</p>

      {/* Glass container */}
      <div className="relative" style={{ width: 160, height: 300 }}>
        <svg width={160} height={300} viewBox="0 0 160 300" className="overflow-visible">
          <defs>
            {/* Glass reflection */}
            <linearGradient id="glassShine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="30%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="70%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
            </linearGradient>
            {/* Water gradient */}
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={waterColorTop} />
              <stop offset="100%" stopColor={waterColor} />
            </linearGradient>
            {/* Golden glow */}
            <radialGradient id="clarityGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(255, 215, 100, 0.4)" />
              <stop offset="100%" stopColor="rgba(255, 215, 100, 0)" />
            </radialGradient>
            <filter id="waterBlur">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
          </defs>

          {/* Golden glow behind glass */}
          {glowOpacity > 0 && (
            <motion.ellipse
              cx={80}
              cy={GY + GH / 2}
              rx={GW * 0.7}
              ry={GH * 0.6}
              fill="url(#clarityGlow)"
              animate={{ opacity: glowOpacity }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Glass body */}
          <rect
            x={GX}
            y={GY}
            width={GW}
            height={GH}
            rx={8}
            ry={8}
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1.5}
          />

          {/* Water fill */}
          <motion.rect
            x={GX + 2}
            width={GW - 4}
            rx={6}
            ry={2}
            fill="url(#waterGrad)"
            filter="url(#waterBlur)"
            animate={{
              y: WATER_TOP,
              height: WATER_HEIGHT,
            }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          />

          {/* Animated wave on water surface */}
          <motion.path
            d={`M ${GX + 2} ${WATER_TOP} 
                Q ${GX + GW * 0.25} ${WATER_TOP - 3} ${GX + GW * 0.5} ${WATER_TOP} 
                Q ${GX + GW * 0.75} ${WATER_TOP + 3} ${GX + GW - 2} ${WATER_TOP}
                L ${GX + GW - 2} ${WATER_TOP + 6}
                L ${GX + 2} ${WATER_TOP + 6} Z`}
            fill={waterColorTop}
            animate={{ y: [0, -1.5, 0, 1.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Bubbles */}
          {clarity > 50 && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx={GX + 30 + i * 30}
                  r={2 + i}
                  fill="rgba(200, 230, 255, 0.25)"
                  animate={{
                    cy: [GLASS_BOTTOM - 20, WATER_TOP + 10],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 2.5 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}

          {/* Glass shine overlay */}
          <rect
            x={GX}
            y={GY}
            width={GW}
            height={GH}
            rx={8}
            ry={8}
            fill="url(#glassShine)"
            pointerEvents="none"
          />

          {/* Glass rim */}
          <rect
            x={GX - 2}
            y={GY - 2}
            width={GW + 4}
            height={6}
            rx={3}
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={0.5}
          />

          {/* Glass base */}
          <ellipse
            cx={80}
            cy={GLASS_BOTTOM + 4}
            rx={GW * 0.35}
            ry={4}
            fill="rgba(255,255,255,0.06)"
          />

          {/* Dim overlay when fully dark */}
          {isFullDark && (
            <motion.rect
              x={0}
              y={0}
              width={160}
              height={300}
              fill="rgba(0,0,0,0.3)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              rx={8}
            />
          )}
        </svg>

        {/* Floating tags */}
        <AnimatePresence>
          {floatingTags.map((tag) => (
            <motion.span
              key={tag.id}
              className={`absolute text-[10px] font-display font-bold tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none ${
                tag.type === "positive"
                  ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
                  : "bg-destructive/20 text-destructive border border-destructive/30"
              }`}
              style={{ left: `${tag.x}%`, transform: "translateX(-50%)" }}
              initial={{ opacity: 0, bottom: 60, scale: 0.7 }}
              animate={{
                opacity: tag.type === "positive" ? [0, 1, 1, 0] : [0, 1, 0.5, 0],
                bottom: tag.type === "positive" ? [60, 180, 260] : [60, 40, 20],
                scale: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: "easeOut" }}
            >
              {tag.text}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Sparkle particles at full clarity */}
        {isFullClarity && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={`spark-${i}`}
                className="absolute w-1 h-1 rounded-full bg-yellow-300"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 3) * 20}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Subtext */}
      <p className="font-body text-xs text-muted-foreground/60 text-center">
        Negativity drains when positivity overflows.
      </p>

      {/* Message */}
      <motion.p
        key={message}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-body text-sm text-muted-foreground italic text-center"
      >
        {isFullClarity
          ? "You didn't remove darkness. You replaced it."
          : isFullDark
          ? "Negativity multiplies when reinforced."
          : message}
      </motion.p>

      {/* Meters */}
      <div className="w-full max-w-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-display text-[10px] tracking-widest text-neon-cyan w-24">🟢 CLARITY</span>
          <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(185, 80%, 50%), hsl(185, 90%, 65%))" }}
              animate={{ width: `${clarity}%` }}
              transition={{ type: "spring", stiffness: 80 }}
            />
          </div>
          <span className="font-display text-[10px] text-neon-cyan w-8 text-right">{clarity}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-[10px] tracking-widest text-destructive w-24">🔴 NEGATIVITY</span>
          <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(0, 70%, 45%), hsl(0, 80%, 55%))" }}
              animate={{ width: `${negativity}%` }}
              transition={{ type: "spring", stiffness: 80 }}
            />
          </div>
          <span className="font-display text-[10px] text-destructive w-8 text-right">{negativity}%</span>
        </div>
      </div>

      {/* Streak */}
      <p className="font-display text-xs text-neon-cyan tracking-widest">
        STREAK: {data.streak} | POURS: {positiveCount}
      </p>

      {/* Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={handlePositive}
          className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all"
        >
          💧 Pour Positivity
        </button>
        <button
          onClick={handleNegative}
          className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-all"
        >
          🛑 Feed Negativity
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-all"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default WaterSimulation;
