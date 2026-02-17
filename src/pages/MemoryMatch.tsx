import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, Timer, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "@/components/Confetti";

// --- DATA ---
interface CardPair {
  term: string;
  definition: string;
}

const easyPairs: CardPair[] = [
  { term: "int", definition: "Integer data type" },
  { term: "float", definition: "Decimal number type" },
  { term: "printf", definition: "Output function" },
  { term: "scanf", definition: "Input function" },
  { term: "&&", definition: "Logical AND" },
  { term: "||", definition: "Logical OR" },
  { term: "=", definition: "Assignment operator" },
  { term: "==", definition: "Comparison operator" },
  { term: "char", definition: "Single character type" },
  { term: "void", definition: "No return type" },
  { term: "return", definition: "Exit function with value" },
  { term: "#include", definition: "Header file directive" },
];

const mediumPairs: CardPair[] = [
  { term: "for", definition: "Loop with init, condition, update" },
  { term: "while", definition: "Loop with condition first" },
  { term: "break", definition: "Exit loop immediately" },
  { term: "continue", definition: "Skip current iteration" },
  { term: "%", definition: "Modulus operator" },
  { term: "\\n", definition: "New line escape sequence" },
  { term: "sizeof", definition: "Returns size of a type" },
  { term: "malloc", definition: "Dynamic memory allocation" },
  { term: "struct", definition: "User-defined data type" },
  { term: "typedef", definition: "Create type alias" },
  { term: "enum", definition: "Named integer constants" },
  { term: "switch", definition: "Multi-way branch statement" },
];

const hardPairs: CardPair[] = [
  { term: "Segmentation fault", definition: "Invalid memory access" },
  { term: "Dangling pointer", definition: "Pointer to freed memory" },
  { term: "Stack overflow", definition: "Too many recursive calls" },
  { term: "Undefined behavior", definition: "Not specified by standard" },
  { term: "Buffer overflow", definition: "Write past array bounds" },
  { term: "Race condition", definition: "Timing-dependent bug" },
  { term: "Memory leak", definition: "Unreleased allocated memory" },
  { term: "Deadlock", definition: "Threads waiting on each other" },
  { term: "Null dereference", definition: "Accessing via null pointer" },
  { term: "Off-by-one", definition: "Loop boundary error" },
  { term: "Double free", definition: "Freeing memory twice" },
  { term: "Use after free", definition: "Accessing freed memory" },
];

const difficultyData: Record<string, CardPair[]> = {
  easy: easyPairs,
  medium: mediumPairs,
  hard: hardPairs,
};

// --- TYPES ---
interface GameCard {
  id: number;
  pairId: number;
  content: string;
  type: "term" | "definition";
  isFlipped: boolean;
  isMatched: boolean;
}

// --- AUDIO ---
const playTone = (freq: number, duration: number, type: OscillatorType = "sine") => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
};

const playFlipSound = () => playTone(600, 0.1, "sine");
const playMatchSound = () => {
  playTone(523, 0.15, "sine");
  setTimeout(() => playTone(659, 0.15, "sine"), 100);
  setTimeout(() => playTone(784, 0.2, "sine"), 200);
};
const playErrorSound = () => {
  playTone(300, 0.15, "square");
  setTimeout(() => playTone(250, 0.2, "square"), 120);
};

// --- COMPONENT ---
const MemoryMatch = () => {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPairs = 8;

  const initGame = useCallback(() => {
    const pool = difficultyData[difficulty];
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, totalPairs);
    const gameCards: GameCard[] = [];
    shuffled.forEach((pair, i) => {
      gameCards.push({ id: i * 2, pairId: i, content: pair.term, type: "term", isFlipped: false, isMatched: false });
      gameCards.push({ id: i * 2 + 1, pairId: i, content: pair.definition, type: "definition", isFlipped: false, isMatched: false });
    });
    gameCards.sort(() => Math.random() - 0.5);
    setCards(gameCards);
    setFlippedIds([]);
    setMatchedPairs(0);
    setScore(0);
    setMoves(0);
    setIsLocked(false);
    setGameStarted(false);
    setGameOver(false);
    setShowConfetti(false);
    setTimeLeft(60);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [difficulty]);

  useEffect(() => { initGame(); }, [initGame]);

  useEffect(() => {
    if (timerEnabled && gameStarted && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setGameOver(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [timerEnabled, gameStarted, gameOver]);

  const handleCardClick = (id: number) => {
    if (isLocked || gameOver) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedIds.includes(id)) return;

    if (!gameStarted) setGameStarted(true);
    playFlipSound();

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)));

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);
      const [firstId, secondId] = newFlipped;
      const first = cards.find((c) => c.id === firstId)!;
      const second = cards.find((c) => c.id === secondId)!;

      if (first.pairId === second.pairId && first.type !== second.type) {
        // Match!
        setTimeout(() => {
          playMatchSound();
          setCards((prev) => prev.map((c) => (c.pairId === first.pairId ? { ...c, isMatched: true, isFlipped: true } : c)));
          setMatchedPairs((m) => {
            const newM = m + 1;
            if (newM === totalPairs) {
              if (timerRef.current) clearInterval(timerRef.current);
              setGameOver(true);
              setShowConfetti(true);
            }
            return newM;
          });
          setScore((s) => s + 10);
          setFlippedIds([]);
          setIsLocked(false);
        }, 500);
      } else {
        // No match
        playErrorSound();
        setScore((s) => Math.max(0, s - 2));
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (newFlipped.includes(c.id) && !c.isMatched ? { ...c, isFlipped: false } : c)));
          setFlippedIds([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const timeTaken = 60 - timeLeft;
  const timeBonus = matchedPairs === totalPairs ? (timeTaken < 30 ? 20 : timeTaken < 45 ? 10 : 0) : 0;
  const finalScore = score + timeBonus;
  const grade = finalScore >= 90 ? "A" : finalScore >= 70 ? "B" : finalScore >= 50 ? "C" : "D";
  const won = matchedPairs === totalPairs;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {showConfetti && <Confetti />}

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-neon-purple/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-neon-cyan/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Timer</span>
            <Switch checked={timerEnabled} onCheckedChange={(v) => { setTimerEnabled(v); initGame(); }} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight mb-2">
            <Brain className="inline w-8 h-8 mr-2 text-neon-purple" />
            Memory Match
          </h1>
          <p className="text-muted-foreground text-sm">Flip cards and match programming pairs</p>
        </div>

        {/* Difficulty */}
        <div className="flex justify-center gap-3 mb-6">
          {(["easy", "medium", "hard"] as const).map((d) => (
            <Button
              key={d}
              variant={difficulty === d ? "default" : "outline"}
              size="sm"
              onClick={() => { setDifficulty(d); }}
              className={`capitalize font-display ${difficulty === d ? (d === "easy" ? "bg-green-600 hover:bg-green-700" : d === "medium" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-red-600 hover:bg-red-700") : ""}`}
            >
              {d === "easy" ? "🟢" : d === "medium" ? "🟡" : "🔴"} {d}
            </Button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center gap-6 mb-8 text-sm font-display">
          <div className="glass-panel px-4 py-2 rounded-lg">
            <span className="text-muted-foreground">Score: </span>
            <span className="text-neon-cyan font-bold">{score}</span>
          </div>
          <div className="glass-panel px-4 py-2 rounded-lg">
            <span className="text-muted-foreground">Moves: </span>
            <span className="text-neon-purple font-bold">{moves}</span>
          </div>
          <div className="glass-panel px-4 py-2 rounded-lg">
            <span className="text-muted-foreground">Matches: </span>
            <span className="text-neon-pink font-bold">{matchedPairs}/{totalPairs}</span>
          </div>
          {timerEnabled && (
            <div className={`glass-panel px-4 py-2 rounded-lg ${timeLeft <= 10 ? "animate-pulse text-red-400" : ""}`}>
              <Timer className="inline w-3 h-3 mr-1" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-xl mx-auto mb-8" style={{ perspective: "1000px" }}>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className="aspect-square cursor-pointer"
              style={{ perspective: "600px" }}
              onClick={() => handleCardClick(card.id)}
              whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
              whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
            >
              <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {/* Back (face down) */}
                <div
                  className="absolute inset-0 rounded-xl glass-panel flex items-center justify-center border border-border/50 hover:border-neon-purple/50 hover:shadow-[0_0_20px_hsl(270_80%_60%/0.2)] transition-all duration-300"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-2xl sm:text-3xl opacity-40">?</span>
                </div>

                {/* Front (face up) */}
                <div
                  className={`absolute inset-0 rounded-xl flex items-center justify-center p-2 text-center text-xs sm:text-sm font-display font-bold transition-all duration-300 ${
                    card.isMatched
                      ? "bg-green-500/20 border-2 border-green-400/60 shadow-[0_0_20px_hsl(120_60%_50%/0.3)]"
                      : card.type === "term"
                      ? "glass-panel border border-neon-cyan/40"
                      : "glass-panel border border-neon-pink/40"
                  }`}
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <span className={card.isMatched ? "text-green-300" : card.type === "term" ? "text-neon-cyan" : "text-neon-pink"}>
                    {card.content}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Restart */}
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={initGame} className="gap-2 font-display">
            <RotateCcw className="w-4 h-4" /> Restart
          </Button>
        </div>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-panel rounded-2xl p-8 max-w-sm w-full mx-4 text-center border border-border/50"
            >
              <Trophy className={`w-12 h-12 mx-auto mb-4 ${won ? "text-yellow-400" : "text-muted-foreground"}`} />
              <h2 className="font-display text-2xl font-black mb-2">
                {won ? "🎉 Congratulations!" : "⏰ Time's Up!"}
              </h2>
              <div className="space-y-2 text-sm mb-6">
                <p>
                  <span className="text-muted-foreground">Score: </span>
                  <span className="font-bold text-neon-cyan">{finalScore}</span>
                  {timeBonus > 0 && <span className="text-green-400 text-xs ml-1">(+{timeBonus} time bonus)</span>}
                </p>
                <p>
                  <span className="text-muted-foreground">Moves: </span>
                  <span className="font-bold">{moves}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Matches: </span>
                  <span className="font-bold">{matchedPairs}/{totalPairs}</span>
                </p>
                {timerEnabled && (
                  <p>
                    <span className="text-muted-foreground">Time: </span>
                    <span className="font-bold">{timeTaken}s</span>
                  </p>
                )}
                <div className={`text-4xl font-display font-black mt-4 ${grade === "A" ? "text-green-400" : grade === "B" ? "text-yellow-400" : grade === "C" ? "text-orange-400" : "text-red-400"}`}>
                  Grade: {grade}
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={initGame} className="font-display gap-2">
                  <RotateCcw className="w-4 h-4" /> Play Again
                </Button>
                <Link to="/">
                  <Button variant="outline" className="font-display">Home</Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryMatch;
