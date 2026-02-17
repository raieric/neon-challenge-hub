import { useState, useEffect, useMemo, useCallback } from "react";
import { QuizQuestion } from "./cQuestions";

export function useQuiz(allQuestions: QuizQuestion[], count: number = 50) {
  const [selectedQuestions, setSelectedQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Map<number, boolean>>(new Map());
  const [score, setScore] = useState(0);

  const initQuiz = useCallback(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setSelectedQuestions(shuffled.slice(0, Math.min(count, shuffled.length)));
    setAnswers(new Map());
    setScore(0);
  }, [allQuestions, count]);

  useEffect(() => { initQuiz(); }, [initQuiz]);

  const totalQuestions = selectedQuestions.length;
  const attempted = answers.size;
  const isComplete = attempted === totalQuestions && totalQuestions > 0;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const grade = percentage >= 85 ? "A" : percentage >= 70 ? "B" : percentage >= 50 ? "C" : "Fail";

  const answerQuestion = useCallback((tileIndex: number, selectedOption: number) => {
    const q = selectedQuestions[tileIndex];
    if (!q || answers.has(tileIndex)) return false;
    const correct = selectedOption === q.correct;
    setAnswers(prev => new Map(prev).set(tileIndex, correct));
    if (correct) setScore(prev => prev + 1);
    return correct;
  }, [selectedQuestions, answers]);

  return { selectedQuestions, answers, score, attempted, totalQuestions, isComplete, percentage, grade, answerQuestion, restart: initQuiz };
}
