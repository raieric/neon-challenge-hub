import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleBackground from "@/components/ParticleBackground";
import BingoBoard from "./components/BingoBoard";
import WordCaller from "./components/WordCaller";
import ControlPanel from "./components/ControlPanel";
import ResultModal from "./components/ResultModal";
import { wordSets, type WordSet } from "./data/wordSets";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const WIN_LINES = (() => {
  const lines: number[][] = [];
  for (let r = 0; r < 5; r++) lines.push([0,1,2,3,4].map(c => r * 5 + c));
  for (let c = 0; c < 5; c++) lines.push([0,1,2,3,4].map(r => r * 5 + c));
  lines.push([0,6,12,18,24]);
  lines.push([4,8,12,16,20]);
  return lines;
})();

const playTone = (freq: number, dur: number) => {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = freq;
    o.type = "sine";
    g.gain.value = 0.08;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch {}
};

const WordBingo = () => {
  const [selectedSet, setSelectedSet] = useState<WordSet | null>(null);
  const [board, setBoard] = useState<string[]>([]);
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [poolIndex, setPoolIndex] = useState(0);
  const [calledWords, setCalledWords] = useState<string[]>([]);
  const [calledSet, setCalledSet] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<Set<number>>(new Set());
  const [winningCells, setWinningCells] = useState<Set<number>>(new Set());
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const startGame = useCallback((ws: WordSet) => {
    const shuffled = shuffle(ws.words);
    const boardWords = shuffled.slice(0, 24);
    boardWords.splice(12, 0, "★ FREE");
    const pool = shuffle(shuffled);
    setBoard(boardWords);
    setWordPool(pool);
    setPoolIndex(0);
    setCalledWords([]);
    setCalledSet(new Set());
    setSelectedCells(new Set([12]));
    setWinningCells(new Set());
    setIsRunning(false);
    setGameOver(false);
    setMistakes(0);
    setTimeElapsed(0);
    setSelectedSet(ws);
    setShowCategorySelect(false);
  }, []);

  // Timer
  useEffect(() => {
    if (isRunning && !gameOver) {
      timerRef.current = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, gameOver]);

  // Auto caller
  useEffect(() => {
    if (!isAutoMode || !isRunning || gameOver) return;
    const id = setInterval(() => callNextWord(), 3000);
    return () => clearInterval(id);
  }, [isAutoMode, isRunning, gameOver, poolIndex]);

  const callNextWord = useCallback(() => {
    if (gameOver) return;
    let idx = poolIndex;
    while (idx < wordPool.length && calledSet.has(wordPool[idx])) idx++;
    if (idx >= wordPool.length) return;
    const word = wordPool[idx];
    setCalledWords(prev => [...prev, word]);
    setCalledSet(prev => new Set(prev).add(word));
    setPoolIndex(idx + 1);
    if (!isRunning) setIsRunning(true);
    playTone(600 + Math.random() * 400, 0.15);
  }, [poolIndex, wordPool, calledSet, gameOver, isRunning]);

  const checkWin = useCallback((cells: Set<number>) => {
    for (const line of WIN_LINES) {
      if (line.every(i => cells.has(i))) {
        return new Set(line);
      }
    }
    return null;
  }, []);

  const onCellClick = useCallback((index: number) => {
    if (gameOver || index === 12) return;
    const word = board[index];
    if (selectedCells.has(index)) return;
    if (!calledSet.has(word)) {
      setMistakes(m => m + 1);
      playTone(200, 0.3);
      return;
    }
    playTone(800, 0.1);
    const next = new Set(selectedCells).add(index);
    setSelectedCells(next);
    const win = checkWin(next);
    if (win) {
      setWinningCells(win);
      setGameOver(true);
      setIsRunning(false);
      [0, 100, 200, 300].forEach((d, i) => setTimeout(() => playTone(523 + i * 100, 0.3), d));
    }
  }, [board, calledSet, selectedCells, gameOver, checkWin]);

  // Category select screen
  if (!selectedSet || showCategorySelect) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <ParticleBackground />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
          <div className="absolute top-4 left-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="font-display text-xs tracking-wider">
                <ArrowLeft className="w-4 h-4 mr-1" /> Home
              </Button>
            </Link>
          </div>
          <div className="absolute top-4 right-4"><ThemeToggle /></div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
            <h1 className="font-display text-4xl sm:text-5xl font-black text-foreground text-glow-purple">
              🔤 Word Bingo
            </h1>
            <p className="text-muted-foreground font-body text-lg">Choose a category</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {wordSets.map(ws => (
                <motion.button
                  key={ws.name}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startGame(ws)}
                  className="glass-panel p-6 sm:p-8 text-center space-y-2 cursor-pointer hover:shadow-[0_0_30px_hsl(270_80%_60%/0.3)]"
                >
                  <span className="text-4xl block">{ws.icon}</span>
                  <span className="font-display text-lg font-bold text-foreground">{ws.name}</span>
                  <span className="font-body text-sm text-muted-foreground block">{ws.words.length}+ words</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      <div className="relative z-10 flex flex-col items-center px-4 py-6 sm:py-10 gap-5 sm:gap-6">
        {/* Header */}
        <div className="w-full max-w-3xl flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="font-display text-xs tracking-wider">
              <ArrowLeft className="w-4 h-4 mr-1" /> Home
            </Button>
          </Link>
          <h1 className="font-display text-xl sm:text-2xl font-black text-foreground">
            🔤 Word Bingo
          </h1>
          <ThemeToggle />
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-3 sm:gap-6 justify-center text-xs sm:text-sm font-body text-muted-foreground">
          <span>📚 {selectedSet.name}</span>
          <span>⏱ {Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, "0")}</span>
          <span>📢 {calledWords.length} called</span>
          <span>❌ {mistakes} mistakes</span>
        </div>

        {/* Word Caller */}
        <WordCaller
          currentWord={calledWords.length > 0 ? calledWords[calledWords.length - 1] : null}
          calledWords={calledWords}
          totalWords={wordPool.length}
        />

        {/* Controls */}
        <ControlPanel
          isAutoMode={isAutoMode}
          isRunning={isRunning}
          gameOver={gameOver}
          onToggleMode={() => setIsAutoMode(p => !p)}
          onToggleRunning={() => setIsRunning(p => !p)}
          onCallNext={callNextWord}
          onRestart={() => startGame(selectedSet)}
        />

        {/* Board */}
        <BingoBoard
          board={board}
          selectedCells={selectedCells}
          calledWords={calledSet}
          winningCells={winningCells}
          onCellClick={onCellClick}
        />

        {/* Result Modal */}
        {gameOver && (
          <ResultModal
            timeElapsed={timeElapsed}
            wordsCalledCount={calledWords.length}
            mistakes={mistakes}
            onRestart={() => startGame(selectedSet)}
            onChangeCategory={() => setShowCategorySelect(true)}
          />
        )}
      </div>
    </div>
  );
};

export default WordBingo;
