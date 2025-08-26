import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeIcon } from "lucide-react";
import { type GameMode, type Difficulty } from "@shared/gameTypes";
import { Link } from "wouter";

interface GameModeSelectorProps {
  onSelectGame: (gameMode: GameMode, difficulty: Difficulty) => void;
  isCreating?: boolean;
}

export default function GameModeSelector({ onSelectGame, isCreating = false }: GameModeSelectorProps) {
  const handleDifficultySelect = (difficulty: Difficulty) => {
    console.log('Selected difficulty:', difficulty); // Debug log
    onSelectGame('standard', difficulty);
  };

  const getDifficultyInfo = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy':
        return {
          title: 'Easy',
          description: 'Perfect for beginners',
          color: 'bg-gradient-to-br from-green-400 to-green-600'
        };
      case 'medium':
        return {
          title: 'Medium', 
          description: 'A balanced challenge',
          color: 'bg-gradient-to-br from-yellow-400 to-orange-500'
        };
      case 'hard':
        return {
          title: 'Hard',
          description: 'For experienced players',
          color: 'bg-gradient-to-br from-orange-500 to-red-500'
        };
      case 'expert':
        return {
          title: 'Expert',
          description: 'Ultimate challenge',
          color: 'bg-gradient-to-br from-red-500 to-red-700'
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Choose Your Challenge</h1>
        <p className="text-lg text-gray-600">Select a difficulty level to start playing</p>
        
        {/* Back to Dashboard button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
          <HomeIcon className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Difficulty Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {(['easy', 'medium', 'hard', 'expert'] as const).map((difficulty) => {
          const info = getDifficultyInfo(difficulty);
          return (
            <Card 
              key={difficulty}
              className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0"
              onClick={() => handleDifficultySelect(difficulty)}
              data-testid={`difficulty-${difficulty}`}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 ${info.color}`} />
              
              {/* Content */}
              <CardHeader className="relative z-10 text-center text-white p-8">
                <CardTitle className="text-2xl font-bold mb-2">
                  {info.title}
                </CardTitle>
                <CardDescription className="text-white/90 text-base">
                  {info.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 text-center pb-8">
                <Button 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-200"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Start Game'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}