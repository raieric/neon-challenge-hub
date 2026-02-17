import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import ParticleBackground from "@/components/ParticleBackground";
import Confetti from "@/components/Confetti";
import ThemeToggle from "@/components/ThemeToggle";

const SEGMENTS = [
  { label: "🎤 Speak like a news reporter for 30 seconds", color: "hsl(270, 80%, 55%)", timer: 30 },
  { label: "🇺🇸 Introduce yourself in American accent", color: "hsl(185, 80%, 45%)", timer: 60 },
  { label: "🎬 Act like a startup founder pitching your idea", color: "hsl(320, 80%, 55%)", timer: 60 },
  { label: "🧠 Describe your dream job in 60 seconds", color: "hsl(220, 90%, 55%)", timer: 60 },
  { label: "🎙 Explain recursion like you're 5 years old", color: "hsl(270, 80%, 55%)", timer: 60 },
  { label: "🎭 Mimic a professor teaching programming", color: "hsl(185, 80%, 45%)", timer: 30 },
  { label: "📢 Motivate the class in 30 seconds", color: "hsl(320, 80%, 55%)", timer: 30 },
  { label: "💻 Write the code", color: "hsl(220, 90%, 55%)", timer: 0 },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;

// Helper to wrap text into lines
const wrapText = (text: string, maxChars: number): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current.length + word.length + 1 > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current);
  return lines;
};

// Countdown Timer Component
const CountdownTimer = ({ seconds, onComplete }: { seconds: number; onComplete: () => void }) => {
  const [remaining, setRemaining] = useState(seconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setRemaining(seconds);
    setIsRunning(false);
  }, [seconds]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          onComplete();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, remaining, onComplete]);

  const progress = seconds > 0 ? remaining / seconds : 0;
  const isLow = remaining <= 5 && remaining > 0;

  if (seconds === 0) return null;

  return (
    <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-md">
      <div className="flex items-center gap-3">
        <span className={`font-display text-3xl sm:text-5xl font-black tabular-nums ${isLow ? "text-destructive animate-pulse" : "text-neon-cyan"}`}>
          {String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}
        </span>
      </div>

      {/* Timer bar */}
      <div className="w-full h-3 rounded-full bg-muted overflow-hidden border border-border">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progress * 100}%`,
            background: isLow
              ? "hsl(0, 84%, 60%)"
              : "linear-gradient(90deg, hsl(270, 80%, 60%), hsl(185, 80%, 50%))",
            boxShadow: isLow
              ? "0 0 12px hsl(0, 84%, 60%)"
              : "0 0 12px hsl(270, 80%, 60%, 0.5)",
          }}
        />
      </div>

      {!isRunning && remaining > 0 && (
        <button
          onClick={() => setIsRunning(true)}
          className="mt-2 px-6 py-2 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 transition-all"
        >
          ▶ START TIMER
        </button>
      )}
      {isRunning && (
        <button
          onClick={() => setIsRunning(false)}
          className="mt-2 px-6 py-2 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-destructive/50 text-destructive hover:bg-destructive/10 transition-all"
        >
          ⏸ PAUSE
        </button>
      )}
      {remaining === 0 && (
        <span className="font-display text-lg font-black text-neon-green animate-pulse">⏰ TIME'S UP!</span>
      )}
    </div>
  );
};

const SpinWheel2 = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultTimer, setResultTimer] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimBg, setDimBg] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    setResultTimer(0);
    setShowConfetti(false);
    setDimBg(false);

    const extraSpins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalDegrees = extraSpins * 360 + randomAngle;
    const newRotation = rotation + totalDegrees;

    setRotation(newRotation);

    setTimeout(() => {
      const normalizedAngle = (360 - (newRotation % 360)) % 360;
      const segmentIndex = Math.floor(normalizedAngle / SEGMENT_ANGLE);
      const selected = SEGMENTS[segmentIndex % SEGMENTS.length];

      setResult(selected.label);
      setResultTimer(selected.timer);
      setSpinning(false);
      setSpinCount((c) => c + 1);
      setShowConfetti(true);
      setDimBg(true);

      setTimeout(() => setShowConfetti(false), 4000);
    }, 4500);
  }, [spinning, rotation]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const wheelSize = 320;
  const center = wheelSize / 2;
  const radius = center - 10;

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden bg-background">
      <ParticleBackground />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-neon-cyan/8 rounded-full blur-[120px]" />
      </div>

      {/* Dim overlay when result shown */}
      {dimBg && (
        <div
          className="fixed inset-0 bg-background/50 z-[5] transition-opacity duration-500"
          style={{ animation: "fade-in 0.5s ease-out" }}
        />
      )}

      {showConfetti && <Confetti />}

      <div className="relative z-10 flex flex-col items-center px-4 py-6 sm:py-10 min-h-screen">
        {/* Top bar */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-6 sm:mb-10 animate-fade-in">
          <Link
            to="/"
            className="font-display text-sm sm:text-base font-bold text-muted-foreground hover:text-neon-cyan transition-colors tracking-wider"
          >
            ← BACK
          </Link>

          <div className="flex items-center gap-3">
            <span className="font-body text-xs sm:text-sm text-muted-foreground">
              Spins: <span className="text-neon-pink font-bold">{spinCount}</span>
            </span>
            <button
              onClick={toggleFullscreen}
              className="glass-panel px-3 py-1.5 text-xs font-display font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              {isFullscreen ? "EXIT FS" : "⛶ FULLSCREEN"}
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl sm:text-4xl font-black text-foreground text-glow-pink mb-2 animate-fade-in text-center">
          🎤 Personality Arena
        </h1>
        <p className="font-body text-sm sm:text-base text-muted-foreground mb-8 sm:mb-12 animate-fade-in text-center">
          Step into the spotlight. Express, perform, and impress.
        </p>

        {/* Wheel Container */}
        <div className="relative animate-scale-in">
          {/* Arrow pointer */}
          <div className="absolute top-[-18px] left-1/2 -translate-x-1/2 z-20">
            <div
              className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent"
              style={{
                borderTopColor: "hsl(320, 80%, 58%)",
                filter: "drop-shadow(0 0 8px hsl(320, 80%, 58%))",
              }}
            />
          </div>

          {/* Outer glow ring */}
          <div
            className={`absolute inset-[-20px] rounded-full transition-all duration-1000 ${spinning ? "opacity-80" : "opacity-30"}`}
            style={{
              background: "conic-gradient(from 0deg, hsl(320,80%,58%), hsl(270,80%,60%), hsl(185,80%,50%), hsl(220,90%,55%), hsl(320,80%,58%))",
              filter: "blur(20px)",
            }}
          />

          {/* Wheel SVG */}
          <svg
            ref={wheelRef}
            width={wheelSize}
            height={wheelSize}
            viewBox={`0 0 ${wheelSize} ${wheelSize}`}
            className="relative z-10 w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[500px] md:h-[500px]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                : "none",
            }}
          >
            {SEGMENTS.map((seg, i) => {
              const startAngle = i * SEGMENT_ANGLE - 90;
              const endAngle = startAngle + SEGMENT_ANGLE;
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = center + radius * Math.cos(startRad);
              const y1 = center + radius * Math.sin(startRad);
              const x2 = center + radius * Math.cos(endRad);
              const y2 = center + radius * Math.sin(endRad);

              const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;

              const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
              const textRadius = radius * 0.62;
              const textX = center + textRadius * Math.cos(midAngle);
              const textY = center + textRadius * Math.sin(midAngle);
              const textRotation = (startAngle + endAngle) / 2;

              // Wrap text for long labels
              const lines = wrapText(seg.label, 18);
              const fontSize = lines.length > 2 ? 6.5 : lines.length > 1 ? 7.5 : 8.5;

              return (
                <g key={i}>
                  <path
                    d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="hsl(230, 25%, 7%)"
                    strokeWidth="2"
                  />
                  {lines.map((line, lineIdx) => {
                    const lineOffset = (lineIdx - (lines.length - 1) / 2) * (fontSize + 2);
                    return (
                      <text
                        key={lineIdx}
                        x={textX}
                        y={textY + lineOffset}
                        fill="white"
                        fontSize={fontSize}
                        fontFamily="var(--font-display)"
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                        style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}
                      >
                        {line}
                      </text>
                    );
                  })}
                </g>
              );
            })}

            {/* Center circle */}
            <g onClick={spin} className="cursor-pointer">
              <circle cx={center} cy={center} r="28" fill="hsl(230, 25%, 10%)" stroke="hsl(320, 80%, 58%)" strokeWidth="3" />
              <text
                x={center}
                y={center}
                fill="hsl(320, 80%, 58%)"
                fontSize="10"
                fontFamily="var(--font-display)"
                fontWeight="800"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ pointerEvents: "none" }}
              >
                SPIN
              </text>
            </g>
          </svg>
        </div>

        {/* Result display */}
        {result && !spinning && (
          <div className="mt-8 sm:mt-12 text-center flex flex-col items-center" style={{ animation: "result-appear 0.6s ease-out forwards" }}>
            <p className="font-body text-sm text-muted-foreground uppercase tracking-widest mb-2">
              🎤 Your challenge:
            </p>
            <div className="glass-panel px-8 sm:px-12 py-5 sm:py-6 neon-glow-pink max-w-xl">
              <h2 className="font-display text-xl sm:text-3xl md:text-4xl font-black text-foreground text-glow-cyan">
                {result}
              </h2>
            </div>

            {/* Countdown timer */}
            {resultTimer > 0 && (
              <CountdownTimer seconds={resultTimer} onComplete={() => {}} />
            )}

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  setResult(null);
                  setDimBg(false);
                  setResultTimer(0);
                }}
                className="px-8 py-3 font-display text-sm sm:text-base font-black tracking-widest uppercase rounded-xl border transition-all duration-300
                  bg-gradient-to-r from-neon-pink to-neon-purple text-primary-foreground border-neon-pink/50
                  hover:shadow-[0_0_30px_hsl(320_80%_58%/0.4)] hover:scale-105 active:scale-95"
              >
                🔁 SPIN AGAIN
              </button>
              <Link
                to="/"
                className="px-8 py-3 font-display text-sm sm:text-base font-bold tracking-widest uppercase rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-neon-cyan/50 transition-all duration-300"
              >
                ⬅ HOME
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinWheel2;
