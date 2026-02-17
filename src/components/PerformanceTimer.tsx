import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

interface PerformanceTimerProps {
  challenge: string;
  onBack: () => void;
}

const TOTAL_SECONDS = 60;

const PerformanceTimer = ({ challenge, onBack }: PerformanceTimerProps) => {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          setIsDone(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  const reset = useCallback(() => {
    setRemaining(TOTAL_SECONDS);
    setIsRunning(false);
    setIsDone(false);
  }, []);

  const progress = remaining / TOTAL_SECONDS;
  const size = 200;
  const strokeWidth = 6;
  const r = size / 2 - strokeWidth - 4;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Color based on remaining time
  const getColor = () => {
    if (remaining > 30) return "hsl(150, 80%, 50%)"; // green
    if (remaining > 10) return "hsl(45, 90%, 55%)";  // yellow
    return "hsl(0, 84%, 60%)";                        // red
  };

  const timerColor = getColor();

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in" style={{ animation: "result-appear 0.6s ease-out forwards" }}>
      {/* Challenge title */}
      <div className="glass-panel px-8 sm:px-12 py-4 sm:py-5 neon-glow-purple text-center animate-pulse-glow">
        <h2 className="font-display text-xl sm:text-3xl md:text-4xl font-black text-foreground">
          {challenge}
        </h2>
      </div>

      {/* Circular Timer */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="hsl(230, 20%, 18%)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={timerColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: `drop-shadow(0 0 10px ${timerColor})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-display text-3xl sm:text-4xl font-black tabular-nums ${
              isDone ? "text-destructive animate-pulse" : "text-foreground"
            }`}
            style={!isDone ? { color: timerColor, textShadow: `0 0 12px ${timerColor}` } : undefined}
          >
            {isDone ? "⏰" : timeStr}
          </span>
          <span className="font-body text-xs text-muted-foreground uppercase tracking-wider mt-1">
            {isDone ? "Time's Up!" : "remaining"}
          </span>
        </div>
      </div>

      {/* Instruction label */}
      <p className="font-body text-sm text-muted-foreground text-center max-w-xs">
        Complete your challenge within the time limit.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {!isRunning && !isDone && (
          <button
            onClick={() => setIsRunning(true)}
            className="px-6 py-2.5 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 transition-all"
          >
            ▶ Start Timer
          </button>
        )}
        {isRunning && (
          <button
            onClick={() => setIsRunning(false)}
            className="px-6 py-2.5 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-destructive/50 text-destructive hover:bg-destructive/10 transition-all"
          >
            ⏸ Pause
          </button>
        )}
        <button
          onClick={reset}
          className="px-6 py-2.5 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 transition-all"
        >
          🔁 Reset
        </button>
        <button
          onClick={onBack}
          className="px-6 py-2.5 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-muted-foreground/50 text-muted-foreground hover:bg-muted/30 transition-all"
        >
          🎡 Spin Again
        </button>
        <Link
          to="/"
          className="px-6 py-2.5 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-muted-foreground/50 text-muted-foreground hover:bg-muted/30 transition-all"
        >
          ⬅ Back to Home
        </Link>
      </div>

      {/* Time's up flash */}
      {isDone && (
        <div className="font-display text-2xl sm:text-3xl font-black text-destructive animate-pulse text-center">
          ⏰ TIME'S UP! ⏰
        </div>
      )}
    </div>
  );
};

export default PerformanceTimer;
