import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SpinWheel from "./pages/SpinWheel";
import RockPaperScissors from "./pages/RockPaperScissors";
import SpinWheel2 from "./pages/SpinWheel2";
import SocialArena from "./pages/SocialArena";
import VisionaryArena from "./pages/VisionaryArena";
import TrolleySimulator from "./pages/TrolleySimulator";
import SettleThis from "./pages/SettleThis";
import AuctionChallenge from "./pages/AuctionChallenge";
import WhoWasAlive from "./pages/WhoWasAlive";
import DrawCircle from "./pages/DrawCircle";
import MemoryMatch from "./pages/MemoryMatch";
import SpendBinod from "./pages/SpendBinod";
import LifeProgress from "./pages/LifeProgress";
import UniverseForecast from "./pages/UniverseForecast";
import PasswordChallenge from "./pages/PasswordChallenge";
import QuizHome from "./quiz/QuizHome";
import CQuizPage from "./quiz/CQuizPage";
import JavaQuizPage from "./quiz/JavaQuizPage";
import PythonQuizPage from "./quiz/PythonQuizPage";
import ImposterClassroom from "./pages/ImposterClassroom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/spin" element={<SpinWheel />} />
          <Route path="/rps" element={<RockPaperScissors />} />
          <Route path="/spin2" element={<SpinWheel2 />} />
          <Route path="/social" element={<SocialArena />} />
          <Route path="/visionary" element={<VisionaryArena />} />
          <Route path="/trolley" element={<TrolleySimulator />} />
          <Route path="/settle" element={<SettleThis />} />
          <Route path="/auction" element={<AuctionChallenge />} />
          <Route path="/alive" element={<WhoWasAlive />} />
          <Route path="/circle" element={<DrawCircle />} />
          <Route path="/memory-match" element={<MemoryMatch />} />
          <Route path="/spend-binod" element={<SpendBinod />} />
          <Route path="/life-progress" element={<LifeProgress />} />
          <Route path="/universe-forecast" element={<UniverseForecast />} />
          <Route path="/password-challenge" element={<PasswordChallenge />} />
          <Route path="/quiz" element={<QuizHome />} />
          <Route path="/quiz/c" element={<CQuizPage />} />
          <Route path="/quiz/java" element={<JavaQuizPage />} />
          <Route path="/quiz/python" element={<PythonQuizPage />} />
          <Route path="/imposter" element={<ImposterClassroom />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
