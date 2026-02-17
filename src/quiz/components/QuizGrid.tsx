import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { QuizQuestion } from "../data/cQuestions";
import { useQuiz } from "../data/useQuiz";
import QuestionModal from "./QuestionModal";
import Confetti from "@/components/Confetti";

interface Props {
  title: string;
  questions: QuizQuestion[];
  count?: number;
  backTo: string;
}

const QuizGrid = ({ title, questions, count = 50, backTo }: Props) => {
  const navigate = useNavigate();
  const { selectedQuestions, answers, score, attempted, totalQuestions, isComplete, percentage, grade, answerQuestion, restart } = useQuiz(questions, count);
  const [activeTile, setActiveTile] = useState<number | null>(null);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-cyan/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(backTo)} className="p-2 rounded-lg glass-panel hover:bg-muted/50 transition-colors text-muted-foreground">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">Select any number to start</p>
          </div>
        </div>

        {/* Stats */}
        <div className="glass-panel p-4 mb-6 flex flex-wrap items-center gap-4 sm:gap-8">
          <div className="font-body">
            <span className="text-muted-foreground text-sm">Score: </span>
            <span className="font-display font-bold text-primary text-lg">{score}</span>
          </div>
          <div className="font-body">
            <span className="text-muted-foreground text-sm">Attempted: </span>
            <span className="font-display font-bold text-foreground text-lg">{attempted} / {totalQuestions}</span>
          </div>
          {/* Progress bar */}
          <div className="flex-1 min-w-[120px]">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: "0%" }}
                animate={{ width: `${totalQuestions > 0 ? (attempted / totalQuestions) * 100 : 0}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Number Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const answered = answers.has(i);
            const correct = answers.get(i);

            let tileClass = "glass-panel hover:border-primary/50 hover:-translate-y-1 cursor-pointer";
            if (answered && correct) tileClass = "border-2 border-green-500 bg-green-500/15 rounded-xl cursor-default";
            else if (answered && !correct) tileClass = "border-2 border-red-500 bg-red-500/15 rounded-xl cursor-default";

            return (
              <motion.button
                key={i}
                whileHover={!answered ? { scale: 1.1 } : {}}
                whileTap={!answered ? { scale: 0.95 } : {}}
                onClick={() => !answered && setActiveTile(i)}
                disabled={answered}
                className={`aspect-square flex items-center justify-center font-display font-bold text-sm sm:text-base transition-all duration-300 ${tileClass}`}
              >
                {answered ? (correct ? "✓" : "✗") : i + 1}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Question Modal */}
      {activeTile !== null && selectedQuestions[activeTile] && (
        <QuestionModal
          question={selectedQuestions[activeTile]}
          tileIndex={activeTile}
          onAnswer={answerQuestion}
          onClose={() => setActiveTile(null)}
        />
      )}

      {/* Completion Modal */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            {percentage >= 70 && <Confetti />}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="glass-panel p-8 sm:p-12 max-w-md w-full text-center"
            >
              <p className="text-5xl mb-4">{percentage >= 70 ? "🏆" : "💪"}</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Quiz Complete!</h2>

              <div className="space-y-3 my-6 font-body text-lg text-muted-foreground">
                <p>Score: <strong className="text-foreground">{score} / {totalQuestions}</strong></p>
                <p>Percentage: <strong className="text-foreground">{percentage}%</strong></p>
                <p>Grade: <strong className={`font-display text-2xl ${grade === "Fail" ? "text-red-400" : grade === "A" ? "text-green-400" : grade === "B" ? "text-blue-400" : "text-yellow-400"}`}>{grade}</strong></p>
              </div>

              <p className="font-body text-sm text-muted-foreground mb-6">
                {percentage >= 85 ? "Outstanding! You've mastered this topic! 🌟" :
                 percentage >= 70 ? "Great job! Keep pushing for excellence! 🚀" :
                 percentage >= 50 ? "Good effort! Review and try again to improve! 📚" :
                 "Don't give up! Practice makes perfect! 💪"}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={restart} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:bg-primary/90 transition-colors">
                  🔁 Restart Quiz
                </button>
                <button onClick={() => navigate(backTo)} className="px-6 py-3 rounded-lg glass-panel font-display font-bold text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ⬅ Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizGrid;
