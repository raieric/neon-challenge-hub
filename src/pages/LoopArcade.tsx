import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, RotateCcw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Footer from "@/components/Footer";

// ─── High Score Helpers ───
const getHigh = (key: string) => Number(localStorage.getItem(`loop-arcade-${key}`) || 0);
const setHigh = (key: string, val: number) => {
  const prev = getHigh(key);
  if (val > prev) localStorage.setItem(`loop-arcade-${key}`, String(val));
};

// ─── 1. Click Speed Test ───
const ClickSpeed = () => {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [highScore, setHighScore] = useState(() => getHigh("click"));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setPhase("running");
    setScore(0);
    setTimeLeft(10);
  };

  useEffect(() => {
    if (phase !== "running") return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  useEffect(() => {
    if (phase === "done") {
      setHigh("click", score);
      setHighScore(getHigh("click"));
    }
  }, [phase, score]);

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex items-center gap-6 text-center">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Score</p>
          <p className="text-3xl font-black font-display text-foreground">{score}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Time</p>
          <p className={`text-3xl font-black font-display ${timeLeft <= 3 && phase === "running" ? "text-destructive animate-pulse" : "text-foreground"}`}>{timeLeft}s</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Trophy className="w-3 h-3" /> Best</p>
          <p className="text-3xl font-black font-display text-neon-cyan">{highScore}</p>
        </div>
      </div>

      {phase === "idle" && (
        <Button onClick={start} size="lg" className="gap-2 mt-4">
          <Play className="w-4 h-4" /> Start
        </Button>
      )}

      {phase === "running" && (
        <button
          onClick={() => setScore((s) => s + 1)}
          className="mt-4 w-40 h-40 rounded-2xl bg-primary text-primary-foreground font-display text-2xl font-black active:scale-95 transition-transform shadow-lg hover:shadow-xl"
        >
          TAP!
        </button>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-3 mt-4 animate-fade-in">
          <p className="text-xl font-display font-bold text-foreground">{score} clicks in 10s!</p>
          <Button onClick={start} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Play Again
          </Button>
        </div>
      )}
    </div>
  );
};

// ─── 2. Color Tap Game ───
const COLORS = [
  { name: "Red", bg: "bg-red-500", text: "text-red-500" },
  { name: "Blue", bg: "bg-blue-500", text: "text-blue-500" },
  { name: "Green", bg: "bg-green-500", text: "text-green-500" },
  { name: "Yellow", bg: "bg-yellow-400", text: "text-yellow-400" },
  { name: "Purple", bg: "bg-purple-500", text: "text-purple-500" },
];

const ColorTap = () => {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [target, setTarget] = useState(COLORS[0]);
  const [options, setOptions] = useState<typeof COLORS>([]);
  const [speed, setSpeed] = useState(3000);
  const [highScore, setHighScore] = useState(() => getHigh("color"));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const newRound = useCallback((currentSpeed: number) => {
    const t = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTarget(t);
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5).slice(0, Math.min(3 + Math.floor(score / 5), 5));
    if (!shuffled.find((c) => c.name === t.name)) shuffled[0] = t;
    setOptions(shuffled.sort(() => Math.random() - 0.5));
    timerRef.current = setTimeout(() => {
      setLives((l) => l - 1);
    }, currentSpeed);
  }, [score]);

  const start = () => {
    setPhase("running");
    setScore(0);
    setLives(3);
    setSpeed(3000);
    newRound(3000);
  };

  useEffect(() => {
    if (lives <= 0 && phase === "running") {
      setPhase("done");
      setHigh("color", score);
      setHighScore(getHigh("color"));
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [lives, phase, score]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleTap = (color: typeof COLORS[0]) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (color.name === target.name) {
      const newScore = score + 1;
      setScore(newScore);
      const newSpeed = Math.max(800, 3000 - newScore * 100);
      setSpeed(newSpeed);
      newRound(newSpeed);
    } else {
      setLives((l) => l - 1);
      if (lives > 1) newRound(speed);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex items-center gap-6 text-center">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Score</p>
          <p className="text-3xl font-black font-display text-foreground">{score}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Lives</p>
          <p className="text-3xl font-black font-display text-foreground">{"❤️".repeat(Math.max(0, lives))}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Trophy className="w-3 h-3" /> Best</p>
          <p className="text-3xl font-black font-display text-neon-cyan">{highScore}</p>
        </div>
      </div>

      {phase === "idle" && (
        <Button onClick={start} size="lg" className="gap-2 mt-4">
          <Play className="w-4 h-4" /> Start
        </Button>
      )}

      {phase === "running" && (
        <div className="flex flex-col items-center gap-4 mt-4 animate-fade-in">
          <p className="font-display text-lg font-bold text-foreground">Tap: <span className={`${target.text} font-black`}>{target.name}</span></p>
          <div className="flex flex-wrap justify-center gap-3">
            {options.map((c) => (
              <button
                key={c.name}
                onClick={() => handleTap(c)}
                className={`${c.bg} w-20 h-20 rounded-xl active:scale-90 transition-transform shadow-md hover:shadow-lg`}
              />
            ))}
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-3 mt-4 animate-fade-in">
          <p className="text-xl font-display font-bold text-foreground">Score: {score}</p>
          <Button onClick={start} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Play Again
          </Button>
        </div>
      )}
    </div>
  );
};

// ─── 3. Memory Sequence ───
const MEMORY_COLORS = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-400"];

const MemorySequence = () => {
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "done">("idle");
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [highScore, setHighScore] = useState(() => getHigh("memory"));
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  useEffect(() => () => clearTimeouts(), []);

  const showSequence = (seq: number[]) => {
    setPhase("showing");
    clearTimeouts();
    seq.forEach((idx, i) => {
      const t1 = setTimeout(() => setActiveIdx(idx), i * 600);
      const t2 = setTimeout(() => setActiveIdx(null), i * 600 + 400);
      timeoutRefs.current.push(t1, t2);
    });
    const t3 = setTimeout(() => {
      setPhase("input");
      setUserInput([]);
    }, seq.length * 600 + 200);
    timeoutRefs.current.push(t3);
  };

  const start = () => {
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first);
    setRound(1);
    showSequence(first);
  };

  const handleInput = (idx: number) => {
    if (phase !== "input") return;
    const newInput = [...userInput, idx];
    setUserInput(newInput);
    setActiveIdx(idx);
    setTimeout(() => setActiveIdx(null), 200);

    if (newInput[newInput.length - 1] !== sequence[newInput.length - 1]) {
      setPhase("done");
      const score = round - 1;
      setHigh("memory", score);
      setHighScore(getHigh("memory"));
      return;
    }

    if (newInput.length === sequence.length) {
      const newSeq = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(newSeq);
      setRound((r) => r + 1);
      setTimeout(() => showSequence(newSeq), 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex items-center gap-6 text-center">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Round</p>
          <p className="text-3xl font-black font-display text-foreground">{round}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Trophy className="w-3 h-3" /> Best</p>
          <p className="text-3xl font-black font-display text-neon-cyan">{highScore}</p>
        </div>
      </div>

      {phase === "idle" && (
        <Button onClick={start} size="lg" className="gap-2 mt-4">
          <Play className="w-4 h-4" /> Start
        </Button>
      )}

      {(phase === "showing" || phase === "input") && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {MEMORY_COLORS.map((color, i) => (
            <button
              key={i}
              onClick={() => handleInput(i)}
              disabled={phase === "showing"}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-xl transition-all duration-200 shadow-md ${color} ${
                activeIdx === i ? "scale-110 brightness-150 ring-4 ring-white/50" : "opacity-60 hover:opacity-80"
              } ${phase === "showing" ? "cursor-not-allowed" : "active:scale-95"}`}
            />
          ))}
        </div>
      )}

      {phase === "showing" && (
        <p className="text-sm text-muted-foreground font-display animate-pulse mt-2">Watch the sequence...</p>
      )}
      {phase === "input" && (
        <p className="text-sm text-muted-foreground font-display mt-2">Your turn! ({userInput.length}/{sequence.length})</p>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-3 mt-4 animate-fade-in">
          <p className="text-xl font-display font-bold text-foreground">Made it to round {round}!</p>
          <Button onClick={start} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Play Again
          </Button>
        </div>
      )}
    </div>
  );
};

// ─── 4. Target Shoot ───
const TargetShoot = () => {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [target, setTarget] = useState({ x: 50, y: 50, size: 40 });
  const [highScore, setHighScore] = useState(() => getHigh("target"));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const spawnTarget = () => {
    setTarget({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 20 + Math.random() * 30,
    });
  };

  const start = () => {
    setPhase("running");
    setScore(0);
    setTimeLeft(15);
    spawnTarget();
  };

  useEffect(() => {
    if (phase !== "running") return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  useEffect(() => {
    if (phase === "done") {
      setHigh("target", score);
      setHighScore(getHigh("target"));
    }
  }, [phase, score]);

  const handleHit = () => {
    setScore((s) => s + 1);
    spawnTarget();
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex items-center gap-6 text-center">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Score</p>
          <p className="text-3xl font-black font-display text-foreground">{score}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Time</p>
          <p className={`text-3xl font-black font-display ${timeLeft <= 3 && phase === "running" ? "text-destructive animate-pulse" : "text-foreground"}`}>{timeLeft}s</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Trophy className="w-3 h-3" /> Best</p>
          <p className="text-3xl font-black font-display text-neon-cyan">{highScore}</p>
        </div>
      </div>

      {phase === "idle" && (
        <Button onClick={start} size="lg" className="gap-2 mt-4">
          <Play className="w-4 h-4" /> Start
        </Button>
      )}

      {phase === "running" && (
        <div
          ref={areaRef}
          className="relative mt-4 w-full max-w-sm h-64 sm:h-80 rounded-xl border border-border/50 bg-muted/30 overflow-hidden cursor-crosshair"
        >
          <button
            onClick={handleHit}
            className="absolute rounded-full bg-destructive shadow-lg active:scale-75 transition-transform animate-scale-in hover:brightness-125"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: target.size,
              height: target.size,
              transform: "translate(-50%, -50%)",
            }}
          >
            <span className="sr-only">Target</span>
          </button>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-3 mt-4 animate-fade-in">
          <p className="text-xl font-display font-bold text-foreground">{score} targets in 15s!</p>
          <Button onClick={start} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Play Again
          </Button>
        </div>
      )}
    </div>
  );
};

// ─── 5. Snake Escape (playable version) ───
const TAU = Math.PI * 2;
const SE_CX = 200;
const SE_CY = 200;
const SE_TRACK_R = 100;
const SE_SNAKE_LEN = 1.2;
const SE_SNAKE_SPEED = 0.012;
const SE_FROG_R = SE_TRACK_R + 40;
const SE_GAP_SIZE = 0.22;
const SE_CROAK_PROXIMITY = 0.26;

interface SEFrog {
  angle: number;
  speed: number;
  croaking: boolean;
  croakTimer: number;
  shocked: boolean;
  laughing: boolean;
}

const SnakeEscapeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [escapes, setEscapes] = useState(0);
  const [highScore, setHighScoreState] = useState(() => getHigh("snake"));
  const stateRef = useRef({
    snakeAngle: 0,
    snakeDir: 1,
    escaping: false,
    escapeProgress: 0,
    escaped: false,
    resetTimer: 0,
    confetti: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[],
    gapAngle: Math.random() * TAU,
    frogs: [
      { angle: 0, speed: -0.004, croaking: false, croakTimer: 1500 + Math.random() * 2000, shocked: false, laughing: false },
      { angle: TAU / 3, speed: -0.005, croaking: false, croakTimer: 1500 + Math.random() * 2000, shocked: false, laughing: false },
      { angle: (TAU * 2) / 3, speed: -0.003, croaking: false, croakTimer: 1500 + Math.random() * 2000, shocked: false, laughing: false },
    ] as SEFrog[],
    tonguePhase: 0,
    escapeCount: 0,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    const s = stateRef.current;
    const dt = 16;
    s.tonguePhase += 0.05;
    ctx.clearRect(0, 0, w, h);
    const scale = Math.min(w, h) / 420;
    ctx.save();
    ctx.translate(w / 2 - SE_CX * scale, h / 2 - SE_CY * scale);
    ctx.scale(scale, scale);

    // Track
    ctx.strokeStyle = "rgba(130, 80, 255, 0.15)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(SE_CX, SE_CY, SE_TRACK_R, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "rgba(130, 80, 255, 0.4)";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(130, 80, 255, 0.5)";
    ctx.shadowBlur = 12;
    const gapStart = s.gapAngle - SE_GAP_SIZE / 2;
    const gapEnd = s.gapAngle + SE_GAP_SIZE / 2;
    ctx.beginPath();
    ctx.arc(SE_CX, SE_CY, SE_TRACK_R, gapEnd, gapStart + TAU);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Gap marker
    const gx = SE_CX + Math.cos(s.gapAngle) * SE_TRACK_R;
    const gy = SE_CY + Math.sin(s.gapAngle) * SE_TRACK_R;
    ctx.fillStyle = "rgba(0, 255, 200, 0.7)";
    ctx.beginPath();
    ctx.arc(gx, gy, 5, 0, TAU);
    ctx.fill();

    // Frogs
    for (const frog of s.frogs) {
      if (!s.escaped) {
        frog.angle = (frog.angle + frog.speed) % TAU;
        if (frog.angle < 0) frog.angle += TAU;
      }
      frog.croakTimer -= dt;
      if (frog.croakTimer <= 0 && !s.escaping && !s.escaped) {
        frog.croaking = true;
        frog.croakTimer = 2500 + Math.random() * 2000;
        let diff = Math.abs(frog.angle - s.gapAngle);
        if (diff > Math.PI) diff = TAU - diff;
        if (diff < SE_CROAK_PROXIMITY) {
          s.escaping = true;
          s.snakeDir = frog.angle > s.gapAngle ? 1 : -1;
        } else {
          frog.laughing = true;
          setTimeout(() => { frog.laughing = false; }, 800);
        }
        setTimeout(() => { frog.croaking = false; }, 500);
      }
      const fx = SE_CX + Math.cos(frog.angle) * SE_FROG_R;
      const fy = SE_CY + Math.sin(frog.angle) * SE_FROG_R;
      ctx.fillStyle = frog.shocked ? "#ffcc00" : "#44cc44";
      ctx.beginPath();
      ctx.ellipse(fx, fy, 10, 8, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(fx - 4, fy - 6, 3, 0, TAU);
      ctx.arc(fx + 4, fy - 6, 3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(fx - 4, fy - 6, 1.5, 0, TAU);
      ctx.arc(fx + 4, fy - 6, 1.5, 0, TAU);
      ctx.fill();
      if (frog.shocked) {
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(fx, fy + 2, 3, 0, TAU);
        ctx.stroke();
      } else if (frog.laughing) {
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0.1, Math.PI - 0.1);
        ctx.stroke();
      }
      if (frog.croaking) {
        ctx.strokeStyle = "rgba(68, 204, 68, 0.4)";
        ctx.lineWidth = 1.5;
        const pulseR = 12 + 6 * Math.sin(Date.now() * 0.01);
        ctx.beginPath();
        ctx.arc(fx, fy, pulseR, 0, TAU);
        ctx.stroke();
      }
    }

    // Snake logic
    if (s.escaping && !s.escaped) {
      let diff = s.gapAngle - s.snakeAngle;
      if (diff > Math.PI) diff -= TAU;
      if (diff < -Math.PI) diff += TAU;
      if (Math.abs(diff) < 0.05) {
        s.escaped = true;
        s.escapeProgress = 0;
        s.resetTimer = 3000;
        s.escapeCount++;
        setEscapes(s.escapeCount);
        setHigh("snake", s.escapeCount);
        setHighScoreState(getHigh("snake"));
        s.frogs.forEach(f => { f.shocked = true; });
        for (let i = 0; i < 30; i++) {
          s.confetti.push({
            x: gx, y: gy,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: ["#ff0", "#0ff", "#f0f", "#0f0", "#f90"][Math.floor(Math.random() * 5)],
            life: 70,
          });
        }
      } else {
        s.snakeAngle += Math.sign(diff) * SE_SNAKE_SPEED * 2.5;
      }
    } else if (!s.escaped) {
      s.snakeAngle = (s.snakeAngle + SE_SNAKE_SPEED * s.snakeDir) % TAU;
    }

    // Draw snake
    if (!s.escaped) {
      const segments = 25;
      ctx.lineCap = "round";
      for (let i = segments; i >= 0; i--) {
        const t = i / segments;
        const a = s.snakeAngle - t * SE_SNAKE_LEN * s.snakeDir;
        const sx2 = SE_CX + Math.cos(a) * SE_TRACK_R;
        const sy2 = SE_CY + Math.sin(a) * SE_TRACK_R;
        const thickness = 3 + (1 - t) * 5;
        const green = Math.floor(100 + (1 - t) * 100);
        ctx.fillStyle = `rgb(${30 + t * 40}, ${green}, ${50})`;
        ctx.beginPath();
        ctx.arc(sx2, sy2, thickness, 0, TAU);
        ctx.fill();
      }
      const hx = SE_CX + Math.cos(s.snakeAngle) * SE_TRACK_R;
      const hy = SE_CY + Math.sin(s.snakeAngle) * SE_TRACK_R;
      const headWobble = Math.sin(s.tonguePhase * 2) * 0.8;
      ctx.fillStyle = "#22aa33";
      ctx.beginPath();
      ctx.arc(hx + headWobble, hy, 7, 0, TAU);
      ctx.fill();
      const eyeAngle = s.snakeAngle + (s.snakeDir > 0 ? 0.3 : -0.3);
      ctx.fillStyle = "#ff0";
      ctx.beginPath();
      ctx.arc(hx + Math.cos(eyeAngle) * 3, hy + Math.sin(eyeAngle) * 3 - 2, 2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(hx + Math.cos(eyeAngle) * 3, hy + Math.sin(eyeAngle) * 3 - 2, 0.8, 0, TAU);
      ctx.fill();
      if (Math.sin(s.tonguePhase) > 0.5) {
        const tongueDir = s.snakeAngle;
        ctx.strokeStyle = "#ff3333";
        ctx.lineWidth = 1;
        const tLen = 8 + Math.sin(s.tonguePhase * 3) * 3;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        const tx = hx + Math.cos(tongueDir) * tLen;
        const ty = hy + Math.sin(tongueDir) * tLen;
        ctx.lineTo(tx, ty);
        ctx.lineTo(tx + Math.cos(tongueDir + 0.4) * 3, ty + Math.sin(tongueDir + 0.4) * 3);
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + Math.cos(tongueDir - 0.4) * 3, ty + Math.sin(tongueDir - 0.4) * 3);
        ctx.stroke();
      }
    } else {
      s.escapeProgress += 0.02;
      const escR = SE_TRACK_R + s.escapeProgress * 60;
      if (s.escapeProgress < 1) {
        const hx = SE_CX + Math.cos(s.gapAngle) * escR;
        const hy = SE_CY + Math.sin(s.gapAngle) * escR;
        ctx.fillStyle = "#22aa33";
        ctx.globalAlpha = 1 - s.escapeProgress;
        ctx.beginPath();
        ctx.arc(hx, hy, 6, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      s.resetTimer -= dt;
      if (s.resetTimer <= 0) {
        s.snakeAngle = Math.random() * TAU;
        s.snakeDir = 1;
        s.escaping = false;
        s.escaped = false;
        s.escapeProgress = 0;
        s.confetti = [];
        s.gapAngle = Math.random() * TAU;
        s.frogs.forEach(f => {
          f.shocked = false;
          f.laughing = false;
          f.angle = Math.random() * TAU;
        });
      }
    }

    // Confetti
    s.confetti = s.confetti.filter(c => {
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.05;
      c.life--;
      ctx.fillStyle = c.color;
      ctx.globalAlpha = c.life / 70;
      ctx.fillRect(c.x - 2, c.y - 2, 4, 4);
      ctx.globalAlpha = 1;
      return c.life > 0;
    });

    ctx.restore();
  }, []);

  useEffect(() => {
    let raf: number;
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex items-center gap-6 text-center">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Escapes</p>
          <p className="text-3xl font-black font-display text-foreground">{escapes}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Trophy className="w-3 h-3" /> Best</p>
          <p className="text-3xl font-black font-display text-neon-cyan">{highScore}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-body">Watch the snake escape when a frog croaks near the gap!</p>
      <canvas
        ref={canvasRef}
        className="w-full max-w-sm h-72 sm:h-80 rounded-xl border border-border/30"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
};

// ─── Main Page ───
const LoopArcade = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-display text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>

        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-black font-display text-foreground mb-2">🕹️ Loop Arcade</h1>
          <p className="text-muted-foreground font-body">Quick mini games. Beat your high scores.</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card shadow-xl overflow-hidden">
          <Tabs defaultValue="click" className="w-full">
            <TabsList className="w-full grid grid-cols-5 rounded-none h-12 bg-muted/50">
              <TabsTrigger value="click" className="font-display text-xs sm:text-sm font-semibold data-[state=active]:shadow-md transition-all">⚡ Click</TabsTrigger>
              <TabsTrigger value="color" className="font-display text-xs sm:text-sm font-semibold data-[state=active]:shadow-md transition-all">🎨 Color</TabsTrigger>
              <TabsTrigger value="memory" className="font-display text-xs sm:text-sm font-semibold data-[state=active]:shadow-md transition-all">🧠 Memory</TabsTrigger>
              <TabsTrigger value="target" className="font-display text-xs sm:text-sm font-semibold data-[state=active]:shadow-md transition-all">🎯 Target</TabsTrigger>
              <TabsTrigger value="snake" className="font-display text-xs sm:text-sm font-semibold data-[state=active]:shadow-md transition-all">🐍 Snake</TabsTrigger>
            </TabsList>
            <TabsContent value="click" className="p-4 sm:p-6">
              <ClickSpeed />
            </TabsContent>
            <TabsContent value="color" className="p-4 sm:p-6">
              <ColorTap />
            </TabsContent>
            <TabsContent value="memory" className="p-4 sm:p-6">
              <MemorySequence />
            </TabsContent>
            <TabsContent value="target" className="p-4 sm:p-6">
              <TargetShoot />
            </TabsContent>
            <TabsContent value="snake" className="p-4 sm:p-6">
              <SnakeEscapeGame />
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-12">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default LoopArcade;
