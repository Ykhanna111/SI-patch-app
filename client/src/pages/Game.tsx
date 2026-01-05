import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameControls from "@/components/GameControls";
import EnhancedSudokuGrid from "@/components/EnhancedSudokuGrid";
import GameStats from "@/components/GameStats";
import EnhancedNumberSelector from "@/components/EnhancedNumberSelector";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Home, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { User } from "@shared/schema";
import { type GameMode, type GameConstraints, GAME_MODES, getGridDimensions, getValidNumbers } from "@shared/gameTypes";

interface Game {
  id: string;
  difficulty: string;
  gameMode: string;
  gridSize: number;
  puzzle: string;
  currentState: string;
  solution: string;
  constraints?: string;
  moves: string;
  isCompleted: boolean;
  timeElapsed: number;
  mistakes: number;
  hintsUsed: number;
}

type SudokuGrid = number[][];

export default function GamePage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // Game state
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentGrid, setCurrentGrid] = useState<SudokuGrid>(Array(9).fill(0).map(() => Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moves, setMoves] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [showGameFailed, setShowGameFailed] = useState(false);
  const [creatingDifficulty, setCreatingDifficulty] = useState<string | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
  // Game mode specific state
  const gameMode = (currentGame?.gameMode as GameMode) || 'standard';
  const gridSize = currentGame?.gridSize || 9;
  const constraints = currentGame?.constraints ? JSON.parse(currentGame.constraints) as GameConstraints : undefined;

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
      const gameMode = sessionStorage.getItem('selectedGameMode') || 'standard';
      const response = await apiRequest('POST', '/api/games', { difficulty, gameMode });
      return await response.json();
    },
    onSuccess: (game: any) => {
      if (game && typeof game === 'object' && 'id' in game) {
        initializeGame(game);
        const modeName = game.gameMode === 'diagonal' ? 'Diagonal Sudoku' : 
                        game.gameMode === 'hyper' ? 'Hyper Sudoku' : 
                        game.gameMode === 'odd-even' ? 'Odd-Even Sudoku' : 'Standard Sudoku';
        toast({
          title: "New Game",
          description: `Started a new ${game.difficulty} ${modeName} puzzle!`,
        });
        setCreatingDifficulty(null);
      }
    },
    onError: (error: any) => {
      if (error?.message?.includes("Daily limit exceeded") || error?.upgradeRequired) {
        toast({
          title: "Daily limit exceeded",
          description: (
            <div className="space-y-2">
              <p>Sign up to play more games and access all features!</p>
              <div className="flex gap-2">
                <Link href="/register">
                  <Button size="sm" variant="default" data-testid="button-register-toast">Sign Up</Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" variant="outline" data-testid="button-login-toast">Sign In</Button>
                </Link>
              </div>
            </div>
          ),
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create new game",
          variant: "destructive",
        });
      }
      setCreatingDifficulty(null);
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
        solution: JSON.parse(currentGame.solution),
        puzzle: JSON.parse(currentGame.puzzle),
        gameMode: currentGame.gameMode,
        constraints: currentGame.constraints ? JSON.parse(currentGame.constraints) : undefined
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
      const move = {
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
      const size = game.gridSize || 9;
      
      // Ensure we have a valid grid of the correct size
      const validGrid = Array.isArray(parsedGrid) && parsedGrid.length === size && 
        parsedGrid.every(row => Array.isArray(row) && row.length === size) 
        ? parsedGrid 
        : Array(size).fill(0).map(() => Array(size).fill(0));
      
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
      const size = 9; // fallback to standard size
      setCurrentGrid(Array(size).fill(0).map(() => Array(size).fill(0)));
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

    // Handle erasing
    if (value === 0) {
      const newGrid = [...currentGrid];
      newGrid[row][col] = 0;
      setCurrentGrid(newGrid);

      // Add to moves history
      const move = {
        row,
        col,
        oldValue,
        newValue: 0,
        timestamp: Date.now(),
      };
      setMoves(prev => [...prev, move]);
      return;
    }

    // Validate the move for non-zero values
    try {
      const validation = await validateMoveMutation.mutateAsync({ row, col, value });
      
      if (!validation.isValid) {
        setMistakes(prev => {
          const newMistakes = prev + 1;
          if (newMistakes >= 3) {
            setShowGameFailed(true);
            toast({
              title: "Game Over!",
              description: "You've made 3 mistakes. Returning to menu...",
              variant: "destructive",
            });
            // Auto-redirect after 3 seconds
            setTimeout(() => {
              setCurrentGame(null);
              setShowGameFailed(false);
            }, 3000);
          } else {
            toast({
              title: "Invalid move",
              description: `This number conflicts with existing values. Mistakes: ${newMistakes}/3`,
              variant: "destructive",
            });
          }
          return newMistakes;
        });
        // ❌ RETURN IMMEDIATELY without updating the grid
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

    // ✅ Valid move → apply to grid
    const newGrid = [...currentGrid];
    newGrid[row][col] = value;
    setCurrentGrid(newGrid);

    // Add to moves history
    const move = {
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
      setShowGameComplete(true);
      toast({
        title: "Congratulations! 🎉",
        description: "You've successfully completed the puzzle!",
      });
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        setCurrentGame(null);
        setShowGameComplete(false);
      }, 3000);
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
    // Reset all game state before creating new game
    setCurrentGame(null);
    setCurrentGrid(Array(9).fill(0).map(() => Array(9).fill(0)));
    setSelectedCell(null);
    setSelectedNumber(null);
    setMistakes(0);
    setHintsUsed(0);
    setTimeElapsed(0);
    setIsCompleted(false);
    setMoves([]);
    setIsPaused(false);
    setShowGameComplete(false);
    setShowGameFailed(false);
    
    createGameMutation.mutate(difficulty);
  };

  const resetGame = () => {
    if (!currentGame) return;
    
    try {
      // Reset to original puzzle state but keep hints used count
      const originalPuzzle = JSON.parse(currentGame.puzzle);
      setCurrentGrid(originalPuzzle);
      setMistakes(0);
      setTimeElapsed(0);
      setMoves([]);
      setSelectedCell(null);
      setSelectedNumber(null);
      setIsCompleted(false);
      setShowGameComplete(false);
      setShowGameFailed(false);
      // Keep hintsUsed as is
      
      toast({
        title: "Game Reset",
        description: "Puzzle has been reset to the beginning. Hints remain used.",
      });
    } catch (error) {
      console.error('Error resetting game:', error);
      toast({
        title: "Error",
        description: "Failed to reset game",
        variant: "destructive",
      });
    }
  };

  const backToMenu = () => {
    // Ensure complete state cleanup when backing out
    setCurrentGame(null);
    setCurrentGrid(Array(9).fill(0).map(() => Array(9).fill(0)));
    setSelectedCell(null);
    setSelectedNumber(null);
    setMistakes(0);
    setHintsUsed(0);
    setTimeElapsed(0);
    setIsCompleted(false);
    setMoves([]);
    setIsPaused(false);
    setShowGameComplete(false);
    setShowGameFailed(false);
  };

  const backToSudokuAdventure = () => {
    setLocation('/select-game');
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
    const maxNum = gridSize === 4 ? 4 : gridSize === 6 ? 6 : 9;
    const counts = Array(maxNum + 1).fill(0); // Index 0 is unused
    if (currentGrid && Array.isArray(currentGrid) && currentGrid.length > 0) {
      currentGrid.forEach(row => {
        if (row && Array.isArray(row)) {
          row.forEach(cell => {
            if (typeof cell === 'number' && cell !== 0 && cell <= maxNum) counts[cell]++;
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
            {!isAuthenticated && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={backToSudokuAdventure}
                  className="flex items-center gap-2 mx-auto"
                  data-testid="button-back-adventure-challenge"
                >
                  <Home className="h-4 w-4" />
                  Back to Sudoku Adventure
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { level: 'easy', title: 'Easy', description: 'Perfect for beginners', color: 'bg-green-500' },
              { level: 'medium', title: 'Medium', description: 'A balanced challenge', color: 'bg-yellow-500' },
              { level: 'hard', title: 'Hard', description: 'For experienced players', color: 'bg-orange-500' },
              { level: 'expert', title: 'Expert', description: 'An ultimate challenge', color: 'bg-red-500' }
            ].map((difficulty) => (
              <div
                key={difficulty.level}
                className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => {
                  setCreatingDifficulty(difficulty.level);
                  createGameMutation.mutate(difficulty.level);
                }}
              >
                <div className={`h-2 ${difficulty.color}`}></div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{difficulty.title}</h3>
                  <p className="text-gray-600 mb-4">{difficulty.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCreatingDifficulty(difficulty.level);
                      createGameMutation.mutate(difficulty.level);
                    }}
                    disabled={createGameMutation.isPending}
                    className="w-full bg-sudoku-primary text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    data-testid={`button-start-${difficulty.level}`}
                  >
                    {createGameMutation.isPending && creatingDifficulty === difficulty.level 
                      ? `Creating ${difficulty.title}...` 
                      : 'Start Game'}
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
    <div className="min-h-screen bg-sudoku-bg flex flex-col overflow-x-hidden">
      <div className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-2">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-2 lg:gap-3">
          {/* Sidebar */}
          <div className="hidden lg:flex lg:flex-col gap-2 overflow-hidden">
            <GameControls
              currentDifficulty={currentGame.difficulty}
              onNewGame={startNewGame}
              onPause={togglePause}
              isPaused={isPaused}
              isLoading={createGameMutation.isPending}
              showDifficultySelector={false}
            />
            <GameStats
              timeElapsed={timeElapsed}
              mistakes={mistakes}
              hintsUsed={hintsUsed}
              numberCounts={getNumberCounts()}
              formatTime={formatTime}
            />
          </div>

          {/* Main Game Panel */}
          <div className="flex flex-col min-h-[calc(100vh-5rem)] lg:min-h-0 overflow-hidden">
            <div className="flex-1 bg-white rounded-lg shadow-lg border border-gray-100 flex flex-col overflow-hidden">
              {/* Compact Header */}
              <div className="flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 border-b shrink-0">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={backToMenu}
                    className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-1 h-6 sm:h-7 flex-shrink-0"
                    data-testid="button-back-menu"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span className="text-xs">Menu</span>
                  </Button>
                  <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                    <span className="text-base sm:text-lg flex-shrink-0">{GAME_MODES[gameMode]?.icon || '🔢'}</span>
                    <h2 className="text-xs sm:text-sm font-bold text-gray-900 truncate" data-testid="text-puzzle-title">
                      {currentGame.difficulty.charAt(0).toUpperCase() + currentGame.difficulty.slice(1)} Sudoku
                    </h2>
                  </div>
                </div>
                <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHowToPlay(true)}
                    className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
                    data-testid="button-how-to-play"
                  >
                    <HelpCircle className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetGame}
                    className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
                    disabled={isCompleted}
                    data-testid="button-reset"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <button
                    onClick={() => getHintMutation.mutate()}
                    disabled={hintsUsed >= 2 || isCompleted || getHintMutation.isPending}
                    className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                    title={`Hint (${2 - hintsUsed})`}
                    data-testid="button-hint"
                  >
                    💡
                  </button>
                  <button
                    onClick={handleUndo}
                    disabled={moves.length === 0 || isCompleted}
                    className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                    title="Undo"
                    data-testid="button-undo"
                  >
                    ↶
                  </button>
                </div>
              </div>

              {/* Mobile Stats Row */}
              <div className="lg:hidden flex gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border-b text-xs shrink-0">
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span className="font-mono">{formatTime(timeElapsed)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>❌</span>
                  <span>{mistakes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>💡</span>
                  <span>{hintsUsed}/2</span>
                </div>
              </div>

              {/* Grid - Centered and Scaled */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex items-center justify-center p-2 sm:p-3 overflow-hidden">
                  <div className="w-full max-w-[min(100vw-2rem,calc(100vh-20rem))] aspect-square">
                    <EnhancedSudokuGrid
                      gameMode={gameMode}
                      currentGrid={currentGrid || []}
                      originalPuzzle={currentGame.puzzle ? JSON.parse(currentGame.puzzle) : []}
                      selectedCell={selectedCell}
                      selectedNumber={selectedNumber}
                      onCellClick={handleCellClick}
                      isPaused={isPaused}
                      constraints={constraints}
                    />
                  </div>
                </div>

                {/* Number Selector - Always Visible */}
                <div className="px-2 sm:px-3 pb-2 sm:pb-3 shrink-0 border-t overflow-x-hidden">
                  <div className="pt-2">
                    <EnhancedNumberSelector
                      gameMode={gameMode}
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
      </div>

      {/* How to Play Dialog */}
      <Dialog open={showHowToPlay} onOpenChange={setShowHowToPlay}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{GAME_MODES[gameMode]?.icon}</span>
              How to Play {GAME_MODES[gameMode]?.name}
            </DialogTitle>
            <DialogDescription>
              {GAME_MODES[gameMode]?.description}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Rules</h4>
                <ul className="space-y-1">
                  {GAME_MODES[gameMode]?.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-sudoku-primary">•</span>
                      <span className="text-sm">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Grid Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Grid Size:</span>
                    <span className="ml-2">{gridSize}×{gridSize}</span>
                  </div>
                  <div>
                    <span className="font-medium">Difficulty:</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {currentGame?.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>

              {gameMode === 'odd-even' && constraints?.oddEvenCells && (
                <div>
                  <h4 className="font-semibold mb-2">Odd-Even Constraints</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p>Gray cells: Only odd numbers (1,3,5,7,9)</p>
                    <p>Blue cells: Only even numbers (2,4,6,8)</p>
                    <p>White cells: Any number allowed</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
