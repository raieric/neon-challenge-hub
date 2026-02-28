import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Monitor, Trophy, ArrowLeft } from 'lucide-react';

interface DisplayViewProps {
  state: any;
}

export default function DisplayView({ state }: DisplayViewProps) {
  const currentQuestion = state.filteredQuestions[state.currentQuestionIndex];
  const currentRound = state.rounds[state.currentRoundIndex];
  const currentTeam = state.teams[state.currentTeamIndex];

  return (
    <div className="h-full flex flex-col bg-[hsl(220,25%,4%)] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[150px]" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={() => state.setView('host')}>
            <ArrowLeft size={14} /> Host
          </Button>
          <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={() => state.setView('scoreboard')}>
            <Trophy size={14} /> Scoreboard
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">{currentRound?.name}</p>
        </div>

        {/* Timer */}
        <div className={`font-mono text-3xl font-black ${state.timerValue <= 5 && state.timerValue > 0 ? 'text-red-400 animate-pulse' : state.timerValue === 0 ? 'text-red-500' : 'text-neon-cyan'}`}>
          {state.timerRunning || state.timerValue < state.timerDuration ? state.timerValue : ''}
        </div>
      </div>

      {/* Current team indicator */}
      <div className="relative z-10 text-center py-3 border-b border-white/5">
        <span className="text-xs text-muted-foreground uppercase tracking-widest mr-2">Current Turn:</span>
        <span className="text-lg font-display font-bold text-neon-purple">{currentTeam?.name}</span>
      </div>

      {/* Question area */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {state.showQuestion && currentQuestion ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="max-w-4xl w-full text-center space-y-8"
            >
              {/* Category badge */}
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                {currentQuestion.category}
              </span>

              {/* Question */}
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight">
                {currentQuestion.text}
              </h2>

              {/* Answer */}
              <AnimatePresence>
                {state.showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-8"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Answer</p>
                    <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-neon-cyan">
                      {currentQuestion.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <div className="flex gap-3 justify-center mt-8">
                <Button size="lg" variant="secondary" onClick={state.toggleShowAnswer} className="gap-2">
                  {state.showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
                  {state.showAnswer ? 'Hide Answer' : 'Reveal Answer'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <Monitor className="w-20 h-20 mx-auto text-muted-foreground/20" />
              <p className="font-display text-2xl text-muted-foreground/40">Select a question from the host panel</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mini scoreboard */}
      <div className="relative z-10 border-t border-white/10 px-4 py-3">
        <div className="flex gap-3 justify-center flex-wrap">
          {state.teams.map((team: any, i: number) => (
            <div
              key={team.id}
              className={`px-4 py-2 rounded-lg border transition-all
                ${i === state.currentTeamIndex ? 'border-neon-cyan/50 bg-neon-cyan/10' : 'border-white/10 bg-white/5'}`}
            >
              <p className="text-xs text-muted-foreground">{team.name}</p>
              <p className="text-lg font-mono font-bold text-foreground text-center">{team.score}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
