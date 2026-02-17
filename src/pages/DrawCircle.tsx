import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "@/components/Confetti";

interface Point {
  x: number;
  y: number;
}

type Phase = "idle" | "drawing" | "result";

const DrawCircle = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const animFrameRef = useRef<number>(0);

  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const s = localStorage.getItem("circle-best");
    return s ? parseFloat(s) : 0;
  });
  const [attempts, setAttempts] = useState(() => {
    const a = localStorage.getItem("circle-attempts");
    return a ? parseInt(a) : 0;
  });
  const [avgScore, setAvgScore] = useState(() => {
    const a = localStorage.getItem("circle-avg");
    return a ? parseFloat(a) : 0;
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [classroomMode, setClassroomMode] = useState(false);
  const [idealCircle, setIdealCircle] = useState<{ cx: number; cy: number; r: number } | null>(null);
  const [showIdeal, setShowIdeal] = useState(false);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  useEffect(() => {
    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, [setupCanvas]);

  const getScoreColor = (s: number) => {
    if (s >= 90) return "hsl(150, 80%, 50%)";
    if (s >= 70) return "hsl(50, 90%, 55%)";
    if (s >= 50) return "hsl(30, 90%, 55%)";
    return "hsl(0, 80%, 55%)";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 98) return "INHUMAN PRECISION";
    if (s >= 95) return "Nearly Perfect!";
    if (s >= 90) return "Excellent!";
    if (s >= 80) return "Great Job!";
    if (s >= 70) return "Not Bad!";
    if (s >= 50) return "Keep Practicing";
    if (s >= 30) return "Needs Work";
    return "Try Again...";
  };

  const drawStroke = useCallback((points: Point[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || points.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Calculate current center and radius for real-time color feedback
    let cx = 0, cy = 0;
    points.forEach(p => { cx += p.x; cy += p.y; });
    cx /= points.length;
    cy /= points.length;
    const distances = points.map(p => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2));
    const meanR = distances.reduce((a, b) => a + b, 0) / distances.length;

    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];

      // Color based on deviation from mean radius
      const dist = Math.sqrt((p1.x - cx) ** 2 + (p1.y - cy) ** 2);
      const dev = Math.abs(dist - meanR) / (meanR || 1);
      const hue = Math.max(0, 150 - dev * 600); // green → red

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `hsl(${hue}, 85%, 55%)`;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = `hsl(${hue}, 85%, 55%)`;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, []);

  const drawIdealOverlay = useCallback((cx: number, cy: number, r: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "hsla(185, 80%, 50%, 0.4)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  const drawHeatmap = useCallback((points: Point[], cx: number, cy: number, meanR: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    points.forEach(p => {
      const dist = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
      const dev = Math.abs(dist - meanR);
      const intensity = Math.min(1, dev / (meanR * 0.3));
      const radius = 6 + intensity * 10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${Math.max(0, 60 - intensity * 60)}, 90%, 50%, ${0.1 + intensity * 0.3})`;
      ctx.fill();
    });
  }, []);

  const calculateScore = useCallback((points: Point[]) => {
    if (points.length < 10) return 0;

    let cx = 0, cy = 0;
    points.forEach(p => { cx += p.x; cy += p.y; });
    cx /= points.length;
    cy /= points.length;

    const distances = points.map(p => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2));
    const meanRadius = distances.reduce((a, b) => a + b, 0) / distances.length;

    if (meanRadius < 20) return 0;

    const avgError = distances.reduce((sum, d) => sum + Math.abs(d - meanRadius), 0) / distances.length;
    const rawScore = Math.max(0, 100 - (avgError / meanRadius) * 100);

    // Bonus: check if shape is closed
    const first = points[0];
    const last = points[points.length - 1];
    const closeDist = Math.sqrt((first.x - last.x) ** 2 + (first.y - last.y) ** 2);
    const closureBonus = closeDist < meanRadius * 0.3 ? 2 : -(closeDist / meanRadius) * 5;

    const finalScore = Math.max(0, Math.min(100, rawScore + closureBonus));
    return Math.round(finalScore * 10) / 10;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (phase !== "idle") return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointsRef.current = [{ x, y }];
    setPhase("drawing");
    setShowConfetti(false);
    setIdealCircle(null);
    setShowIdeal(false);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }
  }, [phase]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (phase !== "drawing") return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointsRef.current.push({ x, y });

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      drawStroke(pointsRef.current);
    });
  }, [phase, drawStroke]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (phase !== "drawing") return;
    e.preventDefault();

    const points = pointsRef.current;
    const s = calculateScore(points);
    setScore(s);

    // Compute ideal circle
    let cx = 0, cy = 0;
    points.forEach(p => { cx += p.x; cy += p.y; });
    cx /= points.length;
    cy /= points.length;
    const distances = points.map(p => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2));
    const meanR = distances.reduce((a, b) => a + b, 0) / distances.length;
    setIdealCircle({ cx, cy, r: meanR });

    // Heatmap
    drawHeatmap(points, cx, cy, meanR);

    // Stats
    const newAttempts = attempts + 1;
    const newAvg = ((avgScore * attempts) + s) / newAttempts;
    const newBest = Math.max(bestScore, s);

    setAttempts(newAttempts);
    setAvgScore(Math.round(newAvg * 10) / 10);
    setBestScore(newBest);

    localStorage.setItem("circle-attempts", String(newAttempts));
    localStorage.setItem("circle-avg", String(Math.round(newAvg * 10) / 10));
    localStorage.setItem("circle-best", String(newBest));

    if (s >= 95) setShowConfetti(true);

    setPhase("result");
  }, [phase, calculateScore, drawHeatmap, attempts, avgScore, bestScore]);

  useEffect(() => {
    if (phase === "result" && showIdeal && idealCircle) {
      drawStroke(pointsRef.current);
      drawHeatmap(pointsRef.current, idealCircle.cx, idealCircle.cy, idealCircle.r);
      drawIdealOverlay(idealCircle.cx, idealCircle.cy, idealCircle.r);
    }
  }, [showIdeal, phase, idealCircle, drawStroke, drawHeatmap, drawIdealOverlay]);

  const reset = () => {
    setPhase("idle");
    setScore(0);
    setShowConfetti(false);
    setIdealCircle(null);
    setShowIdeal(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden select-none" style={{ touchAction: "none" }}>
      {showConfetti && <Confetti />}

      {/* Subtle bg texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
        backgroundSize: "32px 32px"
      }} />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: phase === "idle" ? "crosshair" : phase === "drawing" ? "none" : "default" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <button
          onClick={() => navigate("/")}
          className="pointer-events-auto font-display text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
        >
          ← ARENA
        </button>

        {classroomMode && (
          <div className="flex gap-4 font-body text-sm text-muted-foreground">
            <span>Attempts: <span className="text-foreground font-semibold">{attempts}</span></span>
            <span>Best: <span className="text-neon-green font-semibold">{bestScore}%</span></span>
            <span>Avg: <span className="text-neon-cyan font-semibold">{avgScore}%</span></span>
          </div>
        )}

        <button
          onClick={() => setClassroomMode(!classroomMode)}
          className={`pointer-events-auto font-display text-xs tracking-wider px-3 py-1.5 rounded-full border transition-all ${
            classroomMode
              ? "border-neon-green/50 text-neon-green bg-neon-green/10"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          🎓 {classroomMode ? "CLASS ON" : "CLASS OFF"}
        </button>
      </div>

      {/* Idle screen */}
      <AnimatePresence>
        {phase === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
          >
            <motion.p
              className="font-display text-xl sm:text-2xl text-muted-foreground/70 mb-8 tracking-wider"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Can you draw a <span className="text-foreground">PERFECT</span> circle?
            </motion.p>

            {/* Pulsing ring */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-neon-purple/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-neon-cyan/40"
                animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.05, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-lg text-muted-foreground/50 tracking-widest">DRAW</span>
              </div>
            </div>

            <p className="mt-8 font-body text-sm text-muted-foreground/40">
              Click and drag to draw
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result overlay */}
      <AnimatePresence>
        {phase === "result" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className={`text-center pointer-events-auto ${score < 40 ? "animate-[rickroll-shake_0.3s_ease-in-out_3]" : ""}`}
            >
              <div
                className="glass-panel px-10 py-8 sm:px-14 sm:py-10 rounded-2xl"
                style={{ boxShadow: `0 0 60px ${getScoreColor(score)}33` }}
              >
                <motion.p
                  className="font-display text-5xl sm:text-7xl font-black tracking-tight"
                  style={{ color: getScoreColor(score) }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1, damping: 10 }}
                >
                  {score}%
                </motion.p>
                <p className="font-display text-sm sm:text-base tracking-widest text-muted-foreground mt-2 uppercase">
                  {getScoreLabel(score)}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => setShowIdeal(!showIdeal)}
                    className="px-4 py-2 rounded-lg font-display text-xs tracking-wider border border-border text-muted-foreground hover:text-foreground hover:border-neon-cyan/50 transition-all"
                  >
                    {showIdeal ? "HIDE" : "SHOW"} IDEAL
                  </button>
                  <button
                    onClick={reset}
                    className="px-6 py-2 rounded-lg font-display text-sm tracking-wider bg-neon-purple/20 border border-neon-purple/40 text-foreground hover:bg-neon-purple/30 transition-all"
                  >
                    TRY AGAIN
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 rounded-lg font-display text-xs tracking-wider border border-border text-muted-foreground hover:text-foreground transition-all"
                  >
                    BACK
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DrawCircle;
