import { motion } from "framer-motion";
import RPSHand, { type Choice } from "./RPSHand";

type Result = "win" | "lose" | "draw" | null;
type Matchup = "rock-scissors" | "paper-rock" | "scissors-paper" | "draw" | null;

interface BattleArenaProps {
  playerChoice: Choice;
  computerChoice: Choice;
  result: Result;
  phase: "idle" | "reveal" | "battle" | "done";
}

const getMatchup = (winner: Choice, loser: Choice): Matchup => {
  if (winner === "rock" && loser === "scissors") return "rock-scissors";
  if (winner === "paper" && loser === "rock") return "paper-rock";
  if (winner === "scissors" && loser === "paper") return "scissors-paper";
  return null;
};

// --- Debris particles (rock crushes scissors) ---
const CrushDebris = ({ originX }: { originX: "left" | "right" }) => {
  const base = originX === "left" ? -20 : 20;
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
      {/* Large scissor blade shards */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`blade-${i}`}
          className="absolute"
          style={{
            left: "50%",
            top: "35%",
            width: 12 + Math.random() * 20,
            height: 4 + Math.random() * 10,
            background: `linear-gradient(135deg, hsl(320, 70%, ${45 + Math.random() * 20}%), hsl(320, 80%, 30%))`,
            boxShadow: `0 0 10px hsl(320, 80%, 58%), 0 0 20px hsl(320, 80%, 58%, 0.3)`,
            borderRadius: "2px",
          }}
          initial={{ x: base, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{
            x: base + (Math.random() - 0.5) * 350,
            y: 80 + Math.random() * 200,
            opacity: 0,
            scale: 0.2,
            rotate: Math.random() * 1080 - 540,
          }}
          transition={{ duration: 0.8 + Math.random() * 0.5, delay: 0.2 + Math.random() * 0.15, ease: "easeOut" as const }}
        />
      ))}
      {/* Small metal fragments */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`frag-${i}`}
          className="absolute"
          style={{
            left: "50%",
            top: "38%",
            width: 3 + Math.random() * 8,
            height: 3 + Math.random() * 6,
            background: `hsl(320, ${50 + Math.random() * 30}%, ${40 + Math.random() * 25}%)`,
            boxShadow: `0 0 6px hsl(320, 80%, 58%)`,
            borderRadius: Math.random() > 0.5 ? "50%" : "1px",
          }}
          initial={{ x: base, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{
            x: base + (Math.random() - 0.5) * 300,
            y: 40 + Math.random() * 180,
            opacity: 0,
            scale: 0.2,
            rotate: Math.random() * 720 - 360,
          }}
          transition={{ duration: 0.6 + Math.random() * 0.5, delay: 0.2 + Math.random() * 0.2, ease: "easeOut" as const }}
        />
      ))}
      {/* Sparks */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute"
          style={{
            left: "50%",
            top: "38%",
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "hsl(45, 100%, 70%)",
            boxShadow: "0 0 8px hsl(45, 100%, 60%), 0 0 16px hsl(30, 100%, 50%)",
          }}
          initial={{ x: base, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: base + (Math.random() - 0.5) * 250,
            y: (Math.random() - 0.5) * 200,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.4 + Math.random() * 0.3, delay: 0.15 + Math.random() * 0.1, ease: "easeOut" as const }}
        />
      ))}
      {/* Large impact flash */}
      <motion.div
        className="absolute rounded-full"
        style={{ left: "50%", top: "38%", transform: "translate(-50%, -50%)" }}
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{ width: 160, height: 160, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="w-full h-full rounded-full bg-neon-purple/70 blur-xl" />
      </motion.div>
      {/* Secondary shockwave ring */}
      <motion.div
        className="absolute rounded-full border-2 border-neon-purple/60"
        style={{ left: "50%", top: "38%", transform: "translate(-50%, -50%)" }}
        initial={{ width: 0, height: 0, opacity: 0.8 }}
        animate={{ width: 220, height: 220, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
      />
    </div>
  );
};

// --- Paper wrapping effect (paper covers rock) ---
const WrapEffect = ({ targetSide }: { targetSide: "left" | "right" }) => (
  <motion.div
    className="absolute z-20 pointer-events-none"
    style={{
      [targetSide === "left" ? "left" : "right"]: "10%",
      top: "15%",
      width: "35%",
      height: "65%",
    }}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 0.7, scale: 1.1 }}
    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" as const }}
  >
    <div
      className="w-full h-full rounded-xl"
      style={{
        background: "linear-gradient(135deg, hsl(185, 80%, 50%, 0.4), hsl(185, 60%, 40%, 0.6))",
        border: "2px solid hsl(185, 80%, 55%)",
        boxShadow: "0 0 20px hsl(185, 80%, 50%, 0.4), inset 0 0 15px hsl(185, 80%, 50%, 0.2)",
      }}
    />
  </motion.div>
);

// --- Torn paper pieces (scissors cuts paper) ---
const TornPaper = ({ originX }: { originX: "left" | "right" }) => {
  const base = originX === "left" ? -20 : 20;
  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Left torn piece */}
      <motion.div
        className="absolute"
        style={{
          left: `calc(50% + ${base}px - 20px)`,
          top: "25%",
          width: 28,
          height: 50,
          background: "hsl(185, 50%, 28%)",
          border: "2px solid hsl(185, 80%, 50%)",
          borderRadius: "4px",
          borderRight: "none",
          clipPath: "polygon(0 0, 100% 5%, 85% 30%, 100% 50%, 90% 75%, 100% 100%, 0 100%)",
        }}
        initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
        animate={{ x: -60, y: 100, rotate: -35, opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeIn" as const }}
      />
      {/* Right torn piece */}
      <motion.div
        className="absolute"
        style={{
          left: `calc(50% + ${base}px + 8px)`,
          top: "25%",
          width: 28,
          height: 50,
          background: "hsl(185, 50%, 28%)",
          border: "2px solid hsl(185, 80%, 50%)",
          borderRadius: "4px",
          borderLeft: "none",
          clipPath: "polygon(0 5%, 100% 0, 100% 100%, 0 100%, 15% 75%, 0% 50%, 10% 30%)",
        }}
        initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
        animate={{ x: 60, y: 110, rotate: 30, opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeIn" as const }}
      />
      {/* Cut sparks */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `calc(50% + ${base}px)`,
            top: "40%",
            width: 2,
            height: 6,
            background: "hsl(185, 90%, 70%)",
            boxShadow: "0 0 6px hsl(185, 90%, 70%)",
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 80,
            y: (Math.random() - 0.5) * 60,
            opacity: 0,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 0.4, delay: 0.2 + Math.random() * 0.1 }}
        />
      ))}
    </div>
  );
};

// --- Screen shake wrapper ---
const ScreenShake = ({ active, children }: { active: boolean; children: React.ReactNode }) => (
  <motion.div
    animate={
      active
        ? { x: [0, -6, 6, -4, 4, -2, 2, 0], y: [0, 3, -3, 2, -2, 1, -1, 0] }
        : { x: 0, y: 0 }
    }
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    {children}
  </motion.div>
);

const BattleArena = ({ playerChoice, computerChoice, result, phase }: BattleArenaProps) => {
  const isBattle = phase === "battle" || phase === "done";

  // Determine the matchup
  let matchup: Matchup = null;
  let winnerSide: "left" | "right" | null = null;
  if (result === "draw") {
    matchup = "draw";
  } else if (result === "win") {
    matchup = getMatchup(playerChoice, computerChoice);
    winnerSide = "left";
  } else if (result === "lose") {
    matchup = getMatchup(computerChoice, playerChoice);
    winnerSide = "right";
  }

  const loserSide = winnerSide === "left" ? "right" : "left";

  // Matchup-specific winner/loser animations
  const getWinnerAnim = () => {
    const dir = winnerSide === "left" ? 1 : -1;
    if (matchup === "rock-scissors") {
      // Rock charges forward
      return {
        animate: { x: dir * 60, scale: 1.2 },
        transition: { duration: 0.45, ease: "easeOut" as const },
      };
    }
    if (matchup === "paper-rock") {
      // Paper slides over
      return {
        animate: { x: dir * 50, scale: 1.1 },
        transition: { duration: 0.6, ease: "easeInOut" as const },
      };
    }
    if (matchup === "scissors-paper") {
      // Scissors cutting motion
      return {
        animate: { x: dir * 55, scale: 1.1, rotate: dir * -8 },
        transition: { duration: 0.4, ease: "easeOut" as const },
      };
    }
    return { animate: { x: dir * 40, scale: 1.15 }, transition: { duration: 0.5, ease: "easeOut" as const } };
  };

  const getLoserAnim = () => {
    if (matchup === "rock-scissors") {
      // Scissors crack and break apart
      return {
        animate: { opacity: 0.15, scale: 0.4, rotate: loserSide === "left" ? -30 : 30, y: 20 },
        transition: { duration: 0.5, ease: "easeIn" as const, delay: 0.25 },
      };
    }
    if (matchup === "paper-rock") {
      // Rock gets covered/hidden
      return {
        animate: { opacity: 0.2, scale: 0.75 },
        transition: { duration: 0.7, ease: "easeInOut" as const, delay: 0.2 },
      };
    }
    if (matchup === "scissors-paper") {
      // Paper tears apart
      return {
        animate: { opacity: 0.1, scale: 0.5, y: 40 },
        transition: { duration: 0.6, ease: "easeIn" as const, delay: 0.3 },
      };
    }
    return {
      animate: { opacity: 0.3, scale: 0.7, rotate: loserSide === "left" ? -20 : 20, y: 30 },
      transition: { duration: 0.6, ease: "easeIn" as const, delay: 0.3 },
    };
  };

  const getAnim = (side: "left" | "right") => {
    if (result === "draw") {
      return {
        animate: { y: [0, -20, 0, -12, 0, -6, 0] },
        transition: { duration: 0.7, ease: "easeInOut" as const },
      };
    }
    if (side === winnerSide) return getWinnerAnim();
    return getLoserAnim();
  };

  return (
    <ScreenShake active={isBattle && result !== "draw"}>
      <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-20 py-8 relative">
        {/* Matchup-specific effects */}
        {isBattle && matchup === "rock-scissors" && <CrushDebris originX={loserSide} />}
        {isBattle && matchup === "paper-rock" && <WrapEffect targetSide={loserSide} />}
        {isBattle && matchup === "scissors-paper" && <TornPaper originX={loserSide} />}

        {/* Player */}
        <div className="flex flex-col items-center gap-3 relative">
          <motion.div
            key={`player-${playerChoice}-${phase}`}
            initial={{ x: -60, opacity: 0 }}
            animate={isBattle ? getAnim("left").animate : { x: 0, opacity: 1 }}
            transition={isBattle ? getAnim("left").transition : { duration: 0.4, ease: "backOut" as const }}
          >
            <RPSHand choice={playerChoice} side="left" />
          </motion.div>
          <span className="font-display text-xs sm:text-sm font-bold text-neon-cyan tracking-wider uppercase">
            You
          </span>
        </div>

        {/* VS */}
        <motion.div
          className="font-display text-2xl sm:text-4xl font-black text-muted-foreground"
          animate={
            isBattle
              ? { scale: [1, 1.4, 0.6, 0], opacity: [1, 1, 0.5, 0] }
              : { scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.5 }}
        >
          VS
        </motion.div>

        {/* Computer */}
        <div className="flex flex-col items-center gap-3 relative">
          <motion.div
            key={`computer-${computerChoice}-${phase}`}
            initial={{ x: 60, opacity: 0 }}
            animate={isBattle ? getAnim("right").animate : { x: 0, opacity: 1 }}
            transition={isBattle ? getAnim("right").transition : { duration: 0.4, ease: "backOut" as const }}
          >
            <RPSHand choice={computerChoice} side="right" />
          </motion.div>
          <span className="font-display text-xs sm:text-sm font-bold text-neon-pink tracking-wider uppercase">
            CPU
          </span>
        </div>

        {/* Impact text flash */}
        {isBattle && result !== "draw" && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1.2], opacity: [0, 1, 0] }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <span className="font-display text-4xl sm:text-6xl font-black" style={{
              color: matchup === "rock-scissors"
                ? "hsl(270, 80%, 60%)"
                : matchup === "scissors-paper"
                  ? "hsl(320, 80%, 58%)"
                  : "hsl(185, 80%, 50%)",
              textShadow: "0 0 30px currentColor",
            }}>
              {matchup === "rock-scissors" ? "💥" : matchup === "scissors-paper" ? "✂️" : "📦"}
            </span>
          </motion.div>
        )}
      </div>
    </ScreenShake>
  );
};

export default BattleArena;
