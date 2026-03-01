import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import ParticleBackground from "@/components/ParticleBackground";
import Confetti from "@/components/Confetti";
import ThemeToggle from "@/components/ThemeToggle";
import PerformanceTimer from "@/components/PerformanceTimer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, LogIn, X, Settings } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_SEGMENTS = [
  { label: "Tell a joke", color: "hsl(270, 80%, 55%)" },
  { label: "Sing a song", color: "hsl(185, 80%, 45%)" },
  { label: "Make a dance move", color: "hsl(320, 80%, 55%)" },
  { label: "Write the code", color: "hsl(220, 90%, 55%)" },
  { label: "Rick Roll 🕺", color: "hsl(150, 80%, 45%)" },
  { label: "Do 10 push ups", color: "hsl(30, 90%, 55%)" },
  { label: "Introduce yourself in American accent", color: "hsl(350, 80%, 55%)" },
];

const PRESET_COLORS = [
  "hsl(270, 80%, 55%)", "hsl(185, 80%, 45%)", "hsl(320, 80%, 55%)",
  "hsl(220, 90%, 55%)", "hsl(150, 80%, 45%)", "hsl(30, 90%, 55%)",
  "hsl(350, 80%, 55%)", "hsl(45, 90%, 55%)", "hsl(200, 80%, 50%)",
];

interface Segment {
  label: string;
  color: string;
}

const SpinWheel = () => {
  const { user } = useAuth();
  const [segments, setSegments] = useState<Segment[]>(DEFAULT_SEGMENTS);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [phase, setPhase] = useState<"wheel" | "performance">("wheel");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSegments, setEditSegments] = useState<Segment[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const wheelRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load user's custom wheel options
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("user_wheel_options")
        .select("label, color, sort_order")
        .eq("user_id", user.id)
        .order("sort_order");
      if (data && data.length > 0) {
        setSegments(data.map((d: any) => ({ label: d.label, color: d.color })));
      }
    };
    load();
  }, [user]);

  const saveSegments = async (newSegments: Segment[]) => {
    if (!user) return;
    // Delete old, insert new
    await supabase.from("user_wheel_options").delete().eq("user_id", user.id);
    const rows = newSegments.map((s, i) => ({
      user_id: user.id,
      label: s.label,
      color: s.color,
      sort_order: i,
    }));
    const { error } = await supabase.from("user_wheel_options").insert(rows);
    if (error) toast.error("Failed to save options");
    else toast.success("Wheel options saved!");
  };

  const SEGMENT_ANGLE = 360 / segments.length;

  const spin = useCallback(() => {
    if (spinning || segments.length < 2) return;
    setSpinning(true);
    setResult(null);
    setShowConfetti(false);

    const extraSpins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalDegrees = extraSpins * 360 + randomAngle;
    const newRotation = rotation + totalDegrees;

    setRotation(newRotation);

    setTimeout(() => {
      const normalizedAngle = (360 - (newRotation % 360)) % 360;
      const segmentIndex = Math.floor(normalizedAngle / SEGMENT_ANGLE);
      const selected = segments[segmentIndex % segments.length];

      setResult(selected.label);
      setSpinning(false);
      setSpinCount((c) => c + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }, 4500);
  }, [spinning, rotation, segments, SEGMENT_ANGLE]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const openEditModal = () => {
    setEditSegments([...segments]);
    setNewLabel("");
    setShowEditModal(true);
  };

  const addSegment = () => {
    if (!newLabel.trim()) return;
    const color = PRESET_COLORS[editSegments.length % PRESET_COLORS.length];
    setEditSegments((prev) => [...prev, { label: newLabel.trim(), color }]);
    setNewLabel("");
  };

  const removeSegment = (idx: number) => {
    setEditSegments((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveEdit = async () => {
    if (editSegments.length < 2) { toast.error("Need at least 2 options"); return; }
    setSegments(editSegments);
    setShowEditModal(false);
    setResult(null);
    if (user) await saveSegments(editSegments);
  };

  const resetToDefault = async () => {
    setEditSegments([...DEFAULT_SEGMENTS]);
  };

  const wheelSize = 320;
  const center = wheelSize / 2;
  const radius = center - 10;

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden bg-background">
      <ParticleBackground />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[150px]" />
      </div>

      {showConfetti && <Confetti />}

      <div className="relative z-10 flex flex-col items-center px-4 py-6 sm:py-10 min-h-screen">
        {/* Top bar */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-6 sm:mb-10 animate-fade-in">
          <Link to="/" className="font-display text-sm sm:text-base font-bold text-muted-foreground hover:text-neon-cyan transition-colors tracking-wider">
            ← BACK
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-body text-xs sm:text-sm text-muted-foreground">
              Spins: <span className="text-neon-cyan font-bold">{spinCount}</span>
            </span>
            <button onClick={openEditModal} className="glass-panel px-3 py-1.5 text-xs font-display font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Settings className="w-3 h-3" /> Edit Options
            </button>
            {!user && (
              <Link to="/auth" className="glass-panel px-3 py-1.5 text-xs font-display font-bold text-neon-cyan hover:text-foreground transition-colors flex items-center gap-1">
                <LogIn className="w-3 h-3" /> Login
              </Link>
            )}
            <button onClick={toggleFullscreen} className="glass-panel px-3 py-1.5 text-xs font-display font-bold text-muted-foreground hover:text-foreground transition-colors">
              {isFullscreen ? "EXIT FS" : "⛶ FULLSCREEN"}
            </button>
            <ThemeToggle />
          </div>
        </div>

        <h1 className="font-display text-2xl sm:text-4xl font-black text-foreground text-glow-purple mb-8 sm:mb-12 animate-fade-in text-center">
          🎡 Spin The Wheel
        </h1>

        {user && <p className="text-xs text-neon-cyan mb-4 font-display">✓ Your custom options are saved</p>}

        {phase === "wheel" && (
          <>
            <div className="relative animate-scale-in">
              <div className="absolute top-[-18px] left-1/2 -translate-x-1/2 z-20">
                <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent"
                  style={{ borderTopColor: "hsl(185, 80%, 50%)", filter: "drop-shadow(0 0 8px hsl(185, 80%, 50%))" }} />
              </div>

              <div className={`absolute inset-[-20px] rounded-full transition-all duration-1000 ${spinning ? "opacity-80" : "opacity-30"}`}
                style={{ background: "conic-gradient(from 0deg, hsl(270,80%,60%), hsl(185,80%,50%), hsl(320,80%,58%), hsl(270,80%,60%))", filter: "blur(20px)" }} />

              <svg ref={wheelRef} width={wheelSize} height={wheelSize} viewBox={`0 0 ${wheelSize} ${wheelSize}`}
                className="relative z-10 w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[500px] md:h-[500px]"
                style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none" }}>
                {segments.map((seg, i) => {
                  const startAngle = i * SEGMENT_ANGLE - 90;
                  const endAngle = startAngle + SEGMENT_ANGLE;
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  const x1 = center + radius * Math.cos(startRad);
                  const y1 = center + radius * Math.sin(startRad);
                  const x2 = center + radius * Math.cos(endRad);
                  const y2 = center + radius * Math.sin(endRad);
                  const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
                  const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
                  const textRadius = radius * 0.65;
                  const textX = center + textRadius * Math.cos(midAngle);
                  const textY = center + textRadius * Math.sin(midAngle);
                  const textRotation = (startAngle + endAngle) / 2;

                  return (
                    <g key={i}>
                      <path d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={seg.color} stroke="hsl(230, 25%, 7%)" strokeWidth="2" />
                      <text x={textX} y={textY} fill="white" fontSize="9" fontFamily="var(--font-display)" fontWeight="700"
                        textAnchor="middle" dominantBaseline="middle" transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                        {seg.label.length > 16 ? seg.label.slice(0, 14) + "…" : seg.label}
                      </text>
                    </g>
                  );
                })}
                <g onClick={spin} className="cursor-pointer">
                  <circle cx={center} cy={center} r="24" fill="hsl(230, 25%, 10%)" stroke="hsl(270, 80%, 60%)" strokeWidth="3" />
                  <text x={center} y={center} fill="hsl(270, 80%, 60%)" fontSize="11" fontFamily="var(--font-display)" fontWeight="800"
                    textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: "none" }}>SPIN</text>
                </g>
              </svg>
            </div>

            {result && !spinning && (
              <div className="mt-8 sm:mt-12 text-center" style={{ animation: "result-appear 0.6s ease-out forwards" }}>
                <p className="font-body text-sm text-muted-foreground uppercase tracking-widest mb-2">
                  {result === "Rick Roll 🕺" ? "You've been chosen..." : "The wheel has spoken:"}
                </p>
                <div className={`glass-panel px-8 sm:px-12 py-5 sm:py-6 ${result === "Rick Roll 🕺" ? "" : "neon-glow-purple"}`}
                  style={result === "Rick Roll 🕺" ? { animation: "rickroll-shake 0.4s ease-in-out infinite, rickroll-rainbow 2s linear infinite", border: "2px solid" } : undefined}>
                  <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-foreground"
                    style={result === "Rick Roll 🕺" ? { animation: "rickroll-rainbow-text 1.5s linear infinite" } : undefined}>
                    {result === "Rick Roll 🕺" ? "🕺 RICK ROLLED! 🕺" : result}
                  </h2>
                  {result === "Rick Roll 🕺" && (
                    <>
                      <p className="mt-2 text-lg sm:text-xl animate-pulse">🎵 Never gonna give you up! 🎵</p>
                      <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer"
                        className="mt-4 inline-block font-display text-sm sm:text-base font-bold text-neon-cyan underline hover:text-neon-purple transition-colors">
                        🎶 Watch the Rick Roll →
                      </a>
                      <div className="mt-4 rounded-xl overflow-hidden">
                        <iframe width="320" height="180" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&start=0"
                          title="Rick Roll" allow="autoplay; encrypted-media" allowFullScreen
                          className="w-full max-w-[400px] aspect-video rounded-xl" />
                      </div>
                    </>
                  )}
                </div>
                {result !== "Rick Roll 🕺" && (
                  <button onClick={() => setPhase("performance")}
                    className="mt-6 px-8 py-3 font-display text-sm font-bold tracking-widest uppercase rounded-lg bg-neon-purple/20 border border-neon-purple/60 text-neon-purple hover:bg-neon-purple/30 transition-all neon-glow-purple">
                    🎤 Start Challenge Timer
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {phase === "performance" && result && (
          <PerformanceTimer challenge={result} onBack={() => { setPhase("wheel"); setResult(null); setShowConfetti(false); }} />
        )}
      </div>

      {/* Edit Options Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="glass-panel rounded-2xl p-6 max-w-md w-full mx-4 border border-border/50 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold">⚙️ Edit Wheel Options</h2>
                <button onClick={() => setShowEditModal(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-2 mb-4">
                {editSegments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-2 glass-panel rounded-lg p-2">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="flex-1 text-sm font-display truncate">{seg.label}</span>
                    <button onClick={() => removeSegment(i)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="New option..."
                  maxLength={60} onKeyDown={(e) => e.key === "Enter" && addSegment()}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-display focus:outline-none focus:ring-2 focus:ring-neon-purple/50" />
                <Button size="sm" onClick={addSegment} disabled={!newLabel.trim()}><Plus className="w-4 h-4" /></Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveEdit} className="flex-1 font-display" disabled={editSegments.length < 2}>Save Options</Button>
                <Button variant="outline" onClick={resetToDefault} className="font-display">Reset</Button>
              </div>

              {!user && <p className="text-xs text-muted-foreground text-center mt-3">💡 <Link to="/auth" className="text-neon-cyan underline">Sign in</Link> to save your options permanently</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpinWheel;
