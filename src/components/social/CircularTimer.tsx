import { useState, useEffect, useCallback } from "react";

interface CircularTimerProps {
  seconds: number;
  size?: number;
  autoStart?: boolean;
  onComplete?: () => void;
  color?: string;
}

const CircularTimer = ({
  seconds,
  size = 160,
  autoStart = false,
  onComplete,
  color = "hsl(185, 80%, 50%)",
}: CircularTimerProps) => {
  const [remaining, setRemaining] = useState(seconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    setRemaining(seconds);
    setIsRunning(autoStart);
  }, [seconds, autoStart]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, remaining, onComplete]);

  const progress = seconds > 0 ? remaining / seconds : 0;
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const offset = circumference * (1 - progress);
  const isLow = remaining <= 5 && remaining > 0;
  const isDone = remaining === 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            fill="none"
            stroke="hsl(230, 20%, 18%)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            fill="none"
            stroke={isLow ? "hsl(0, 84%, 60%)" : color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: `drop-shadow(0 0 8px ${isLow ? "hsl(0, 84%, 60%)" : color})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-display text-3xl sm:text-4xl font-black tabular-nums ${
              isDone ? "text-neon-green" : isLow ? "text-destructive animate-pulse" : "text-foreground"
            }`}
          >
            {isDone ? "✓" : remaining}
          </span>
          <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">
            {isDone ? "Done!" : "seconds"}
          </span>
        </div>
      </div>

      {!isRunning && remaining > 0 && (
        <button
          onClick={() => setIsRunning(true)}
          className="px-6 py-2 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 transition-all"
        >
          ▶ START TIMER
        </button>
      )}
      {isRunning && (
        <button
          onClick={() => setIsRunning(false)}
          className="px-6 py-2 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-destructive/50 text-destructive hover:bg-destructive/10 transition-all"
        >
          ⏸ PAUSE
        </button>
      )}
      {isDone && (
        <span className="font-display text-lg font-black text-neon-green animate-pulse">⏰ TIME'S UP!</span>
      )}
    </div>
  );
};

export default CircularTimer;
