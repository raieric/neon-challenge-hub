import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import Confetti from "@/components/Confetti";
import ThemeToggle from "@/components/ThemeToggle";
import CircularTimer from "@/components/social/CircularTimer";

interface Challenge {
  label: string;
  color: string;
  timer: number;
  prompts: string[];
}

const CHALLENGES: Challenge[] = [
  {
    label: "🚀 Pitch a tech startup idea",
    color: "hsl(270, 80%, 55%)",
    timer: 90,
    prompts: [
      "What problem are you solving?",
      "Who is your target user?",
      "How will you earn revenue?",
      "What makes it unique?",
    ],
  },
  {
    label: "🤖 If you build an AI today, what problem will you solve?",
    color: "hsl(220, 90%, 55%)",
    timer: 60,
    prompts: [
      "Local or global problem?",
      "Why is AI necessary?",
      "Data source?",
      "Ethical concerns?",
    ],
  },
  {
    label: "🌍 How can IT help Nepal?",
    color: "hsl(185, 80%, 45%)",
    timer: 60,
    prompts: [
      "Education?",
      "Agriculture?",
      "Governance?",
      "Startups?",
    ],
  },
  {
    label: "📊 What skill will dominate tech in 5 years?",
    color: "hsl(270, 80%, 55%)",
    timer: 60,
    prompts: [
      "Why?",
      "Industry demand?",
      "Required preparation?",
      "Impact on jobs?",
    ],
  },
  {
    label: "💡 Invent a new programming language feature",
    color: "hsl(220, 90%, 55%)",
    timer: 90,
    prompts: [
      "What limitation does it solve?",
      "Syntax example?",
      "Performance impact?",
      "Use case?",
    ],
  },
];

const SEGMENT_ANGLE = 360 / CHALLENGES.length;

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

const VisionaryArena = () => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selected, setSelected] = useState<Challenge | null>(null);
  const [phase, setPhase] = useState<"wheel" | "reveal" | "present">("wheel");
  const containerRef = useRef<HTMLDivElement>(null);

  const spin = useCallback(() => {
    if (spinning || phase !== "wheel") return;
    setSpinning(true);
    setSelected(null);
    setShowConfetti(false);

    const extraSpins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalDegrees = extraSpins * 360 + randomAngle;
    const newRotation = rotation + totalDegrees;

    setRotation(newRotation);

    setTimeout(() => {
      const normalizedAngle = (360 - (newRotation % 360)) % 360;
      const segmentIndex = Math.floor(normalizedAngle / SEGMENT_ANGLE);
      const sel = CHALLENGES[segmentIndex % CHALLENGES.length];

      setSelected(sel);
      setSpinning(false);
      setSpinCount((c) => c + 1);
      setShowConfetti(true);
      setPhase("reveal");
      setTimeout(() => setShowConfetti(false), 4000);
    }, 4500);
  }, [spinning, rotation, phase]);

  const startPresentation = () => setPhase("present");
  const resetToWheel = () => {
    setPhase("wheel");
    setSelected(null);
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

      {/* Ambient glow — more subtle / elegant */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[25%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-neon-blue/8 rounded-full blur-[180px]" />
        <div className="absolute bottom-[15%] right-[15%] w-[350px] h-[350px] bg-neon-purple/6 rounded-full blur-[140px]" />
      </div>

      {/* Dim overlay for reveal/present */}
      {phase !== "wheel" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/60 z-[5]"
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
              Sessions: <span className="text-neon-blue font-bold">{spinCount}</span>
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
        <h1 className="font-display text-2xl sm:text-4xl font-black text-foreground mb-1 animate-fade-in text-center"
          style={{ textShadow: "0 0 20px hsl(220 90% 56% / 0.4), 0 0 60px hsl(220 90% 56% / 0.15)" }}
        >
          🚀 Visionary Arena
        </h1>
        <p className="font-body text-sm sm:text-base text-muted-foreground mb-8 sm:mb-12 animate-fade-in text-center tracking-widest">
          Think beyond code. Lead the future.
        </p>
        {/* Subtle animated underline */}
        <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50 mb-8 animate-pulse-glow" />

        {/* === WHEEL PHASE === */}
        <AnimatePresence mode="wait">
          {phase === "wheel" && (
            <motion.div
              key="wheel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative animate-scale-in"
            >
              {/* Arrow */}
              <div className="absolute top-[-18px] left-1/2 -translate-x-1/2 z-20">
                <div
                  className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent"
                  style={{
                    borderTopColor: "hsl(220, 90%, 56%)",
                    filter: "drop-shadow(0 0 10px hsl(220, 90%, 56%))",
                  }}
                />
              </div>

              {/* Outer glow */}
              <div
                className={`absolute inset-[-20px] rounded-full transition-all duration-1000 ${spinning ? "opacity-70" : "opacity-20"}`}
                style={{
                  background: "conic-gradient(from 0deg, hsl(270,80%,60%), hsl(220,90%,55%), hsl(185,80%,50%), hsl(270,80%,60%))",
                  filter: "blur(25px)",
                }}
              />

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
                {CHALLENGES.map((seg, i) => {
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
                  const textRadius = radius * 0.58;
                  const textX = center + textRadius * Math.cos(midAngle);
                  const textY = center + textRadius * Math.sin(midAngle);
                  const textRotation = (startAngle + endAngle) / 2;
                  const lines = wrapText(seg.label, 16);
                  const fontSize = lines.length > 2 ? 5.5 : lines.length > 1 ? 6.5 : 7.5;

                  return (
                    <g key={i}>
                      <path
                        d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={seg.color}
                        stroke="hsl(230, 25%, 7%)"
                        strokeWidth="2"
                        opacity="0.9"
                      />
                      {lines.map((line, li) => {
                        const off = (li - (lines.length - 1) / 2) * (fontSize + 2);
                        return (
                          <text
                            key={li}
                            x={textX}
                            y={textY + off}
                            fill="white"
                            fontSize={fontSize}
                            fontFamily="var(--font-display)"
                            fontWeight="700"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
                          >
                            {line}
                          </text>
                        );
                      })}
                    </g>
                  );
                })}

                <g onClick={spin} className="cursor-pointer">
                  <circle cx={center} cy={center} r="30" fill="hsl(230, 25%, 8%)" stroke="hsl(220, 90%, 56%)" strokeWidth="2.5" />
                  <text
                    x={center}
                    y={center - 4}
                    fill="hsl(220, 90%, 65%)"
                    fontSize="8"
                    fontFamily="var(--font-display)"
                    fontWeight="800"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ pointerEvents: "none" }}
                  >
                    START
                  </text>
                  <text
                    x={center}
                    y={center + 8}
                    fill="hsl(220, 90%, 65%)"
                    fontSize="5"
                    fontFamily="var(--font-display)"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ pointerEvents: "none", opacity: 0.6 }}
                  >
                    CHALLENGE
                  </text>
                </g>
              </svg>
            </motion.div>
          )}

          {/* === REVEAL PHASE === */}
          {phase === "reveal" && selected && (
            <motion.div
              key="reveal"
              initial={{ scale: 0.5, opacity: 0, filter: "blur(12px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center gap-6 text-center max-w-2xl"
            >
              <p className="font-body text-xs sm:text-sm text-muted-foreground uppercase tracking-[0.3em]">
                Your challenge
              </p>

              <div className="glass-panel px-8 sm:px-14 py-6 sm:py-8"
                style={{ boxShadow: `0 0 30px ${selected.color}40, 0 0 80px ${selected.color}15` }}
              >
                <h2
                  className="font-display text-xl sm:text-3xl md:text-4xl font-black text-foreground leading-tight"
                  style={{ textShadow: `0 0 15px ${selected.color}80` }}
                >
                  {selected.label}
                </h2>
              </div>

              <p className="font-body text-xs text-muted-foreground">
                {selected.timer} seconds • {selected.prompts.length} guiding prompts
              </p>

              <motion.button
                onClick={startPresentation}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 font-display text-sm sm:text-base font-black tracking-widest uppercase rounded-xl border transition-all duration-300
                  bg-gradient-to-r from-neon-blue to-neon-purple text-primary-foreground border-neon-blue/50
                  hover:shadow-[0_0_40px_hsl(220_90%_56%/0.4)]"
              >
                🎤 BEGIN PRESENTATION
              </motion.button>

              <button
                onClick={resetToWheel}
                className="text-xs font-display font-bold text-muted-foreground hover:text-foreground transition-colors tracking-widest uppercase"
              >
                ← RESPIN
              </button>
            </motion.div>
          )}

          {/* === PRESENTATION PHASE === */}
          {phase === "present" && selected && (
            <motion.div
              key="present"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-8 text-center max-w-2xl w-full"
            >
              {/* Challenge title */}
              <div>
                <h2
                  className="font-display text-xl sm:text-3xl font-black text-foreground leading-tight"
                  style={{ textShadow: `0 0 15px ${selected.color}80` }}
                >
                  {selected.label}
                </h2>
                <div className="mt-3 mx-auto w-20 h-[1px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-40" />
              </div>

              {/* Guiding prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {selected.prompts.map((prompt, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 * i, duration: 0.4 }}
                    className="glass-panel px-5 py-3 text-left flex items-start gap-3"
                  >
                    <span className="font-display text-sm font-black text-neon-blue opacity-60 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-body text-sm sm:text-base text-foreground/90">
                      {prompt}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Timer */}
              <CircularTimer
                seconds={selected.timer}
                size={180}
                color={selected.color}
                onComplete={() => {}}
              />

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <motion.button
                  onClick={resetToWheel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 font-display text-sm font-black tracking-widest uppercase rounded-xl border transition-all duration-300
                    bg-gradient-to-r from-neon-blue to-neon-purple text-primary-foreground border-neon-blue/50
                    hover:shadow-[0_0_30px_hsl(220_90%_56%/0.4)]"
                >
                  ✅ CHALLENGE COMPLETE
                </motion.button>
                <Link
                  to="/"
                  className="px-6 py-3 font-display text-xs font-bold tracking-widest uppercase rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all"
                >
                  ⬅ HOME
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VisionaryArena;
