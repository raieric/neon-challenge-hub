import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import Confetti from "@/components/Confetti";
import ThemeToggle from "@/components/ThemeToggle";
import PartnerChallenge from "@/components/social/PartnerChallenge";
import QuestionChallenge from "@/components/social/QuestionChallenge";
import DuelChallenge from "@/components/social/DuelChallenge";
import VoteChallenge from "@/components/social/VoteChallenge";
import RapidFireChallenge from "@/components/social/RapidFireChallenge";

const SEGMENTS = [
  { label: "🤝 Choose a partner and explain a concept together", color: "hsl(185, 80%, 45%)", mode: "partner" },
  { label: "👀 Pick someone to ask you one question", color: "hsl(270, 80%, 55%)", mode: "question" },
  { label: "🎲 Challenge another student", color: "hsl(320, 80%, 55%)", mode: "duel" },
  { label: "🗳 Class votes if you pass or retry", color: "hsl(220, 90%, 55%)", mode: "vote" },
  { label: "🎯 Rapid-fire 3 questions", color: "hsl(185, 80%, 45%)", mode: "rapidfire" },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;

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

const SocialArena = () => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [resultLabel, setResultLabel] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const spin = useCallback(() => {
    if (spinning || activeMode) return;
    setSpinning(true);
    setResultLabel(null);
    setShowConfetti(false);

    const extraSpins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalDegrees = extraSpins * 360 + randomAngle;
    const newRotation = rotation + totalDegrees;

    setRotation(newRotation);

    setTimeout(() => {
      const normalizedAngle = (360 - (newRotation % 360)) % 360;
      const segmentIndex = Math.floor(normalizedAngle / SEGMENT_ANGLE);
      const selected = SEGMENTS[segmentIndex % SEGMENTS.length];

      setResultLabel(selected.label);
      setSpinning(false);
      setSpinCount((c) => c + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);

      // After reveal, transition to challenge mode
      setTimeout(() => {
        setActiveMode(selected.mode);
      }, 2000);
    }, 4500);
  }, [spinning, rotation, activeMode]);

  const resetToWheel = () => {
    setActiveMode(null);
    setResultLabel(null);
  };

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

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-neon-purple/8 rounded-full blur-[120px]" />
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
              Rounds: <span className="text-neon-cyan font-bold">{spinCount}</span>
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
        <h1 className="font-display text-2xl sm:text-4xl font-black text-foreground text-glow-cyan mb-2 animate-fade-in text-center">
          🎯 Social Arena
        </h1>
        <p className="font-body text-sm sm:text-base text-muted-foreground mb-8 sm:mb-12 animate-fade-in text-center">
          Collaboration. Pressure. Interaction.
        </p>

        {/* Challenge Mode UI */}
        <AnimatePresence mode="wait">
          {activeMode && (
            <div className="w-full max-w-2xl flex flex-col items-center">
              {activeMode === "partner" && <PartnerChallenge onDone={resetToWheel} />}
              {activeMode === "question" && <QuestionChallenge onDone={resetToWheel} />}
              {activeMode === "duel" && <DuelChallenge onDone={resetToWheel} />}
              {activeMode === "vote" && <VoteChallenge onDone={resetToWheel} />}
              {activeMode === "rapidfire" && <RapidFireChallenge onDone={resetToWheel} />}

              <button
                onClick={resetToWheel}
                className="mt-8 px-6 py-2 font-display text-xs font-bold tracking-widest uppercase rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all"
              >
                ⬅ BACK TO WHEEL
              </button>
            </div>
          )}
        </AnimatePresence>

        {/* Wheel (hidden during active mode) */}
        {!activeMode && (
          <>
            {/* Result reveal */}
            {resultLabel && !spinning && (
              <div className="mb-6 text-center" style={{ animation: "result-appear 0.6s ease-out forwards" }}>
                <p className="font-body text-sm text-muted-foreground uppercase tracking-widest mb-2">
                  🎯 Your challenge:
                </p>
                <div className="glass-panel px-6 sm:px-10 py-4 sm:py-5 neon-glow-cyan">
                  <h2 className="font-display text-lg sm:text-2xl md:text-3xl font-black text-foreground text-glow-cyan">
                    {resultLabel}
                  </h2>
                </div>
                <p className="mt-2 font-body text-xs text-muted-foreground animate-pulse">
                  Loading challenge mode...
                </p>
              </div>
            )}

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
                  background: "conic-gradient(from 0deg, hsl(185,80%,50%), hsl(270,80%,60%), hsl(320,80%,58%), hsl(220,90%,55%), hsl(185,80%,50%))",
                  filter: "blur(20px)",
                }}
              />

              {/* Wheel SVG */}
              <svg
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
                  const textRadius = radius * 0.6;
                  const textX = center + textRadius * Math.cos(midAngle);
                  const textY = center + textRadius * Math.sin(midAngle);
                  const textRotation = (startAngle + endAngle) / 2;

                  const lines = wrapText(seg.label, 16);
                  const fontSize = lines.length > 2 ? 6 : lines.length > 1 ? 7 : 8;

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
                  <circle cx={center} cy={center} r="28" fill="hsl(230, 25%, 10%)" stroke="hsl(185, 80%, 50%)" strokeWidth="3" />
                  <text
                    x={center}
                    y={center}
                    fill="hsl(185, 80%, 50%)"
                    fontSize="10"
                    fontFamily="var(--font-display)"
                    fontWeight="800"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ pointerEvents: "none" }}
                  >
                    START
                  </text>
                </g>
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SocialArena;
