import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getRandomTopic, ALL_CATEGORIES } from "./data/topics";
import Confetti from "@/components/Confetti";
import ParticleBackground from "@/components/ParticleBackground";
import ThemeToggle from "@/components/ThemeToggle";

const DURATION_OPTIONS = [60, 90, 120] as const;

const MOTIVATIONAL_QUOTES = [
  "Every expert was once a beginner.",
  "Your voice matters. Keep speaking.",
  "Confidence comes from practice.",
  "You just got 1% better.",
  "Great speakers are made, not born.",
  "Words have power. You just proved it.",
  "One minute closer to mastery.",
  "The stage is yours. Own it.",
  "Progress, not perfection.",
  "You showed up. That's the hardest part.",
];

const ACCENT_COLORS = [
  "hsl(270, 80%, 60%)",
  "hsl(185, 80%, 50%)",
  "hsl(320, 80%, 58%)",
  "hsl(220, 90%, 56%)",
  "hsl(150, 80%, 50%)",
  "hsl(30, 90%, 55%)",
  "hsl(350, 80%, 55%)",
];

const ImpromptuPage = () => {
  const [topic, setTopic] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("");
  const [topicCategory, setTopicCategory] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleDisplay, setShuffleDisplay] = useState<string>("");
  const [shuffleCat, setShuffleCat] = useState<string>("");
  const [shuffleAnimKey, setShuffleAnimKey] = useState(0);
  const shuffleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [timerDuration, setTimerDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const [sessions, setSessions] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quote, setQuote] = useState("");
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [topicKey, setTopicKey] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Accurate timer using refs
  const startTimeRef = useRef<number>(0);
  const pausedRemainingRef = useRef<number>(60);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    pausedRemainingRef.current = remaining;
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const newRemaining = Math.max(0, Math.round(pausedRemainingRef.current - elapsed));
      setRemaining(newRemaining);
      if (newRemaining <= 0) {
        clearTimer();
        setIsRunning(false);
        setIsDone(true);
        setSessions((s) => s + 1);
        setShowConfetti(true);
        setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }, 100);
  }, [remaining, clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    pausedRemainingRef.current = remaining;
    setIsRunning(false);
  }, [remaining, clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setRemaining(timerDuration);
    setIsRunning(false);
    setIsDone(false);
    pausedRemainingRef.current = timerDuration;
  }, [clearTimer, timerDuration]);

  const playTick = useCallback((pitch: number = 800, volume: number = 0.15) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = pitch;
      osc.type = 'sine';
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }, []);

  const playFinalDing = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1200;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }, []);

  const generateTopic = useCallback(() => {
    setIsShuffling(true);
    setIsDone(false);
    clearTimer();
    setRemaining(timerDuration);
    pausedRemainingRef.current = timerDuration;

    if (shuffleRef.current) clearTimeout(shuffleRef.current);

    let count = 0;
    const totalFlips = 18;
    const baseInterval = 50;

    const doFlip = () => {
      const r = getRandomTopic(selectedFilter || undefined);
      setShuffleDisplay(r.topic);
      setShuffleCat(r.category);
      setShuffleAnimKey((k) => k + 1);
      playTick(600 + count * 30, 0.12);
      count++;

      if (count >= totalFlips) {
        shuffleRef.current = null;

        // Final pick
        const final = getRandomTopic(selectedFilter || undefined, topic || undefined);
        setTimeout(() => {
          setTopic(final.topic);
          setTopicCategory(final.category);
          setShuffleDisplay(final.topic);
          setShuffleCat(final.category);
          setShuffleAnimKey((k) => k + 1);
          setAccentColor(ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)]);
          setTopicKey((k) => k + 1);
          setIsShuffling(false);
          playFinalDing();

          // Auto-start timer
          setTimeout(() => {
            startTimeRef.current = Date.now();
            pausedRemainingRef.current = timerDuration;
            setIsRunning(true);
            intervalRef.current = setInterval(() => {
              const elapsed = (Date.now() - startTimeRef.current) / 1000;
              const newRemaining = Math.max(0, Math.round(pausedRemainingRef.current - elapsed));
              setRemaining(newRemaining);
              if (newRemaining <= 0) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = null;
                setIsRunning(false);
                setIsDone(true);
                setSessions((s) => s + 1);
                setShowConfetti(true);
                setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
                setTimeout(() => setShowConfetti(false), 4000);
              }
            }, 100);
          }, 300);
        }, 200);
        return;
      }

      // Ease out: progressively slower
      const nextDelay = baseInterval + Math.pow(count, 1.6) * 8;
      shuffleRef.current = setTimeout(doFlip, nextDelay);
    };

    shuffleRef.current = setTimeout(doFlip, baseInterval);
  }, [selectedFilter, topic, clearTimer, playTick, playFinalDing, timerDuration]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress = remaining / timerDuration;
  const size = 220;
  const strokeWidth = 7;
  const r = size / 2 - strokeWidth - 4;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);

  const getTimerColor = () => {
    if (remaining > 30) return "hsl(150, 80%, 50%)";
    if (remaining > 10) return "hsl(45, 90%, 55%)";
    return "hsl(0, 84%, 60%)";
  };
  const timerColor = getTimerColor();
  const isLow = remaining <= 10 && remaining > 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      {showConfetti && <Confetti />}

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-cyan/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 min-h-screen">
        {/* Header */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeToggle />
        </div>
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <Link
            to="/"
            className="font-display text-sm font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ⬅ Home
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8 sm:mb-10 mt-8 animate-fade-in">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-3 text-glow-cyan">
            🎙️ Impromptu Speaking
          </h1>
          <p className="font-body text-base sm:text-lg text-muted-foreground max-w-lg mx-auto">
            Click "Generate Topic" and speak for 1 minute. The timer will automatically count down.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "150ms" }}>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="font-body text-sm bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
          >
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Duration Selector */}
        <div className="mb-6 flex items-center gap-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <span className="font-body text-xs text-muted-foreground uppercase tracking-wider mr-1">Timer:</span>
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => {
                setTimerDuration(d);
                setRemaining(d);
                pausedRemainingRef.current = d;
                clearTimer();
                setIsRunning(false);
                setIsDone(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-display text-xs font-bold tracking-wider transition-all duration-200 hover:scale-105
                ${timerDuration === d
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                  : 'bg-muted/20 text-muted-foreground border border-transparent hover:bg-muted/40'}`}
            >
              {d === 60 ? '1 min' : d === 90 ? '1:30' : '2 min'}
            </button>
          ))}
        </div>

        {/* Topic Display */}
        <div
          key={topicKey}
          className="glass-panel w-full max-w-2xl px-8 py-10 sm:px-12 sm:py-14 text-center mb-8 animate-scale-in"
          style={{
            boxShadow: topic ? `0 0 40px ${accentColor}30, 0 0 80px ${accentColor}10` : undefined,
          }}
        >
          {isShuffling ? (
            <div className="overflow-hidden relative" style={{ minHeight: '100px' }}>
              <div
                key={shuffleAnimKey}
                className="animate-shuffle-slide"
              >
                <span className="inline-block px-3 py-1 text-xs font-display font-bold tracking-wider uppercase bg-neon-purple/15 text-neon-purple border border-neon-purple/30 rounded-full mb-4">
                  {shuffleCat || "Shuffling..."}
                </span>
                <p className="font-display text-xl sm:text-2xl md:text-3xl font-black text-foreground leading-snug">
                  "{shuffleDisplay}"
                </p>
              </div>
            </div>
          ) : topic ? (
            <>
              <span className="inline-block px-3 py-1 text-xs font-display font-bold tracking-wider uppercase bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 rounded-full mb-4">
                {topicCategory}
              </span>
              <p className="font-display text-xl sm:text-2xl md:text-3xl font-black text-foreground leading-snug">
                "{topic}"
              </p>
            </>
          ) : (
            <p className="font-body text-lg text-muted-foreground">
              Click <span className="text-neon-cyan font-semibold">Generate Topic</span> to get your topic
            </p>
          )}
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={timerColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-200 ease-linear"
                style={{ filter: `drop-shadow(0 0 10px ${timerColor})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`font-display text-4xl sm:text-5xl font-black tabular-nums ${
                  isDone ? "text-neon-green animate-pulse" : isLow ? "text-destructive animate-pulse" : "text-foreground"
                }`}
                style={!isDone && !isLow ? { color: timerColor, textShadow: `0 0 12px ${timerColor}` } : undefined}
              >
                {isDone ? "👏" : timeStr}
              </span>
              <span className="font-body text-xs text-muted-foreground uppercase tracking-wider mt-1">
                {isDone ? "Great job!" : "remaining"}
              </span>
            </div>
          </div>
        </div>

        {/* Done message */}
        {isDone && (
          <div className="text-center mb-6 animate-fade-in">
            <p className="font-display text-2xl sm:text-3xl font-black text-neon-green mb-2">
              ⏰ Time's up! Great job 👏
            </p>
            <p className="font-body text-base text-muted-foreground italic">
              "{quote}"
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-fade-in" style={{ animationDelay: "450ms" }}>
          <button
            onClick={generateTopic}
            className="px-6 py-2.5 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 transition-all"
          >
            🎲 Generate Topic
          </button>
          {isRunning && (
            <button
              onClick={pauseTimer}
              className="px-6 py-2.5 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-destructive/50 text-destructive hover:bg-destructive/10 transition-all"
            >
              ⏸ Pause
            </button>
          )}
          {!isRunning && !isDone && remaining < timerDuration && remaining > 0 && (
            <button
              onClick={startTimer}
              className="px-6 py-2.5 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-neon-green/50 text-neon-green hover:bg-neon-green/10 transition-all"
            >
              ▶ Resume
            </button>
          )}
          {(topic || isDone) && (
            <button
              onClick={resetTimer}
              className="px-6 py-2.5 font-display text-sm font-bold tracking-widest uppercase rounded-lg border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 transition-all"
            >
              🔄 Reset
            </button>
          )}
        </div>

        {/* Stats */}
        {sessions > 0 && (
          <div className="flex items-center gap-6 text-center animate-fade-in">
            <div>
              <p className="font-display text-2xl font-black text-neon-cyan">{sessions}</p>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Sessions</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="font-display text-2xl font-black text-neon-purple">{sessions}</p>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Minutes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImpromptuPage;
