import { motion } from "framer-motion";

interface BingoBoardProps {
  board: string[];
  selectedCells: Set<number>;
  calledWords: Set<string>;
  winningCells: Set<number>;
  onCellClick: (index: number) => void;
}

const BingoBoard = ({ board, selectedCells, calledWords, winningCells, onCellClick }: BingoBoardProps) => {
  const isFreeSpace = (index: number) => index === 12;

  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-[560px] mx-auto">
      {board.map((word, index) => {
        const isSelected = selectedCells.has(index) || isFreeSpace(index);
        const isCalled = calledWords.has(word) || isFreeSpace(index);
        const isWinning = winningCells.has(index);

        return (
          <motion.button
            key={`${word}-${index}`}
            whileHover={!isSelected ? { scale: 1.05, y: -2 } : {}}
            whileTap={!isSelected && isCalled ? { scale: 0.95 } : {}}
            onClick={() => onCellClick(index)}
            disabled={isFreeSpace(index)}
            className={`
              relative aspect-square rounded-xl flex items-center justify-center p-1 sm:p-2
              text-[10px] sm:text-xs md:text-sm font-display font-bold text-center
              transition-all duration-300 border select-none
              ${isFreeSpace(index)
                ? "bg-neon-purple/30 border-neon-purple/50 text-neon-purple cursor-default"
                : isWinning
                  ? "bg-neon-cyan/40 border-neon-cyan shadow-[0_0_20px_hsl(185_80%_50%/0.5)] text-foreground"
                  : isSelected
                    ? "bg-emerald-500/30 border-emerald-400/60 text-foreground shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                    : isCalled
                      ? "bg-accent/60 border-neon-purple/40 text-foreground cursor-pointer hover:shadow-[0_0_15px_hsl(270_80%_60%/0.3)]"
                      : "bg-card/50 border-border/50 text-muted-foreground cursor-not-allowed opacity-60"
              }
            `}
          >
            {isFreeSpace(index) ? "★ FREE" : word}
            {isWinning && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-neon-cyan"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default BingoBoard;
