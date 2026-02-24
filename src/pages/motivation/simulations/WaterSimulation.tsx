import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
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

interface SpillDrop {
  id: number;
  x: number;
  delay: number;
  size: number;
}

interface RippleRing {
  id: number;
  x: number;
}

// Lerp between two RGB colors
const lerpColor = (a: [number, number, number], b: [number, number, number], t: number): string => {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
};

// Multi-stop color blend for water
const getWaterColors = (clarity: number) => {
  const t = clarity / 100;
  const DIRTY: [number, number, number] = [70, 52, 35];      // muddy brown
  const MID_DIRTY: [number, number, number] = [85, 75, 60];   // murky
  const MID_CLEAN: [number, number, number] = [80, 150, 180]; // teal transition
  const CLEAN: [number, number, number] = [120, 200, 240];    // clear blue
  const CLEAN_BRIGHT: [number, number, number] = [160, 225, 255];

  let bottom: string, mid: string, top: string, surface: string;

  if (t < 0.3) {
    const s = t / 0.3;
    bottom = lerpColor(DIRTY, DIRTY, 0);
    mid = lerpColor(DIRTY, MID_DIRTY, s);
    top = lerpColor(DIRTY, MID_DIRTY, s * 0.5);
    surface = lerpColor(DIRTY, MID_DIRTY, s * 0.3);
  } else if (t < 0.7) {
    const s = (t - 0.3) / 0.4;
    bottom = lerpColor(DIRTY, MID_DIRTY, s);
    mid = lerpColor(MID_DIRTY, MID_CLEAN, s);
    top = lerpColor(MID_DIRTY, MID_CLEAN, s);
    surface = lerpColor(MID_DIRTY, MID_CLEAN, s * 0.8);
  } else {
    const s = (t - 0.7) / 0.3;
    bottom = lerpColor(MID_DIRTY, MID_CLEAN, s);
    mid = lerpColor(MID_CLEAN, CLEAN, s);
    top = lerpColor(MID_CLEAN, CLEAN, s);
    surface = lerpColor(CLEAN, CLEAN_BRIGHT, s);
  }

  return { bottom, mid, top, surface };
};

// Glass constants
const SVG_W = 200;
const SVG_H = 340;
const GW = 130;
const GH = 200;
const GX = (SVG_W - GW) / 2;
const GY = 60;
const GLASS_BOTTOM = GY + GH;
const GLASS_RIM_Y = GY;
const GLASS_INNER_X = GX + 3;
const GLASS_INNER_W = GW - 6;

const WaterSimulation = () => {
  const { data, showUp, skip, reset } = useStreakStorage("water");

  const totalActions = data.history.length;
  const positiveCount = data.history.filter((h) => h === "up").length;
  const negativeCount = totalActions - positiveCount;

  // Simple linear: start at 50, +1 per pour, -1 per negativity, clamped 0–100
  const clarity = useMemo(() => {
    return Math.max(0, Math.min(100, 50 + positiveCount - negativeCount));
  }, [positiveCount, negativeCount]);

  const negativity = 100 - clarity;
  const isFullClarity = clarity >= 100;
  const isFullDark = clarity <= 0;

  const [floatingTags, setFloatingTags] = useState<FloatingTag[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [message, setMessage] = useState("Pour positivity to clear your mind.");
  const [isPouringStream, setIsPouringStream] = useState(false);
  const [spillDrops, setSpillDrops] = useState<SpillDrop[]>([]);
  const [ripples, setRipples] = useState<RippleRing[]>([]);
  const [waveIntensity, setWaveIntensity] = useState(0);
  const tagIdRef = useRef(0);
  const spillIdRef = useRef(0);
  const rippleIdRef = useRef(0);
  const prevClarityRef = useRef(clarity);
  const glassControls = useAnimation();

  useEffect(() => {
    if (isFullClarity && prevClarityRef.current < 100) {
      setShowConfetti(true);
      playSound("pour");
      setTimeout(() => setShowConfetti(false), 4000);
    }
    prevClarityRef.current = clarity;
  }, [isFullClarity, clarity]);

  // Dynamic message based on clarity thresholds
  const dynamicMessage = useMemo(() => {
    if (isFullClarity) return "Displacement complete.";
    if (isFullDark) return "Negativity multiplies when reinforced.";
    if (clarity >= 80) return "Negativity losing space.";
    if (clarity >= 50) return "Replacement in progress.";
    return message;
  }, [clarity, isFullClarity, isFullDark, message]);

  // Water fill level (always filled, but ratio of dirty vs clean changes)
  const totalFill = useMemo(() => Math.min(1, 0.45 + (totalActions / 25) * 0.55), [totalActions]);
  const cleanRatio = clarity / 100;
  const dirtyRatio = 1 - cleanRatio;

  const TOTAL_WATER_H = GH * totalFill;
  const WATER_TOP_Y = GLASS_BOTTOM - TOTAL_WATER_H;
  const DIRTY_H = TOTAL_WATER_H * dirtyRatio;
  const CLEAN_H = TOTAL_WATER_H * cleanRatio;
  const DIRTY_TOP_Y = GLASS_BOTTOM - DIRTY_H;

  const waterColors = useMemo(() => getWaterColors(clarity), [clarity]);

  // Overflow: dirty water spills when clarity rises and glass is full
  const isOverflowing = totalFill >= 0.95 && clarity > 60;

  const triggerSpill = useCallback(() => {
    const drops: SpillDrop[] = [];
    for (let i = 0; i < 4; i++) {
      drops.push({
        id: spillIdRef.current++,
        x: i < 2 ? GX - 4 - Math.random() * 8 : GX + GW + 4 + Math.random() * 8,
        delay: Math.random() * 0.3,
        size: 3 + Math.random() * 4,
      });
    }
    setSpillDrops((prev) => [...prev.slice(-8), ...drops]);
    setTimeout(() => {
      setSpillDrops((prev) => prev.filter((d) => !drops.find((nd) => nd.id === d.id)));
    }, 2000);
  }, []);

  const triggerRipple = useCallback(() => {
    const id = rippleIdRef.current++;
    const x = GLASS_INNER_X + 15 + Math.random() * (GLASS_INNER_W - 30);
    setRipples((prev) => [...prev.slice(-3), { id, x }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 1200);
  }, []);

  const handlePositive = useCallback(() => {
    showUp();
    playSound("pour");

    // Pour stream
    setIsPouringStream(true);
    setTimeout(() => setIsPouringStream(false), 800);

    // Wave & ripple
    setWaveIntensity(6);
    setTimeout(() => setWaveIntensity(3), 400);
    setTimeout(() => setWaveIntensity(0), 1200);
    triggerRipple();

    // Glass vibration
    glassControls.start({
      x: [0, -1.5, 1.5, -1, 0.5, 0],
      transition: { duration: 0.4 },
    });

    // Spill if overflowing
    if (totalFill >= 0.9 && clarity > 50) {
      setTimeout(triggerSpill, 300);
    }

    // Floating tag
    const tag = POSITIVE_TAGS[Math.floor(Math.random() * POSITIVE_TAGS.length)];
    const id = tagIdRef.current++;
    setFloatingTags((prev) => [...prev.slice(-5), { id, text: tag, x: 15 + Math.random() * 70, type: "positive" }]);
    setMessage("Replace, don't fight.");
    setTimeout(() => setFloatingTags((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, [showUp, glassControls, triggerSpill, triggerRipple, totalFill, clarity]);

  const handleNegative = useCallback(() => {
    skip();
    playSound("dark");

    setWaveIntensity(2);
    setTimeout(() => setWaveIntensity(0), 600);

    glassControls.start({
      x: [0, 1, -1, 0],
      transition: { duration: 0.25 },
    });

    const tag = NEGATIVE_TAGS[Math.floor(Math.random() * NEGATIVE_TAGS.length)];
    const id = tagIdRef.current++;
    setFloatingTags((prev) => [...prev.slice(-5), { id, text: tag, x: 15 + Math.random() * 70, type: "negative" }]);
    setMessage("What you feed grows.");
    setTimeout(() => setFloatingTags((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, [skip, glassControls]);

  const handleReset = useCallback(() => {
    setFloatingTags([]);
    setShowConfetti(false);
    setSpillDrops([]);
    setRipples([]);
    setIsPouringStream(false);
    setWaveIntensity(0);
    setMessage("Pour positivity to clear your mind.");
    reset();
  }, [reset]);

  // Wave path for water surface
  const wavePath = useMemo(() => {
    const y = WATER_TOP_Y;
    const amp = waveIntensity || 1.5;
    return `M ${GLASS_INNER_X} ${y}
      Q ${GLASS_INNER_X + GLASS_INNER_W * 0.15} ${y - amp} ${GLASS_INNER_X + GLASS_INNER_W * 0.3} ${y}
      Q ${GLASS_INNER_X + GLASS_INNER_W * 0.45} ${y + amp * 0.8} ${GLASS_INNER_X + GLASS_INNER_W * 0.6} ${y}
      Q ${GLASS_INNER_X + GLASS_INNER_W * 0.75} ${y - amp * 0.6} ${GLASS_INNER_X + GLASS_INNER_W * 0.9} ${y}
      Q ${GLASS_INNER_X + GLASS_INNER_W * 0.95} ${y + amp * 0.4} ${GLASS_INNER_X + GLASS_INNER_W} ${y}`;
  }, [WATER_TOP_Y, waveIntensity]);

  const glowOpacity = isFullClarity ? 0.7 : clarity > 85 ? 0.3 : clarity > 70 ? 0.12 : 0;

  return (
    <div className="flex flex-col items-center gap-5">
      {showConfetti && <Confetti />}

      {/* Label */}
      <p className="font-display text-sm tracking-widest text-muted-foreground uppercase">Your Mind</p>

      {/* Glass container */}
      <motion.div className="relative" style={{ width: SVG_W, height: SVG_H + 30 }} animate={glassControls}>
        <svg width={SVG_W} height={SVG_H + 60} viewBox={`0 0 ${SVG_W} ${SVG_H + 60}`} className="overflow-visible">
          <defs>
            {/* Glass body gradient */}
            <linearGradient id="wGlassBody" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="20%" stopColor="rgba(255,255,255,0.03)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.01)" />
              <stop offset="80%" stopColor="rgba(255,255,255,0.03)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
            </linearGradient>
            {/* Glass edge shine */}
            <linearGradient id="wGlassEdge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.18)" />
            </linearGradient>
            {/* Dirty water gradient (bottom) */}
            <linearGradient id="wDirtyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={waterColors.mid} stopOpacity={0.85} />
              <stop offset="60%" stopColor={waterColors.bottom} stopOpacity={0.92} />
              <stop offset="100%" stopColor={waterColors.bottom} stopOpacity={0.95} />
            </linearGradient>
            {/* Clean water gradient (top) */}
            <linearGradient id="wCleanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={waterColors.surface} stopOpacity={0.5} />
              <stop offset="40%" stopColor={waterColors.top} stopOpacity={0.6} />
              <stop offset="100%" stopColor={waterColors.mid} stopOpacity={0.7} />
            </linearGradient>
            {/* Pour stream gradient */}
            <linearGradient id="wPourStream" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(140,215,255,0.6)" />
              <stop offset="100%" stopColor="rgba(100,190,240,0.3)" />
            </linearGradient>
            {/* Spill dirty gradient */}
            <linearGradient id="wSpillDirty" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={waterColors.bottom} stopOpacity={0.8} />
              <stop offset="100%" stopColor={waterColors.bottom} stopOpacity={0} />
            </linearGradient>
            {/* Inner shadow filter */}
            <filter id="wInnerShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
              <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
              <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
            </filter>
            {/* Turbidity noise */}
            <filter id="wTurbidity">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale={Math.max(0, 8 - clarity * 0.08)} />
            </filter>
            {/* Clarity glow */}
            <radialGradient id="wClarityGlow" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="rgba(255,220,100,0.45)" />
              <stop offset="60%" stopColor="rgba(180,220,255,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            {/* Clip for glass interior */}
            <clipPath id="wGlassClip">
              <rect x={GLASS_INNER_X} y={GY + 2} width={GLASS_INNER_W} height={GH - 4} rx={5} />
            </clipPath>
            {/* Highlight reflection */}
            <linearGradient id="wHighlight" x1="0.2" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>

          {/* Golden glow behind glass */}
          {glowOpacity > 0 && (
            <motion.ellipse
              cx={SVG_W / 2}
              cy={GY + GH / 2}
              rx={GW * 0.8}
              ry={GH * 0.65}
              fill="url(#wClarityGlow)"
              animate={{ opacity: glowOpacity }}
              transition={{ duration: 1 }}
            />
          )}

          {/* Glass body */}
          <rect
            x={GX}
            y={GY}
            width={GW}
            height={GH}
            rx={6}
            fill="url(#wGlassBody)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1.2}
          />

          {/* Glass inner shadow (left & right edges) */}
          <rect x={GX + 1} y={GY + 1} width={4} height={GH - 2} rx={2} fill="rgba(0,0,0,0.08)" />
          <rect x={GX + GW - 5} y={GY + 1} width={4} height={GH - 2} rx={2} fill="rgba(0,0,0,0.06)" />

          {/* ===== WATER LAYERS (clipped to glass) ===== */}
          <g clipPath="url(#wGlassClip)">
            {/* Dirty water layer (bottom) */}
            {DIRTY_H > 0 && (
              <motion.rect
                x={GLASS_INNER_X}
                width={GLASS_INNER_W}
                fill="url(#wDirtyGrad)"
                filter={clarity < 60 ? "url(#wTurbidity)" : undefined}
                animate={{
                  y: DIRTY_TOP_Y,
                  height: DIRTY_H,
                }}
                transition={{ type: "spring", stiffness: 50, damping: 18 }}
              />
            )}

            {/* Clean water layer (on top of dirty) */}
            {CLEAN_H > 0 && (
              <motion.rect
                x={GLASS_INNER_X}
                width={GLASS_INNER_W}
                fill="url(#wCleanGrad)"
                animate={{
                  y: WATER_TOP_Y,
                  height: CLEAN_H,
                }}
                transition={{ type: "spring", stiffness: 50, damping: 18 }}
              />
            )}

            {/* Transition blend zone between clean and dirty */}
            {CLEAN_H > 2 && DIRTY_H > 2 && (
              <motion.rect
                x={GLASS_INNER_X}
                width={GLASS_INNER_W}
                height={12}
                animate={{ y: DIRTY_TOP_Y - 6 }}
                transition={{ type: "spring", stiffness: 50, damping: 18 }}
                fill={waterColors.mid}
                opacity={0.35}
              />
            )}

            {/* Surface wave */}
            <motion.path
              d={wavePath + ` L ${GLASS_INNER_X + GLASS_INNER_W} ${WATER_TOP_Y + 8} L ${GLASS_INNER_X} ${WATER_TOP_Y + 8} Z`}
              fill={waterColors.surface}
              opacity={0.4}
              animate={{ y: [0, -1, 0, 1, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Second wave layer offset */}
            <motion.path
              d={wavePath + ` L ${GLASS_INNER_X + GLASS_INNER_W} ${WATER_TOP_Y + 5} L ${GLASS_INNER_X} ${WATER_TOP_Y + 5} Z`}
              fill={waterColors.surface}
              opacity={0.2}
              animate={{ y: [0, 1.5, 0, -1.5, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Bubbles */}
            {clarity > 30 && Array.from({ length: Math.min(5, Math.floor(clarity / 20)) }).map((_, i) => (
              <motion.circle
                key={`bubble-${i}`}
                cx={GLASS_INNER_X + 15 + ((i * 27 + 11) % (GLASS_INNER_W - 30))}
                r={1.5 + (i % 3)}
                fill="rgba(200, 235, 255, 0.2)"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={0.3}
                animate={{
                  cy: [GLASS_BOTTOM - 15 - i * 10, WATER_TOP_Y + 8],
                  opacity: [0.4, 0],
                }}
                transition={{
                  duration: 3 + i * 0.6,
                  repeat: Infinity,
                  delay: i * 1.1,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Light reflection moving across surface */}
            <motion.ellipse
              cx={GLASS_INNER_X + 20}
              rx={18}
              ry={3}
              fill="rgba(255,255,255,0.08)"
              animate={{
                cx: [GLASS_INNER_X + 20, GLASS_INNER_X + GLASS_INNER_W - 20, GLASS_INNER_X + 20],
                cy: WATER_TOP_Y + 4,
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>

          {/* ===== POUR STREAM ===== */}
          <AnimatePresence>
            {isPouringStream && (
              <motion.g>
                {/* Main stream */}
                <motion.rect
                  x={SVG_W / 2 - 3}
                  y={10}
                  width={6}
                  rx={3}
                  fill="url(#wPourStream)"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: WATER_TOP_Y - 10, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                {/* Stream wobble overlay */}
                <motion.rect
                  x={SVG_W / 2 - 1.5}
                  y={10}
                  width={3}
                  rx={1.5}
                  fill="rgba(180,230,255,0.4)"
                  initial={{ height: 0 }}
                  animate={{ height: WATER_TOP_Y - 10 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
                {/* Splash droplets */}
                {[0, 1, 2].map((i) => (
                  <motion.circle
                    key={`splash-${i}`}
                    cx={SVG_W / 2 + (i - 1) * 12}
                    r={2}
                    fill="rgba(140,215,255,0.5)"
                    initial={{ cy: WATER_TOP_Y, opacity: 0, scale: 0 }}
                    animate={{
                      cy: [WATER_TOP_Y, WATER_TOP_Y - 10 - i * 5, WATER_TOP_Y + 3],
                      opacity: [0, 0.7, 0],
                      scale: [0, 1, 0.5],
                    }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                  />
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* ===== RIPPLE RINGS on surface ===== */}
          <AnimatePresence>
            {ripples.map((r) => (
              <motion.ellipse
                key={r.id}
                cx={r.x}
                cy={WATER_TOP_Y}
                fill="none"
                stroke="rgba(200,235,255,0.3)"
                strokeWidth={0.8}
                initial={{ rx: 2, ry: 1, opacity: 0.6 }}
                animate={{ rx: 25, ry: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>

          {/* ===== OVERFLOW / SPILL ===== */}
          <AnimatePresence>
            {spillDrops.map((drop) => (
              <motion.g key={drop.id}>
                {/* Spill stream */}
                <motion.rect
                  x={drop.x}
                  y={GY}
                  width={drop.size}
                  rx={drop.size / 2}
                  fill="url(#wSpillDirty)"
                  initial={{ height: 0, opacity: 0.8 }}
                  animate={{ height: 60, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, delay: drop.delay, ease: "easeIn" }}
                />
                {/* Drip at bottom */}
                <motion.circle
                  cx={drop.x + drop.size / 2}
                  r={drop.size * 0.6}
                  fill={waterColors.bottom}
                  initial={{ cy: GY + 10, opacity: 0.7 }}
                  animate={{ cy: GLASS_BOTTOM + 40, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.8, delay: drop.delay + 0.3, ease: "easeIn" }}
                />
              </motion.g>
            ))}
          </AnimatePresence>

          {/* Persistent overflow drip when glass is very full */}
          {isOverflowing && (
            <>
              {[0, 1].map((side) => (
                <motion.rect
                  key={`overflow-${side}`}
                  x={side === 0 ? GX - 2 : GX + GW - 1}
                  y={GY - 1}
                  width={3}
                  rx={1.5}
                  fill={waterColors.bottom}
                  opacity={0.5}
                  animate={{
                    height: [0, 25, 0],
                    opacity: [0.5, 0.3, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: side * 0.8,
                    ease: "easeIn",
                  }}
                />
              ))}
            </>
          )}

          {/* Glass highlight reflection (vertical stripe) */}
          <rect
            x={GX + 8}
            y={GY + 8}
            width={6}
            height={GH - 16}
            rx={3}
            fill="url(#wHighlight)"
            pointerEvents="none"
          />

          {/* Glass rim */}
          <rect
            x={GX - 3}
            y={GY - 3}
            width={GW + 6}
            height={6}
            rx={3}
            fill="url(#wGlassEdge)"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={0.5}
          />

          {/* Glass base (thicker) */}
          <rect
            x={GX + 5}
            y={GLASS_BOTTOM}
            width={GW - 10}
            height={5}
            rx={2}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.5}
          />
          <ellipse
            cx={SVG_W / 2}
            cy={GLASS_BOTTOM + 8}
            rx={GW * 0.38}
            ry={3}
            fill="rgba(255,255,255,0.04)"
          />

          {/* Dim overlay when fully dark */}
          {isFullDark && (
            <motion.rect
              x={GX - 5}
              y={GY - 5}
              width={GW + 10}
              height={GH + 10}
              fill="rgba(0,0,0,0.25)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              rx={8}
            />
          )}

          {/* Full clarity shine animation */}
          {isFullClarity && (
            <motion.rect
              x={GX + GW * 0.3}
              y={GY + 10}
              width={3}
              height={GH * 0.6}
              rx={1.5}
              fill="rgba(255,255,255,0.25)"
              animate={{
                x: [GX + GW * 0.3, GX + GW * 0.7, GX + GW * 0.3],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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
              initial={{ opacity: 0, bottom: 80, scale: 0.7 }}
              animate={{
                opacity: tag.type === "positive" ? [0, 1, 1, 0] : [0, 1, 0.5, 0],
                bottom: tag.type === "positive" ? [80, 200, 300] : [80, 50, 30],
                scale: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
            >
              {tag.text}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Sparkle particles at full clarity */}
        {isFullClarity && (
          <>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={`spark-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  left: `${18 + i * 12}%`,
                  top: `${25 + (i % 3) * 18}%`,
                  background: "radial-gradient(circle, rgba(255,220,100,0.9) 0%, rgba(255,220,100,0) 70%)",
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.3, 1.8, 0.3],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.35,
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Subtext */}
      <p className="font-body text-xs text-muted-foreground/60 text-center">
        Negativity drains when positivity overflows.
      </p>

      {/* Message */}
      <motion.p
        key={dynamicMessage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-body text-sm text-muted-foreground italic text-center"
      >
        {dynamicMessage}
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
