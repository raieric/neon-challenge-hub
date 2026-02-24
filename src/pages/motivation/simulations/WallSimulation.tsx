import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreakStorage } from "../hooks/useStreakStorage";
import Confetti from "@/components/Confetti";

// House is built in layers: foundation (row 0-1), walls (row 2-4), roof
const COLS = 4;
const MAX_ROWS = 5;
const MAX_BRICKS = COLS * MAX_ROWS; // 20 bricks to complete walls
const BRICK_W = 48;
const BRICK_H = 18;
const BRICK_GAP = 2;
const MORTAR = 2;

const SVG_W = 240;
const SVG_H = 300;
const WALL_BASE_Y = SVG_H - 30;
const WALL_LEFT = (SVG_W - (COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP)) / 2;

const playSound = (type: "place" | "break" | "collapse" | "success") => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === "place") {
      osc.type = "sine";
      osc.frequency.value = 350;
      gain.gain.value = 0.08;
      osc.start();
      setTimeout(() => { osc.frequency.value = 440; }, 80);
      setTimeout(() => { osc.stop(); ctx.close(); }, 200);
    } else if (type === "break") {
      osc.type = "sawtooth";
      osc.frequency.value = 250;
      gain.gain.value = 0.1;
      osc.start();
      setTimeout(() => { osc.frequency.value = 180; }, 100);
      setTimeout(() => { osc.stop(); ctx.close(); }, 250);
    } else if (type === "collapse") {
      osc.type = "sawtooth";
      osc.frequency.value = 200;
      gain.gain.value = 0.15;
      osc.start();
      setTimeout(() => { osc.frequency.value = 100; }, 200);
      setTimeout(() => { osc.frequency.value = 60; }, 400);
      setTimeout(() => { osc.stop(); ctx.close(); }, 700);
    } else {
      osc.type = "sine";
      osc.frequency.value = 523;
      gain.gain.value = 0.12;
      osc.start();
      setTimeout(() => { osc.frequency.value = 659; }, 150);
      setTimeout(() => { osc.frequency.value = 784; }, 300);
      setTimeout(() => { osc.stop(); ctx.close(); }, 500);
    }
  } catch {}
};

const WallSimulation = () => {
  const { data, showUp, skip, reset } = useStreakStorage("wall");
  const bricks = Math.min(data.steps, MAX_BRICKS);
  const totalRows = Math.ceil(bricks / COLS);

  const [brokenBricks, setBrokenBricks] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCompleteRef = useRef(false);

  const brokenCount = brokenBricks.size;
  const isCollapsed = brokenCount > 5 || data.collapsed;
  const isComplete = bricks >= MAX_BRICKS && !isCollapsed;

  // House elements visibility
  const hasFoundation = totalRows >= 1;
  const hasWalls = totalRows >= 3;
  const hasRoof = bricks >= MAX_BRICKS;
  const hasDoor = totalRows >= 2;
  const hasWindow = totalRows >= 4;

  useEffect(() => {
    if (isComplete && !prevCompleteRef.current) {
      playSound("success");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
    prevCompleteRef.current = isComplete;
  }, [isComplete]);

  const toggleBrick = useCallback((index: number) => {
    if (isCollapsed) return;
    setBrokenBricks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
        playSound("break");
      }
      return next;
    });
  }, [isCollapsed]);

  const handleReset = useCallback(() => {
    setBrokenBricks(new Set());
    setShowConfetti(false);
    reset();
  }, [reset]);

  // Compute brick positions (bottom-up, left-to-right)
  const brickPositions = useMemo(() => {
    return Array.from({ length: bricks }, (_, i) => {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      // Offset every other row for realistic brick pattern
      const offset = row % 2 === 1 ? (BRICK_W + BRICK_GAP) / 2 : 0;
      const x = WALL_LEFT + col * (BRICK_W + BRICK_GAP) + offset;
      const y = WALL_BASE_Y - (row + 1) * (BRICK_H + MORTAR);
      return { index: i, row, col, x, y };
    });
  }, [bricks]);

  const roofTopY = bricks >= MAX_BRICKS
    ? WALL_BASE_Y - MAX_ROWS * (BRICK_H + MORTAR) - 50
    : WALL_BASE_Y - totalRows * (BRICK_H + MORTAR) - 10;

  const wallTopY = WALL_BASE_Y - totalRows * (BRICK_H + MORTAR);

  const message = useMemo(() => {
    if (isCollapsed) return "💥 House collapsed! Too many broken bricks. Reset and rebuild.";
    if (isComplete) return "🏠 House complete! Your consistency built something lasting.";
    if (bricks === 0) return "Lay your first brick. Build your house.";
    if (totalRows <= 1) return "Foundation forming. Keep stacking.";
    if (totalRows <= 3) return "Walls rising. Brick by brick.";
    if (totalRows <= 4) return "Structure taking shape. Almost there.";
    return "Final bricks. The roof awaits.";
  }, [isCollapsed, isComplete, bricks, totalRows]);

  return (
    <div className="flex flex-col items-center gap-5">
      {showConfetti && <Confetti />}

      {/* SVG House */}
      <div className="relative" style={{ width: SVG_W, height: SVG_H }}>
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="overflow-visible">
          <defs>
            {/* Brick gradient */}
            <linearGradient id="brickGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(15, 60%, 45%)" />
              <stop offset="50%" stopColor="hsl(12, 55%, 40%)" />
              <stop offset="100%" stopColor="hsl(10, 50%, 35%)" />
            </linearGradient>
            <linearGradient id="brickGrad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(18, 58%, 42%)" />
              <stop offset="100%" stopColor="hsl(8, 52%, 38%)" />
            </linearGradient>
            {/* Broken brick */}
            <linearGradient id="brokenBrickGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(15, 30%, 28%)" />
              <stop offset="100%" stopColor="hsl(10, 25%, 22%)" />
            </linearGradient>
            {/* Roof */}
            <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(20, 50%, 30%)" />
              <stop offset="100%" stopColor="hsl(15, 45%, 25%)" />
            </linearGradient>
            {/* Door */}
            <linearGradient id="doorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(30, 50%, 30%)" />
              <stop offset="100%" stopColor="hsl(25, 45%, 22%)" />
            </linearGradient>
            <filter id="brickShadow">
              <feDropShadow dx="0.5" dy="1" stdDeviation="0.6" floodColor="rgba(0,0,0,0.3)" />
            </filter>
          </defs>

          {/* Ground */}
          <rect x={0} y={WALL_BASE_Y} width={SVG_W} height={30} rx={2} fill="hsl(30, 20%, 15%)" opacity={0.4} />
          <ellipse cx={SVG_W / 2} cy={WALL_BASE_Y + 2} rx={110} ry={4} fill="hsl(30, 15%, 12%)" opacity={0.3} />

          {/* ===== BRICKS ===== */}
          <AnimatePresence>
            {brickPositions.map(({ index: i, row, col, x, y }) => {
              const isBroken = brokenBricks.has(i);

              if (isCollapsed) {
                // Collapse animation — bricks fall and scatter
                const fallAngle = (Math.sin(i * 3.7) * 40);
                const fallX = x + (Math.cos(i * 2.3) * 30);
                const fallY = WALL_BASE_Y - 5 + Math.random() * 10;
                return (
                  <motion.rect
                    key={`brick-${i}`}
                    x={x}
                    y={y}
                    width={BRICK_W}
                    height={BRICK_H}
                    rx={1.5}
                    fill="url(#brokenBrickGrad)"
                    animate={{
                      x: fallX,
                      y: fallY,
                      rotate: fallAngle,
                      opacity: 0.4,
                    }}
                    transition={{ duration: 0.8, delay: i * 0.03, ease: "easeIn" }}
                  />
                );
              }

              return (
                <motion.g
                  key={`brick-${i}`}
                  initial={{ opacity: 0, scale: 0.5, y: y + 15 }}
                  animate={{ opacity: 1, scale: 1, y: y }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  onClick={() => toggleBrick(i)}
                  className="cursor-pointer"
                >
                  {isBroken ? (
                    <>
                      {/* Broken brick — two halves */}
                      <motion.rect
                        x={x}
                        y={y}
                        width={BRICK_W * 0.45}
                        height={BRICK_H}
                        rx={1}
                        fill="url(#brokenBrickGrad)"
                        animate={{ rotate: -4, y: y + 3 }}
                        style={{ transformOrigin: `${x}px ${y + BRICK_H}px` }}
                        opacity={0.5}
                      />
                      <motion.rect
                        x={x + BRICK_W * 0.55}
                        y={y}
                        width={BRICK_W * 0.4}
                        height={BRICK_H}
                        rx={1}
                        fill="url(#brokenBrickGrad)"
                        animate={{ rotate: 3, y: y + 2 }}
                        style={{ transformOrigin: `${x + BRICK_W}px ${y + BRICK_H}px` }}
                        opacity={0.45}
                      />
                      {/* Crack */}
                      <line
                        x1={x + BRICK_W * 0.47}
                        y1={y}
                        x2={x + BRICK_W * 0.52}
                        y2={y + BRICK_H}
                        stroke="hsl(10, 20%, 15%)"
                        strokeWidth={1}
                        opacity={0.6}
                      />
                    </>
                  ) : (
                    <>
                      {/* Intact brick */}
                      <rect
                        x={x}
                        y={y}
                        width={BRICK_W}
                        height={BRICK_H}
                        rx={1.5}
                        fill={row % 2 === 0 ? "url(#brickGrad)" : "url(#brickGrad2)"}
                        filter="url(#brickShadow)"
                      />
                      {/* Mortar lines */}
                      <line x1={x + 2} y1={y + BRICK_H / 2} x2={x + BRICK_W - 2} y2={y + BRICK_H / 2} stroke="hsl(15, 30%, 30%)" strokeWidth={0.4} opacity={0.3} />
                      {/* Texture dots */}
                      <circle cx={x + 8} cy={y + 6} r={0.8} fill="hsl(12, 40%, 32%)" opacity={0.4} />
                      <circle cx={x + BRICK_W - 10} cy={y + 12} r={0.8} fill="hsl(12, 40%, 32%)" opacity={0.35} />
                    </>
                  )}
                  {/* Hover outline */}
                  <rect
                    x={x - 1}
                    y={y - 1}
                    width={BRICK_W + 2}
                    height={BRICK_H + 2}
                    rx={2}
                    fill="transparent"
                    stroke="transparent"
                    className="hover:stroke-neon-cyan/40 hover:stroke-1 transition-all"
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* ===== DOOR ===== */}
          {hasDoor && !isCollapsed && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <rect
                x={SVG_W / 2 - 12}
                y={WALL_BASE_Y - 2 * (BRICK_H + MORTAR) + 2}
                width={24}
                height={2 * (BRICK_H + MORTAR) - 4}
                rx={2}
                fill="url(#doorGrad)"
              />
              {/* Doorknob */}
              <circle
                cx={SVG_W / 2 + 7}
                cy={WALL_BASE_Y - (BRICK_H + MORTAR) + 2}
                r={1.8}
                fill="hsl(40, 60%, 50%)"
              />
              {/* Door frame */}
              <rect
                x={SVG_W / 2 - 13}
                y={WALL_BASE_Y - 2 * (BRICK_H + MORTAR) + 1}
                width={26}
                height={2 * (BRICK_H + MORTAR) - 3}
                rx={2}
                fill="none"
                stroke="hsl(25, 35%, 20%)"
                strokeWidth={1}
              />
            </motion.g>
          )}

          {/* ===== WINDOWS ===== */}
          {hasWindow && !isCollapsed && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              {/* Left window */}
              <rect
                x={WALL_LEFT + 8}
                y={wallTopY + (BRICK_H + MORTAR) * 2 + 3}
                width={20}
                height={16}
                rx={1.5}
                fill="hsl(210, 60%, 70%)"
                opacity={0.5}
              />
              <line
                x1={WALL_LEFT + 18}
                y1={wallTopY + (BRICK_H + MORTAR) * 2 + 3}
                x2={WALL_LEFT + 18}
                y2={wallTopY + (BRICK_H + MORTAR) * 2 + 19}
                stroke="hsl(25, 30%, 25%)"
                strokeWidth={1}
              />
              <line
                x1={WALL_LEFT + 8}
                y1={wallTopY + (BRICK_H + MORTAR) * 2 + 11}
                x2={WALL_LEFT + 28}
                y2={wallTopY + (BRICK_H + MORTAR) * 2 + 11}
                stroke="hsl(25, 30%, 25%)"
                strokeWidth={1}
              />
              <rect
                x={WALL_LEFT + 7}
                y={wallTopY + (BRICK_H + MORTAR) * 2 + 2}
                width={22}
                height={18}
                rx={2}
                fill="none"
                stroke="hsl(25, 40%, 28%)"
                strokeWidth={1.2}
              />

              {/* Right window */}
              <rect
                x={WALL_LEFT + COLS * (BRICK_W + BRICK_GAP) - 30}
                y={wallTopY + (BRICK_H + MORTAR) * 2 + 3}
                width={20}
                height={16}
                rx={1.5}
                fill="hsl(210, 60%, 70%)"
                opacity={0.5}
              />
              <line
                x1={WALL_LEFT + COLS * (BRICK_W + BRICK_GAP) - 20}
                y1={wallTopY + (BRICK_H + MORTAR) * 2 + 3}
                x2={WALL_LEFT + COLS * (BRICK_W + BRICK_GAP) - 20}
                y2={wallTopY + (BRICK_H + MORTAR) * 2 + 19}
                stroke="hsl(25, 30%, 25%)"
                strokeWidth={1}
              />
              <line
                x1={WALL_LEFT + COLS * (BRICK_W + BRICK_GAP) - 30}
                y1={wallTopY + (BRICK_H + MORTAR) * 2 + 11}
                x2={WALL_LEFT + COLS * (BRICK_W + BRICK_GAP) - 10}
                y2={wallTopY + (BRICK_H + MORTAR) * 2 + 11}
                stroke="hsl(25, 30%, 25%)"
                strokeWidth={1}
              />
              <rect
                x={WALL_LEFT + COLS * (BRICK_W + BRICK_GAP) - 31}
                y={wallTopY + (BRICK_H + MORTAR) * 2 + 2}
                width={22}
                height={18}
                rx={2}
                fill="none"
                stroke="hsl(25, 40%, 28%)"
                strokeWidth={1.2}
              />
            </motion.g>
          )}

          {/* ===== ROOF ===== */}
          {hasRoof && !isCollapsed && (
            <motion.g
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <polygon
                points={`${SVG_W / 2},${roofTopY} ${WALL_LEFT - 15},${wallTopY} ${WALL_LEFT + COLS * (BRICK_W + BRICK_GAP) + 15},${wallTopY}`}
                fill="url(#roofGrad)"
              />
              {/* Roof edge highlight */}
              <line
                x1={WALL_LEFT - 15}
                y1={wallTopY}
                x2={WALL_LEFT + COLS * (BRICK_W + BRICK_GAP) + 15}
                y2={wallTopY}
                stroke="hsl(20, 40%, 22%)"
                strokeWidth={2}
              />
              {/* Chimney */}
              <rect
                x={SVG_W / 2 + 25}
                y={roofTopY + 8}
                width={12}
                height={22}
                fill="hsl(12, 50%, 35%)"
                rx={1}
              />
              <rect
                x={SVG_W / 2 + 23}
                y={roofTopY + 6}
                width={16}
                height={4}
                fill="hsl(12, 45%, 30%)"
                rx={1}
              />
            </motion.g>
          )}

          {/* Collapse warning label */}
          {isCollapsed && (
            <motion.text
              x={SVG_W / 2}
              y={SVG_H / 2 - 20}
              textAnchor="middle"
              className="font-display text-sm"
              fill="hsl(var(--destructive))"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textShadow: "0 0 12px hsl(0 80% 50% / 0.5)" }}
            >
              ⚠️ HOUSE COLLAPSED
            </motion.text>
          )}

          {/* Complete label */}
          {isComplete && (
            <motion.text
              x={SVG_W / 2}
              y={roofTopY - 12}
              textAnchor="middle"
              className="font-display text-xs"
              fill="hsl(var(--neon-green))"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ textShadow: "0 0 10px hsl(150 80% 50% / 0.6)" }}
            >
              ✦ HOME SWEET HOME ✦
            </motion.text>
          )}
        </svg>
      </div>

      {/* Message */}
      <motion.p
        key={message}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-body text-sm text-muted-foreground italic text-center max-w-xs"
      >
        {message}
      </motion.p>

      {/* Stats */}
      <p className="font-display text-xs text-neon-cyan tracking-widest">
        STREAK: {data.streak} | BRICKS: {bricks}/{MAX_BRICKS}{brokenCount > 0 ? ` | BROKEN: ${brokenCount}` : ""}
      </p>

      {/* Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={() => { showUp(); playSound("place"); }}
          disabled={isCollapsed}
          className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ✅ I Showed Up Today
        </button>
        <button
          onClick={skip}
          disabled={isCollapsed}
          className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ❌ I Skipped Today
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

export default WallSimulation;
