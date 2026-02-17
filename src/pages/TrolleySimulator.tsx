import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Level {
  name: string;
  scenario: string;
  leftLabel: string;
  rightLabel: string;
  leftCount: string;
  rightCount: string;
  note?: string;
  debatable?: "left" | "right" | "both";
}

const levels: Level[] = [
  { name: "The Original", scenario: "Oh no! A trolley is heading toward five people on the main track. You can pull the lever to divert it to a side track, where one person is tied down.", leftLabel: "Five Unnamed People", rightLabel: "One Unnamed Person", leftCount: "5 die", rightCount: "1 dies" },
  { name: "Four People", scenario: "Oh no! A trolley is heading toward five people. You can divert it, but four people are on the other track.", leftLabel: "Five Unnamed People", rightLabel: "Four Unnamed People", leftCount: "5 die", rightCount: "4 die" },
  { name: "Life Savings", scenario: "Oh no! A trolley is heading toward five people. You can divert it onto a track that destroys your entire life savings.", leftLabel: "Five Unnamed People", rightLabel: "Your Life Savings Destroyed", leftCount: "5 die", rightCount: "💸 Gone" },
  { name: "You", scenario: "Oh no! A trolley is heading toward five people. You can divert it, but the other track leads directly to you.", leftLabel: "Five Unnamed People", rightLabel: "You", leftCount: "5 die", rightCount: "You die" },
  { name: "Priceless Painting", scenario: "Oh no! A trolley is heading toward five people. You can divert it, but a priceless painting will be destroyed.", leftLabel: "Five Unnamed People", rightLabel: "Priceless Painting", leftCount: "5 die", rightCount: "🎨 Destroyed" },
  { name: "Bribes", scenario: "Oh no! A trolley is heading toward a rich man who offered you a bribe. The other track has an unnamed person.", leftLabel: "Unnamed Rich Man", rightLabel: "Unnamed Person", leftCount: "1 dies", rightCount: "1 dies" },
  { name: "Levels of Sentience", scenario: "Oh no! A trolley is heading toward five lobsters. You can divert it toward one cat.", leftLabel: "Five Lobsters", rightLabel: "One Cat", leftCount: "5 🦞", rightCount: "1 🐱" },
  { name: "Sleeping", scenario: "Oh no! A trolley is heading toward five sleeping people. You can divert it toward one awake person.", leftLabel: "Five Sleeping People", rightLabel: "One Awake Person", leftCount: "5 😴", rightCount: "1 👀" },
  { name: "Personal Choices", scenario: "Oh no! A trolley is heading toward one person. You can divert it toward five people who tied themselves to the track voluntarily.", leftLabel: "One Person", rightLabel: "Five People (Tied Themselves)", leftCount: "1 dies", rightCount: "5 die" },
  { name: "Mercy", scenario: "Oh no! A trolley is heading toward five people. You can divert it toward one person, but they will be run over painfully slowly.", leftLabel: "Five People", rightLabel: "One Person (Painfully Slow)", leftCount: "5 die", rightCount: "1 dies slowly" },
  { name: "Minor Inconvenience", scenario: "Oh no! A trolley is heading toward one man. You can divert it to an empty track, but you'll suffer a minor embarrassment.", leftLabel: "One Man", rightLabel: "Nobody Dies (Minor Embarrassment)", leftCount: "1 dies", rightCount: "😳" },
  { name: "Best Friend", scenario: "Oh no! A trolley is heading toward your best friend. You can divert it toward five unnamed people.", leftLabel: "Your Best Friend", rightLabel: "Five Unnamed People", leftCount: "1 💔", rightCount: "5 die" },
  { name: "Can't See", scenario: "Oh no! A trolley is heading toward people, but visibility is poor. There seem to be five people on one track and one on the other… maybe.", leftLabel: "Five People", rightLabel: "One Person", leftCount: "5?", rightCount: "1?", debatable: "both" },
  { name: "Cousins", scenario: "Oh no! A trolley is heading toward your first cousin. You can divert it toward three of your second cousins.", leftLabel: "Your First Cousin", rightLabel: "Three Second Cousins", leftCount: "1 dies", rightCount: "3 die" },
  { name: "Age", scenario: "Oh no! A trolley is heading toward five elderly people. You can divert it toward one baby.", leftLabel: "Five Elderly People", rightLabel: "One Baby", leftCount: "5 👴", rightCount: "1 👶" },
  { name: "Clones", scenario: "Oh no! A trolley is heading toward you. You can divert it toward five of your clones.", leftLabel: "You", rightLabel: "Five of Your Clones", leftCount: "1 (you)", rightCount: "5 (also you?)" },
  { name: "Mystery Box", scenario: "Oh no! A trolley is heading toward either two or zero people (90% chance it's zero). The other track has either ten or zero people (50% chance it's zero).", leftLabel: "Two People (Maybe)", rightLabel: "Ten People (Maybe)", leftCount: "2?", rightCount: "10?", note: "Left: 90% chance nobody is there. Right: 50% chance nobody is there." },
  { name: "I Am Robot", scenario: "Oh no! A trolley is heading toward five robots. You can divert it toward one human.", leftLabel: "Five Robots", rightLabel: "One Human", leftCount: "5 🤖", rightCount: "1 🧑" },
  { name: "Economic Damage", scenario: "Oh no! A trolley is heading toward a critical infrastructure point. If it hits, massive economic collapse follows. The other track has one person.", leftLabel: "Massive Economic Collapse", rightLabel: "One Person", leftCount: "📉💥", rightCount: "1 dies" },
  { name: "External Costs", scenario: "Oh no! A trolley's CO₂ emissions will eventually kill five people over decades. You can stop it now, but nobody is immediately harmed either way.", leftLabel: "Five People Die (CO₂ Over Time)", rightLabel: "Nobody Immediately Harmed", leftCount: "5 (eventually)", rightCount: "0" },
  { name: "Reincarnation", scenario: "Oh no! A trolley is heading toward one reincarnated version of you. You can divert it toward five reincarnated versions of you.", leftLabel: "One Reincarnated You", rightLabel: "Five Reincarnated Yous", leftCount: "1 past you", rightCount: "5 past yous" },
  { name: "Harmless Prank?", scenario: "Oh no! A trolley is heading toward an empty track, but the sound will cause lifelong psychological trauma to a bystander. The other track is also empty.", leftLabel: "Nobody Dies", rightLabel: "Psychological Trauma", leftCount: "0 (trauma-free)", rightCount: "0 (but 😰)" },
  { name: "Citizens", scenario: "Oh no! A trolley is heading toward a known bad citizen. You can divert it toward a known good citizen.", leftLabel: "Bad Citizen", rightLabel: "Good Citizen", leftCount: "1 😈", rightCount: "1 😇" },
  { name: "Eternity", scenario: "Oh no! A runaway trolley's brakes have failed. The driver will be blown up, or you can divert it to blow up eight passengers.", leftLabel: "Trolley Driver Blown Up", rightLabel: "Eight Passengers Blown Up", leftCount: "1", rightCount: "8", debatable: "both" },
  { name: "Enemy", scenario: "Oh no! A trolley is heading toward your worst enemy. The other track is completely empty. Nobody else is in danger.", leftLabel: "Your Worst Enemy", rightLabel: "Nobody", leftCount: "1 😠", rightCount: "0" },
];

// Splat SVG path - irregular hand-drawn blob
const SPLAT_PATH = "M0,-30 C8,-32 15,-28 20,-22 C26,-18 30,-10 28,-2 C32,5 28,15 22,20 C18,26 10,30 2,28 C-5,32 -15,28 -20,22 C-26,18 -30,10 -28,2 C-32,-5 -28,-15 -22,-20 C-18,-26 -10,-30 -2,-28Z";

// Particle droplets for splat
const SplatParticles = ({ x, y }: { x: number; y: number }) => {
  const particles = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    dx: (Math.random() - 0.5) * 40,
    dy: (Math.random() - 0.5) * 30 - 10,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 0.1,
  }));

  return (
    <g>
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          cx={x}
          cy={y}
          r={p.size}
          fill="#333"
          initial={{ opacity: 1, cx: x, cy: y, scale: 1 }}
          animate={{ cx: x + p.dx, cy: y + p.dy, opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.5, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </g>
  );
};

type AnimPhase = "idle" | "lever" | "switch" | "travel" | "freeze" | "splat" | "fadeout";

const TrolleyIllustration = ({
  phase,
  pulled,
}: {
  phase: AnimPhase;
  pulled: boolean | null;
}) => {
  const isMoving = ["travel", "freeze", "splat"].includes(phase);
  const showSplat = ["splat", "fadeout"].includes(phase);
  const leverDown = pulled !== null && phase !== "idle";
  const phaseStr = phase as string;
  const trackSwitched = pulled && (phaseStr === "switch" || isMoving || showSplat);

  // Trolley target positions
  const getTrolleyPos = () => {
    if (!isMoving && !showSplat) return { x: 0, y: 0 };
    if (pulled) return { x: 155, y: -55 };
    return { x: 155, y: 35 };
  };

  const trolleyTarget = getTrolleyPos();

  // Impact coordinates
  const impactX = pulled ? 335 : 340;
  const impactY = pulled ? 75 : 178;

  // Hand-drawn wobble filter
  const wobbleId = "wobble-" + Math.random().toString(36).slice(2, 6);

  // Splat rotation
  const splatRotation = -3 + Math.random() * 6;

  return (
    <svg viewBox="0 0 400 230" className="w-full max-w-md mx-auto" style={{ fontFamily: "'Comic Sans MS', 'Caveat', cursive" }}>
      <defs>
        <filter id={wobbleId}>
          <feTurbulence baseFrequency="0.03" numOctaves="2" seed={Math.floor(Math.random() * 100)} />
          <feDisplacementMap in="SourceGraphic" scale="0.6" />
        </filter>
      </defs>

      {/* Main track */}
      <line x1="30" y1="140" x2="200" y2="140" stroke="#333" strokeWidth="3" strokeDasharray="8,4" />

      {/* Upper track (pull lever) */}
      <motion.line
        x1="200" y1="140" x2="370" y2="80"
        stroke="#333" strokeWidth="3" strokeDasharray="8,4"
        animate={trackSwitched ? { strokeWidth: 3.5, opacity: 1 } : { strokeWidth: 3, opacity: 1 }}
      />

      {/* Lower track (do nothing) */}
      <motion.line
        x1="200" y1="140" x2="370" y2="180"
        stroke="#333" strokeWidth="3" strokeDasharray="8,4"
        animate={!trackSwitched ? { strokeWidth: 3.5 } : { strokeWidth: 3 }}
      />

      {/* Track switch junction */}
      <motion.g
        animate={trackSwitched ? { rotate: -15 } : { rotate: 15 }}
        transition={phase === "switch" ? { duration: 0.3, type: "spring", stiffness: 300, damping: 12 } : { duration: 0 }}
        style={{ originX: "200px", originY: "140px" }}
      >
        <line x1="196" y1="138" x2="210" y2="138" stroke="#555" strokeWidth="4" strokeLinecap="round" />
      </motion.g>

      {/* Lever */}
      <circle cx="200" cy="160" r="6" fill="#555" />
      <motion.line
        x1="200" y1="160"
        x2={leverDown && pulled ? 185 : 215}
        y2="145"
        stroke="#555" strokeWidth="3" strokeLinecap="round"
        animate={{ x2: leverDown && pulled ? 185 : 215 }}
        transition={phase === "lever" ? {
          duration: 0.4,
          ease: [0.25, 1.4, 0.5, 1], // overshoot
        } : { duration: 0 }}
      />
      <text x="195" y="185" fontSize="9" fill="#888" textAnchor="middle">lever</text>

      {/* Dust puff at lever */}
      {phase === "lever" && (
        <motion.g
          initial={{ opacity: 0.8, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.5 }}
        >
          <circle cx="200" cy="162" r="4" fill="none" stroke="#aaa" strokeWidth="1" />
          <circle cx="195" cy="165" r="2" fill="#ccc" opacity="0.6" />
          <circle cx="206" cy="164" r="3" fill="#ccc" opacity="0.4" />
        </motion.g>
      )}

      {/* Trolley */}
      <motion.g
        initial={{ x: 0, y: 0 }}
        animate={
          isMoving || showSplat
            ? {
                x: trolleyTarget.x,
                y: trolleyTarget.y,
              }
            : phase === "idle"
              ? { x: [-2, 2, -2], y: [0, -1, 0] }
              : { x: 0, y: 0 }
        }
        transition={
          phase === "travel"
            ? { duration: 1.5, ease: [0.4, 0, 1, 1] } // ease-in acceleration
            : phase === "freeze"
              ? { duration: 0 }
              : phase === "splat" || phase === "fadeout"
                ? { duration: 0 }
                : phase === "idle"
                  ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0 }
        }
      >
        {/* Trolley body with wobble */}
        <motion.g
          animate={
            phase === "travel"
              ? { y: [-0.5, 0.5, -0.8, 0.3, -0.5], rotate: [-0.5, 0.5, -0.3, 0.8, -0.5] }
              : phase === "splat"
                ? { x: [0, -3, 2, -1, 0] } // recoil shake
                : {}
          }
          transition={
            phase === "travel"
              ? { duration: 0.3, repeat: Infinity, ease: "linear" }
              : phase === "splat"
                ? { duration: 0.3, ease: "easeOut" }
                : {}
          }
        >
          <rect x="40" y="122" width="40" height="20" rx="3" fill="#e74c3c" stroke="#333" strokeWidth="2" />
          {/* Wheels with rotation hint */}
          <motion.circle
            cx="48" cy="145" r="5" fill="#333"
            animate={phase === "travel" ? { rotate: 360 } : {}}
            transition={phase === "travel" ? { duration: 0.3, repeat: Infinity, ease: "linear" } : {}}
          />
          <line x1="48" y1="142" x2="48" y2="148" stroke="#555" strokeWidth="1" />
          <motion.circle
            cx="72" cy="145" r="5" fill="#333"
            animate={phase === "travel" ? { rotate: 360 } : {}}
            transition={phase === "travel" ? { duration: 0.3, repeat: Infinity, ease: "linear" } : {}}
          />
          <line x1="72" y1="142" x2="72" y2="148" stroke="#555" strokeWidth="1" />
          <text x="60" y="136" fontSize="8" fill="white" textAnchor="middle">🚃</text>
        </motion.g>
      </motion.g>

      {/* Stick figures on lower track (do nothing path) */}
      <motion.g
        animate={showSplat && !pulled ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {[320, 335, 350].map((x, i) => (
          <g key={`bottom-${i}`}>
            <circle cx={x} cy="168" r="4" fill="none" stroke="#333" strokeWidth="1.5" />
            <line x1={x} y1="172" x2={x} y2="184" stroke="#333" strokeWidth="1.5" />
            <line x1={x - 5} y1="178" x2={x + 5} y2="178" stroke="#333" strokeWidth="1.5" />
            <line x1={x} y1="184" x2={x - 4} y2="192" stroke="#333" strokeWidth="1.5" />
            <line x1={x} y1="184" x2={x + 4} y2="192" stroke="#333" strokeWidth="1.5" />
          </g>
        ))}
      </motion.g>

      {/* Stick figure on upper track (pull lever path) */}
      <motion.g
        animate={showSplat && pulled ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <g>
          <circle cx="340" cy="68" r="4" fill="none" stroke="#333" strokeWidth="1.5" />
          <line x1="340" y1="72" x2="340" y2="84" stroke="#333" strokeWidth="1.5" />
          <line x1="335" y1="78" x2="345" y2="78" stroke="#333" strokeWidth="1.5" />
          <line x1="340" y1="84" x2="336" y2="92" stroke="#333" strokeWidth="1.5" />
          <line x1="340" y1="84" x2="344" y2="92" stroke="#333" strokeWidth="1.5" />
        </g>
      </motion.g>

      {/* SPLAT */}
      {showSplat && (
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.35, 0.95, 1.05, 1], opacity: 1, rotate: splatRotation }}
          transition={{
            duration: 0.4,
            ease: [0.34, 1.56, 0.64, 1],
            times: [0, 0.4, 0.6, 0.8, 1],
          }}
          style={{ originX: `${impactX}px`, originY: `${impactY}px` }}
        >
          <g transform={`translate(${impactX}, ${impactY})`}>
            {/* Irregular splat blob */}
            <path
              d={SPLAT_PATH}
              fill="white"
              stroke="#333"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Starburst spikes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const len = 18 + (i % 3) * 6;
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={Math.cos(rad) * 20}
                  y1={Math.sin(rad) * 20}
                  x2={Math.cos(rad) * len}
                  y2={Math.sin(rad) * len}
                  stroke="#333"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              );
            })}
            <text
              x="0" y="5"
              fontSize="14"
              fontWeight="900"
              fill="#333"
              textAnchor="middle"
              style={{ fontFamily: "'Comic Sans MS', 'Caveat', cursive" }}
            >
              SPLAT
            </text>
          </g>
        </motion.g>
      )}

      {/* Splat particles */}
      {showSplat && <SplatParticles x={impactX} y={impactY} />}

      {/* Freeze zoom effect */}
      {phase === "freeze" && (
        <motion.rect
          x="0" y="0" width="400" height="230"
          fill="transparent"
          initial={{ scale: 1 }}
          animate={{ scale: 1.02 }}
          transition={{ duration: 0.15 }}
          style={{ originX: `${impactX}px`, originY: `${impactY}px` }}
        />
      )}

      {/* Player near lever */}
      <g>
        <circle cx="210" cy="195" r="5" fill="none" stroke="#555" strokeWidth="1.5" />
        <line x1="210" y1="200" x2="210" y2="215" stroke="#555" strokeWidth="1.5" />
        <motion.line
          x1="204" y1="207"
          x2="200" y2="162"
          stroke="#555" strokeWidth="1.5"
          animate={phase === "lever" ? { x2: [200, 198, 200] } : {}}
          transition={{ duration: 0.3 }}
        />
        <line x1="216" y1="207" x2="220" y2="212" stroke="#555" strokeWidth="1.5" />
        <line x1="210" y1="215" x2="205" y2="220" stroke="#555" strokeWidth="1.5" />
        <line x1="210" y1="215" x2="215" y2="220" stroke="#555" strokeWidth="1.5" />
      </g>
    </svg>
  );
};

const TrolleySimulator = () => {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [choices, setChoices] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<AnimPhase>("idle");
  const [pulled, setPulled] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);

  const level = levels[currentLevel];

  const handleChoice = useCallback((pullLever: boolean) => {
    if (phase !== "idle") return;
    setPulled(pullLever);
    setChoices((prev) => [...prev, pullLever]);

    // 0.0s - Lever
    setPhase("lever");

    // 0.4s - Track switch
    setTimeout(() => setPhase("switch"), 400);

    // 0.7s - Trolley moves
    setTimeout(() => setPhase("travel"), 700);

    // 2.2s - Pre-impact freeze
    setTimeout(() => setPhase("freeze"), 2200);

    // 2.4s - SPLAT
    setTimeout(() => setPhase("splat"), 2400);

    // 2.8s - Fade to next
    setTimeout(() => {
      setPhase("fadeout");
      setTimeout(() => {
        if (currentLevel >= levels.length - 1) {
          setFinished(true);
        } else {
          setCurrentLevel((prev) => prev + 1);
        }
        setPhase("idle");
        setPulled(null);
      }, 400);
    }, 2800);
  }, [phase, currentLevel]);

  const pullCount = choices.filter(Boolean).length;
  const nothingCount = choices.filter((c) => !c).length;
  const pullPercent = choices.length > 0 ? Math.round((pullCount / choices.length) * 100) : 0;

  const getLabel = () => {
    if (pullPercent >= 75) return "The Utilitarian";
    if (pullPercent <= 25) return "The Chaos Neutral";
    if (choices[3] === false && choices[11] === false) return "The Self-Preserver";
    return "The Emotional Protector";
  };

  const restart = () => {
    setCurrentLevel(0);
    setChoices([]);
    setFinished(false);
    setPhase("idle");
    setPulled(null);
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6" style={{ fontFamily: "'Caveat', 'Comic Sans MS', cursive, sans-serif" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Simulation Complete</h1>
          <div className="w-24 h-1 bg-gray-300 mx-auto my-6 rounded" />
          <div className="space-y-4 text-lg text-gray-700 mb-8">
            <p>You pulled the lever <strong className="text-red-500">{pullCount}</strong> times.</p>
            <p>You did nothing <strong className="text-gray-500">{nothingCount}</strong> times.</p>
            <p>Lever usage: <strong>{pullPercent}%</strong></p>
          </div>
          <div className="py-6 px-8 border-2 border-dashed border-gray-400 rounded-xl mb-8">
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Your moral archetype</p>
            <p className="text-3xl font-bold text-gray-800">{getLabel()}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={restart} className="px-6 py-3 border-2 border-gray-800 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors text-lg">
              🔄 Restart Simulation
            </button>
            <button onClick={() => navigate("/")} className="px-6 py-3 border-2 border-gray-400 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors text-lg">
              ⬅ Back to Arena
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 md:p-8" style={{ fontFamily: "'Caveat', 'Comic Sans MS', cursive, sans-serif" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLevel}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
          className="max-w-2xl w-full"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">Trolley Problems</h1>
            <p className="text-lg text-gray-500 mt-1">Level {currentLevel + 1}: {level.name}</p>
            <div className="flex justify-center gap-1 mt-3">
              {levels.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < currentLevel ? "bg-gray-800" : i === currentLevel ? "bg-red-400" : "bg-gray-200"}`} />
              ))}
            </div>
          </div>

          {/* Illustration */}
          <TrolleyIllustration phase={phase} pulled={pulled} />

          {/* Track labels */}
          <div className="flex justify-between max-w-md mx-auto mt-2 px-4 text-sm text-gray-500">
            <div className="text-center">
              <span className="text-xs uppercase tracking-wide">Pull lever →</span><br />
              <span className="font-semibold text-gray-700">{level.rightLabel}</span>
              {level.debatable && (level.debatable === "right" || level.debatable === "both") && (
                <span className="text-red-400 text-xs ml-1">(Debatable)</span>
              )}
            </div>
            <div className="text-center">
              <span className="text-xs uppercase tracking-wide">Do nothing →</span><br />
              <span className="font-semibold text-gray-700">{level.leftLabel}</span>
              {level.debatable && (level.debatable === "left" || level.debatable === "both") && (
                <span className="text-red-400 text-xs ml-1">(Debatable)</span>
              )}
            </div>
          </div>

          {/* Scenario */}
          <div className="text-center mt-6 px-4">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">{level.scenario}</p>
            {level.note && <p className="text-sm text-gray-400 mt-2 italic">{level.note}</p>}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button
              onClick={() => handleChoice(true)}
              disabled={phase !== "idle"}
              className="px-8 py-4 border-2 border-gray-800 text-gray-800 rounded-xl hover:bg-gray-100 transition-all text-xl disabled:opacity-40 hover:scale-105 active:scale-95"
            >
              🔀 Pull the lever
            </button>
            <button
              onClick={() => handleChoice(false)}
              disabled={phase !== "idle"}
              className="px-8 py-4 border-2 border-gray-400 text-gray-500 rounded-xl hover:bg-gray-50 transition-all text-xl disabled:opacity-40 hover:scale-105 active:scale-95"
            >
              😐 Do nothing
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TrolleySimulator;
