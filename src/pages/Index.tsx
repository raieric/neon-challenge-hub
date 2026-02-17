import ParticleBackground from "@/components/ParticleBackground";
import GameCard from "@/components/GameCard";
import ThemeToggle from "@/components/ThemeToggle";

const games = [
  {
    icon: "🎡",
    title: "Spin The Wheel",
    description: "Let fate decide your classroom challenge.",
    to: "/spin",
  },
  {
    icon: "✊",
    title: "Rock Paper Scissors",
    description: "Play against the computer with animated battle effects!",
    to: "/rps",
  },
  {
    icon: "🎤",
    title: "Spin The Wheel 2 – Personality Arena",
    description: "Step into the spotlight. Express, perform, and impress.",
    to: "/spin2",
  },
  {
    icon: "🎯",
    title: "Social Arena – Group Dynamics",
    description: "Collaboration. Pressure. Interaction.",
    to: "/social",
  },
  {
    icon: "🚀",
    title: "Visionary Arena – Big Ideas Lab",
    description: "Think beyond code. Lead the future.",
    to: "/visionary",
  },
  {
    icon: "🎲",
    title: "Lucky Draw",
    description: "One click. Pure randomness.",
    comingSoon: true,
  },
  {
    icon: "🚂",
    title: "Trolley Simulator",
    description: "25 moral dilemmas. No right answers.",
    to: "/trolley",
  },
  {
    icon: "💻",
    title: "Programming Quiz Portal",
    description: "Test your programming fundamentals.",
    to: "/quiz",
  },
  {
    icon: "⚖️",
    title: "Let's Settle This",
    description: "Choose your side. The class decides.",
    to: "/settle",
  },
  {
    icon: "💰",
    title: "Auction Challenge",
    description: "How much is it really worth?",
    to: "/auction",
  },
  {
    icon: "📜",
    title: "Who Was Alive?",
    description: "Enter a year. Discover history.",
    to: "/alive",
  },
  {
    icon: "💰",
    title: "Spend Binod's Money",
    description: "Can you spend $2 billion?",
    to: "/spend-binod",
  },
  {
    icon: "⭕",
    title: "Draw a Perfect Circle",
    description: "Steady hands. Pure geometry.",
    to: "/circle",
  },
  {
    icon: "🧩",
    title: "Memory Match",
    description: "Match programming concepts with definitions.",
    to: "/memory-match",
  },
  {
    icon: "⏳",
    title: "Life & Universe Progress",
    description: "How long until…?",
    to: "/life-progress",
  },
  {
    icon: "⚡",
    title: "Reaction Challenge",
    description: "Test your reflex speed.",
    comingSoon: true,
  },
  {
    icon: "🎯",
    title: "Code Randomizer",
    description: "Randomly select who writes the code.",
    comingSoon: true,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />

      {/* Ambient gradient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-cyan/8 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-neon-pink/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-12 sm:py-20">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeToggle />
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-foreground mb-4 text-glow-purple animate-float">
            🎮 Class Challenge Arena
          </h1>
          <p className="font-body text-lg sm:text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
            Where randomness meets responsibility.
          </p>

          {/* Decorative line */}
          <div className="mt-8 mx-auto w-48 h-[2px] bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-60" />
        </div>

        {/* Game Cards Grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {games.map((game, i) => (
            <GameCard key={game.title} {...game} delay={i * 150} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-20 text-center animate-fade-in" style={{ animationDelay: "800ms" }}>
          <p className="font-body text-sm text-muted-foreground/50 tracking-wider uppercase">
            Designed for live classroom interaction
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
