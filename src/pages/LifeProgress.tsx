import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// ─── LUNAR CALCULATION (Simplified astronomical algorithm) ───
const LUNAR_CYCLE = 29.53058770576;
const KNOWN_NEW_MOON = new Date("2024-01-11T11:57:00Z").getTime();

const getMoonPhaseDay = (date: Date): number => {
  const diff = date.getTime() - KNOWN_NEW_MOON;
  const days = diff / (1000 * 60 * 60 * 24);
  return ((days % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
};

const getNextMoonPhase = (targetDay: number, from: Date): Date => {
  const currentDay = getMoonPhaseDay(from);
  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) daysUntil += LUNAR_CYCLE;
  return new Date(from.getTime() + daysUntil * 24 * 60 * 60 * 1000);
};

// Moon phase targets (approximate days into cycle)
const MOON_PHASES = [
  { emoji: "🌑", name: "New Moon", day: 0 },
  { emoji: "🌒", name: "Waxing Crescent", day: 3.69 },
  { emoji: "🌓", name: "First Quarter", day: 7.38 },
  { emoji: "🌔", name: "Waxing Gibbous", day: 11.07 },
  { emoji: "🌕", name: "Full Moon", day: 14.76 },
  { emoji: "🌖", name: "Waning Gibbous", day: 18.46 },
  { emoji: "🌗", name: "Last Quarter", day: 22.15 },
  { emoji: "🌘", name: "Waning Crescent", day: 25.84 },
];

// ─── EASTER CALCULATION (Anonymous Gregorian algorithm) ───
const getEaster = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

// ─── THANKSGIVING (4th Thursday of November) ───
const getThanksgiving = (year: number): Date => {
  const nov1 = new Date(year, 10, 1);
  const dayOfWeek = nov1.getDay();
  const firstThursday = dayOfWeek <= 4 ? 4 - dayOfWeek + 1 : 7 - dayOfWeek + 5;
  return new Date(year, 10, firstThursday + 21);
};

// ─── MOTHER'S DAY (2nd Sunday of May) ───
const getMothersDay = (year: number): Date => {
  const may1 = new Date(year, 4, 1);
  const dayOfWeek = may1.getDay();
  const firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  return new Date(year, 4, firstSunday + 7);
};

// ─── FATHER'S DAY (3rd Sunday of June) ───
const getFathersDay = (year: number): Date => {
  const jun1 = new Date(year, 5, 1);
  const dayOfWeek = jun1.getDay();
  const firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  return new Date(year, 5, firstSunday + 14);
};

// ─── DASHAIN (approximate Nepali calendar — Vijaya Dashami dates) ───
const getDashain = (year: number): Date => {
  const dashainDates: Record<number, string> = {
    2024: "2024-10-12", 2025: "2025-10-02", 2026: "2026-10-21",
    2027: "2027-10-10", 2028: "2028-09-28", 2029: "2029-10-17",
    2030: "2030-10-07",
  };
  if (dashainDates[year]) return new Date(dashainDates[year]);
  return new Date(year, 9, 10); // fallback ~Oct 10
};

// ─── NEXT OCCURRENCE HELPER ───
const getNextDate = (month: number, day: number, now: Date): Date => {
  const thisYear = new Date(now.getFullYear(), month, day);
  if (thisYear.getTime() > now.getTime()) return thisYear;
  return new Date(now.getFullYear() + 1, month, day);
};

const getNextRecurring = (getDate: (y: number) => Date, now: Date): Date => {
  const thisYear = getDate(now.getFullYear());
  if (thisYear.getTime() > now.getTime()) return thisYear;
  return getDate(now.getFullYear() + 1);
};

// ─── FORMATTING ───
const formatTimeLeft = (ms: number): string => {
  if (ms <= 0) return "Now!";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365.25);

  if (years > 1000000000) return `~${(years / 1e9).toFixed(1)} billion years`;
  if (years > 1000000) return `~${(years / 1e6).toFixed(1)} million years`;
  if (years > 1000) return `~${years.toLocaleString()} years`;
  if (years > 0) return `${years}y ${days % 365}d`;
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

// ─── EVENT TYPES ───
interface ProgressEvent {
  emoji: string;
  name: string;
  category: "short" | "holiday" | "moon" | "longterm" | "cosmic" | "custom";
  getTarget: (now: Date) => Date;
  getStart: (now: Date, target: Date) => Date;
  color: string;
}

interface CustomBirthday {
  name: string;
  date: string; // YYYY-MM-DD
}

const buildEvents = (): ProgressEvent[] => {
  const events: ProgressEvent[] = [];

  // Short-term
  const shortTerm: Array<{ emoji: string; name: string; getTarget: (n: Date) => Date; getStart: (n: Date, t: Date) => Date }> = [
    {
      emoji: "🕑", name: "Next Minute",
      getTarget: (n) => { const d = new Date(n); d.setSeconds(0, 0); d.setMinutes(d.getMinutes() + 1); return d; },
      getStart: (n) => { const d = new Date(n); d.setSeconds(0, 0); return d; },
    },
    {
      emoji: "🕑", name: "Next Hour",
      getTarget: (n) => { const d = new Date(n); d.setMinutes(0, 0, 0); d.setHours(d.getHours() + 1); return d; },
      getStart: (n) => { const d = new Date(n); d.setMinutes(0, 0, 0); return d; },
    },
    {
      emoji: "🌅", name: "Next Day",
      getTarget: (n) => { const d = new Date(n); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 1); return d; },
      getStart: (n) => { const d = new Date(n); d.setHours(0, 0, 0, 0); return d; },
    },
    {
      emoji: "📅", name: "Next Month",
      getTarget: (n) => new Date(n.getFullYear(), n.getMonth() + 1, 1),
      getStart: (n) => new Date(n.getFullYear(), n.getMonth(), 1),
    },
    {
      emoji: "🎆", name: "Next Year",
      getTarget: (n) => new Date(n.getFullYear() + 1, 0, 1),
      getStart: (n) => new Date(n.getFullYear(), 0, 1),
    },
  ];
  shortTerm.forEach((e) => events.push({ ...e, category: "short", color: "from-cyan-400 to-blue-500" }));

  // Holidays
  const holidays: Array<{ emoji: string; name: string; getDate: (y: number) => Date }> = [
    { emoji: "💑", name: "Valentine's Day", getDate: (y) => new Date(y, 1, 14) },
    { emoji: "🍀", name: "St. Patrick's Day", getDate: (y) => new Date(y, 2, 17) },
    { emoji: "🐇", name: "Easter", getDate: getEaster },
    { emoji: "👩", name: "Mother's Day", getDate: getMothersDay },
    { emoji: "👨", name: "Father's Day", getDate: getFathersDay },
    { emoji: "👻", name: "Halloween", getDate: (y) => new Date(y, 9, 31) },
    { emoji: "🦃", name: "Thanksgiving", getDate: getThanksgiving },
    { emoji: "🎅", name: "Christmas", getDate: (y) => new Date(y, 11, 25) },
    { emoji: "🏵", name: "Dashain", getDate: getDashain },
  ];
  holidays.forEach((h) =>
    events.push({
      emoji: h.emoji, name: h.name, category: "holiday", color: "from-orange-400 to-rose-500",
      getTarget: (n) => getNextRecurring(h.getDate, n),
      getStart: (n, t) => {
        const prev = new Date(t);
        prev.setFullYear(prev.getFullYear() - 1);
        return prev;
      },
    })
  );

  // Moon phases
  MOON_PHASES.forEach((mp) =>
    events.push({
      emoji: mp.emoji, name: mp.name, category: "moon", color: "from-slate-300 to-indigo-400",
      getTarget: (n) => getNextMoonPhase(mp.day, n),
      getStart: (n, t) => new Date(t.getTime() - LUNAR_CYCLE * 24 * 60 * 60 * 1000),
    })
  );

  // Long-term
  const longTerm = [
    { emoji: "📅", name: "Next Decade", getTarget: (n: Date) => { const y = Math.ceil((n.getFullYear() + 1) / 10) * 10; return new Date(y, 0, 1); }, getStart: (n: Date) => { const y = Math.floor(n.getFullYear() / 10) * 10; return new Date(y, 0, 1); } },
    { emoji: "📅", name: "Next Century", getTarget: (n: Date) => { const y = Math.ceil((n.getFullYear() + 1) / 100) * 100; return new Date(y, 0, 1); }, getStart: (n: Date) => { const y = Math.floor(n.getFullYear() / 100) * 100; return new Date(y, 0, 1); } },
    { emoji: "📅", name: "Next Millennium", getTarget: (n: Date) => { const y = Math.ceil((n.getFullYear() + 1) / 1000) * 1000; return new Date(y, 0, 1); }, getStart: (n: Date) => { const y = Math.floor(n.getFullYear() / 1000) * 1000; return new Date(y, 0, 1); } },
  ];
  longTerm.forEach((e) => events.push({ ...e, category: "longterm", color: "from-violet-400 to-purple-600" }));

  // Cosmic
  const cosmic = [
    { emoji: "☄️", name: "Halley's Comet", year: 2061 },
    { emoji: "🏭", name: "Chernobyl Safe Zone", year: 2200 },
    { emoji: "🛰", name: "Voyager 1 → Oort Cloud", year: 2300 },
    { emoji: "🌌", name: "Milky Way–Andromeda Collision", year: 4500000000 },
    { emoji: "☀️", name: "Sun Becomes Red Giant", year: 5000000000 },
  ];
  cosmic.forEach((c) =>
    events.push({
      emoji: c.emoji, name: c.name, category: "cosmic", color: "from-indigo-500 to-purple-900",
      getTarget: () => new Date(Math.min(c.year, 275760), 0, 1), // JS Date max year limit
      getStart: () => new Date(2024, 0, 1),
    })
  );

  return events;
};

// ─── PROGRESS BAR COMPONENT ───
const ProgressBar = ({ emoji, name, timeLeft, progress, colorClass, isShort }: {
  emoji: string; name: string; timeLeft: string; progress: number; colorClass: string; isShort: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel rounded-xl p-4 sm:p-5 border border-border/30 hover:border-neon-purple/30 transition-all duration-300 group"
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xl sm:text-2xl">{emoji}</span>
        <h3 className="font-display font-bold text-sm sm:text-base">{name}</h3>
      </div>
      <span className={`font-display text-xs sm:text-sm font-semibold ${isShort ? "text-neon-cyan" : "text-muted-foreground"}`}>
        {timeLeft}
      </span>
    </div>
    <div className="h-3 sm:h-4 rounded-full bg-muted/30 overflow-hidden relative">
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${colorClass} relative`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-pulse" />
      </motion.div>
    </div>
    <div className="text-right mt-1">
      <span className="text-xs text-muted-foreground font-display">{(progress * 100).toFixed(1)}%</span>
    </div>
  </motion.div>
);

// ─── MAIN COMPONENT ───
const LifeProgress = () => {
  const [now, setNow] = useState(new Date());
  const [filter, setFilter] = useState<string>("all");
  const [birthdays, setBirthdays] = useState<CustomBirthday[]>(() => {
    try { return JSON.parse(localStorage.getItem("life-progress-birthdays") || "[]"); } catch { return []; }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");

  // Tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Save birthdays
  useEffect(() => {
    localStorage.setItem("life-progress-birthdays", JSON.stringify(birthdays));
  }, [birthdays]);

  const events = useMemo(() => buildEvents(), []);

  const addBirthday = () => {
    if (!newName.trim() || !newDate) return;
    setBirthdays((prev) => [...prev, { name: newName.trim(), date: newDate }]);
    setNewName(""); setNewDate(""); setShowAddModal(false);
  };

  const removeBirthday = (idx: number) => setBirthdays((prev) => prev.filter((_, i) => i !== idx));

  const categories = [
    { key: "all", label: "All" },
    { key: "short", label: "⏱ Short" },
    { key: "holiday", label: "🎉 Holidays" },
    { key: "moon", label: "🌙 Moon" },
    { key: "longterm", label: "📅 Long" },
    { key: "cosmic", label: "☄️ Cosmic" },
    { key: "custom", label: "💖 Custom" },
  ];

  const filteredEvents = filter === "all" ? events : events.filter((e) => e.category === filter);

  // Build computed data
  const computedEvents = filteredEvents.map((e) => {
    const target = e.getTarget(now);
    const start = e.getStart(now, target);
    const total = target.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const progress = total > 0 ? elapsed / total : 1;
    const msLeft = target.getTime() - now.getTime();
    return { ...e, timeLeft: formatTimeLeft(msLeft), progress, msLeft };
  });

  // Birthday events
  const birthdayEvents = birthdays.map((b, idx) => {
    const [, m, d] = b.date.split("-").map(Number);
    const target = getNextDate(m - 1, d, now);
    const prevYear = new Date(target);
    prevYear.setFullYear(prevYear.getFullYear() - 1);
    const total = target.getTime() - prevYear.getTime();
    const elapsed = now.getTime() - prevYear.getTime();
    const progress = total > 0 ? elapsed / total : 1;
    const msLeft = target.getTime() - now.getTime();
    return { emoji: "💖", name: `${b.name}'s Birthday`, timeLeft: formatTimeLeft(msLeft), progress, msLeft, color: "from-pink-400 to-rose-500", idx };
  });

  const showBirthdays = filter === "all" || filter === "custom";

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Starfield background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-foreground/20 animate-pulse"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 font-display">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)} className="gap-2 font-display">
            <Plus className="w-4 h-4" /> Add Birthday
          </Button>
        </div>

        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight mb-2">
            ⏳ Life & Universe Progress
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">See how far away the future really is.</p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((c) => (
            <Button
              key={c.key}
              variant={filter === c.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(c.key)}
              className="font-display text-xs"
            >
              {c.label}
            </Button>
          ))}
        </div>

        {/* Event list */}
        <div className="space-y-3">
          {computedEvents.map((e, i) => (
            <ProgressBar
              key={`${e.name}-${i}`}
              emoji={e.emoji}
              name={e.name}
              timeLeft={e.timeLeft}
              progress={e.progress}
              colorClass={e.color}
              isShort={e.category === "short"}
            />
          ))}

          {/* Custom birthdays */}
          {showBirthdays && birthdayEvents.map((b) => (
            <div key={b.idx} className="relative">
              <ProgressBar
                emoji={b.emoji}
                name={b.name}
                timeLeft={b.timeLeft}
                progress={b.progress}
                colorClass={b.color}
                isShort={false}
              />
              <button
                onClick={() => removeBirthday(b.idx)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground/40 font-display tracking-wider uppercase">
            Time waits for no one
          </p>
        </div>
      </div>

      {/* Add Birthday Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-panel rounded-2xl p-6 max-w-sm w-full mx-4 border border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold">💖 Add Birthday</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-display mb-1 text-muted-foreground">Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Anita"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-display focus:outline-none focus:ring-2 focus:ring-neon-purple/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-display mb-1 text-muted-foreground">Birthday</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-display focus:outline-none focus:ring-2 focus:ring-neon-purple/50"
                  />
                </div>
                <Button onClick={addBirthday} className="w-full font-display" disabled={!newName.trim() || !newDate}>
                  Add Birthday
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LifeProgress;
