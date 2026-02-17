import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import Confetti from "@/components/Confetti";
import ThemeToggle from "@/components/ThemeToggle";
import BattleArena from "@/components/rps/BattleArena";
import RPSHand, { type Choice } from "@/components/rps/RPSHand";

const CHOICES: Choice[] = ["rock", "paper", "scissors"];
const LABELS: Record<Choice, string> = { rock: "🪨 Rock", paper: "📄 Paper", scissors: "✂️ Scissors" };

const getResult = (player: Choice, computer: Choice): "win" | "lose" | "draw" => {
  if (player === computer) return "draw";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) return "win";
  return "lose";
};

const RockPaperScissors = () => {
  const [phase, setPhase] = useState<"pick" | "reveal" | "battle" | "done">("pick");
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakBonus, setStreakBonus] = useState(false);

  const play = useCallback((choice: Choice) => {
    if (phase !== "pick") return;

    const cpu = CHOICES[Math.floor(Math.random() * 3)];
    const res = getResult(choice, cpu);

    setPlayerChoice(choice);
    setComputerChoice(cpu);
    setResult(res);
    setPhase("reveal");

    // Reveal phase -> battle phase
    setTimeout(() => setPhase("battle"), 600);

    // Battle -> done
    setTimeout(() => {
      setPhase("done");

      if (res === "win") {
        setScore((s) => ({ ...s, wins: s.wins + 1 }));
        setStreak((s) => {
          const newStreak = s + 1;
          setBestStreak((b) => Math.max(b, newStreak));
          if (newStreak >= 3 && newStreak % 3 === 0) {
            setStreakBonus(true);
            setTimeout(() => setStreakBonus(false), 3000);
          }
          return newStreak;
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      } else if (res === "lose") {
        setScore((s) => ({ ...s, losses: s.losses + 1 }));
        setStreak(0);
      } else {
        setScore((s) => ({ ...s, draws: s.draws + 1 }));
      }
    }, 1400);
  }, [phase]);

  const reset = () => {
    setPhase("pick");
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setStreakBonus(false);
  };

  const resultText = result === "win" ? "🎉 You Win!" : result === "lose" ? "💀 You Lose!" : "🤝 It's a Draw!";
  const resultColor = result === "win" ? "text-neon-green" : result === "lose" ? "text-destructive" : "text-neon-cyan";

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <ParticleBackground />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/10 rounded-full blur-[150px]" />
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
              🏆 <span className="text-neon-cyan font-bold">{score.wins}</span>
              {" / "}
              <span className="text-destructive font-bold">{score.losses}</span>
              {" / "}
              <span className="text-muted-foreground font-bold">{score.draws}</span>
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl sm:text-4xl font-black text-foreground text-glow-purple mb-2 animate-fade-in text-center">
          ✊ Rock Paper Scissors
        </h1>

        {/* Streak display */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <span className="font-body text-xs sm:text-sm text-muted-foreground">
            🔥 Streak: <span className="text-neon-cyan font-bold">{streak}</span>
          </span>
          <span className="font-body text-xs sm:text-sm text-muted-foreground">
            ⭐ Best: <span className="text-neon-purple font-bold">{bestStreak}</span>
          </span>
        </div>

        {/* Streak Bonus */}
        <AnimatePresence>
          {streakBonus && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="mb-4 glass-panel px-6 py-3 neon-glow-cyan"
            >
              <span className="font-display text-sm sm:text-lg font-black text-neon-cyan">
                🏅 {streak}x STREAK BONUS!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pick Phase */}
        {phase === "pick" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <p className="font-body text-sm sm:text-base text-muted-foreground mb-8 tracking-widest uppercase">
              Choose your weapon
            </p>
            <div className="flex gap-4 sm:gap-8">
              {CHOICES.map((choice) => (
                <motion.button
                  key={choice}
                  onClick={() => play(choice)}
                  whileHover={{ scale: 1.1, y: -8 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-3 glass-panel p-4 sm:p-6 hover:neon-glow-purple transition-shadow duration-300 group"
                >
                  <RPSHand choice={choice} side="left" className="group-hover:drop-shadow-[0_0_12px_hsl(270,80%,60%)]" />
                  <span className="font-display text-xs sm:text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors tracking-wider">
                    {LABELS[choice]}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Battle Phase */}
        {phase !== "pick" && playerChoice && computerChoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <BattleArena
              playerChoice={playerChoice}
              computerChoice={computerChoice}
              result={result}
              phase={phase === "reveal" ? "reveal" : phase === "battle" ? "battle" : "done"}
            />

            {/* Result text */}
            <AnimatePresence>
              {phase === "done" && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  className="mt-4 text-center"
                >
                  <h2 className={`font-display text-3xl sm:text-5xl font-black ${resultColor}`}>
                    {resultText}
                  </h2>
                  <p className="font-body text-sm text-muted-foreground mt-2">
                    {LABELS[playerChoice]} vs {LABELS[computerChoice]}
                  </p>

                  <motion.button
                    onClick={reset}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-8 px-8 sm:px-12 py-3 sm:py-4 font-display text-base sm:text-lg font-black tracking-widest uppercase
                      rounded-xl border transition-all duration-300
                      bg-gradient-to-r from-neon-purple to-neon-cyan text-primary-foreground border-neon-purple/50
                      hover:shadow-[0_0_30px_hsl(270_80%_60%/0.4)]"
                  >
                    🔁 PLAY AGAIN
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RockPaperScissors;
