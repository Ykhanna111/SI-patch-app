import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import { GameMode, getValidNumbers } from "@shared/gameTypes";

interface EnhancedNumberSelectorProps {
  gameMode: GameMode;
  selectedNumber: number | null;
  onNumberSelect: (number: number) => void;
  onErase: () => void;
  disabled?: boolean;
  numberCounts?: { [key: number]: number };
}

export default function EnhancedNumberSelector({
  gameMode,
  selectedNumber,
  onNumberSelect,
  onErase,
  disabled = false,
  numberCounts = {},
}: EnhancedNumberSelectorProps) {
  const validNumbers = getValidNumbers(gameMode);
  const maxCount = gameMode === 'mini-4x4' ? 4 : gameMode === 'mini-6x6' ? 6 : gameMode === 'hexadoku' ? 16 : 9;
  
  // Convert number to display format (1-9,A-F for hexadoku)
  const numberToDisplay = (num: number) => {
    if (gameMode === 'hexadoku' && num > 9) {
      return String.fromCharCode(65 + num - 10); // A-F
    }
    return num.toString();
  };

  return (
    <div className="flex flex-col items-center space-y-2 sm:space-y-4 w-full px-2">
      <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Number
      </div>
      
      <div className={cn(
        "grid gap-1.5 sm:gap-2 w-full max-w-md",
        gameMode === 'hexadoku' ? "grid-cols-9" : "grid-cols-5"
      )}>
        {validNumbers.map((number) => {
          const count = numberCounts[number] || 0;
          const isComplete = count >= maxCount;
          const isSelected = selectedNumber === number;
          
          return (
            <Button
              key={number}
              variant={isSelected ? "default" : "outline"}
              size="lg"
              className={cn(
                "aspect-square w-full font-bold relative p-0 min-h-0",
                gameMode === 'hexadoku' ? "text-xs sm:text-sm" : "text-base sm:text-lg",
                {
                  "opacity-50": isComplete && !isSelected,
                  "ring-2 ring-sudoku-primary": isSelected,
                }
              )}
              onClick={() => onNumberSelect(number)}
              disabled={disabled}
              data-testid={`number-${number}`}
            >
              {numberToDisplay(number)}
              {isComplete && (
                <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full" />
              )}
              {gameMode !== 'hexadoku' && (
                <div className="absolute -bottom-0.5 sm:-bottom-1 text-[0.5rem] sm:text-xs text-gray-500 dark:text-gray-400">
                  {count}/{maxCount}
                </div>
              )}
            </Button>
          );
        })}
        
        {/* Erase button */}
        <Button
          variant="outline"
          size="lg"
          className="aspect-square w-full text-red-500 hover:text-red-600 hover:bg-red-50 p-0 min-h-0"
          onClick={onErase}
          disabled={disabled}
          data-testid="button-erase"
        >
          <Eraser className="w-4 h-4 sm:w-6 sm:h-6" />
        </Button>
      </div>
      
      <div className="text-[0.65rem] sm:text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs px-2">
        {gameMode === 'mini-4x4' && "Fill with numbers 1-4"}
        {gameMode === 'mini-6x6' && "Fill with numbers 1-6"}
        {gameMode === 'standard' && "Fill with numbers 1-9"}
        {gameMode === 'hexadoku' && "Fill with numbers 1-16 (displayed as 1-9,A-F)"}
        {gameMode === 'jigsaw' && "Fill irregular regions with 1-9"}
        {gameMode === 'diagonal' && "Fill rows, columns, boxes, and diagonals with 1-9"}
        {gameMode === 'killer' && "Fill cages respecting sum constraints"}
        {gameMode === 'hyper' && "Fill standard regions plus 4 extra highlighted areas"}
        {gameMode === 'odd-even' && "Respect odd/even cell restrictions"}
        {gameMode === 'inequality' && "Follow inequality constraints between cells"}
        {gameMode === 'consecutive' && "Marked adjacent cells must be consecutive"}
      </div>
    </div>
  );
}