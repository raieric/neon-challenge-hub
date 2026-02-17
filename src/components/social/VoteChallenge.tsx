import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "@/components/Confetti";

interface VoteChallengeProps {
  onDone: () => void;
}

const VoteChallenge = ({ onDone }: VoteChallengeProps) => {
  const [passVotes, setPassVotes] = useState(0);
  const [retryVotes, setRetryVotes] = useState(0);
  const [votingOpen, setVotingOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!votingOpen || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((r) => {
        if (r <= 1) {
          clearInterval(t);
          setVotingOpen(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [votingOpen, timeLeft]);

  useEffect(() => {
    if (!votingOpen && passVotes > retryVotes) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [votingOpen, passVotes, retryVotes]);

  const total = passVotes + retryVotes || 1;
  const passPercent = (passVotes / total) * 100;
  const retryPercent = (retryVotes / total) * 100;
  const result = passVotes > retryVotes ? "PASS" : passVotes === retryVotes ? "TIE" : "RETRY";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center gap-6 text-center relative"
    >
      {showConfetti && <Confetti />}

      <div className="glass-panel px-6 sm:px-10 py-4 neon-glow-cyan">
        <h3 className="font-display text-lg sm:text-2xl font-black text-foreground">
          🗳 Class Vote
        </h3>
      </div>

      {votingOpen && (
        <motion.span
          className="font-display text-2xl font-black text-neon-cyan tabular-nums"
          animate={{ scale: timeLeft <= 3 ? [1, 1.2, 1] : 1 }}
          transition={{ repeat: timeLeft <= 3 ? Infinity : 0, duration: 0.5 }}
        >
          {timeLeft}s
        </motion.span>
      )}

      {/* Vote buttons */}
      <div className="flex gap-6 sm:gap-10">
        <motion.button
          whileHover={votingOpen ? { scale: 1.08 } : {}}
          whileTap={votingOpen ? { scale: 0.95 } : {}}
          onClick={() => votingOpen && setPassVotes((v) => v + 1)}
          disabled={!votingOpen}
          className={`glass-panel px-8 sm:px-12 py-6 sm:py-8 flex flex-col items-center gap-2 transition-all ${
            votingOpen ? "neon-glow-cyan cursor-pointer" : "opacity-70"
          }`}
        >
          <span className="text-4xl sm:text-5xl">✅</span>
          <span className="font-display text-lg sm:text-xl font-black text-neon-green">PASS</span>
          <span className="font-display text-2xl sm:text-3xl font-black text-foreground tabular-nums">{passVotes}</span>
        </motion.button>

        <motion.button
          whileHover={votingOpen ? { scale: 1.08 } : {}}
          whileTap={votingOpen ? { scale: 0.95 } : {}}
          onClick={() => votingOpen && setRetryVotes((v) => v + 1)}
          disabled={!votingOpen}
          className={`glass-panel px-8 sm:px-12 py-6 sm:py-8 flex flex-col items-center gap-2 transition-all ${
            votingOpen ? "neon-glow-pink cursor-pointer" : "opacity-70"
          }`}
        >
          <span className="text-4xl sm:text-5xl">🔁</span>
          <span className="font-display text-lg sm:text-xl font-black text-destructive">RETRY</span>
          <span className="font-display text-2xl sm:text-3xl font-black text-foreground tabular-nums">{retryVotes}</span>
        </motion.button>
      </div>

      {/* Progress bars */}
      <div className="w-full max-w-md flex flex-col gap-2">
        <div className="flex gap-1 h-5 rounded-full overflow-hidden bg-muted">
          <motion.div
            className="h-full rounded-l-full"
            style={{ background: "hsl(150, 80%, 45%)", boxShadow: "0 0 10px hsl(150, 80%, 45%)" }}
            animate={{ width: `${passPercent}%` }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="h-full rounded-r-full"
            style={{ background: "hsl(0, 84%, 60%)", boxShadow: "0 0 10px hsl(0, 84%, 60%)" }}
            animate={{ width: `${retryPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between font-body text-xs text-muted-foreground">
          <span>{Math.round(passPercent)}% Pass</span>
          <span>{Math.round(retryPercent)}% Retry</span>
        </div>
      </div>

      {/* Result */}
      {!votingOpen && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <h3
            className={`font-display text-3xl sm:text-5xl font-black ${
              result === "PASS" ? "text-neon-green" : result === "RETRY" ? "text-destructive" : "text-neon-cyan"
            }`}
          >
            {result === "PASS" ? "✅ PASSED!" : result === "RETRY" ? "🔁 RETRY!" : "🤝 TIE!"}
          </h3>
          <button
            onClick={onDone}
            className="mt-4 px-8 py-3 font-display text-sm font-bold tracking-widest uppercase rounded-xl border border-neon-green/50 text-neon-green hover:bg-neon-green/10 transition-all"
          >
            ✅ CONTINUE
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VoteChallenge;
