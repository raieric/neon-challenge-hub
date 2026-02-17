import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, RotateCcw, Zap, Hand } from "lucide-react";

interface NumberControlPanelProps {
  isAutoMode: boolean;
  isRunning: boolean;
  gameOver: boolean;
  onToggleMode: () => void;
  onToggleRunning: () => void;
  onCallNext: () => void;
  onRestart: () => void;
}

const NumberControlPanel = ({
  isAutoMode, isRunning, gameOver,
  onToggleMode, onToggleRunning, onCallNext, onRestart,
}: NumberControlPanelProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleMode}
        className="font-display text-xs tracking-wider gap-1.5"
      >
        {isAutoMode ? <Zap className="w-3.5 h-3.5" /> : <Hand className="w-3.5 h-3.5" />}
        {isAutoMode ? "Auto" : "Manual"}
      </Button>

      {isAutoMode ? (
        <Button
          size="sm"
          onClick={onToggleRunning}
          disabled={gameOver}
          className="font-display text-xs tracking-wider gap-1.5"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isRunning ? "Pause" : "Start"}
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={onCallNext}
          disabled={gameOver}
          className="font-display text-xs tracking-wider gap-1.5"
        >
          <SkipForward className="w-3.5 h-3.5" /> Draw Number
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onRestart}
        className="font-display text-xs tracking-wider gap-1.5"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Restart
      </Button>
    </div>
  );
};

export default NumberControlPanel;
