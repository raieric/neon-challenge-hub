import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreakStorage } from "../hooks/useStreakStorage";
import Confetti from "@/components/Confetti";

const COLS = 5;
const MAX_ROWS = 4;
const MAX_BRICKS = COLS * MAX_ROWS;
const BRICK_W = 36;
const BRICK_H = 14;
const BRICK_GAP = 3;
const MORTAR = 3;

const SVG_W = 220;
const SVG_H = 220;
const WALL_BASE_Y = SVG_H - 16;
const ROW_H = BRICK_H + MORTAR;
const TOTAL_WALL_W = COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP;
const WALL_LEFT = (SVG_W - TOTAL_WALL_W) / 2;

const playSound = (type: "place" | "break" | "collapse" | "success") => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === "place") {
      osc.type = "sine"; osc.frequency.value = 350; gain.gain.value = 0.08;
      osc.start(); setTimeout(() => { osc.frequency.value = 440; }, 80);
      setTimeout(() => { osc.stop(); ctx.close(); }, 200);
    } else if (type === "break") {
      osc.type = "sawtooth"; osc.frequency.value = 250; gain.gain.value = 0.1;
      osc.start(); setTimeout(() => { osc.frequency.value = 180; }, 100);
      setTimeout(() => { osc.stop(); ctx.close(); }, 250);
    } else if (type === "collapse") {
      osc.type = "sawtooth"; osc.frequency.value = 200; gain.gain.value = 0.15;
      osc.start(); setTimeout(() => { osc.frequency.value = 60; }, 400);
      setTimeout(() => { osc.stop(); ctx.close(); }, 700);
    } else {
      osc.type = "sine"; osc.frequency.value = 523; gain.gain.value = 0.12;
      osc.start(); setTimeout(() => { osc.frequency.value = 659; }, 150);
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

  const hasDoor = totalRows >= 2;
  const hasWindow = totalRows >= 3;
  const hasRoof = bricks >= MAX_BRICKS;

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
      if (next.has(index)) next.delete(index);
      else { next.add(index); playSound("break"); }
      return next;
    });
  }, [isCollapsed]);

  const handleReset = useCallback(() => {
    setBrokenBricks(new Set());
    setShowConfetti(false);
    reset();
  }, [reset]);

  const brickPositions = useMemo(() => {
    return Array.from({ length: bricks }, (_, i) => {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const offset = row % 2 === 1 ? (BRICK_W + BRICK_GAP) / 2 - BRICK_GAP : 0;
      const x = WALL_LEFT + col * (BRICK_W + BRICK_GAP) + offset;
      const y = WALL_BASE_Y - (row + 1) * ROW_H;
      return { index: i, row, col, x, y };
    });
  }, [bricks]);

  const wallTopY = WALL_BASE_Y - totalRows * ROW_H;
  const roofPeakY = wallTopY - 36;

  const message = useMemo(() => {
    if (isCollapsed) return "💥 House collapsed! Too many broken bricks.";
    if (isComplete) return "🏠 House complete! Consistency built this.";
    if (bricks === 0) return "Lay your first brick.";
    if (totalRows <= 1) return "Foundation forming. Keep going.";
    if (totalRows <= 2) return "Walls rising. Brick by brick.";
    if (totalRows <= 3) return "Almost there. Keep stacking.";
    return "Final layer. The roof awaits.";
  }, [isCollapsed, isComplete, bricks, totalRows]);

  return (
    <div className="flex flex-col items-center gap-4">
      {showConfetti && <Confetti />}

      <div className="relative" style={{ width: SVG_W, height: SVG_H }}>
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
          <defs>
            <linearGradient id="hBrick1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(15,60%,45%)" />
              <stop offset="100%" stopColor="hsl(10,50%,35%)" />
            </linearGradient>
            <linearGradient id="hBrick2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(18,58%,42%)" />
              <stop offset="100%" stopColor="hsl(8,52%,38%)" />
            </linearGradient>
            <linearGradient id="hBroken" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(15,30%,28%)" />
              <stop offset="100%" stopColor="hsl(10,25%,20%)" />
            </linearGradient>
            <linearGradient id="hRoof" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(20,50%,32%)" />
              <stop offset="100%" stopColor="hsl(15,45%,24%)" />
            </linearGradient>
            <linearGradient id="hDoor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(30,50%,32%)" />
              <stop offset="100%" stopColor="hsl(25,45%,22%)" />
            </linearGradient>
            <filter id="hShadow">
              <feDropShadow dx="0.5" dy="0.8" stdDeviation="0.5" floodColor="rgba(0,0,0,0.25)" />
            </filter>
          </defs>

          {/* Ground line */}
          <line x1={20} y1={WALL_BASE_Y + 1} x2={SVG_W - 20} y2={WALL_BASE_Y + 1} stroke="hsl(30,15%,20%)" strokeWidth={1.5} opacity={0.5} />

          {/* BRICKS */}
          <AnimatePresence>
            {brickPositions.map(({ index: i, row, x, y }) => {
              const isBroken = brokenBricks.has(i);

              if (isCollapsed) {
                return (
                  <motion.rect
                    key={`b-${i}`}
                    width={BRICK_W} height={BRICK_H} rx={1.5}
                    fill="url(#hBroken)"
                    initial={{ x, y }}
                    animate={{
                      x: x + Math.cos(i * 2.3) * 25,
                      y: WALL_BASE_Y - 8 + Math.random() * 6,
                      rotate: Math.sin(i * 3.7) * 35,
                      opacity: 0.35,
                    }}
                    transition={{ duration: 0.7, delay: i * 0.025, ease: "easeIn" }}
                  />
                );
              }

              return (
                <motion.g
                  key={`b-${i}`}
                  initial={{ opacity: 0, y: y + 12 }}
                  animate={{ opacity: 1, y }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.025 }}
                  onClick={() => toggleBrick(i)}
                  className="cursor-pointer"
                >
                  {isBroken ? (
                    <>
                      <motion.rect x={x} y={y} width={BRICK_W * 0.43} height={BRICK_H} rx={1}
                        fill="url(#hBroken)" animate={{ rotate: -5, y: y + 2 }}
                        style={{ transformOrigin: `${x}px ${y + BRICK_H}px` }} opacity={0.5}
                      />
                      <motion.rect x={x + BRICK_W * 0.55} y={y} width={BRICK_W * 0.4} height={BRICK_H} rx={1}
                        fill="url(#hBroken)" animate={{ rotate: 4, y: y + 1.5 }}
                        style={{ transformOrigin: `${x + BRICK_W}px ${y + BRICK_H}px` }} opacity={0.45}
                      />
                      <line x1={x + BRICK_W * 0.46} y1={y} x2={x + BRICK_W * 0.53} y2={y + BRICK_H}
                        stroke="hsl(10,20%,14%)" strokeWidth={0.8} opacity={0.5}
                      />
                    </>
                  ) : (
                    <>
                      <rect x={x} y={y} width={BRICK_W} height={BRICK_H} rx={1.5}
                        fill={row % 2 === 0 ? "url(#hBrick1)" : "url(#hBrick2)"}
                        filter="url(#hShadow)"
                      />
                      <line x1={x + 2} y1={y + BRICK_H * 0.5} x2={x + BRICK_W - 2} y2={y + BRICK_H * 0.5}
                        stroke="hsl(15,30%,30%)" strokeWidth={0.3} opacity={0.25}
                      />
                    </>
                  )}
                  <rect x={x - 1} y={y - 1} width={BRICK_W + 2} height={BRICK_H + 2} rx={2}
                    fill="transparent" className="hover:fill-[rgba(255,255,255,0.05)]"
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* DOOR */}
          {hasDoor && !isCollapsed && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <rect x={SVG_W / 2 - 10} y={WALL_BASE_Y - 2 * ROW_H + 3}
                width={20} height={2 * ROW_H - 5} rx={1.5} fill="url(#hDoor)"
              />
              <circle cx={SVG_W / 2 + 5} cy={WALL_BASE_Y - ROW_H + 2} r={1.5} fill="hsl(40,60%,50%)" />
              <rect x={SVG_W / 2 - 11} y={WALL_BASE_Y - 2 * ROW_H + 2}
                width={22} height={2 * ROW_H - 4} rx={2} fill="none" stroke="hsl(25,35%,20%)" strokeWidth={0.8}
              />
            </motion.g>
          )}

          {/* WINDOWS */}
          {hasWindow && !isCollapsed && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              {[WALL_LEFT + 6, WALL_LEFT + TOTAL_WALL_W - 22].map((wx, idx) => {
                const wy = wallTopY + ROW_H + 2;
                return (
                  <g key={`win-${idx}`}>
                    <rect x={wx} y={wy} width={16} height={13} rx={1} fill="hsl(210,50%,65%)" opacity={0.45} />
                    <line x1={wx + 8} y1={wy} x2={wx + 8} y2={wy + 13} stroke="hsl(25,30%,22%)" strokeWidth={0.8} />
                    <line x1={wx} y1={wy + 6.5} x2={wx + 16} y2={wy + 6.5} stroke="hsl(25,30%,22%)" strokeWidth={0.8} />
                    <rect x={wx - 0.5} y={wy - 0.5} width={17} height={14} rx={1.5} fill="none" stroke="hsl(25,40%,26%)" strokeWidth={0.8} />
                  </g>
                );
              })}
            </motion.g>
          )}

          {/* ROOF */}
          {hasRoof && !isCollapsed && (
            <motion.g initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <polygon
                points={`${SVG_W / 2},${roofPeakY} ${WALL_LEFT - 12},${wallTopY} ${WALL_LEFT + TOTAL_WALL_W + 12},${wallTopY}`}
                fill="url(#hRoof)"
              />
              <line x1={WALL_LEFT - 12} y1={wallTopY} x2={WALL_LEFT + TOTAL_WALL_W + 12} y2={wallTopY}
                stroke="hsl(20,40%,20%)" strokeWidth={1.5}
              />
              {/* Chimney */}
              <rect x={SVG_W / 2 + 20} y={roofPeakY + 6} width={10} height={18} fill="hsl(12,50%,33%)" rx={1} />
              <rect x={SVG_W / 2 + 18} y={roofPeakY + 4} width={14} height={4} fill="hsl(12,45%,28%)" rx={1} />
            </motion.g>
          )}

          {/* Collapse label */}
          {isCollapsed && (
            <motion.text x={SVG_W / 2} y={SVG_H / 2 - 10} textAnchor="middle"
              className="font-display text-xs" fill="hsl(var(--destructive))"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textShadow: "0 0 10px hsl(0 80% 50% / 0.5)" }}
            >
              ⚠️ HOUSE COLLAPSED
            </motion.text>
          )}

          {/* Complete label */}
          {isComplete && (
            <motion.text x={SVG_W / 2} y={roofPeakY - 8} textAnchor="middle"
              className="font-display text-xs" fill="hsl(var(--neon-green))"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ textShadow: "0 0 8px hsl(150 80% 50% / 0.5)" }}
            >
              ✦ HOME SWEET HOME ✦
            </motion.text>
          )}
        </svg>
      </div>

      {/* Message */}
      <motion.p key={message} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
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
        <button onClick={() => { showUp(); playSound("place"); }} disabled={isCollapsed}
          className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ✅ I Showed Up Today
        </button>
        <button onClick={skip} disabled={isCollapsed}
          className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ❌ I Skipped Today
        </button>
        <button onClick={handleReset}
          className="px-5 py-2.5 rounded-lg font-display text-sm font-bold bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-all"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default WallSimulation;
