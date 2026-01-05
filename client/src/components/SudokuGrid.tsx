import { cn } from "@/lib/utils";

type SudokuGrid = number[][];

interface SudokuGridProps {
  currentGrid: SudokuGrid;
  originalPuzzle: SudokuGrid;
  selectedCell: { row: number; col: number } | null;
  selectedNumber: number | null;
  onCellClick: (row: number, col: number) => void;
  isPaused: boolean;
}

export default function SudokuGrid({
  currentGrid,
  originalPuzzle,
  selectedCell,
  selectedNumber,
  onCellClick,
  isPaused,
}: SudokuGridProps) {
  const getCellClasses = (row: number, col: number) => {
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isHighlighted = selectedCell && (
      selectedCell.row === row || 
      selectedCell.col === col ||
      (Math.floor(selectedCell.row / 3) === Math.floor(row / 3) && 
       Math.floor(selectedCell.col / 3) === Math.floor(col / 3))
    );
    const currentValue = currentGrid && currentGrid[row] && currentGrid[row][col] ? currentGrid[row][col] : 0;
    const originalValue = originalPuzzle && originalPuzzle[row] && originalPuzzle[row][col] ? originalPuzzle[row][col] : 0;
    const isNumberHighlighted = selectedNumber && currentValue === selectedNumber && currentValue !== 0;
    const isPrefilled = originalValue !== 0;
    const hasValue = currentValue !== 0;

    return cn(
      "w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 flex items-center justify-center text-lg font-bold cursor-pointer transition-colors",
      // Grid borders
      {
        "border-l-2 border-gray-600": col % 3 === 0,
        "border-t-2 border-gray-600": row % 3 === 0,
        "border-r-2 border-gray-600": col === 2 || col === 5 || col === 8,
        "border-b-2 border-gray-600": row === 2 || row === 5 || row === 8,
      },
      // Cell states
      {
        "bg-blue-50 border-2 border-sudoku-primary": isSelected,
        "bg-blue-25": isHighlighted && !isSelected,
        "bg-yellow-50": isNumberHighlighted && !isSelected,
        "hover:bg-blue-50": !isSelected && !isPaused,
      }
    );
  };

  const getTextClasses = (row: number, col: number) => {
    const originalValue = originalPuzzle && originalPuzzle[row] && originalPuzzle[row][col] ? originalPuzzle[row][col] : 0;
    const currentValue = currentGrid && currentGrid[row] && currentGrid[row][col] ? currentGrid[row][col] : 0;
    const isPrefilled = originalValue !== 0;
    
    return cn(
      "select-none",
      {
        "text-gray-400": isPrefilled,
        "text-sudoku-primary": !isPrefilled && currentValue !== 0,
      }
    );
  };

  if (isPaused) {
    return (
      <div className="flex justify-center mb-6">
        <div className="w-fit bg-gray-100 rounded-lg p-8 border-4 border-gray-300">
          <div className="text-center text-gray-500">
            <i className="fas fa-pause text-4xl mb-4"></i>
            <p className="text-lg font-semibold">Game Paused</p>
            <p className="text-sm">Click Resume to continue</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mb-6">
      <div className="grid grid-cols-9 gap-0 border-0 rounded-lg overflow-hidden bg-white" style={{ width: 'fit-content' }}>
        {Array.from({ length: 9 }, (_, row) =>
          Array.from({ length: 9 }, (_, col) => (
            <div
              key={`${row}-${col}`}
              className={getCellClasses(row, col)}
              onClick={() => onCellClick(row, col)}
              data-testid={`cell-${row}-${col}`}
            >
              <span className={getTextClasses(row, col)}>
                {currentGrid && currentGrid[row] && currentGrid[row][col] ? currentGrid[row][col] : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
