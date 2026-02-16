import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import ParticleBackground from "@/components/ParticleBackground";
import Confetti from "@/components/Confetti";

const SEGMENTS = [
  { label: "Tell a joke", color: "hsl(270, 80%, 55%)" },
  { label: "Sing a song", color: "hsl(185, 80%, 45%)" },
  { label: "Make a dance move", color: "hsl(320, 80%, 55%)" },
  { label: "Write the code", color: "hsl(220, 90%, 55%)" },
  { label: "Write the code", color: "hsl(150, 80%, 45%)" },
  { label: "Do 10 push ups", color: "hsl(30, 90%, 55%)" },
  { label: "Will be ready by next class", color: "hsl(350, 80%, 55%)" },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;

const SpinWheel = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    setShowConfetti(false);

    const extraSpins = 5 + Math.random() * 5; // 5-10 full rotations
    const randomAngle = Math.random() * 360;
    const totalDegrees = extraSpins * 360 + randomAngle;
    const newRotation = rotation + totalDegrees;

    setRotation(newRotation);

    setTimeout(() => {
      // Calculate which segment the arrow points to
      const normalizedAngle = (360 - (newRotation % 360)) % 360;
      const segmentIndex = Math.floor(normalizedAngle / SEGMENT_ANGLE);
      const selected = SEGMENTS[segmentIndex % SEGMENTS.length];

      setResult(selected.label);
      setSpinning(false);
      setSpinCount((c) => c + 1);
      setShowConfetti(true);

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
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[150px]" />
      </div>

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
              Spins: <span className="text-neon-cyan font-bold">{spinCount}</span>
            </span>
            <button
              onClick={toggleFullscreen}
              className="glass-panel px-3 py-1.5 text-xs font-display font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              {isFullscreen ? "EXIT FS" : "⛶ FULLSCREEN"}
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl sm:text-4xl font-black text-foreground text-glow-purple mb-8 sm:mb-12 animate-fade-in text-center">
          🎡 Spin The Wheel
        </h1>

        {/* Wheel Container */}
        <div className="relative animate-scale-in">
          {/* Arrow pointer */}
          <div className="absolute top-[-18px] left-1/2 -translate-x-1/2 z-20">
            <div
              className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent"
              style={{
                borderTopColor: "hsl(185, 80%, 50%)",
                filter: "drop-shadow(0 0 8px hsl(185, 80%, 50%))",
              }}
            />
          </div>

          {/* Outer glow ring */}
          <div
            className={`absolute inset-[-20px] rounded-full transition-all duration-1000 ${spinning ? "opacity-80" : "opacity-30"}`}
            style={{
              background: "conic-gradient(from 0deg, hsl(270,80%,60%), hsl(185,80%,50%), hsl(320,80%,58%), hsl(270,80%,60%))",
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
              const textRadius = radius * 0.65;
              const textX = center + textRadius * Math.cos(midAngle);
              const textY = center + textRadius * Math.sin(midAngle);
              const textRotation = (startAngle + endAngle) / 2;

              return (
                <g key={i}>
                  <path
                    d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="hsl(230, 25%, 7%)"
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="9"
                    fontFamily="var(--font-display)"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                  >
                    {seg.label.length > 16
                      ? seg.label.slice(0, 14) + "…"
                      : seg.label}
                  </text>
                </g>
              );
            })}

            {/* Center circle */}
            <circle cx={center} cy={center} r="24" fill="hsl(230, 25%, 10%)" stroke="hsl(270, 80%, 60%)" strokeWidth="3" />
            <text
              x={center}
              y={center}
              fill="hsl(270, 80%, 60%)"
              fontSize="11"
              fontFamily="var(--font-display)"
              fontWeight="800"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              SPIN
            </text>
          </svg>
        </div>

        {/* Spin Button */}
        <button
          onClick={spin}
          disabled={spinning}
          className={`
            mt-8 sm:mt-12 px-8 sm:px-12 py-3 sm:py-4 font-display text-base sm:text-lg font-black tracking-widest uppercase
            rounded-xl border transition-all duration-300
            ${
              spinning
                ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                : "bg-gradient-to-r from-neon-purple to-neon-cyan text-primary-foreground border-neon-purple/50 hover:shadow-[0_0_30px_hsl(270_80%_60%/0.4)] hover:scale-105 active:scale-95"
            }
          `}
        >
          {spinning ? "SPINNING..." : result ? "🔁 SPIN AGAIN" : "🎰 SPIN NOW"}
        </button>

        {/* Result display */}
        {result && !spinning && (
          <div className="mt-8 sm:mt-12 text-center" style={{ animation: "result-appear 0.6s ease-out forwards" }}>
            <p className="font-body text-sm text-muted-foreground uppercase tracking-widest mb-2">
              The wheel has spoken:
            </p>
            <div className="glass-panel px-8 sm:px-12 py-5 sm:py-6 neon-glow-purple">
              <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-foreground text-glow-cyan">
                {result}
              </h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinWheel;
