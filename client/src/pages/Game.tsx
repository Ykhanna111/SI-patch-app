import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import GameControls from "@/components/GameControls";
import SudokuGrid from "@/components/SudokuGrid";
import GameStats from "@/components/GameStats";
import NumberSelector from "@/components/NumberSelector";
import type { Game } from "@shared/schema";

type SudokuGrid = number[][];
type Move = {
  row: number;
  col: number;
  oldValue: number;
  newValue: number;
  timestamp: number;
};

export default function GamePage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Game state
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentGrid, setCurrentGrid] = useState<SudokuGrid>(Array(9).fill(0).map(() => Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moves, setMoves] = useState<Move[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  // Timer
  useEffect(() => {
    if (!currentGame || isCompleted || isPaused) return;

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentGame, isCompleted, isPaused]);

  // Auto-save for authenticated users
  const saveGameMutation = useMutation({
    mutationFn: async (gameData: Partial<Game>) => {
      if (!currentGame) return;
      return await apiRequest('PUT', `/api/games/${currentGame.id}`, gameData);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error('Failed to save game:', error);
    },
  });

  // Auto-save effect
  useEffect(() => {
    if (!isAuthenticated || !currentGame || moves.length === 0) return;

    const saveTimeout = setTimeout(() => {
      saveGameMutation.mutate({
        currentState: JSON.stringify(currentGrid),
        timeElapsed,
        mistakes,
        hintsUsed,
        isCompleted,
        moves: JSON.stringify(moves),
      });
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(saveTimeout);
  }, [currentGrid, timeElapsed, mistakes, hintsUsed, isCompleted, moves, isAuthenticated, currentGame]);

  // Load active game for authenticated users
  const { data: activeGame } = useQuery({
    queryKey: ['/api/games/user/active'],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 30000, // 30 seconds
  });

  // Create new game
  const createGameMutation = useMutation({
    mutationFn: async (difficulty: string) => {
      const response = await apiRequest('POST', '/api/games', { difficulty });
      return await response.json();
    },
    onSuccess: (game: Game) => {
      if (game && typeof game === 'object' && 'id' in game) {
        initializeGame(game);
        toast({
          title: "New Game",
          description: `Started a new ${game.difficulty} puzzle!`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create new game",
        variant: "destructive",
      });
    },
  });

  // Validate move
  const validateMoveMutation = useMutation({
    mutationFn: async ({ row, col, value }: { row: number; col: number; value: number }) => {
      if (!currentGame) throw new Error('No active game');
      const response = await apiRequest('POST', `/api/games/${currentGame.id}/validate`, {
        row,
        col,
        value,
        currentState: currentGrid,
      });
      return await response.json();
    },
  });

  // Get hint
  const getHintMutation = useMutation({
    mutationFn: async () => {
      if (!currentGame) throw new Error('No active game');
      console.log('Getting hint for game:', currentGame.id);
      console.log('Current grid:', currentGrid);
      
      const response = await apiRequest('POST', `/api/games/${currentGame.id}/hint`, {
        currentState: currentGrid,
      });
      return await response.json();
    },
    onSuccess: (hint: { row: number; col: number; value: number } | null) => {
      console.log('Hint response:', hint);
      
      if (!hint) {
        toast({
          title: "No hints available",
          description: "The puzzle is already complete!",
        });
        return;
      }

      if (hintsUsed >= 2) {
        toast({
          title: "No hints left",
          description: "You've used all your hints for this puzzle.",
          variant: "destructive",
        });
        return;
      }

      const newGrid = [...currentGrid];
      newGrid[hint.row][hint.col] = hint.value;
      setCurrentGrid(newGrid);
      setHintsUsed(prev => prev + 1);

      // Add to moves history
      const move: Move = {
        row: hint.row,
        col: hint.col,
        oldValue: currentGrid[hint.row][hint.col],
        newValue: hint.value,
        timestamp: Date.now(),
      };
      setMoves(prev => [...prev, move]);

      setSelectedCell({ row: hint.row, col: hint.col });
      
      toast({
        title: "Hint used",
        description: `Filled cell at row ${hint.row + 1}, column ${hint.col + 1}`,
      });

      checkCompletion(newGrid);
    },
    onError: (error) => {
      console.error('Hint error:', error);
      toast({
        title: "Error",
        description: "Failed to get hint. Please try again.",
        variant: "destructive",
      });
    },
  });

  const initializeGame = (game: Game) => {
    try {
      setCurrentGame(game);
      const parsedGrid = JSON.parse(game.currentState);
      // Ensure we have a valid 9x9 grid
      const validGrid = Array.isArray(parsedGrid) && parsedGrid.length === 9 && 
        parsedGrid.every(row => Array.isArray(row) && row.length === 9) 
        ? parsedGrid 
        : Array(9).fill(0).map(() => Array(9).fill(0));
      
      setCurrentGrid(validGrid);
      setMistakes(game.mistakes || 0);
      setHintsUsed(game.hintsUsed || 0);
      setTimeElapsed(game.timeElapsed || 0);
      setIsCompleted(game.isCompleted || false);
      setMoves(game.moves ? JSON.parse(game.moves) : []);
      setSelectedCell(null);
      setSelectedNumber(null);
      setIsPaused(false);
    } catch (error) {
      console.error('Error initializing game:', error);
      setCurrentGame(null);
      setCurrentGrid(Array(9).fill(0).map(() => Array(9).fill(0)));
    }
  };

  // Initialize with active game only, don't auto-start new games
  useEffect(() => {
    if (isAuthenticated && activeGame && typeof activeGame === 'object' && 'id' in activeGame) {
      initializeGame(activeGame as Game);
    }
  }, [activeGame, isAuthenticated]);

  const handleCellClick = (row: number, col: number) => {
    if (!currentGame || isCompleted) return;
    
    const puzzle = JSON.parse(currentGame.puzzle);
    if (puzzle[row][col] !== 0) return; // Can't modify pre-filled cells
    
    setSelectedCell({ row, col });
  };

  const handleNumberSelect = (number: number) => {
    setSelectedNumber(number);
    
    if (selectedCell) {
      placeCellValue(selectedCell.row, selectedCell.col, number);
    }
  };

  const handleErase = () => {
    if (selectedCell) {
      placeCellValue(selectedCell.row, selectedCell.col, 0);
    }
  };

  const placeCellValue = async (row: number, col: number, value: number) => {
    if (!currentGame || isCompleted) return;

    const puzzle = JSON.parse(currentGame.puzzle);
    if (puzzle[row][col] !== 0) return; // Can't modify pre-filled cells

    const oldValue = currentGrid[row][col];
    if (oldValue === value) return; // No change

    // Validate the move if placing a number (not erasing)
    if (value !== 0) {
      try {
        const validation = await validateMoveMutation.mutateAsync({ row, col, value });
        if (!validation.isValid) {
          setMistakes(prev => {
            const newMistakes = prev + 1;
            if (newMistakes >= 3) {
              toast({
                title: "Game Over",
                description: "You've made 3 mistakes. The game will reset.",
                variant: "destructive",
              });
              // Reset to original puzzle
              setTimeout(() => {
                setCurrentGrid(JSON.parse(currentGame.puzzle));
                setMistakes(0);
                setMoves([]);
              }, 2000);
            } else {
              toast({
                title: "Invalid move",
                description: `This number conflicts with existing values. Mistakes: ${newMistakes}/3`,
                variant: "destructive",
              });
            }
            return newMistakes;
          });
          return;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to validate move",
          variant: "destructive",
        });
        return;
      }
    }

    // Make the move
    const newGrid = [...currentGrid];
    newGrid[row][col] = value;
    setCurrentGrid(newGrid);

    // Add to moves history
    const move: Move = {
      row,
      col,
      oldValue,
      newValue: value,
      timestamp: Date.now(),
    };
    setMoves(prev => [...prev, move]);

    checkCompletion(newGrid);
  };

  const checkCompletion = (grid: SudokuGrid) => {
    // Check if grid is completely filled
    const isFilled = grid.every(row => row.every(cell => cell !== 0));
    
    if (isFilled) {
      setIsCompleted(true);
      toast({
        title: "Congratulations! 🎉",
        description: "You've successfully completed the puzzle!",
      });
    }
  };

  const handleUndo = () => {
    if (moves.length === 0) return;

    const lastMove = moves[moves.length - 1];
    const newGrid = [...currentGrid];
    newGrid[lastMove.row][lastMove.col] = lastMove.oldValue;
    
    setCurrentGrid(newGrid);
    setMoves(prev => prev.slice(0, -1));
    setSelectedCell({ row: lastMove.row, col: lastMove.col });
  };

  const startNewGame = (difficulty: string) => {
    createGameMutation.mutate(difficulty);
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getNumberCounts = () => {
    const counts = Array(10).fill(0); // Index 0 is unused, 1-9 for numbers
    if (currentGrid && Array.isArray(currentGrid) && currentGrid.length > 0) {
      currentGrid.forEach(row => {
        if (row && Array.isArray(row)) {
          row.forEach(cell => {
            if (typeof cell === 'number' && cell !== 0) counts[cell]++;
          });
        }
      });
    }
    return counts;
  };

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-sudoku-bg">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Challenge</h1>
            <p className="text-lg text-gray-600">Select a difficulty level to start playing</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { level: 'easy', title: 'Easy', description: 'Perfect for beginners', color: 'bg-green-500' },
              { level: 'medium', title: 'Medium', description: 'A balanced challenge', color: 'bg-yellow-500' },
              { level: 'hard', title: 'Hard', description: 'For experienced players', color: 'bg-orange-500' },
              { level: 'expert', title: 'Expert', description: 'Ultimate challenge', color: 'bg-red-500' }
            ].map((difficulty) => (
              <div
                key={difficulty.level}
                className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => createGameMutation.mutate(difficulty.level)}
              >
                <div className={`h-2 ${difficulty.color}`}></div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{difficulty.title}</h3>
                  <p className="text-gray-600 mb-4">{difficulty.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      createGameMutation.mutate(difficulty.level);
                    }}
                    disabled={createGameMutation.isPending}
                    className="w-full bg-sudoku-primary text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    data-testid={`button-start-${difficulty.level}`}
                  >
                    {createGameMutation.isPending ? 'Creating...' : 'Start Game'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sudoku-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <GameControls
              currentDifficulty={currentGame.difficulty}
              onNewGame={startNewGame}
              onPause={togglePause}
              isPaused={isPaused}
              isLoading={createGameMutation.isPending}
            />
            
            <GameStats
              timeElapsed={timeElapsed}
              mistakes={mistakes}
              hintsUsed={hintsUsed}
              numberCounts={getNumberCounts()}
              formatTime={formatTime}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900" data-testid="text-puzzle-title">
                  {currentGame.difficulty.charAt(0).toUpperCase() + currentGame.difficulty.slice(1)} Puzzle
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => getHintMutation.mutate()}
                    disabled={hintsUsed >= 2 || isCompleted || getHintMutation.isPending}
                    className="px-3 py-2 text-gray-600 hover:text-sudoku-accent bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    title={`Get Hint (${2 - hintsUsed} left)`}
                    data-testid="button-hint"
                  >
                    💡 Hint
                  </button>
                  <button
                    onClick={handleUndo}
                    disabled={moves.length === 0 || isCompleted}
                    className="px-3 py-2 text-gray-600 hover:text-sudoku-primary bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    title="Undo"
                    data-testid="button-undo"
                  >
                    ↶ Undo
                  </button>
                </div>
              </div>

              <SudokuGrid
                currentGrid={currentGrid || []}
                originalPuzzle={currentGame.puzzle ? JSON.parse(currentGame.puzzle) : []}
                selectedCell={selectedCell}
                selectedNumber={selectedNumber}
                onCellClick={handleCellClick}
                isPaused={isPaused}
              />

              <div className="mt-6">
                <NumberSelector
                  selectedNumber={selectedNumber}
                  onNumberSelect={handleNumberSelect}
                  onErase={handleErase}
                  disabled={!selectedCell || isCompleted}
                  numberCounts={getNumberCounts()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
