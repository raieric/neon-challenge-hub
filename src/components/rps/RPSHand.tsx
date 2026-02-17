import { motion } from "framer-motion";

export type Choice = "rock" | "paper" | "scissors";

interface RPSHandProps {
  choice: Choice;
  side: "left" | "right";
  className?: string;
}

const handPaths: Record<Choice, JSX.Element> = {
  rock: (
    <g>
      <path
        d="M50 15 C30 15 15 30 15 55 C15 75 25 90 50 90 C75 90 85 75 85 55 C85 30 70 15 50 15Z"
        fill="currentColor"
        stroke="hsl(270, 80%, 60%)"
        strokeWidth="2.5"
      />
      <path d="M30 40 Q35 35 45 38" stroke="hsl(270, 80%, 40%)" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M35 55 Q45 52 55 55" stroke="hsl(270, 80%, 40%)" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M35 65 Q45 62 55 65" stroke="hsl(270, 80%, 40%)" strokeWidth="1.5" fill="none" opacity="0.5" />
      <circle cx="40" cy="30" r="3" fill="hsl(270, 80%, 70%)" opacity="0.3" />
    </g>
  ),
  paper: (
    <g>
      <rect
        x="15"
        y="10"
        width="70"
        height="80"
        rx="6"
        fill="currentColor"
        stroke="hsl(185, 80%, 50%)"
        strokeWidth="2.5"
      />
      <line x1="28" y1="28" x2="72" y2="28" stroke="hsl(185, 80%, 40%)" strokeWidth="1.5" opacity="0.4" />
      <line x1="28" y1="40" x2="72" y2="40" stroke="hsl(185, 80%, 40%)" strokeWidth="1.5" opacity="0.4" />
      <line x1="28" y1="52" x2="72" y2="52" stroke="hsl(185, 80%, 40%)" strokeWidth="1.5" opacity="0.4" />
      <line x1="28" y1="64" x2="60" y2="64" stroke="hsl(185, 80%, 40%)" strokeWidth="1.5" opacity="0.4" />
      <path d="M15 10 L30 10 L15 25 Z" fill="hsl(185, 80%, 60%)" opacity="0.15" />
    </g>
  ),
  scissors: (
    <g>
      <ellipse cx="35" cy="25" rx="14" ry="16" fill="none" stroke="hsl(320, 80%, 58%)" strokeWidth="2.5" />
      <ellipse cx="65" cy="25" rx="14" ry="16" fill="none" stroke="hsl(320, 80%, 58%)" strokeWidth="2.5" />
      <line x1="38" y1="38" x2="58" y2="85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <line x1="62" y1="38" x2="42" y2="85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <circle cx="50" cy="55" r="4" fill="hsl(320, 80%, 50%)" />
    </g>
  ),
};

const RPSHand = ({ choice, side, className = "" }: RPSHandProps) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 text-card ${className}`}
      style={{ transform: side === "right" ? "scaleX(-1)" : undefined }}
    >
      {handPaths[choice]}
    </svg>
  );
};

export default RPSHand;
