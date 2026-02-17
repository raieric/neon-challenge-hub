import QuizGrid from "./components/QuizGrid";
import cQuestions from "./data/cQuestions";

const CQuizPage = () => (
  <QuizGrid title="C Programming Quiz" questions={cQuestions} count={50} backTo="/quiz" />
);

export default CQuizPage;
