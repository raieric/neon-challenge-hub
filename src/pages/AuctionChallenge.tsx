import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Trophy, Target, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────
interface AuctionItem {
  id: number;
  name: string;
  description: string;
  image: string;
  year: string;
}

interface GuessResult {
  actual_price: number;
  guess: number;
  difference: number;
  percent_off: number;
  score: number;
}

interface SessionRecord {
  item: AuctionItem;
  result: GuessResult;
}

// ─── Helpers ──────────────────────────────────────────────
const formatPrice = (n: number) =>
  "$" + n.toLocaleString("en-US");

const getRank = (score: number, total: number) => {
  const avg = score / total;
  if (avg >= 900) return { title: "Billionaire Visionary", emoji: "👑" };
  if (avg >= 700) return { title: "Elite Collector", emoji: "💎" };
  if (avg >= 500) return { title: "Gallery Curator", emoji: "🏛️" };
  if (avg >= 300) return { title: "Auction Regular", emoji: "🎩" };
  return { title: "Auction Apprentice", emoji: "📚" };
};

const getReaction = (pct: number) => {
  if (pct <= 5) return "Incredible! 🎯";
  if (pct <= 15) return "Very close! 🔥";
  if (pct <= 30) return "Not bad! 👏";
  if (pct <= 60) return "That was bold… 🤔";
  return "Way off! 😅";
};

// ─── Animated Counter ─────────────────────────────────────
const AnimatedCounter = ({ target, duration = 2000 }: { target: number; duration?: number }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);

  return <>{formatPrice(val)}</>;
};

// ─── Score Counter ────────────────────────────────────────
const ScoreCounter = ({ target }: { target: number }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target]);

  return <>{val}</>;
};

// ─── Main Component ──────────────────────────────────────
const AuctionChallenge = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<GuessResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [imageHover, setImageHover] = useState(false);

  const ITEMS_PER_SESSION = 7;

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("auction/items");
        if (error) throw error;
        setItems((data as AuctionItem[]).slice(0, ITEMS_PER_SESSION));
      } catch (e) {
        console.error("Failed to fetch auction items:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const currentItem = items[currentIdx];

  const handleGuessChange = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, "");
    setGuess(numeric);
  };

  const formattedGuess = guess
    ? "$" + parseInt(guess).toLocaleString("en-US")
    : "";

  const submitGuess = useCallback(async () => {
    if (!guess || !currentItem || submitting) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("auction/guess", {
        body: { itemId: currentItem.id, guess: parseInt(guess) },
      });
      if (error) throw error;
      const res = data as GuessResult;
      setResult(res);
      setTotalScore((s) => s + res.score);
      setHistory((h) => [...h, { item: currentItem, result: res }]);

      // Play reveal sound
      playRevealSound();
    } catch (e) {
      console.error("Failed to submit guess:", e);
    } finally {
      setSubmitting(false);
    }
  }, [guess, currentItem, submitting]);

  const nextItem = () => {
    if (currentIdx >= items.length - 1) {
      setGameOver(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setGuess("");
      setResult(null);
    }
  };

  const playAgain = () => {
    setCurrentIdx(0);
    setGuess("");
    setResult(null);
    setTotalScore(0);
    setHistory([]);
    setGameOver(false);
    setLoading(true);
    supabase.functions.invoke("auction/items").then(({ data }) => {
      setItems(((data as AuctionItem[]) || []).slice(0, ITEMS_PER_SESSION));
      setLoading(false);
    });
  };

  const playRevealSound = () => {
    try {
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      [440, 554, 659, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
    } catch {}
  };

  // ─── GAME OVER SCREEN ───────────────────────────────────
  if (gameOver) {
    const rank = getRank(totalScore, history.length);
    const avgAccuracy = history.length
      ? Math.round(
          (history.reduce((s, h) => s + (100 - h.result.percent_off), 0) / history.length) * 10
        ) / 10
      : 0;
    const closest = [...history].sort((a, b) => a.result.percent_off - b.result.percent_off)[0];
    const farthest = [...history].sort((a, b) => b.result.percent_off - a.result.percent_off)[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-6xl mb-4"
          >
            {rank.emoji}
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-black text-amber-400 mb-2">{rank.title}</h1>
          <p className="text-white/50 mb-8">Auction Complete</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{totalScore}</div>
              <div className="text-xs text-white/40">Total Score</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Target className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{avgAccuracy}%</div>
              <div className="text-xs text-white/40">Avg Accuracy</div>
            </div>
          </div>

          {closest && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-3 text-left">
              <p className="text-emerald-400 text-sm font-semibold">🎯 Closest Guess</p>
              <p className="text-white/70 text-sm">{closest.item.name} — {closest.result.percent_off}% off</p>
            </div>
          )}
          {farthest && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-8 text-left">
              <p className="text-red-400 text-sm font-semibold"><TrendingDown className="inline w-4 h-4" /> Farthest Guess</p>
              <p className="text-white/70 text-sm">{farthest.item.name} — {farthest.result.percent_off}% off</p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-5 py-3 rounded-xl border border-white/20 text-white/70 font-semibold hover:bg-white/5 transition-colors"
            >
              Back to Arena
            </button>
            <button
              onClick={playAgain}
              className="px-5 py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Play Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── LOADING ────────────────────────────────────────────
  if (loading || !currentItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-amber-400 text-xl font-semibold"
        >
          Loading auction items...
        </motion.div>
      </div>
    );
  }

  // ─── MAIN GAME ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] relative overflow-hidden">
      {/* Spotlight */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6">
        {/* Header */}
        <div className="w-full max-w-3xl flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Arena</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/30 font-semibold tracking-wider uppercase">
              {currentIdx + 1} / {items.length}
            </span>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5">
              <span className="text-amber-400 font-bold text-sm">
                <Trophy className="inline w-4 h-4 mr-1" />
                {totalScore}
              </span>
            </div>
          </div>
        </div>

        {/* Item Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl flex flex-col items-center"
          >
            {/* Image */}
            <div
              className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-2xl shadow-black/50 bg-black/30"
              onMouseEnter={() => setImageHover(true)}
              onMouseLeave={() => setImageHover(false)}
            >
              <motion.img
                src={currentItem.image}
                alt={currentItem.name}
                className="w-full h-full object-cover"
                animate={{ scale: imageHover ? 1.05 : 1 }}
                transition={{ duration: 0.4 }}
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-xs bg-amber-500/80 text-black font-bold px-2 py-0.5 rounded">
                  {currentItem.year}
                </span>
              </div>
            </div>

            {/* Item Info */}
            <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-1">
              {currentItem.name}
            </h2>
            <p className="text-sm text-white/50 text-center mb-8 max-w-md">
              {currentItem.description}
            </p>

            {/* Input / Result */}
            {!result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-sm"
              >
                <label className="text-sm text-white/30 font-semibold mb-2 block text-center uppercase tracking-wider">
                  Enter your guess in USD
                </label>
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-lg">$</span>
                  <input
                    type="text"
                    value={guess ? parseInt(guess).toLocaleString("en-US") : ""}
                    onChange={(e) => handleGuessChange(e.target.value.replace(/,/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/15 rounded-xl py-4 pl-10 pr-4 text-white text-xl font-bold text-center focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-white/20"
                    autoFocus
                  />
                </div>
                <button
                  onClick={submitGuess}
                  disabled={!guess || submitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                >
                  {submitting ? "Revealing..." : "Place Bid"}
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
              >
                {/* Reaction */}
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-center text-2xl font-black text-white mb-6"
                >
                  {getReaction(result.percent_off)}
                </motion.p>

                {/* Price Reveal */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-xs text-white/30 uppercase font-semibold mb-1">Your Guess</p>
                    <p className="text-lg font-bold text-white">{formatPrice(result.guess)}</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 text-center">
                    <p className="text-xs text-amber-400/70 uppercase font-semibold mb-1">Actual Price</p>
                    <p className="text-lg font-bold text-amber-400">
                      <AnimatedCounter target={result.actual_price} />
                    </p>
                  </div>
                </div>

                {/* Accuracy Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/40">Accuracy</span>
                    <span className="text-white/70 font-bold">{Math.max(0, Math.round(100 - result.percent_off))}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, Math.min(100, 100 - result.percent_off))}%` }}
                      transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.4 }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                    />
                  </div>
                </div>

                {/* Score */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center mb-6"
                >
                  <p className="text-white/40 text-sm">
                    You were <span className="text-white font-semibold">{result.percent_off}%</span> off
                  </p>
                  <p className="text-3xl font-black text-amber-400 mt-1">
                    +<ScoreCounter target={result.score} /> pts
                  </p>
                </motion.div>

                {/* Next */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="flex justify-center gap-3"
                >
                  <button
                    onClick={() => navigate("/")}
                    className="px-5 py-3 rounded-xl border border-white/20 text-white/60 font-semibold hover:bg-white/5 transition-colors"
                  >
                    Back to Arena
                  </button>
                  <button
                    onClick={nextItem}
                    className="px-5 py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    {currentIdx >= items.length - 1 ? "See Results" : "Next Item"}
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuctionChallenge;
