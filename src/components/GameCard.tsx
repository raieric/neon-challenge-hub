import { Link } from "react-router-dom";

interface GameCardProps {
  icon: string;
  title: string;
  description: string;
  to?: string;
  comingSoon?: boolean;
  delay?: number;
}

const GameCard = ({ icon, title, description, to, comingSoon, delay = 0 }: GameCardProps) => {
  const content = (
    <div
      className={`
        glass-panel relative overflow-hidden p-6 sm:p-8
        transition-all duration-500 ease-out
        ${comingSoon ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:-translate-y-2 hover:shadow-[0_0_30px_hsl(270_80%_60%/0.3),0_0_60px_hsl(185_80%_50%/0.15)]"}
        group
      `}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Animated gradient border overlay */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none gradient-border" />

      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple/0 via-neon-cyan/0 to-neon-pink/0 group-hover:from-neon-purple/10 group-hover:via-neon-cyan/10 group-hover:to-neon-pink/10 rounded-xl transition-all duration-500 blur-xl pointer-events-none" />

      <div className="relative z-10">
        <span className="text-4xl sm:text-5xl block mb-4">{icon}</span>
        <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-glow-purple transition-all duration-300">
          {title}
        </h3>
        <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>

        {comingSoon && (
          <span className="inline-block mt-4 px-3 py-1 text-xs font-display font-bold tracking-wider uppercase bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-full">
            Coming Soon
          </span>
        )}

        {!comingSoon && (
          <div className="mt-4 flex items-center gap-2 text-neon-cyan font-display text-sm font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>ENTER</span>
            <span className="text-lg">→</span>
          </div>
        )}
      </div>
    </div>
  );

  if (comingSoon || !to) return <div className="animate-fade-in" style={{ animationDelay: `${delay}ms` }}>{content}</div>;

  return (
    <Link to={to} className="block animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      {content}
    </Link>
  );
};

export default GameCard;
