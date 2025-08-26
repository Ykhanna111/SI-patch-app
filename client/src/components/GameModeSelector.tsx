import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Play, HelpCircle, Star } from "lucide-react";
import { GAME_MODES, type GameMode, type Difficulty } from "@shared/gameTypes";

interface GameModeSelectorProps {
  onSelectGame: (gameMode: GameMode, difficulty: Difficulty) => void;
  isCreating?: boolean;
}

export default function GameModeSelector({ onSelectGame, isCreating = false }: GameModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState<GameMode | null>(null);

  // Safety check for GAME_MODES
  if (!GAME_MODES || Object.keys(GAME_MODES).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading game modes. Please refresh the page.</p>
      </div>
    );
  }

  const handleModeSelect = (mode: GameMode) => {
    console.log('Selected mode:', mode); // Debug log
    setSelectedMode(mode);
    setSelectedDifficulty(null);
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    console.log('Selected difficulty:', difficulty); // Debug log
    setSelectedDifficulty(difficulty);
  };

  const handlePlayClick = () => {
    if (selectedMode && selectedDifficulty) {
      console.log('Playing game with:', { selectedMode, selectedDifficulty }); // Debug log
      onSelectGame(selectedMode, selectedDifficulty);
    }
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'hard': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'expert': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getDifficultyStars = (difficulty: Difficulty) => {
    const stars = { easy: 1, medium: 2, hard: 3, expert: 4 }[difficulty];
    return Array.from({ length: 4 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < stars ? 'fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const HowToPlayDialog = ({ mode }: { mode: GameMode }) => {
    const modeInfo = GAME_MODES[mode];
    
    return (
      <Dialog open={showHowToPlay === mode} onOpenChange={() => setShowHowToPlay(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{modeInfo.icon}</span>
              How to Play {modeInfo.name}
            </DialogTitle>
            <DialogDescription>
              {modeInfo.description}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Rules</h4>
                <ul className="space-y-1">
                  {modeInfo.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-sudoku-primary">•</span>
                      <span className="text-sm">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Grid Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Grid Size:</span>
                    <span className="ml-2">{modeInfo.gridSize}×{modeInfo.gridSize}</span>
                  </div>
                  <div>
                    <span className="font-medium">Available Difficulties:</span>
                    <div className="ml-2 flex gap-1 mt-1">
                      {modeInfo.difficulty.map((diff) => (
                        <Badge key={diff} variant="outline" className="text-xs">
                          {diff}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {mode === 'killer' && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Killer Sudoku Example</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p>Dotted cages show groups of cells that must sum to a target number.</p>
                      <p className="mt-1">Example: A 3-cell cage with sum "15" could contain [1,5,9] or [2,4,9] etc.</p>
                    </div>
                  </div>
                </>
              )}

              {mode === 'jigsaw' && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Jigsaw Regions</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p>Instead of regular 3×3 boxes, regions have irregular shapes.</p>
                      <p className="mt-1">Each colored region must still contain digits 1-9 without repetition.</p>
                    </div>
                  </div>
                </>
              )}

              {mode === 'diagonal' && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Diagonal Constraints</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p>Both main diagonals are highlighted and must contain 1-9.</p>
                      <p className="mt-1">This adds two extra constraints to the standard rules.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Sudoku Adventure</h2>
        <p className="text-gray-600">Select a game mode and difficulty to start playing</p>
      </div>

      {/* Game Mode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(GAME_MODES || {}).map((mode) => (
          <Card 
            key={mode.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedMode === mode.id ? 'ring-2 ring-sudoku-primary shadow-lg' : ''
            }`}
            onClick={() => handleModeSelect(mode.id)}
            data-testid={`mode-${mode.id}`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{mode.icon}</span>
                  <span>{mode.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHowToPlay(mode.id);
                  }}
                  data-testid={`how-to-play-${mode.id}`}
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{mode.description}</p>
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-xs">
                  {mode.gridSize}×{mode.gridSize}
                </Badge>
                <div className="flex gap-1">
                  {mode.difficulty.map((diff) => (
                    <Badge key={diff} variant="secondary" className="text-xs">
                      {diff}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Difficulty Selection */}
      {selectedMode && (
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">{GAME_MODES[selectedMode].icon}</span>
            Select Difficulty for {GAME_MODES[selectedMode].name}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {GAME_MODES[selectedMode].difficulty.map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? "default" : "outline"}
                className={`h-16 flex flex-col gap-1 ${getDifficultyColor(difficulty)}`}
                onClick={() => handleDifficultySelect(difficulty)}
                data-testid={`difficulty-${difficulty}`}
              >
                <span className="font-semibold capitalize">{difficulty}</span>
                <div className="flex">
                  {getDifficultyStars(difficulty)}
                </div>
              </Button>
            ))}
          </div>

          {/* Play Button */}
          {selectedDifficulty && (
            <div className="text-center">
              <Button
                size="lg"
                onClick={handlePlayClick}
                disabled={isCreating}
                className="px-8"
                data-testid="button-start-game"
              >
                <Play className="w-5 h-5 mr-2" />
                {isCreating ? 'Creating Game...' : `Start ${selectedDifficulty} ${GAME_MODES[selectedMode].name}`}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* How to Play Dialogs */}
      {Object.values(GAME_MODES || {}).map((mode) => (
        <HowToPlayDialog key={`dialog-${mode.id}`} mode={mode.id} />
      ))}
    </div>
  );
}