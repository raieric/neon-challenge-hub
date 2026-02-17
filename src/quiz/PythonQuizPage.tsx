import QuizGrid from "./components/QuizGrid";
import pythonQuestions from "./data/pythonQuestions";

const PythonQuizPage = () => (
  <QuizGrid title="Python Programming Quiz" questions={pythonQuestions} count={20} backTo="/quiz" />
);

export default PythonQuizPage;
