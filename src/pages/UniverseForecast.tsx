import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronUp } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";

interface TimelineEvent {
  year: string;
  icon: string;
  title: string;
  description: string;
  section: string;
  image: string;
}

const timelineEvents: TimelineEvent[] = [
  // SECTION 1 – NEAR FUTURE
  { year: "2060", icon: "📜", title: "Newton's Theological Forecast", description: "Sir Isaac Newton calculated that 2060 may mark the beginning of a new religious era based on biblical prophecy. He did not predict Earth's destruction — only a transformation of human civilization.", section: "Near Future", image: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg" },
  { year: "2061", icon: "☄️", title: "Halley's Comet Returns", description: "Halley's Comet completes its 76-year orbit and becomes visible from Earth once again — a celestial clock ticking since antiquity.", section: "Near Future", image: "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=600&h=300&fit=crop" },
  { year: "2178", icon: "🪐", title: "Pluto Completes One Full Orbit", description: "Since its discovery in 1930, Pluto finally completes one full trip around the Sun — a 248-year journey through the outer solar system.", section: "Near Future", image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=600&h=300&fit=crop" },
  { year: "2300", icon: "🚀", title: "Voyager 1 Reaches the Oort Cloud", description: "After traveling billions of kilometers, Voyager 1 reaches the outer shell of our solar system — the vast, icy Oort Cloud.", section: "Near Future", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=300&fit=crop" },

  // SECTION 2 – STELLAR TIMESCALES
  { year: "50,000", icon: "💥", title: "VY Canis Majoris Supernova", description: "One of the largest known stars explodes in a cataclysmic supernova, briefly outshining entire galaxies. The shockwave reshapes nearby nebulae.", section: "Stellar Timescales", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=300&fit=crop" },
  { year: "75,000", icon: "🌋", title: "New Hawaiian Island Forms", description: "The Lōʻihi seamount breaches the ocean surface, adding a new island to the Hawaiian chain — built by millions of years of volcanic activity.", section: "Stellar Timescales", image: "https://images.unsplash.com/photo-1547234935-80c7145ec969?w=600&h=300&fit=crop" },
  { year: "100,000", icon: "🌌", title: "Constellations Become Unrecognizable", description: "Stellar drift reshapes the night sky. Orion, the Big Dipper, and every constellation humanity named will be unrecognizable to future observers.", section: "Stellar Timescales", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=300&fit=crop" },

  // PLANETARY FUTURE
  { year: "600 Million", icon: "🌙", title: "Last Total Solar Eclipse", description: "The Moon drifts too far from Earth for its shadow to fully cover the Sun. Total solar eclipses become a thing of the past — forever.", section: "Planetary Future", image: "https://images.unsplash.com/photo-1503862510641-bf1b3ca2e56a?w=600&h=300&fit=crop" },
  { year: "800 Million", icon: "🌱", title: "Photosynthesis Ends", description: "Rising solar luminosity causes CO₂ levels to drop below the threshold for photosynthesis. Plants die. The oxygen-rich atmosphere begins to fade.", section: "Planetary Future", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=300&fit=crop" },
  { year: "1.1 Billion", icon: "🔥", title: "Earth's Oceans Evaporate", description: "The Sun's increasing energy output boils away Earth's oceans. The planet becomes a barren, scorched world — inhospitable to all known life.", section: "Planetary Future", image: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600&h=300&fit=crop" },

  // GALACTIC ERA
  { year: "5 Billion", icon: "🌠", title: "Milky Way–Andromeda Collision", description: "Our galaxy collides with the Andromeda Galaxy. Stars interweave in a cosmic dance spanning millions of years, forming a new galaxy: Milkdromeda.", section: "Galactic Era", image: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=600&h=300&fit=crop" },
  { year: "7 Billion", icon: "☀️", title: "The Sun Becomes a Red Giant", description: "The Sun exhausts its hydrogen fuel and expands enormously, engulfing Mercury, Venus, and possibly Earth in its bloated outer layers.", section: "Galactic Era", image: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=600&h=300&fit=crop" },
  { year: "8 Billion", icon: "⭐", title: "The Sun Becomes a White Dwarf", description: "After shedding its outer layers, the Sun collapses into a dense white dwarf — a fading ember the size of Earth, slowly cooling for eternity.", section: "Galactic Era", image: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=600&h=300&fit=crop" },

  // COSMIC LONG TERM
  { year: "450 Billion", icon: "🌠", title: "Local Group Merges Into One Galaxy", description: "All galaxies gravitationally bound to us merge into a single super-galaxy. Beyond it, the expanding universe carries everything else beyond reach.", section: "Deep Time", image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=600&h=300&fit=crop" },
  { year: "1 Trillion", icon: "🌌", title: "Big Bang Radiation Becomes Undetectable", description: "The cosmic microwave background — the afterglow of creation — redshifts beyond detection. Evidence of the Big Bang vanishes from observable reality.", section: "Deep Time", image: "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=600&h=300&fit=crop" },
  { year: "10¹⁵", icon: "🌑", title: "The Dark Era Begins", description: "All stars have burned out. The universe is populated only by white dwarfs, neutron stars, and black holes drifting through absolute darkness.", section: "Deep Time", image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=600&h=300&fit=crop" },
  { year: "10³⁰", icon: "🕳", title: "Black Holes Slowly Evaporate", description: "Through Hawking radiation, even the most massive black holes begin to lose mass — particle by particle — over inconceivable stretches of time.", section: "Deep Time", image: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=300&fit=crop" },
  { year: "10¹⁰⁰", icon: "❄️", title: "Heat Death of the Universe", description: "The final black hole evaporates in a whisper of radiation. Maximum entropy is reached. No energy gradients remain. Nothing interesting ever happens again.", section: "Deep Time", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=300&fit=crop" },
];

const sections = ["Near Future", "Stellar Timescales", "Planetary Future", "Galactic Era", "Deep Time"];

const sectionColors: Record<string, string> = {
  "Near Future": "from-blue-500 to-cyan-400",
  "Stellar Timescales": "from-amber-500 to-orange-400",
  "Planetary Future": "from-emerald-500 to-teal-400",
  "Galactic Era": "from-purple-500 to-violet-400",
  "Deep Time": "from-red-500 to-pink-400",
};

const sectionDotColors: Record<string, string> = {
  "Near Future": "bg-cyan-400",
  "Stellar Timescales": "bg-amber-400",
  "Planetary Future": "bg-emerald-400",
  "Galactic Era": "bg-violet-400",
  "Deep Time": "bg-red-400",
};

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const stars: { x: number; y: number; r: number; speed: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.3 + 0.05,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity * (0.5 + 0.5 * Math.sin(Date.now() * 0.001 + s.x))})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}

function TimelineCard({ event, index }: { event: TimelineEvent; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isLeft = index % 2 === 0;

  return (
    <div ref={ref} className="relative flex items-center w-full mb-8 md:mb-16">
      {/* Center line dot */}
      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={`w-4 h-4 rounded-full ${sectionDotColors[event.section]} shadow-lg shadow-current`}
        />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -60 : 60, y: 20 }}
        animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`
          relative ml-12 md:ml-0 w-full md:w-[44%]
          ${isLeft ? "md:mr-auto md:pr-12" : "md:ml-auto md:pl-12"}
        `}
      >
        <div className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden hover:border-white/20 transition-all duration-500 hover:bg-white/[0.06]">
          {/* Glow accent */}
          <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${sectionColors[event.section]} blur-xl -z-10`} style={{ opacity: 0.05 }} />

          {/* Image */}
          <div className="relative w-full h-40 md:h-48 overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            {/* Year overlay on image */}
            <div className={`absolute bottom-3 left-4 text-xs font-bold tracking-[0.3em] uppercase bg-gradient-to-r ${sectionColors[event.section]} bg-clip-text text-transparent`}>
              {event.year} {event.year.match(/^\d+$/) && Number(event.year) < 100000 ? "AD" : "Years"}
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Icon + Title */}
            <h3 className="text-xl md:text-2xl font-display font-bold text-white/90 mb-3 leading-tight">
              <span className="mr-2">{event.icon}</span>
              {event.title}
            </h3>

            {/* Description */}
            <p className="text-white/50 leading-relaxed text-sm md:text-base font-body">
              {event.description}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6 }}
      className="relative z-10 text-center py-12 md:py-20"
    >
      <div className={`inline-block text-xs tracking-[0.5em] uppercase font-bold bg-gradient-to-r ${sectionColors[title]} bg-clip-text text-transparent mb-2`}>
        {title}
      </div>
      <div className={`mx-auto w-24 h-[2px] bg-gradient-to-r ${sectionColors[title]} opacity-40 mt-4`} />
    </motion.div>
  );
}

function MiniMap({ activeSection }: { activeSection: string }) {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3 items-end">
      {sections.map((s) => (
        <div key={s} className="flex items-center gap-2 group cursor-pointer" onClick={() => {
          document.getElementById(`section-${s}`)?.scrollIntoView({ behavior: "smooth" });
        }}>
          <span className={`text-[10px] tracking-wider uppercase transition-opacity duration-300 ${activeSection === s ? "opacity-100 text-white" : "opacity-0 group-hover:opacity-70 text-white/50"}`}>
            {s}
          </span>
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${activeSection === s ? `${sectionDotColors[s]} scale-150` : "bg-white/20 scale-100"}`} />
        </div>
      ))}
    </div>
  );
}

const UniverseForecast = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(sections[0]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  const bgY1 = useTransform(smoothProgress, [0, 1], ["0%", "30%"]);
  const bgY2 = useTransform(smoothProgress, [0, 1], ["0%", "-20%"]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 800);
      // Determine active section
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${sections[i]}`);
        if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  let currentSection = "";

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#050510] text-white overflow-x-hidden">
      <StarField />

      {/* Parallax nebula layers */}
      <motion.div style={{ y: bgY1 }} className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[140px]" />
      </motion.div>
      <motion.div style={{ y: bgY2 }} className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[50%] left-[30%] w-[400px] h-[400px] bg-indigo-900/8 rounded-full blur-[120px]" />
        <div className="absolute top-[70%] right-[20%] w-[300px] h-[300px] bg-rose-900/5 rounded-full blur-[100px]" />
      </motion.div>

      {/* Progress bar */}
      <motion.div
        style={{ scaleX: smoothProgress }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left z-50"
      />

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <MiniMap activeSection={activeSection} />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <p className="text-xs tracking-[0.6em] uppercase text-white/30 mb-6">A Timeline of Everything</p>
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-6">
            <span className="mr-4">🌌</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Universe Forecast
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/40 font-body max-w-xl mx-auto mb-12">
            The future of everything.
          </p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white/20"
          >
            <ChevronUp className="w-6 h-6 rotate-180 mx-auto" />
            <p className="text-xs tracking-widest uppercase mt-1">Scroll to begin</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Timeline */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-32">
        {/* Center line */}
        <div className="absolute left-[22px] md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {timelineEvents.map((event, i) => {
          const showHeader = event.section !== currentSection;
          if (showHeader) currentSection = event.section;

          return (
            <div key={i}>
              {showHeader && (
                <div id={`section-${event.section}`}>
                  <SectionHeader title={event.section} />
                </div>
              )}
              <TimelineCard event={event} index={i} />
            </div>
          );
        })}

        {/* Final message */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="relative z-10 text-center py-24 md:py-40"
        >
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-[1px] bg-white/20 mx-auto mb-12" />
            <p className="text-xl md:text-2xl text-white/60 font-body leading-relaxed italic">
              "If the life of the universe were one year,
              <br />
              you are living in the first millisecond of January 1st."
            </p>
            <div className="w-16 h-[1px] bg-white/20 mx-auto mt-12" />
            <p className="text-xs tracking-[0.4em] uppercase text-white/20 mt-8">
              End of timeline
            </p>
          </div>
        </motion.div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
};

export default UniverseForecast;
