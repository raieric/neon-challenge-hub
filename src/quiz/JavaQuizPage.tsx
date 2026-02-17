import QuizGrid from "./components/QuizGrid";
import javaQuestions from "./data/javaQuestions";

const JavaQuizPage = () => (
  <QuizGrid title="Java Programming Quiz" questions={javaQuestions} count={20} backTo="/quiz" />
);

export default JavaQuizPage;
