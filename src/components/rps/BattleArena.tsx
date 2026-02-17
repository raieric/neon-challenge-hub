import { motion, AnimatePresence } from "framer-motion";
import RPSHand, { type Choice } from "./RPSHand";

type Result = "win" | "lose" | "draw" | null;

interface BattleArenaProps {
  playerChoice: Choice;
  computerChoice: Choice;
  result: Result;
  phase: "idle" | "reveal" | "battle" | "done";
}

const getAnimation = (
  playerChoice: Choice,
  computerChoice: Choice,
  result: Result,
  side: "left" | "right"
) => {
  if (result === "draw") {
    return {
      animate: { y: [0, -15, 0, -10, 0] },
      transition: { duration: 0.6, ease: "easeInOut" as const },
    };
  }

  const isWinner =
    (side === "left" && result === "win") ||
    (side === "right" && result === "lose");

  if (isWinner) {
    return {
      animate: { x: side === "left" ? 40 : -40, scale: 1.15 },
      transition: { duration: 0.5, ease: "easeOut" as const },
    };
  }

  // Loser animation
  return {
    animate: { opacity: 0.3, scale: 0.7, rotate: side === "left" ? -20 : 20, y: 30 },
    transition: { duration: 0.6, ease: "easeIn" as const, delay: 0.3 },
  };
};

const Debris = () => (
  <div className="absolute inset-0 pointer-events-none">
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-sm bg-muted-foreground"
        initial={{ x: 0, y: 0, opacity: 1 }}
        animate={{
          x: (Math.random() - 0.5) * 120,
          y: Math.random() * 80 + 20,
          opacity: 0,
          rotate: Math.random() * 360,
        }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{ left: "50%", top: "50%" }}
      />
    ))}
  </div>
);

const BattleArena = ({ playerChoice, computerChoice, result, phase }: BattleArenaProps) => {
  const showDebris =
    phase === "battle" &&
    ((result === "win" && playerChoice === "rock") ||
      (result === "lose" && computerChoice === "rock") ||
      (result === "win" && playerChoice === "scissors") ||
      (result === "lose" && computerChoice === "scissors"));

  return (
    <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-20 py-8">
      {/* Player */}
      <div className="flex flex-col items-center gap-3 relative">
        <motion.div
          key={`player-${playerChoice}-${phase}`}
          initial={{ x: -60, opacity: 0 }}
          animate={
            phase === "battle" || phase === "done"
              ? getAnimation(playerChoice, computerChoice, result, "left").animate
              : { x: 0, opacity: 1 }
          }
          transition={
            phase === "battle" || phase === "done"
              ? getAnimation(playerChoice, computerChoice, result, "left").transition
              : { duration: 0.4, ease: "backOut" }
          }
        >
          <RPSHand choice={playerChoice} side="left" />
        </motion.div>
        {phase === "battle" && result === "lose" && showDebris && <Debris />}
        <span className="font-display text-xs sm:text-sm font-bold text-neon-cyan tracking-wider uppercase">
          You
        </span>
      </div>

      {/* VS */}
      <motion.div
        className="font-display text-2xl sm:text-4xl font-black text-muted-foreground"
        animate={
          phase === "battle"
            ? { scale: [1, 1.3, 0.8], opacity: [1, 1, 0.3] }
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
          animate={
            phase === "battle" || phase === "done"
              ? getAnimation(playerChoice, computerChoice, result, "right").animate
              : { x: 0, opacity: 1 }
          }
          transition={
            phase === "battle" || phase === "done"
              ? getAnimation(playerChoice, computerChoice, result, "right").transition
              : { duration: 0.4, ease: "backOut" }
          }
        >
          <RPSHand choice={computerChoice} side="right" />
        </motion.div>
        {phase === "battle" && result === "win" && showDebris && <Debris />}
        <span className="font-display text-xs sm:text-sm font-bold text-neon-pink tracking-wider uppercase">
          CPU
        </span>
      </div>
    </div>
  );
};

export default BattleArena;
