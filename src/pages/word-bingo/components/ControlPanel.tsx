import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";

interface ControlPanelProps {
  isAutoMode: boolean;
  isRunning: boolean;
  gameOver: boolean;
  onToggleMode: () => void;
  onToggleRunning: () => void;
  onCallNext: () => void;
  onRestart: () => void;
}

const ControlPanel = ({
  isAutoMode,
  isRunning,
  gameOver,
  onToggleMode,
  onToggleRunning,
  onCallNext,
  onRestart,
}: ControlPanelProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleMode}
        disabled={gameOver}
        className="font-display text-xs tracking-wider"
      >
        {isAutoMode ? "🤖 Auto" : "👨‍🏫 Manual"}
      </Button>

      {isAutoMode ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleRunning}
          disabled={gameOver}
          className="font-display text-xs tracking-wider"
        >
          {isRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
          {isRunning ? "Pause" : "Start"}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={onCallNext}
          disabled={gameOver}
          className="font-display text-xs tracking-wider"
        >
          <SkipForward className="w-4 h-4 mr-1" />
          Call Next
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onRestart}
        className="font-display text-xs tracking-wider"
      >
        <RotateCcw className="w-4 h-4 mr-1" />
        Restart
      </Button>
    </div>
  );
};

export default ControlPanel;
