import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, SkipForward, Pause, RotateCcw, BookOpen, ChevronRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import ParticleBackground from "@/components/ParticleBackground";
import { traceCode, type ExecutionStep, type Language } from "./interpreter";
import { examples } from "./examples";

// ─── Code Editor ───
const CodeEditor = ({ code, onChange, currentLine }: { code: string; onChange: (c: string) => void; currentLine: number }) => {
  const lines = code.split('\n');
  const textRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="flex font-mono text-xs leading-6 bg-[hsl(220,20%,8%)] rounded-lg overflow-hidden border border-white/5 h-full">
      <div className="py-3 px-1 text-right select-none border-r border-white/10 min-w-[2.5rem] text-muted-foreground/50">
        {lines.map((_, i) => (
          <div key={i} className={`px-1 ${i === currentLine ? 'bg-neon-purple/30 text-neon-purple font-bold rounded-sm' : ''}`}>
            {i + 1}
          </div>
        ))}
      </div>
      <div className="relative flex-1">
        <div className="absolute inset-0 py-3 pointer-events-none">
          {lines.map((_, i) => (
            <div key={i} className={`leading-6 ${i === currentLine ? 'bg-neon-purple/10' : ''}`} />
          ))}
        </div>
        <textarea
          ref={textRef}
          value={code}
          onChange={e => onChange(e.target.value)}
          className="w-full h-full py-3 px-3 bg-transparent text-foreground/90 leading-6 resize-none outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

// ─── Visualization Canvas ───
const formatVal = (v: any): string => {
  if (v === null || v === undefined) return 'None';
  if (Array.isArray(v)) return `[${v.map(formatVal).join(', ')}]`;
  if (typeof v === 'string') return `"${v}"`;
  return String(v);
};

const Canvas = ({ step, learningMode }: { step: ExecutionStep | null; learningMode: boolean }) => {
  if (!step) return (
    <div className="h-full flex items-center justify-center text-muted-foreground/40">
      <div className="text-center space-y-3">
        <Code2 className="w-16 h-16 mx-auto opacity-30" />
        <p className="font-display text-lg">Press ▶ Run or ⏭ Step to begin</p>
        <p className="text-sm">Write code or load an example to visualize execution</p>
      </div>
    </div>
  );

  const vars = Object.entries(step.variables);
  return (
    <div className="h-full flex flex-col gap-3 p-4 overflow-auto">
      {/* Step explanation */}
      {learningMode && (
        <motion.div
          key={step.explanation}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-3 border-l-4 border-neon-cyan"
        >
          <p className="text-sm font-body">💡 {step.explanation}</p>
        </motion.div>
      )}

      {/* Main step info */}
      <motion.div
        key={`${step.line}-${step.type}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
            step.type.includes('condition_true') ? 'bg-green-500/20 text-green-400' :
            step.type.includes('condition_false') ? 'bg-red-500/20 text-red-400' :
            step.type === 'function_call' ? 'bg-blue-500/20 text-blue-400' :
            step.type === 'function_return' ? 'bg-amber-500/20 text-amber-400' :
            step.type === 'print' ? 'bg-cyan-500/20 text-cyan-400' :
            step.type.includes('loop') ? 'bg-purple-500/20 text-purple-400' :
            'bg-white/10 text-muted-foreground'
          }`}>{step.type.replace('_', ' ')}</span>
          <span className="text-xs text-muted-foreground font-mono">Line {step.line + 1}</span>
        </div>
        <p className="font-mono text-sm text-foreground">{step.explanation}</p>
      </motion.div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Variables */}
        <div className="glass-panel p-4 overflow-auto">
          <h3 className="text-xs font-bold uppercase text-muted-foreground/70 mb-3 tracking-wider">📦 Variables</h3>
          {vars.length === 0 ? (
            <p className="text-xs text-muted-foreground/40 italic">No variables yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <AnimatePresence>
                {vars.map(([name, value]) => (
                  <motion.div
                    key={name}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-neon-purple/10 border border-neon-purple/20 rounded-lg p-2.5 text-center"
                  >
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{name}</p>
                    <p className="font-mono text-sm font-bold text-neon-purple mt-0.5">{formatVal(value)}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Call Stack */}
        <div className="glass-panel p-4 overflow-auto">
          <h3 className="text-xs font-bold uppercase text-muted-foreground/70 mb-3 tracking-wider">📚 Call Stack</h3>
          {step.callStack.length === 0 ? (
            <p className="text-xs text-muted-foreground/40 italic">Global scope</p>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {[...step.callStack].reverse().map((frame, i) => (
                  <motion.div
                    key={`${frame.functionName}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg p-2.5"
                  >
                    <p className="font-mono text-sm font-bold text-neon-cyan">{frame.functionName}()</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(frame.args).map(([k, v]) => (
                        <span key={k} className="text-[10px] bg-neon-cyan/10 rounded px-1.5 py-0.5 text-neon-cyan/70">
                          {k}={formatVal(v)}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Output */}
      <div className="glass-panel p-4">
        <h3 className="text-xs font-bold uppercase text-muted-foreground/70 mb-2 tracking-wider">🖥️ Output</h3>
        <div className="font-mono text-sm bg-[hsl(220,20%,6%)] rounded p-2 min-h-[2.5rem] max-h-24 overflow-auto">
          {step.output.length === 0 ? (
            <span className="text-muted-foreground/30 italic text-xs">No output yet</span>
          ) : step.output.map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-neon-cyan">{line}</motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───
const VisualCodeLab = () => {
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState(examples[0].code);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [learningMode, setLearningMode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const runTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredExamples = examples.filter(e => e.language === language);

  const handleRun = useCallback(() => {
    try {
      const traced = traceCode(code, language);
      setSteps(traced);
      setCurrentStep(0);
      setError(null);
      setIsRunning(true);
    } catch (e: any) {
      setError(e.message || String(e));
      setIsRunning(false);
    }
  }, [code, language]);

  const handleStep = useCallback(() => {
    if (steps.length === 0) {
      try {
        const traced = traceCode(code, language);
        setSteps(traced);
        setCurrentStep(0);
        setError(null);
      } catch (e: any) { setError(e.message || String(e)); }
      return;
    }
    if (currentStep < steps.length - 1) setCurrentStep(p => p + 1);
  }, [steps, currentStep, code, language]);

  const handleReset = useCallback(() => {
    setSteps([]);
    setCurrentStep(-1);
    setIsRunning(false);
    setError(null);
    if (runTimer.current) clearTimeout(runTimer.current);
  }, []);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    if (runTimer.current) clearTimeout(runTimer.current);
  }, []);

  useEffect(() => {
    if (isRunning && currentStep < steps.length - 1) {
      runTimer.current = setTimeout(() => setCurrentStep(p => p + 1), 800 / speed);
      return () => { if (runTimer.current) clearTimeout(runTimer.current); };
    }
    if (isRunning && currentStep >= steps.length - 1) setIsRunning(false);
  }, [isRunning, currentStep, steps.length, speed]);

  // Save to localStorage
  useEffect(() => { localStorage.setItem('vcl-code', code); }, [code]);
  useEffect(() => {
    const saved = localStorage.getItem('vcl-code');
    if (saved) setCode(saved);
  }, []);

  const stepData = steps[currentStep] ?? null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <ParticleBackground />

      {/* Top Bar */}
      <div className="relative z-20 flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-background/90 backdrop-blur-xl flex-wrap">
        <Link to="/" className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-base sm:text-lg font-bold text-foreground mr-2">⚡ VisualCode Lab</h1>

        <select
          value={language}
          onChange={e => { setLanguage(e.target.value as Language); handleReset(); }}
          className="px-2 py-1 rounded-md bg-muted/50 border border-white/10 text-xs font-mono text-foreground"
        >
          <option value="python">Python</option>
          <option value="c">C</option>
        </select>

        <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block" />

        <Button size="sm" variant="default" onClick={handleRun} disabled={isRunning} className="gap-1 text-xs h-7">
          <Play size={12} /> Run
        </Button>
        <Button size="sm" variant="secondary" onClick={handleStep} className="gap-1 text-xs h-7">
          <SkipForward size={12} /> Step
        </Button>
        <Button size="sm" variant="secondary" onClick={handlePause} disabled={!isRunning} className="gap-1 text-xs h-7">
          <Pause size={12} />
        </Button>
        <Button size="sm" variant="secondary" onClick={handleReset} className="gap-1 text-xs h-7">
          <RotateCcw size={12} />
        </Button>

        <div className="hidden sm:flex items-center gap-2 ml-2">
          <span className="text-[10px] text-muted-foreground">{speed}x</span>
          <Slider
            min={0.25} max={2} step={0.25}
            value={[speed]}
            onValueChange={([v]) => setSpeed(v)}
            className="w-20"
          />
        </div>

        <span className="text-[10px] font-mono text-muted-foreground ml-auto mr-2">
          {currentStep >= 0 ? `Step ${currentStep + 1}/${steps.length}` : '—'}
        </span>

        <div className="flex items-center gap-1.5">
          <BookOpen size={12} className="text-muted-foreground" />
          <Switch checked={learningMode} onCheckedChange={setLearningMode} className="scale-75" />
          <span className="text-[10px] text-muted-foreground">Learn</span>
        </div>
      </div>

      {/* Error Bar */}
      {error && (
        <div className="relative z-20 px-4 py-2 bg-destructive/20 border-b border-destructive/30 text-destructive text-xs font-mono">
          ⚠ {error}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Canvas (primary) */}
        <div className="flex-1 overflow-hidden">
          <Canvas step={stepData} learningMode={learningMode} />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 lg:w-96 border-l border-white/10 flex flex-col bg-background/80 backdrop-blur-xl overflow-hidden hidden md:flex">
          {/* Examples toggle */}
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-2 px-3 py-2 border-b border-white/10 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight size={12} className={`transition-transform ${showExamples ? 'rotate-90' : ''}`} />
            📚 Examples ({filteredExamples.length})
          </button>

          {showExamples && (
            <div className="border-b border-white/10 max-h-48 overflow-auto p-2 space-y-1">
              {filteredExamples.map(ex => (
                <button
                  key={ex.name}
                  onClick={() => { setCode(ex.code); handleReset(); setShowExamples(false); }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors group"
                >
                  <p className="text-xs font-bold text-foreground group-hover:text-neon-cyan transition-colors">{ex.name}</p>
                  <p className="text-[10px] text-muted-foreground">{ex.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden p-2">
            <CodeEditor code={code} onChange={c => { setCode(c); handleReset(); }} currentLine={stepData?.line ?? -1} />
          </div>
        </div>
      </div>

      {/* Mobile code toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-30">
        <Button size="icon" variant="secondary" onClick={() => setShowExamples(!showExamples)} className="rounded-full shadow-lg w-12 h-12">
          <Code2 size={20} />
        </Button>
      </div>

      {showExamples && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl p-4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-bold">Code & Examples</h2>
            <Button size="sm" variant="ghost" onClick={() => setShowExamples(false)}>✕</Button>
          </div>
          <div className="space-y-2 mb-4">
            {filteredExamples.map(ex => (
              <button
                key={ex.name}
                onClick={() => { setCode(ex.code); handleReset(); setShowExamples(false); }}
                className="w-full text-left px-3 py-2 rounded-md glass-panel"
              >
                <p className="text-sm font-bold">{ex.name}</p>
                <p className="text-xs text-muted-foreground">{ex.description}</p>
              </button>
            ))}
          </div>
          <div className="h-64">
            <CodeEditor code={code} onChange={c => { setCode(c); handleReset(); }} currentLine={stepData?.line ?? -1} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualCodeLab;
