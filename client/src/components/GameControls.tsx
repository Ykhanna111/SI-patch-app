import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2, Plus, Pause, Play } from "lucide-react";

interface GameControlsProps {
  currentDifficulty: string;
  onNewGame: (difficulty: string) => void;
  onPause: () => void;
  isPaused: boolean;
  isLoading: boolean;
}

export default function GameControls({
  currentDifficulty,
  onNewGame,
  onPause,
  isPaused,
  isLoading,
}: GameControlsProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(currentDifficulty);

  const handleNewGame = () => {
    onNewGame(selectedDifficulty);
  };

  return (
    <Card className="border-gray-100">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <Settings2 className="text-sudoku-primary mr-2 h-5 w-5" />
          Game Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger data-testid="select-difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={handleNewGame}
          disabled={isLoading}
          className="w-full bg-sudoku-secondary text-white hover:bg-emerald-700 font-semibold"
          data-testid="button-new-game"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isLoading ? "Creating..." : "New Game"}
        </Button>
        
        <Button
          onClick={onPause}
          variant="outline"
          className="w-full border-gray-200 text-gray-700 hover:bg-gray-100 font-semibold"
          data-testid="button-pause"
        >
          {isPaused ? (
            <>
              <Play className="mr-2 h-4 w-4" />
              Resume Game
            </>
          ) : (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pause Game
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
