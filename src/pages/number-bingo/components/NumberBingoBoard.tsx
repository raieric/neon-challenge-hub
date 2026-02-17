import { motion } from "framer-motion";

interface NumberBingoBoardProps {
  board: (number | string)[];
  selectedCells: Set<number>;
  calledNumbers: Set<number>;
  winningCells: Set<number>;
  onCellClick: (index: number) => void;
}

const NumberBingoBoard = ({ board, selectedCells, calledNumbers, winningCells, onCellClick }: NumberBingoBoardProps) => {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-md mx-auto">
      {board.map((val, i) => {
        const isFree = val === "★";
        const isSelected = selectedCells.has(i);
        const isCalled = typeof val === "number" && calledNumbers.has(val);
        const isWinning = winningCells.has(i);

        return (
          <motion.button
            key={i}
            whileHover={!isSelected && !isFree ? { scale: 1.08, y: -2 } : {}}
            whileTap={!isSelected && !isFree ? { scale: 0.95 } : {}}
            onClick={() => onCellClick(i)}
            className={`
              aspect-square rounded-full flex items-center justify-center
              font-display text-sm sm:text-lg font-bold
              border-2 transition-all duration-300 cursor-pointer
              ${isWinning
                ? "bg-neon-cyan/30 border-neon-cyan text-neon-cyan shadow-[0_0_20px_hsl(185_80%_50%/0.5)] animate-pulse"
                : isSelected || isFree
                  ? "bg-neon-purple/25 border-neon-purple text-neon-purple shadow-[0_0_15px_hsl(270_80%_60%/0.3)]"
                  : isCalled
                    ? "bg-primary/10 border-primary/50 text-primary hover:shadow-[0_0_15px_hsl(270_80%_60%/0.2)]"
                    : "bg-card/50 border-border/30 text-muted-foreground/60 cursor-not-allowed"
              }
            `}
          >
            {isFree ? "★" : val}
          </motion.button>
        );
      })}
    </div>
  );
};

export default NumberBingoBoard;
