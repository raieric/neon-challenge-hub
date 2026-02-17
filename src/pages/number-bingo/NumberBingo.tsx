import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleBackground from "@/components/ParticleBackground";
import NumberBingoBoard from "./components/NumberBingoBoard";
import NumberCaller from "./components/NumberCaller";
import NumberControlPanel from "./components/NumberControlPanel";
import NumberResultModal from "./components/NumberResultModal";

const MAX_NUM = 75;

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
  for (let r = 0; r < 5; r++) lines.push([0, 1, 2, 3, 4].map(c => r * 5 + c));
  for (let c = 0; c < 5; c++) lines.push([0, 1, 2, 3, 4].map(r => r * 5 + c));
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);
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

const generateBoard = (): (number | string)[] => {
  const nums = Array.from({ length: MAX_NUM }, (_, i) => i + 1);
  const picked = shuffle(nums).slice(0, 24);
  const board: (number | string)[] = [...picked];
  board.splice(12, 0, "★");
  return board;
};

const generateDrawPool = (): number[] => shuffle(Array.from({ length: MAX_NUM }, (_, i) => i + 1));

const NumberBingo = () => {
  const [board, setBoard] = useState<(number | string)[]>([]);
  const [drawPool, setDrawPool] = useState<number[]>([]);
  const [drawIndex, setDrawIndex] = useState(0);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [calledSet, setCalledSet] = useState<Set<number>>(new Set());
  const [selectedCells, setSelectedCells] = useState<Set<number>>(new Set());
  const [winningCells, setWinningCells] = useState<Set<number>>(new Set());
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const initGame = useCallback(() => {
    setBoard(generateBoard());
    setDrawPool(generateDrawPool());
    setDrawIndex(0);
    setCalledNumbers([]);
    setCalledSet(new Set());
    setSelectedCells(new Set([12])); // free space
    setWinningCells(new Set());
    setIsRunning(false);
    setGameOver(false);
    setMistakes(0);
    setTimeElapsed(0);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  // Timer
  useEffect(() => {
    if (isRunning && !gameOver) {
      timerRef.current = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, gameOver]);

  // Auto draw
  useEffect(() => {
    if (!isAutoMode || !isRunning || gameOver) return;
    const id = setInterval(() => drawNext(), 3000);
    return () => clearInterval(id);
  }, [isAutoMode, isRunning, gameOver, drawIndex]);

  const drawNext = useCallback(() => {
    if (gameOver || drawIndex >= drawPool.length) return;
    const num = drawPool[drawIndex];
    setCalledNumbers(prev => [...prev, num]);
    setCalledSet(prev => new Set(prev).add(num));
    setDrawIndex(prev => prev + 1);
    if (!isRunning) setIsRunning(true);
    playTone(500 + Math.random() * 500, 0.15);
  }, [drawIndex, drawPool, gameOver, isRunning]);

  const checkWin = useCallback((cells: Set<number>) => {
    for (const line of WIN_LINES) {
      if (line.every(i => cells.has(i))) return new Set(line);
    }
    return null;
  }, []);

  const onCellClick = useCallback((index: number) => {
    if (gameOver || index === 12 || selectedCells.has(index)) return;
    const val = board[index];
    if (typeof val !== "number" || !calledSet.has(val)) {
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      <div className="relative z-10 flex flex-col items-center px-4 py-6 sm:py-10 gap-5 sm:gap-6">
        {/* Header */}
        <div className="w-full max-w-lg flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="font-display text-xs tracking-wider">
              <ArrowLeft className="w-4 h-4 mr-1" /> Home
            </Button>
          </Link>
          <h1 className="font-display text-xl sm:text-2xl font-black text-foreground">
            🎱 Lucky Number Bingo
          </h1>
          <ThemeToggle />
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 sm:gap-6 justify-center text-xs sm:text-sm font-body text-muted-foreground">
          <span>⏱ {Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, "0")}</span>
          <span>🎱 {calledNumbers.length} / {MAX_NUM} drawn</span>
          <span>❌ {mistakes} mistakes</span>
        </div>

        {/* Number Caller */}
        <NumberCaller
          currentNumber={calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : null}
          calledNumbers={calledNumbers}
          totalNumbers={MAX_NUM}
        />

        {/* Controls */}
        <NumberControlPanel
          isAutoMode={isAutoMode}
          isRunning={isRunning}
          gameOver={gameOver}
          onToggleMode={() => setIsAutoMode(p => !p)}
          onToggleRunning={() => setIsRunning(p => !p)}
          onCallNext={drawNext}
          onRestart={initGame}
        />

        {/* Board */}
        <NumberBingoBoard
          board={board}
          selectedCells={selectedCells}
          calledNumbers={calledSet}
          winningCells={winningCells}
          onCellClick={onCellClick}
        />

        {/* Result Modal */}
        {gameOver && (
          <NumberResultModal
            timeElapsed={timeElapsed}
            numbersCalledCount={calledNumbers.length}
            mistakes={mistakes}
            onRestart={initGame}
          />
        )}
      </div>
    </div>
  );
};

export default NumberBingo;
