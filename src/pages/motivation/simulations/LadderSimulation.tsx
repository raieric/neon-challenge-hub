import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreakStorage } from "../hooks/useStreakStorage";
import Confetti from "@/components/Confetti";

const MESSAGES_UP = ["XP gained.", "Progress compiled.", "Build > Excuses.", "Momentum++", "Stack overflow of wins."];
const MESSAGES_SKIP = ["Warning: momentum decreasing.", "Entropy wins today.", "Runtime error: effort not found.", "Segfault in discipline."];

const MAX_RUNGS = 12;
const RUNG_H = 8;
const RUNG_GAP = 18;
const RAIL_W = 6;
const RUNG_W = 90;
const SVG_W = 160;
const LADDER_LEFT = (SVG_W - RUNG_W) / 2;
const LADDER_RIGHT = LADDER_LEFT + RUNG_W;
const SVG_H = MAX_RUNGS * (RUNG_H + RUNG_GAP) + 60;

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

const LadderSimulation = () => {
  const { data, showUp, skip, reset } = useStreakStorage("ladder");
  const rungs = Math.min(data.steps, MAX_RUNGS);
  const lastAction = data.history[data.history.length - 1];
  const msg = lastAction === "up"
    ? MESSAGES_UP[data.steps % MESSAGES_UP.length]
    : lastAction === "skip"
    ? MESSAGES_SKIP[Math.abs(data.steps) % MESSAGES_SKIP.length]
    : "Start climbing.";

  const [brokenRungs, setBrokenRungs] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const lastSoundRef = useRef<string | null>(null);

  // Only "try again" when gap is MORE than 2 consecutive broken rungs
  const hasLargeGap = useMemo(() => {
    if (brokenRungs.size === 0 || rungs <= 1) return false;
    // Find max consecutive broken rungs
    let maxConsecutive = 0;
    let current = 0;
    for (let i = 0; i < rungs; i++) {
      if (brokenRungs.has(i)) {
        current++;
        maxConsecutive = Math.max(maxConsecutive, current);
      } else {
        current = 0;
      }
    }
    return maxConsecutive > 2;
  }, [brokenRungs, rungs]);

  const isSuccess = rungs >= MAX_RUNGS && !hasLargeGap && !data.collapsed;
  const isTryAgain = rungs >= MAX_RUNGS && hasLargeGap && !data.collapsed;

  const prevStateRef = useRef({ isSuccess: false, isTryAgain: false });
  if (isSuccess && !prevStateRef.current.isSuccess) {
    if (lastSoundRef.current !== "success") {
      playSound("success");
      lastSoundRef.current = "success";
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  } else if (isTryAgain && !prevStateRef.current.isTryAgain) {
    if (lastSoundRef.current !== "warning") {
      playSound("warning");
      lastSoundRef.current = "warning";
    }
  } else if (!isSuccess && !isTryAgain) {
    lastSoundRef.current = null;
  }
  prevStateRef.current = { isSuccess, isTryAgain };

  const toggleRung = (index: number) => {
    setBrokenRungs((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleReset = useCallback(() => {
    setBrokenRungs(new Set());
    setShowConfetti(false);
    reset();
  }, [reset]);

  // Compute rung Y positions (bottom-up)
  const rungPositions = useMemo(() => {
    return Array.from({ length: rungs }, (_, i) => {
      const y = SVG_H - 30 - i * (RUNG_H + RUNG_GAP);
      return { index: i, y };
    });
  }, [rungs]);

  const ladderTopY = rungs > 0 ? rungPositions[rungs - 1].y - 20 : SVG_H - 40;
  const ladderBottomY = SVG_H - 20;

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <Confetti />}

      {/* SVG Ladder */}
      <div className="relative" style={{ width: SVG_W, height: Math.min(SVG_H, 360) }}>
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="overflow-visible"
          style={{ maxHeight: 360 }}
        >
          <defs>
            {/* Wood grain gradient for rails */}
            <linearGradient id="railWood" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(28, 50%, 28%)" />
              <stop offset="30%" stopColor="hsl(30, 55%, 35%)" />
              <stop offset="60%" stopColor="hsl(25, 45%, 30%)" />
              <stop offset="100%" stopColor="hsl(28, 50%, 25%)" />
            </linearGradient>
            {/* Wood grain for rungs */}
            <linearGradient id="rungWood" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(32, 45%, 38%)" />
              <stop offset="25%" stopColor="hsl(35, 50%, 42%)" />
              <stop offset="50%" stopColor="hsl(30, 40%, 36%)" />
              <stop offset="75%" stopColor="hsl(33, 48%, 40%)" />
              <stop offset="100%" stopColor="hsl(28, 42%, 34%)" />
            </linearGradient>
            {/* Broken rung */}
            <linearGradient id="brokenWood" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(20, 30%, 22%)" />
              <stop offset="50%" stopColor="hsl(15, 25%, 28%)" />
              <stop offset="100%" stopColor="hsl(20, 20%, 18%)" />
            </linearGradient>
            {/* Shadow filter */}
            <filter id="woodShadow">
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="rgba(0,0,0,0.35)" />
            </filter>
            <filter id="rungShadow">
              <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="rgba(0,0,0,0.25)" />
            </filter>
          </defs>

          {/* Left rail */}
          {rungs > 0 && (
            <>
              <rect
                x={LADDER_LEFT - RAIL_W / 2}
                y={ladderTopY}
                width={RAIL_W}
                height={ladderBottomY - ladderTopY}
                rx={2}
                fill="url(#railWood)"
                filter="url(#woodShadow)"
              />
              {/* Wood grain lines on left rail */}
              {[0.2, 0.4, 0.6, 0.8].map((t) => (
                <line
                  key={`lg-${t}`}
                  x1={LADDER_LEFT - RAIL_W / 2 + 1.5}
                  y1={ladderTopY + (ladderBottomY - ladderTopY) * t}
                  x2={LADDER_LEFT - RAIL_W / 2 + 1.5}
                  y2={ladderTopY + (ladderBottomY - ladderTopY) * t + 8}
                  stroke="hsl(25, 35%, 22%)"
                  strokeWidth={0.5}
                  opacity={0.4}
                />
              ))}

              {/* Right rail */}
              <rect
                x={LADDER_RIGHT - RAIL_W / 2}
                y={ladderTopY}
                width={RAIL_W}
                height={ladderBottomY - ladderTopY}
                rx={2}
                fill="url(#railWood)"
                filter="url(#woodShadow)"
              />
              {[0.15, 0.35, 0.55, 0.75].map((t) => (
                <line
                  key={`rg-${t}`}
                  x1={LADDER_RIGHT - RAIL_W / 2 + 3}
                  y1={ladderTopY + (ladderBottomY - ladderTopY) * t}
                  x2={LADDER_RIGHT - RAIL_W / 2 + 3}
                  y2={ladderTopY + (ladderBottomY - ladderTopY) * t + 10}
                  stroke="hsl(25, 35%, 22%)"
                  strokeWidth={0.5}
                  opacity={0.35}
                />
              ))}
            </>
          )}

          {/* Rungs */}
          <AnimatePresence>
            {rungPositions.map(({ index: i, y }) => {
              const isBroken = brokenRungs.has(i);
              const cracked = data.collapsed && Math.sin(i * 7.3) > 0;
              return (
                <motion.g
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  onClick={() => toggleRung(i)}
                  className="cursor-pointer"
                  style={{ pointerEvents: "all" }}
                >
                  {isBroken ? (
                    /* Broken rung — two halves with gap and rotation */
                    <>
                      <motion.rect
                        x={LADDER_LEFT}
                        y={y}
                        width={RUNG_W * 0.4}
                        height={RUNG_H}
                        rx={1.5}
                        fill="url(#brokenWood)"
                        animate={{
                          rotate: cracked ? -15 : -6,
                          y: cracked ? y + 4 : y + 2,
                        }}
                        style={{ transformOrigin: `${LADDER_LEFT}px ${y}px` }}
                        opacity={0.6}
                      />
                      <motion.rect
                        x={LADDER_LEFT + RUNG_W * 0.6}
                        y={y}
                        width={RUNG_W * 0.35}
                        height={RUNG_H}
                        rx={1.5}
                        fill="url(#brokenWood)"
                        animate={{
                          rotate: cracked ? 12 : 5,
                          y: cracked ? y + 5 : y + 1,
                        }}
                        style={{ transformOrigin: `${LADDER_RIGHT}px ${y}px` }}
                        opacity={0.5}
                      />
                      {/* Crack lines */}
                      <line
                        x1={LADDER_LEFT + RUNG_W * 0.42}
                        y1={y}
                        x2={LADDER_LEFT + RUNG_W * 0.5}
                        y2={y + RUNG_H}
                        stroke="hsl(20, 20%, 15%)"
                        strokeWidth={1}
                        opacity={0.5}
                      />
                    </>
                  ) : (
                    /* Intact rung */
                    <>
                      <rect
                        x={LADDER_LEFT}
                        y={y}
                        width={RUNG_W}
                        height={RUNG_H}
                        rx={2}
                        fill="url(#rungWood)"
                        filter="url(#rungShadow)"
                      />
                      {/* Wood grain on rung */}
                      <line
                        x1={LADDER_LEFT + 4}
                        y1={y + RUNG_H / 2}
                        x2={LADDER_RIGHT - 4}
                        y2={y + RUNG_H / 2}
                        stroke="hsl(28, 35%, 30%)"
                        strokeWidth={0.5}
                        opacity={0.3}
                      />
                      <line
                        x1={LADDER_LEFT + 8}
                        y1={y + RUNG_H / 2 + 2}
                        x2={LADDER_RIGHT - 12}
                        y2={y + RUNG_H / 2 + 2}
                        stroke="hsl(32, 30%, 28%)"
                        strokeWidth={0.4}
                        opacity={0.2}
                      />
                      {/* Nail holes at joints */}
                      <circle cx={LADDER_LEFT + 4} cy={y + RUNG_H / 2} r={1.2} fill="hsl(30, 20%, 22%)" opacity={0.5} />
                      <circle cx={LADDER_RIGHT - 4} cy={y + RUNG_H / 2} r={1.2} fill="hsl(30, 20%, 22%)" opacity={0.5} />
                    </>
                  )}

                  {/* Hover highlight */}
                  <rect
                    x={LADDER_LEFT - 2}
                    y={y - 2}
                    width={RUNG_W + 4}
                    height={RUNG_H + 4}
                    rx={3}
                    fill="transparent"
                    stroke="transparent"
                    className="hover:stroke-[hsl(var(--neon-cyan))] hover:stroke-1 transition-all"
                    opacity={0.4}
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* Climber */}
          {rungs > 0 && !data.collapsed && (
            <motion.text
              fontSize={22}
              textAnchor="middle"
              animate={{
                y: (rungPositions[Math.min(rungs - 1, rungPositions.length - 1)]?.y ?? SVG_H - 50) - 8,
                x: SVG_W / 2 - 2,
              }}
              transition={{ type: "spring", stiffness: 180 }}
            >
              🧗
            </motion.text>
          )}

          {/* Ground */}
          <ellipse cx={SVG_W / 2} cy={SVG_H - 8} rx={70} ry={6} fill="hsl(30, 20%, 15%)" opacity={0.3} />
        </svg>

        {/* Top label */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 font-display text-sm font-bold tracking-widest whitespace-nowrap"
          style={{ top: -8 }}
          animate={{
            opacity: rungs >= MAX_RUNGS ? 1 : 0.25,
            scale: rungs >= MAX_RUNGS ? 1.15 : 1,
          }}
        >
          <span
            style={{
              textShadow: isTryAgain
                ? "0 0 16px hsl(0 80% 50% / 0.7)"
                : isSuccess
                ? "0 0 16px hsl(150 80% 50% / 0.7)"
                : "none",
              color: isTryAgain
                ? "hsl(var(--destructive))"
                : "hsl(var(--neon-green))",
            }}
          >
            {isTryAgain ? "⚠️ TRY AGAIN" : "✦ SUCCESS ✦"}
          </span>
        </motion.div>
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
        <button onClick={handleReset} className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-all">
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default LadderSimulation;
