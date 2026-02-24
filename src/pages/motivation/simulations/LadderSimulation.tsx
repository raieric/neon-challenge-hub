import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreakStorage } from "../hooks/useStreakStorage";
import Confetti from "@/components/Confetti";

const MESSAGES_UP = ["XP gained.", "Progress compiled.", "Build > Excuses.", "Momentum++", "Stack overflow of wins."];
const MESSAGES_SKIP = ["Warning: momentum decreasing.", "Entropy wins today.", "Runtime error: effort not found.", "Segfault in discipline."];

const MAX_RUNGS = 12;
const RUNG_HEIGHT = 12;
const RUNG_GAP = 10;

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

  // Check if any consecutive gap > 1 exists due to broken rungs
  const hasLargeGap = useMemo(() => {
    if (brokenRungs.size === 0 || rungs <= 1) return false;
    const sorted = Array.from({ length: rungs }, (_, i) => i)
      .filter((i) => !brokenRungs.has(i));
    if (sorted.length === 0) return true;
    // Check gap from bottom
    if (sorted[0] > 1) return true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i - 1] > 2) return true;
    }
    return false;
  }, [brokenRungs, rungs]);

  const isSuccess = rungs >= MAX_RUNGS && !hasLargeGap && !data.collapsed;
  const isTryBetter = rungs >= MAX_RUNGS && hasLargeGap && !data.collapsed;

  // Play sounds and confetti on state change
  const prevStateRef = useRef({ isSuccess: false, isTryBetter: false });
  if (isSuccess && !prevStateRef.current.isSuccess) {
    if (lastSoundRef.current !== "success") {
      playSound("success");
      lastSoundRef.current = "success";
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  } else if (isTryBetter && !prevStateRef.current.isTryBetter) {
    if (lastSoundRef.current !== "warning") {
      playSound("warning");
      lastSoundRef.current = "warning";
    }
  } else if (!isSuccess && !isTryBetter) {
    lastSoundRef.current = null;
  }
  prevStateRef.current = { isSuccess, isTryBetter };

  const toggleRung = (index: number) => {
    setBrokenRungs((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleReset = useCallback(() => {
    setBrokenRungs(new Set());
    setShowConfetti(false);
    reset();
  }, [reset]);

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <Confetti />}
      {/* Ladder visual */}
      <div className="relative w-40 h-80 flex flex-col-reverse items-center justify-start">
        {/* Top label */}
        <motion.div
          className="absolute -top-8 font-display text-sm font-bold tracking-widest"
          animate={{
            opacity: rungs >= MAX_RUNGS ? 1 : 0.3,
            scale: rungs >= MAX_RUNGS ? 1.2 : 1,
          }}
          style={{
            textShadow: isTryBetter
              ? "0 0 20px hsl(0 80% 50% / 0.8)"
              : isSuccess
              ? "0 0 20px hsl(150 80% 50% / 0.8)"
              : "none",
            color: isTryBetter
              ? "hsl(var(--destructive))"
              : "hsl(var(--neon-green))",
          }}
        >
          {isTryBetter ? "⚠️ TRY BETTER" : "✦ SUCCESS ✦"}
        </motion.div>

        {/* Side rails */}
        <div className="absolute left-4 top-0 bottom-0 w-1 rounded-full bg-muted-foreground/20" />
        <div className="absolute right-4 top-0 bottom-0 w-1 rounded-full bg-muted-foreground/20" />

        {/* Rungs */}
        <AnimatePresence>
          {Array.from({ length: rungs }).map((_, i) => {
            const isBroken = brokenRungs.has(i);
            const cracked = data.collapsed && Math.random() > 0.5;
            return (
              <motion.div
                key={i}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: cracked ? 0.6 : isBroken ? 0.5 : 1,
                  opacity: cracked ? 0.4 : isBroken ? 0.35 : 1,
                  x: data.collapsed ? [0, -3, 3, -2, 0] : 0,
                  rotate: isBroken ? 8 : 0,
                }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => toggleRung(i)}
                className="rounded-sm cursor-pointer hover:brightness-125 transition-all"
                style={{
                  width: 112,
                  height: RUNG_HEIGHT,
                  marginBottom: i < rungs - 1 ? RUNG_GAP : 0,
                  background: isBroken
                    ? `linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--destructive) / 0.6))`
                    : `linear-gradient(90deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)))`,
                  boxShadow: isBroken
                    ? `0 0 6px hsl(var(--destructive) / 0.4)`
                    : `0 0 ${8 + i * 2}px hsl(var(--neon-purple) / ${0.2 + i * 0.05})`,
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
        <button onClick={handleReset} className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-all">
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default LadderSimulation;
