import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Trophy, Timer, Skull } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Rule {
  id: number;
  description: string;
  validate: (password: string, context: GameContext) => boolean;
  tier: number;
}

interface GameContext {
  randomNumber: number;
  randomWord: string;
  today: string;
  currentYear: string;
}

const createRules = (ctx: GameContext): Rule[] => [
  { id: 1, description: "Password must be at least 5 characters", validate: (p) => p.length >= 5, tier: 1 },
  { id: 2, description: "Must include a number", validate: (p) => /\d/.test(p), tier: 1 },
  { id: 3, description: "Must include an uppercase letter", validate: (p) => /[A-Z]/.test(p), tier: 1 },
  { id: 4, description: "Must include a special character (!@#$%^&*)", validate: (p) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/~`]/.test(p), tier: 1 },
  { id: 5, description: "The digits must add up to 25", validate: (p) => { const sum = p.split('').filter(c => /\d/.test(c)).reduce((a, c) => a + parseInt(c), 0); return sum === 25; }, tier: 2 },
  { id: 6, description: "Must include a Roman numeral (I, V, X, L, C, D, M)", validate: (p) => /[IVXLCDM]/.test(p), tier: 2 },
  { id: 7, description: "Must contain the name of a planet", validate: (p) => /mercury|venus|earth|mars|jupiter|saturn|uranus|neptune/i.test(p), tier: 2 },
  { id: 8, description: "Must include exactly 3 vowels (a, e, i, o, u)", validate: (p) => { const vowels = p.match(/[aeiouAEIOU]/g); return vowels !== null && vowels.length === 3; }, tier: 3 },
  { id: 9, description: `Must include today's date (${new Date().getDate()})`, validate: (p) => p.includes(String(new Date().getDate())), tier: 3 },
  { id: 10, description: "Must contain a prime number (2,3,5,7,11,13,17,19,23)", validate: (p) => /(?:^|[^\d])(?:2|3|5|7|11|13|17|19|23)(?:[^\d]|$)/.test(p) || /(?:2|3|5|7|11|13|17|19|23)/.test(p), tier: 3 },
  { id: 11, description: "Must include a palindrome of 3+ chars (e.g. aba, 121)", validate: (p) => { for (let i = 0; i < p.length - 2; i++) { for (let len = 3; len <= p.length - i; len++) { const sub = p.slice(i, i + len); if (sub === sub.split('').reverse().join('')) return true; } } return false; }, tier: 4 },
  { id: 12, description: "Must include the square root of 144", validate: (p) => p.includes("12"), tier: 4 },
  { id: 13, description: "Must include a color name (red, blue, green, etc.)", validate: (p) => /red|blue|green|yellow|orange|purple|pink|black|white|cyan/i.test(p), tier: 4 },
  { id: 14, description: `Must include the current year (${ctx.currentYear})`, validate: (p) => p.includes(ctx.currentYear), tier: 5 },
  { id: 15, description: "Must include a Fibonacci number (1,2,3,5,8,13,21,34,55,89)", validate: (p) => /(?:1|2|3|5|8|13|21|34|55|89)/.test(p), tier: 5 },
  { id: 16, description: "Must contain at least 2 consecutive uppercase letters", validate: (p) => /[A-Z]{2,}/.test(p), tier: 5 },
  { id: 17, description: "Must include a periodic table element symbol (He, Li, Na, Fe, Au, Ag)", validate: (p) => /He|Li|Na|Fe|Au|Ag|Cu|Zn|Pb|Sn/i.test(p) && /He|Li|Na|Fe|Au|Ag|Cu|Zn|Pb|Sn/.test(p), tier: 6 },
  { id: 18, description: "Must include the binary of 5 (101)", validate: (p) => p.includes("101"), tier: 6 },
  { id: 19, description: "Must include a chess piece name (king, queen, rook, bishop, knight, pawn)", validate: (p) => /king|queen|rook|bishop|knight|pawn/i.test(p), tier: 6 },
  { id: 20, description: `Must include the number: ${ctx.randomNumber}`, validate: (p) => p.includes(String(ctx.randomNumber)), tier: 7 },
  { id: 21, description: `Must include the word: "${ctx.randomWord}"`, validate: (p) => p.toLowerCase().includes(ctx.randomWord.toLowerCase()), tier: 7 },
  { id: 22, description: "Must include a moon phase emoji (🌑🌒🌓🌔🌕🌖🌗🌘)", validate: (p) => /🌑|🌒|🌓|🌔|🌕|🌖|🌗|🌘/.test(p), tier: 7 },
  { id: 23, description: "Must be at least 30 characters long", validate: (p) => p.length >= 30, tier: 8 },
  { id: 24, description: "Must NOT include the letter 'z'", validate: (p) => !/z/i.test(p), tier: 8 },
  { id: 25, description: "Must include a country name (nepal, japan, france, brazil, egypt)", validate: (p) => /nepal|japan|france|brazil|egypt|india|china|canada|mexico|spain/i.test(p), tier: 8 },
  { id: 26, description: "Must include an emoji 🎉", validate: (p) => /\p{Emoji_Presentation}/u.test(p), tier: 9 },
  { id: 27, description: "Password must contain the word 'password'", validate: (p) => p.toLowerCase().includes("password"), tier: 9 },
  { id: 28, description: "Must be exactly 50 characters", validate: (p) => [...p].length === 50, tier: 10 },
];

const RANDOM_WORDS = ["pixel", "glitch", "cyber", "neon", "flux", "orbit", "blade", "storm", "pulse", "void"];

const PasswordChallenge = () => {
  const [password, setPassword] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [maxRulesReached, setMaxRulesReached] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const gameContext = useMemo<GameContext>(() => ({
    randomNumber: Math.floor(1000 + Math.random() * 9000),
    randomWord: RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)],
    today: String(new Date().getDate()),
    currentYear: String(new Date().getFullYear()),
  }), []);

  const allRules = useMemo(() => createRules(gameContext), [gameContext]);
  const activeRules = allRules.slice(0, visibleCount);

  const ruleResults = useMemo(() => {
    return activeRules.map(rule => ({
      ...rule,
      passed: password.length > 0 && rule.validate(password, gameContext),
    }));
  }, [password, activeRules, gameContext]);

  const passedCount = ruleResults.filter(r => r.passed).length;
  const allPassed = ruleResults.length > 0 && passedCount === ruleResults.length;

  // Start timer on first input
  useEffect(() => {
    if (password.length > 0 && !isRunning) setIsRunning(true);
  }, [password, isRunning]);

  // Timer
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Add new rules when all current are satisfied
  useEffect(() => {
    if (allPassed && visibleCount < allRules.length) {
      const timeout = setTimeout(() => {
        setVisibleCount(c => Math.min(c + 1, allRules.length));
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [allPassed, visibleCount, allRules.length]);

  useEffect(() => {
    if (passedCount > maxRulesReached) setMaxRulesReached(passedCount);
  }, [passedCount, maxRulesReached]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[hsl(230,25%,4%)] text-[hsl(150,80%,65%)] relative overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, hsl(150,80%,50%) 0px, transparent 1px, transparent 40px),
                          repeating-linear-gradient(90deg, hsl(150,80%,50%) 0px, transparent 1px, transparent 40px)`,
      }} />
      {/* Scanline */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(150,80%,50%,0.03) 2px, hsl(150,80%,50%,0.03) 4px)`,
      }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-[hsl(150,80%,50%)] hover:text-[hsl(150,80%,70%)] transition-colors font-mono text-sm">
            <ArrowLeft className="w-4 h-4" /> cd ~/home
          </Link>
          <div className="flex items-center gap-4 font-mono text-sm">
            <div className="flex items-center gap-1 text-[hsl(150,80%,50%,0.7)]">
              <Timer className="w-4 h-4" />
              {formatTime(elapsedTime)}
            </div>
            <div className="flex items-center gap-1 text-[hsl(150,80%,50%,0.7)]">
              <Trophy className="w-4 h-4" />
              {passedCount}/{ruleResults.length}
            </div>
          </div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-mono font-bold mb-2 tracking-tight" style={{
            textShadow: '0 0 20px hsl(150,80%,50%,0.5), 0 0 60px hsl(150,80%,50%,0.2)',
          }}>
            🔐 Infinite Password Challenge
          </h1>
          <p className="font-mono text-sm text-[hsl(150,80%,50%,0.5)] tracking-widest">
            {"// It only gets worse."}
          </p>
        </motion.div>

        {/* Input */}
        <div className="mb-8">
          <label className="block font-mono text-xs text-[hsl(150,80%,50%,0.5)] mb-2 tracking-wider">
            $ enter_password &gt;
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Start typing..."
              className="w-full bg-[hsl(230,25%,8%)] border-2 border-[hsl(150,80%,50%,0.3)] rounded-lg px-4 py-4 font-mono text-lg text-[hsl(150,80%,75%)] placeholder:text-[hsl(150,80%,50%,0.2)] focus:outline-none focus:border-[hsl(150,80%,50%,0.7)] focus:shadow-[0_0_20px_hsl(150,80%,50%,0.2)] transition-all"
              autoFocus
            />
            <button
              onClick={handleCopy}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(150,80%,50%,0.4)] hover:text-[hsl(150,80%,50%,0.8)] transition-colors"
              title="Copy password"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs text-[hsl(150,80%,50%,0.6)] mt-1">
              Copied to clipboard.
            </motion.p>
          )}
          <p className="font-mono text-xs text-[hsl(150,80%,50%,0.3)] mt-2">
            {[...password].length} characters • {activeRules.length} rules active
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-1.5 bg-[hsl(230,25%,12%)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, hsl(150,80%,40%), hsl(150,80%,60%))' }}
              animate={{ width: `${ruleResults.length > 0 ? (passedCount / ruleResults.length) * 100 : 0}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>
        </div>

        {/* Rules */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {ruleResults.map((rule) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -30, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 30, height: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`flex items-start gap-3 p-3 rounded-lg border font-mono text-sm transition-all duration-300 ${
                  rule.passed
                    ? "bg-[hsl(150,80%,50%,0.05)] border-[hsl(150,80%,50%,0.3)] text-[hsl(150,80%,65%)]"
                    : "bg-[hsl(0,80%,50%,0.03)] border-[hsl(0,60%,40%,0.2)] text-[hsl(0,60%,65%)]"
                }`}
              >
                <motion.span
                  className="mt-0.5 text-lg flex-shrink-0"
                  animate={!rule.passed && password.length > 0 ? { x: [0, -2, 2, -2, 0] } : {}}
                  transition={{ duration: 0.3, repeat: 0 }}
                >
                  {rule.passed ? "✅" : "❌"}
                </motion.span>
                <div>
                  <span className="text-[hsl(150,80%,50%,0.4)] mr-2">#{rule.id}</span>
                  {rule.description}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* All rules beaten */}
        {allPassed && visibleCount >= allRules.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 p-6 rounded-xl border-2 border-[hsl(150,80%,50%,0.5)] bg-[hsl(150,80%,50%,0.05)] text-center"
          >
            <Skull className="w-10 h-10 mx-auto mb-3 text-[hsl(150,80%,50%)]" />
            <h2 className="font-mono text-xl font-bold mb-2" style={{ textShadow: '0 0 15px hsl(150,80%,50%,0.5)' }}>
              YOU BEAT THE SYSTEM
            </h2>
            <p className="font-mono text-sm text-[hsl(150,80%,50%,0.6)]">
              All {allRules.length} rules satisfied in {formatTime(elapsedTime)}
            </p>
            <p className="font-mono text-xs text-[hsl(150,80%,50%,0.3)] mt-2 break-all">
              Final password: {password}
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center font-mono text-xs text-[hsl(150,80%,50%,0.2)] tracking-wider">
          {"// good luck. you'll need it."}
        </div>
      </div>
    </div>
  );
};

export default PasswordChallenge;
