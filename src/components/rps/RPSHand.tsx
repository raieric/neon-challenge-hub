export type Choice = "rock" | "paper" | "scissors";

interface RPSHandProps {
  choice: Choice;
  side: "left" | "right";
  className?: string;
}

const handPaths: Record<Choice, JSX.Element> = {
  rock: (
    <g>
      {/* Glow filter */}
      <defs>
        <filter id="glow-rock">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M50 10 C25 10 10 28 10 55 C10 78 22 92 50 92 C78 92 90 78 90 55 C90 28 75 10 50 10Z"
        fill="hsl(270, 60%, 30%)"
        stroke="hsl(270, 80%, 60%)"
        strokeWidth="3"
        filter="url(#glow-rock)"
      />
      <path
        d="M50 10 C25 10 10 28 10 55 C10 78 22 92 50 92 C78 92 90 78 90 55 C90 28 75 10 50 10Z"
        fill="none"
        stroke="hsl(270, 80%, 70%)"
        strokeWidth="1"
        opacity="0.5"
      />
      {/* Surface details */}
      <path d="M28 38 Q38 32 48 36" stroke="hsl(270, 70%, 50%)" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M30 55 Q45 50 60 55" stroke="hsl(270, 70%, 50%)" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M32 68 Q47 63 58 68" stroke="hsl(270, 70%, 50%)" strokeWidth="2" fill="none" opacity="0.6" />
      <circle cx="38" cy="28" r="4" fill="hsl(270, 80%, 70%)" opacity="0.25" />
      <circle cx="65" cy="45" r="3" fill="hsl(270, 80%, 70%)" opacity="0.2" />
      {/* Label */}
      <text x="50" y="105" textAnchor="middle" fill="hsl(270, 80%, 70%)" fontSize="10" fontWeight="800" fontFamily="var(--font-display)">🪨 ROCK</text>
    </g>
  ),
  paper: (
    <g>
      <defs>
        <filter id="glow-paper">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect
        x="12"
        y="8"
        width="76"
        height="84"
        rx="6"
        fill="hsl(185, 50%, 25%)"
        stroke="hsl(185, 80%, 50%)"
        strokeWidth="3"
        filter="url(#glow-paper)"
      />
      <rect
        x="12"
        y="8"
        width="76"
        height="84"
        rx="6"
        fill="none"
        stroke="hsl(185, 80%, 65%)"
        strokeWidth="1"
        opacity="0.4"
      />
      {/* Lines on paper */}
      <line x1="26" y1="26" x2="74" y2="26" stroke="hsl(185, 80%, 55%)" strokeWidth="2" opacity="0.5" />
      <line x1="26" y1="38" x2="74" y2="38" stroke="hsl(185, 80%, 55%)" strokeWidth="2" opacity="0.5" />
      <line x1="26" y1="50" x2="74" y2="50" stroke="hsl(185, 80%, 55%)" strokeWidth="2" opacity="0.5" />
      <line x1="26" y1="62" x2="58" y2="62" stroke="hsl(185, 80%, 55%)" strokeWidth="2" opacity="0.5" />
      {/* Corner fold */}
      <path d="M68 8 L88 8 L88 28 Z" fill="hsl(185, 60%, 35%)" stroke="hsl(185, 80%, 50%)" strokeWidth="1.5" />
      {/* Label */}
      <text x="50" y="105" textAnchor="middle" fill="hsl(185, 80%, 60%)" fontSize="10" fontWeight="800" fontFamily="var(--font-display)">📄 PAPER</text>
    </g>
  ),
  scissors: (
    <g>
      <defs>
        <filter id="glow-scissors">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Handles */}
      <ellipse cx="32" cy="22" rx="16" ry="18" fill="hsl(320, 50%, 30%)" stroke="hsl(320, 80%, 58%)" strokeWidth="3" filter="url(#glow-scissors)" />
      <ellipse cx="68" cy="22" rx="16" ry="18" fill="hsl(320, 50%, 30%)" stroke="hsl(320, 80%, 58%)" strokeWidth="3" filter="url(#glow-scissors)" />
      {/* Inner holes */}
      <ellipse cx="32" cy="22" rx="8" ry="10" fill="hsl(230, 25%, 10%)" stroke="hsl(320, 80%, 45%)" strokeWidth="1.5" />
      <ellipse cx="68" cy="22" rx="8" ry="10" fill="hsl(230, 25%, 10%)" stroke="hsl(320, 80%, 45%)" strokeWidth="1.5" />
      {/* Blades */}
      <line x1="36" y1="38" x2="60" y2="88" stroke="hsl(320, 60%, 45%)" strokeWidth="8" strokeLinecap="round" />
      <line x1="64" y1="38" x2="40" y2="88" stroke="hsl(320, 60%, 45%)" strokeWidth="8" strokeLinecap="round" />
      {/* Blade highlights */}
      <line x1="38" y1="40" x2="59" y2="85" stroke="hsl(320, 80%, 65%)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="62" y1="40" x2="41" y2="85" stroke="hsl(320, 80%, 65%)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      {/* Pivot */}
      <circle cx="50" cy="56" r="6" fill="hsl(320, 60%, 40%)" stroke="hsl(320, 80%, 60%)" strokeWidth="2" />
      <circle cx="50" cy="56" r="2.5" fill="hsl(320, 80%, 70%)" />
      {/* Label */}
      <text x="50" y="105" textAnchor="middle" fill="hsl(320, 80%, 65%)" fontSize="10" fontWeight="800" fontFamily="var(--font-display)">✂️ SCISSORS</text>
    </g>
  ),
};

const RPSHand = ({ choice, side, className = "" }: RPSHandProps) => {
  return (
    <svg
      viewBox="0 0 100 115"
      className={`w-32 h-36 sm:w-44 sm:h-48 md:w-52 md:h-56 ${className}`}
      style={{ transform: side === "right" ? "scaleX(-1)" : undefined }}
    >
      {handPaths[choice]}
    </svg>
  );
};

export default RPSHand;
