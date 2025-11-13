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
  };

  const handlePlayClick = (difficulty: Difficulty) => {
    console.log('Playing game with:', { gameMode: 'standard', difficulty }); // Debug log
    onSelectGame('standard', difficulty);
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
    <div className="space-y-8">
      {/* Header matching your image */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Choose Your Challenge</h1>
        <p className="text-lg text-gray-600">Select a difficulty level to start playing</p>
        
        {/* Back to Dashboard button */}
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Difficulty Cards matching your image design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <Card 
          className={`relative overflow-hidden group transition-all duration-300 hover:shadow-xl border-0 bg-white ${
            isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => !isCreating && handlePlayClick('easy')}
          data-testid="difficulty-easy"
        >
          {/* Green gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-green-600" />
          
          <CardHeader className="text-center pt-8 pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Easy</CardTitle>
            <p className="text-gray-600">Perfect for beginners</p>
          </CardHeader>
          
          <CardContent className="text-center pb-8">
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full font-medium"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Start Game'}
            </Button>
          </CardContent>
        </Card>

        <Card 
          className={`relative overflow-hidden group transition-all duration-300 hover:shadow-xl border-0 bg-white ${
            isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => !isCreating && handlePlayClick('medium')}
          data-testid="difficulty-medium"
        >
          {/* Yellow gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />
          
          <CardHeader className="text-center pt-8 pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Medium</CardTitle>
            <p className="text-gray-600">A balanced challenge</p>
          </CardHeader>
          
          <CardContent className="text-center pb-8">
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full font-medium"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Start Game'}
            </Button>
          </CardContent>
        </Card>

        <Card 
          className={`relative overflow-hidden group transition-all duration-300 hover:shadow-xl border-0 bg-white ${
            isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => !isCreating && handlePlayClick('hard')}
          data-testid="difficulty-hard"
        >
          {/* Orange gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-red-500" />
          
          <CardHeader className="text-center pt-8 pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Hard</CardTitle>
            <p className="text-gray-600">For experienced players</p>
          </CardHeader>
          
          <CardContent className="text-center pb-8">
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full font-medium"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Start Game'}
            </Button>
          </CardContent>
        </Card>

        <Card 
          className={`relative overflow-hidden group transition-all duration-300 hover:shadow-xl border-0 bg-white ${
            isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => !isCreating && handlePlayClick('expert')}
          data-testid="difficulty-expert"
        >
          {/* Red gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-red-700" />
          
          <CardHeader className="text-center pt-8 pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Expert</CardTitle>
            <p className="text-gray-600">An Ultimate challenge</p>
          </CardHeader>
          
          <CardContent className="text-center pb-8">
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full font-medium"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Start Game'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}