import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "@/components/Confetti";

// ─── TYPES ────────────────────────────────────────────────
type Phase = "lobby" | "roleReveal" | "topic" | "discussion" | "voting" | "results" | "gameOver";

interface Player {
  id: number;
  name: string;
  isImposter: boolean;
  isEliminated: boolean;
  color: string;
}

// ─── DATA ─────────────────────────────────────────────────
const TOPICS = [
  { real: "Pointer", fake: "Array", prompt: "Explain this concept in C programming." },
  { real: "Recursion", fake: "Iteration", prompt: "How does this approach solve problems?" },
  { real: "Inheritance", fake: "Encapsulation", prompt: "Describe this OOP principle." },
  { real: "Stack", fake: "Queue", prompt: "When would you use this data structure?" },
  { real: "Compiler", fake: "Interpreter", prompt: "How does this process code?" },
  { real: "Binary Search", fake: "Linear Search", prompt: "Explain this search algorithm." },
  { real: "TCP", fake: "UDP", prompt: "Describe this network protocol." },
  { real: "Git Merge", fake: "Git Rebase", prompt: "When would you use this git strategy?" },
  { real: "Mutex", fake: "Semaphore", prompt: "How does this handle concurrency?" },
  { real: "REST API", fake: "GraphQL", prompt: "Explain this API architecture." },
  { real: "SQL JOIN", fake: "SQL UNION", prompt: "When would you use this SQL operation?" },
  { real: "Docker", fake: "Virtual Machine", prompt: "How does this run applications?" },
];

const PLAYER_COLORS = [
  "hsl(270, 80%, 60%)", "hsl(185, 80%, 50%)", "hsl(320, 80%, 58%)",
  "hsl(150, 80%, 50%)", "hsl(30, 90%, 55%)", "hsl(220, 90%, 56%)",
  "hsl(350, 80%, 55%)", "hsl(50, 90%, 60%)", "hsl(100, 70%, 50%)",
  "hsl(200, 80%, 55%)",
];

// ─── LOBBY ────────────────────────────────────────────────
const Lobby = ({ onStart }: { onStart: (names: string[]) => void }) => {
  const [names, setNames] = useState<string[]>(["", "", ""]);

  const addPlayer = () => {
    if (names.length < 10) setNames([...names, ""]);
  };
  const removePlayer = (i: number) => {
    if (names.length > 3) setNames(names.filter((_, idx) => idx !== i));
  };
  const updateName = (i: number, v: string) => {
    const copy = [...names];
    copy[i] = v;
    setNames(copy);
  };

  const valid = names.every((n) => n.trim().length >= 1) && new Set(names.map(n => n.trim().toLowerCase())).size === names.length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold text-foreground">Player Setup</h2>
        <p className="font-body text-muted-foreground text-sm">Enter names for 3–10 players. Pass the device to reveal roles.</p>
      </div>

      <div className="space-y-3">
        {names.map((name, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: PLAYER_COLORS[i] }} />
            <input
              className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={`Player ${i + 1}`}
              value={name}
              onChange={(e) => updateName(i, e.target.value)}
              maxLength={20}
            />
            {names.length > 3 && (
              <button onClick={() => removePlayer(i)} className="text-destructive hover:text-destructive/80 text-xl font-bold w-8 h-8">×</button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {names.length < 10 && (
          <button onClick={addPlayer} className="flex-1 h-10 rounded-md border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors font-body text-sm">
            + Add Player
          </button>
        )}
        <button
          disabled={!valid}
          onClick={() => onStart(names.map(n => n.trim()))}
          className="flex-1 h-10 rounded-md bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider uppercase hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ▶ Start Game
        </button>
      </div>
    </motion.div>
  );
};

// ─── ROLE REVEAL (pass device) ───────────────────────────
const RoleReveal = ({ players, onDone }: { players: Player[]; onDone: () => void }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const activePlayers = players.filter((p) => !p.isEliminated);
  const current = activePlayers[currentIdx];

  const next = () => {
    setRevealed(false);
    if (currentIdx + 1 >= activePlayers.length) {
      onDone();
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md mx-auto text-center space-y-6">
      <p className="font-body text-muted-foreground text-sm">Pass the device to:</p>
      <div className="flex items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-background" style={{ backgroundColor: current.color }}>
          {current.name[0].toUpperCase()}
        </div>
        <h2 className="font-display text-3xl font-black text-foreground">{current.name}</h2>
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mx-auto block px-8 py-4 rounded-xl border-2 border-primary/50 text-primary font-display font-bold text-lg tracking-wider uppercase hover:bg-primary/10 transition-all"
        >
          🔍 Tap to Reveal Your Role
        </button>
      ) : (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <div className={`p-8 rounded-2xl border-2 ${current.isImposter ? "border-destructive bg-destructive/10" : "border-primary bg-primary/10"}`}>
            <span className="text-5xl block mb-3">{current.isImposter ? "🎭" : "✅"}</span>
            <h3 className={`font-display text-2xl font-black ${current.isImposter ? "text-destructive" : "text-primary"}`}>
              {current.isImposter ? "You are the IMPOSTER" : "You are INNOCENT"}
            </h3>
            {current.isImposter && (
              <p className="font-body text-muted-foreground text-sm mt-2">Blend in. Don't get caught.</p>
            )}
          </div>
          <button onClick={next} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors">
            {currentIdx + 1 >= activePlayers.length ? "Continue →" : "Pass Device →"}
          </button>
        </motion.div>
      )}

      <div className="flex justify-center gap-2 mt-4">
        {activePlayers.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i === currentIdx ? "bg-primary" : i < currentIdx ? "bg-primary/30" : "bg-muted"}`} />
        ))}
      </div>
    </motion.div>
  );
};

// ─── TOPIC REVEAL (pass device) ──────────────────────────
const TopicReveal = ({ players, topic, onDone }: { players: Player[]; topic: typeof TOPICS[0]; onDone: () => void }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const activePlayers = players.filter((p) => !p.isEliminated);
  const current = activePlayers[currentIdx];

  const next = () => {
    setRevealed(false);
    if (currentIdx + 1 >= activePlayers.length) {
      onDone();
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const word = current.isImposter ? topic.fake : topic.real;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md mx-auto text-center space-y-6">
      <p className="font-body text-muted-foreground text-sm">Pass the device to:</p>
      <div className="flex items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-background" style={{ backgroundColor: current.color }}>
          {current.name[0].toUpperCase()}
        </div>
        <h2 className="font-display text-3xl font-black text-foreground">{current.name}</h2>
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mx-auto block px-8 py-4 rounded-xl border-2 border-accent/50 text-accent-foreground font-display font-bold text-lg tracking-wider uppercase hover:bg-accent/10 transition-all"
        >
          📝 Tap to See Your Word
        </button>
      ) : (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <div className="p-8 rounded-2xl border-2 border-primary bg-card">
            <p className="font-body text-muted-foreground text-xs uppercase tracking-widest mb-2">Your secret word</p>
            <h3 className="font-display text-4xl font-black text-foreground">{word}</h3>
            <p className="font-body text-muted-foreground text-sm mt-3">{topic.prompt}</p>
          </div>
          <p className="font-body text-xs text-muted-foreground/60">Memorize it. Don't show anyone.</p>
          <button onClick={next} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors">
            {currentIdx + 1 >= activePlayers.length ? "Start Discussion →" : "Pass Device →"}
          </button>
        </motion.div>
      )}

      <div className="flex justify-center gap-2 mt-4">
        {activePlayers.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i === currentIdx ? "bg-primary" : i < currentIdx ? "bg-primary/30" : "bg-muted"}`} />
        ))}
      </div>
    </motion.div>
  );
};

// ─── DISCUSSION PHASE ────────────────────────────────────
const DiscussionPhase = ({ topic, timeLimit, onDone }: { topic: typeof TOPICS[0]; timeLimit: number; onDone: () => void }) => {
  const [remaining, setRemaining] = useState(timeLimit);

  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const t = setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onDone]);

  const progress = remaining / timeLimit;
  const isLow = remaining <= 10;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg mx-auto text-center space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold text-foreground">💬 Discussion Phase</h2>
        <p className="font-body text-muted-foreground">{topic.prompt}</p>
      </div>

      <div className="relative w-40 h-40 mx-auto">
        <svg width={160} height={160} className="-rotate-90">
          <circle cx={80} cy={80} r={72} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle cx={80} cy={80} r={72} fill="none" stroke={isLow ? "hsl(var(--destructive))" : "hsl(var(--primary))"} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 72} strokeDashoffset={2 * Math.PI * 72 * (1 - progress)}
            className="transition-all duration-1000 ease-linear" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display text-4xl font-black tabular-nums ${isLow ? "text-destructive animate-pulse" : "text-foreground"}`}>{remaining}</span>
          <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">seconds</span>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border">
        <p className="font-body text-muted-foreground text-sm">Everyone discusses face-to-face about the topic. Try to identify who has a different word!</p>
      </div>

      <button onClick={onDone} className="px-6 py-2 rounded-lg border border-destructive/50 text-destructive font-display text-sm font-bold tracking-wider uppercase hover:bg-destructive/10 transition-colors">
        ⏩ Skip to Voting
      </button>
    </motion.div>
  );
};

// ─── VOTING PHASE (pass device) ──────────────────────────
const VotingPhase = ({ players, onDone }: { players: Player[]; onDone: (votes: Record<number, number>) => void }) => {
  const activePlayers = players.filter((p) => !p.isEliminated);
  const [voterIdx, setVoterIdx] = useState(0);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [ready, setReady] = useState(false);
  const voter = activePlayers[voterIdx];

  const castVote = (targetId: number) => {
    const newVotes = { ...votes, [voter.id]: targetId };
    setVotes(newVotes);
    setReady(false);
    if (voterIdx + 1 >= activePlayers.length) {
      onDone(newVotes);
    } else {
      setVoterIdx(voterIdx + 1);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md mx-auto text-center space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">🗳️ Voting Phase</h2>
      <p className="font-body text-muted-foreground text-sm">Pass the device to:</p>

      <div className="flex items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-background" style={{ backgroundColor: voter.color }}>
          {voter.name[0].toUpperCase()}
        </div>
        <h3 className="font-display text-2xl font-black text-foreground">{voter.name}</h3>
      </div>

      {!ready ? (
        <button
          onClick={() => setReady(true)}
          className="mx-auto block px-8 py-4 rounded-xl border-2 border-primary/50 text-primary font-display font-bold text-lg tracking-wider uppercase hover:bg-primary/10 transition-all"
        >
          🗳️ Ready to Vote
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <p className="font-body text-sm text-muted-foreground">Who do you think is the imposter?</p>
          {activePlayers
            .filter((p) => p.id !== voter.id)
            .map((p) => (
              <button
                key={p.id}
                onClick={() => castVote(p.id)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-destructive hover:bg-destructive/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-background" style={{ backgroundColor: p.color }}>
                  {p.name[0].toUpperCase()}
                </div>
                <span className="font-display font-bold text-foreground group-hover:text-destructive transition-colors">{p.name}</span>
              </button>
            ))}
        </motion.div>
      )}

      <div className="flex justify-center gap-2 mt-4">
        {activePlayers.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i === voterIdx ? "bg-primary" : i < voterIdx ? "bg-primary/30" : "bg-muted"}`} />
        ))}
      </div>
    </motion.div>
  );
};

// ─── RESULTS PHASE ───────────────────────────────────────
const ResultsPhase = ({
  players, votes, onContinue, onGameOver,
}: {
  players: Player[];
  votes: Record<number, number>;
  onContinue: (eliminatedId: number) => void;
  onGameOver: (winner: "innocents" | "imposter") => void;
}) => {
  const activePlayers = players.filter((p) => !p.isEliminated);

  // Tally votes
  const tally: Record<number, number> = {};
  Object.values(votes).forEach((targetId) => {
    tally[targetId] = (tally[targetId] || 0) + 1;
  });

  const maxVotes = Math.max(...Object.values(tally));
  const topVoted = Object.entries(tally)
    .filter(([, count]) => count === maxVotes)
    .map(([id]) => Number(id));

  // Pick first in case of tie
  const eliminatedId = topVoted[0];
  const eliminated = players.find((p) => p.id === eliminatedId)!;
  const imposterCaught = eliminated.isImposter;

  // Check if innocents are down to 2 (imposter + 1 innocent)
  const remainingAfter = activePlayers.filter((p) => p.id !== eliminatedId);
  const innocentsLeft = remainingAfter.filter((p) => !p.isImposter).length;
  const imposterWins = !imposterCaught && innocentsLeft <= 1;

  const handleNext = () => {
    if (imposterCaught) {
      onGameOver("innocents");
    } else if (imposterWins) {
      onGameOver("imposter");
    } else {
      onContinue(eliminatedId);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md mx-auto text-center space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">📊 Vote Results</h2>

      <div className="space-y-2">
        {activePlayers
          .sort((a, b) => (tally[b.id] || 0) - (tally[a.id] || 0))
          .map((p) => (
            <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border ${p.id === eliminatedId ? "border-destructive bg-destructive/10" : "border-border"}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-background" style={{ backgroundColor: p.color }}>
                {p.name[0].toUpperCase()}
              </div>
              <span className="font-display font-bold text-foreground flex-1 text-left">{p.name}</span>
              <div className="flex gap-1">
                {Array.from({ length: tally[p.id] || 0 }).map((_, i) => (
                  <span key={i} className="text-destructive text-lg">🗳️</span>
                ))}
              </div>
              <span className="font-display font-bold text-muted-foreground w-6">{tally[p.id] || 0}</span>
            </div>
          ))}
      </div>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }}
        className={`p-6 rounded-2xl border-2 ${imposterCaught ? "border-primary bg-primary/10" : "border-destructive bg-destructive/10"}`}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-background" style={{ backgroundColor: eliminated.color }}>
            {eliminated.name[0].toUpperCase()}
          </div>
          <h3 className="font-display text-xl font-black text-foreground">{eliminated.name}</h3>
        </div>
        <p className="font-display text-lg font-bold">
          {imposterCaught ? (
            <span className="text-primary">was the IMPOSTER! 🎉</span>
          ) : (
            <span className="text-destructive">was INNOCENT! 😱</span>
          )}
        </p>
        {imposterWins && <p className="font-body text-sm text-muted-foreground mt-2">The imposter has survived!</p>}
      </motion.div>

      <button onClick={handleNext} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors">
        {imposterCaught || imposterWins ? "See Final Result →" : "Next Round →"}
      </button>
    </motion.div>
  );
};

// ─── GAME OVER ───────────────────────────────────────────
const GameOver = ({ winner, imposter, onReplay }: { winner: "innocents" | "imposter"; imposter: Player; onReplay: () => void }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-auto text-center space-y-6">
    {winner === "innocents" && <Confetti />}
    <span className="text-7xl block">{winner === "innocents" ? "🎉" : "😈"}</span>
    <h2 className={`font-display text-3xl font-black ${winner === "innocents" ? "text-primary" : "text-destructive"}`}>
      {winner === "innocents" ? "Innocents Win!" : "The Imposter Survived!"}
    </h2>
    <p className="font-body text-muted-foreground">
      The imposter was <span className="font-bold text-foreground">{imposter.name}</span>
    </p>
    <div className="flex gap-3 justify-center">
      <button onClick={onReplay} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider uppercase hover:bg-primary/90 transition-colors">
        🔄 Play Again
      </button>
      <Link to="/" className="px-6 py-3 rounded-lg border border-border text-muted-foreground font-display font-bold text-sm tracking-wider uppercase hover:bg-accent transition-colors">
        🏠 Home
      </Link>
    </div>
  </motion.div>
);

// ─── MAIN GAME ───────────────────────────────────────────
const ImposterClassroom = () => {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [players, setPlayers] = useState<Player[]>([]);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [winner, setWinner] = useState<"innocents" | "imposter">("innocents");
  const [discussionTime] = useState(60);

  const startGame = useCallback((names: string[]) => {
    const imposterIdx = Math.floor(Math.random() * names.length);
    const newPlayers: Player[] = names.map((name, i) => ({
      id: i,
      name,
      isImposter: i === imposterIdx,
      isEliminated: false,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
    }));
    setPlayers(newPlayers);
    setTopic(TOPICS[Math.floor(Math.random() * TOPICS.length)]);
    setPhase("roleReveal");
  }, []);

  const handleContinue = useCallback((eliminatedId: number) => {
    setPlayers((prev) => prev.map((p) => (p.id === eliminatedId ? { ...p, isEliminated: true } : p)));
    setPhase("discussion");
  }, []);

  const handleGameOver = useCallback((w: "innocents" | "imposter") => {
    setWinner(w);
    setPhase("gameOver");
  }, []);

  const replay = useCallback(() => {
    setPlayers([]);
    setVotes({});
    setPhase("lobby");
  }, []);

  const imposter = players.find((p) => p.isImposter);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 min-h-screen">
        {/* Header */}
        <div className="w-full flex items-center justify-between max-w-lg mb-8">
          <Link to="/" className="font-display text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </Link>
          <div className="text-center">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">🎭 Imposter Classroom</h1>
            <p className="font-body text-xs text-muted-foreground tracking-wider uppercase">Find the imposter before it's too late</p>
          </div>
          <div className="w-12" />
        </div>

        {/* Phase indicator */}
        {phase !== "lobby" && phase !== "gameOver" && (
          <div className="flex gap-1 mb-8">
            {(["roleReveal", "topic", "discussion", "voting", "results"] as Phase[]).map((p) => (
              <div key={p} className={`h-1.5 w-12 rounded-full transition-colors ${p === phase ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {phase === "lobby" && <Lobby key="lobby" onStart={startGame} />}
          {phase === "roleReveal" && <RoleReveal key="role" players={players} onDone={() => setPhase("topic")} />}
          {phase === "topic" && <TopicReveal key="topic" players={players} topic={topic} onDone={() => setPhase("discussion")} />}
          {phase === "discussion" && <DiscussionPhase key="disc" topic={topic} timeLimit={discussionTime} onDone={() => setPhase("voting")} />}
          {phase === "voting" && <VotingPhase key="vote" players={players} onDone={(v) => { setVotes(v); setPhase("results"); }} />}
          {phase === "results" && <ResultsPhase key="res" players={players} votes={votes} onContinue={handleContinue} onGameOver={handleGameOver} />}
          {phase === "gameOver" && imposter && <GameOver key="go" winner={winner} imposter={imposter} onReplay={replay} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ImposterClassroom;
