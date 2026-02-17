import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuizQuestion } from "../data/cQuestions";
import { X } from "lucide-react";
import Confetti from "@/components/Confetti";

interface Props {
  question: QuizQuestion;
  tileIndex: number;
  onAnswer: (tileIndex: number, selected: number) => boolean;
  onClose: () => void;
}

const QuestionModal = ({ question, tileIndex, onAnswer, onClose }: Props) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSelect = useCallback((idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = onAnswer(tileIndex, idx);
    setIsCorrect(correct);
    if (correct) {
      setShowConfetti(true);
      setTimeout(() => onClose(), 2000);
    }
  }, [selected, onAnswer, tileIndex, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && selected !== null && !isCorrect && onClose()}
      >
        {showConfetti && <Confetti />}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="glass-panel w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Close button (only after answering incorrectly) */}
          {selected !== null && !isCorrect && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground"
            >
              <X size={18} />
            </button>
          )}

          {/* Question number */}
          <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary font-display text-xs font-bold tracking-wider mb-4">
            QUESTION #{tileIndex + 1}
          </div>

          {/* Question text */}
          <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4 leading-relaxed">
            {question.question}
          </h3>

          {/* Code block */}
          {question.code && (
            <pre className="bg-muted/80 rounded-lg p-4 mb-4 font-mono text-sm text-foreground overflow-x-auto border border-border">
              <code>{question.code}</code>
            </pre>
          )}

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((opt, idx) => {
              let optionClass = "glass-panel p-4 cursor-pointer hover:border-primary/50 transition-all duration-300";

              if (selected !== null) {
                if (idx === question.correct) {
                  optionClass = "p-4 rounded-xl border-2 border-green-500 bg-green-500/15 text-green-400";
                } else if (idx === selected && !isCorrect) {
                  optionClass = "p-4 rounded-xl border-2 border-red-500 bg-red-500/15 text-red-400";
                } else {
                  optionClass = "glass-panel p-4 opacity-50";
                }
              }

              return (
                <motion.button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={selected !== null}
                  whileHover={selected === null ? { scale: 1.02 } : {}}
                  whileTap={selected === null ? { scale: 0.98 } : {}}
                  className={`w-full text-left ${optionClass} font-body text-sm sm:text-base`}
                >
                  <span className="font-display font-bold text-xs text-muted-foreground mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </motion.button>
              );
            })}
          </div>

          {/* Result feedback */}
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              {isCorrect ? (
                <div>
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="font-display text-lg font-bold text-green-400">Correct!</p>
                </div>
              ) : (
                <div>
                  <p className="text-3xl mb-2">😢</p>
                  <p className="font-display text-lg font-bold text-red-400 mb-2">Incorrect</p>
                  <p className="font-body text-sm text-muted-foreground">{question.explanation}</p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2 rounded-lg bg-primary/20 text-primary font-display text-sm font-bold hover:bg-primary/30 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestionModal;
