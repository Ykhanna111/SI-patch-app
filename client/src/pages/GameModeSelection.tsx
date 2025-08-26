import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import GameModeSelector from "@/components/GameModeSelector";
import { GameMode, Difficulty } from "@shared/gameTypes";
import type { Game } from "@shared/schema";

export default function GameModeSelection() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createGameMutation = useMutation({
    mutationFn: async ({ gameMode, difficulty }: { gameMode: GameMode; difficulty: Difficulty }) => {
      setIsCreating(true);
      const response = await apiRequest('POST', '/api/games', { 
        gameMode, 
        difficulty 
      });
      return await response.json();
    },
    onSuccess: (game: Game) => {
      if (game && typeof game === 'object' && 'id' in game) {
        toast({
          title: "Game Created!",
          description: `Started a new ${game.difficulty} ${game.gameMode} puzzle!`,
        });
        setLocation(`/game?id=${game.id}`);
      }
    },
    onError: (error) => {
      console.error('Failed to create game:', error);
      toast({
        title: "Error",
        description: "Failed to create new game. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCreating(false);
    }
  });

  const handleGameSelection = (gameMode: GameMode, difficulty: Difficulty) => {
    createGameMutation.mutate({ gameMode, difficulty });
  };

  return (
    <div className="min-h-screen bg-sudoku-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GameModeSelector 
          onSelectGame={handleGameSelection}
          isCreating={isCreating}
        />
      </div>
    </div>
  );
}