import { cn } from "@/lib/utils";
import { GameMode, GameConstraints, getGridDimensions } from "@shared/gameTypes";

type SudokuGrid = number[][];

interface EnhancedSudokuGridProps {
  gameMode: GameMode;
  currentGrid: SudokuGrid;
  originalPuzzle: SudokuGrid;
  selectedCell: { row: number; col: number } | null;
  selectedNumber: number | null;
  onCellClick: (row: number, col: number) => void;
  isPaused: boolean;
  constraints?: GameConstraints;
}

export default function EnhancedSudokuGrid({
  gameMode,
  currentGrid,
  originalPuzzle,
  selectedCell,
  selectedNumber,
  onCellClick,
  isPaused,
  constraints,
}: EnhancedSudokuGridProps) {
  const { size, boxWidth, boxHeight } = getGridDimensions(gameMode);

  const getCellClasses = (row: number, col: number) => {
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const currentValue = currentGrid?.[row]?.[col] || 0;
    const originalValue = originalPuzzle?.[row]?.[col] || 0;
    const isNumberHighlighted = selectedNumber && currentValue === selectedNumber && currentValue !== 0;
    const isPrefilled = originalValue !== 0;
    
    // Highlighting logic based on game mode
    let isHighlighted = false;
    if (selectedCell) {
      // Row and column highlighting
      if (selectedCell.row === row || selectedCell.col === col) {
        isHighlighted = true;
      }
      
      // Box highlighting (varies by game mode)
      if (gameMode === 'jigsaw') {
        // Jigsaw highlighting based on regions
        if (constraints?.jigsawRegions) {
          const selectedRegion = constraints.jigsawRegions[selectedCell.row][selectedCell.col];
          const currentRegion = constraints.jigsawRegions[row][col];
          if (selectedRegion === currentRegion) {
            isHighlighted = true;
          }
        }
      } else {
        // Standard box highlighting
        const selectedBoxRow = Math.floor(selectedCell.row / boxHeight);
        const selectedBoxCol = Math.floor(selectedCell.col / boxWidth);
        const currentBoxRow = Math.floor(row / boxHeight);
        const currentBoxCol = Math.floor(col / boxWidth);
        
        if (selectedBoxRow === currentBoxRow && selectedBoxCol === currentBoxCol) {
          isHighlighted = true;
        }
      }
      
      // Diagonal highlighting for Sudoku X
      if (gameMode === 'diagonal') {
        const onMainDiagonal = selectedCell.row === selectedCell.col && row === col;
        const onAntiDiagonal = selectedCell.row + selectedCell.col === size - 1 && row + col === size - 1;
        if (onMainDiagonal || onAntiDiagonal) {
          isHighlighted = true;
        }
      }
      
      // Hyper region highlighting
      if (gameMode === 'hyper' && constraints?.hyperRegions) {
        for (const region of constraints.hyperRegions) {
          const selectedInRegion = region.cells.some(cell => cell.row === selectedCell.row && cell.col === selectedCell.col);
          const currentInRegion = region.cells.some(cell => cell.row === row && cell.col === col);
          if (selectedInRegion && currentInRegion) {
            isHighlighted = true;
          }
        }
      }
    }

    // Base cell styling - responsive sizing
    let cellSize = "aspect-square text-xs sm:text-sm";
    if (size === 9) {
      cellSize = "aspect-square text-sm sm:text-base lg:text-lg";
    } else if (size === 6) {
      cellSize = "aspect-square text-sm sm:text-base";
    }

    return cn(
      `${cellSize} border border-gray-300 flex items-center justify-center font-bold cursor-pointer transition-colors`,
      // Game-specific borders
      getGameSpecificBorders(row, col, gameMode, size, boxWidth, boxHeight, constraints),
      // Cell states
      {
        "bg-blue-50 border-2 border-sudoku-primary": isSelected,
        "bg-blue-25": isHighlighted && !isSelected,
        "bg-yellow-50": isNumberHighlighted && !isSelected,
        "hover:bg-blue-50": !isSelected && !isPaused,
      },
      // Game mode specific backgrounds
      getGameSpecificBackground(row, col, gameMode, constraints)
    );
  };

  const getTextClasses = (row: number, col: number) => {
    const originalValue = originalPuzzle?.[row]?.[col] || 0;
    const currentValue = currentGrid?.[row]?.[col] || 0;
    const isPrefilled = originalValue !== 0;
    
    return cn(
      "select-none",
      {
        "text-gray-400": isPrefilled,
        "text-sudoku-primary": !isPrefilled && currentValue !== 0,
      }
    );
  };

  const renderConstraintMarkers = () => {
    if (!constraints) return null;

    const markers: JSX.Element[] = [];

    // Killer Sudoku cages
    if (constraints.killerCages && gameMode === 'killer') {
      constraints.killerCages.forEach((cage, index) => {
        // Find top-left cell of cage for sum display
        const topLeft = cage.cells.reduce((min, cell) => 
          (cell.row < min.row || (cell.row === min.row && cell.col < min.col)) ? cell : min
        );
        
        markers.push(
          <div
            key={`cage-sum-${index}`}
            className="absolute text-xs font-bold text-red-600 pointer-events-none"
            style={{
              left: `${(topLeft.col * (100 / size)) + 1}%`,
              top: `${(topLeft.row * (100 / size)) + 1}%`,
              zIndex: 10
            }}
          >
            {cage.sum}
          </div>
        );
      });
    }

    // Inequality markers
    if (constraints.inequalities && gameMode === 'inequality') {
      constraints.inequalities.forEach((ineq, index) => {
        const isHorizontal = ineq.cell1.row === ineq.cell2.row;
        const centerRow = ineq.cell1.row + (isHorizontal ? 0 : 0.5);
        const centerCol = ineq.cell1.col + (isHorizontal ? 0.5 : 0);
        
        markers.push(
          <div
            key={`inequality-${index}`}
            className="absolute text-lg font-bold text-purple-600 pointer-events-none"
            style={{
              left: `${(centerCol * (100 / size))}%`,
              top: `${(centerRow * (100 / size))}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          >
            {ineq.operator}
          </div>
        );
      });
    }

    // Consecutive markers
    if (constraints.consecutiveMarkers && gameMode === 'consecutive') {
      constraints.consecutiveMarkers.forEach((marker, index) => {
        const isHorizontal = marker.cell1.row === marker.cell2.row;
        const centerRow = marker.cell1.row + (isHorizontal ? 0 : 0.5);
        const centerCol = marker.cell1.col + (isHorizontal ? 0.5 : 0);
        
        markers.push(
          <div
            key={`consecutive-${index}`}
            className="absolute w-2 h-2 bg-white border-2 border-gray-600 rounded-full pointer-events-none"
            style={{
              left: `${(centerCol * (100 / size))}%`,
              top: `${(centerRow * (100 / size))}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          />
        );
      });
    }

    return markers;
  };

  if (isPaused) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <div className="bg-gray-100 rounded-lg p-4 sm:p-8 border-2 sm:border-4 border-gray-300">
          <div className="text-center text-gray-500">
            <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">⏸️</div>
            <p className="text-base sm:text-lg font-semibold">Game Paused</p>
            <p className="text-xs sm:text-sm">Click Resume to continue</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full h-full">
      <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
        <div 
          className={cn(
            "grid gap-0 border-2 sm:border-4 border-gray-800 rounded-md sm:rounded-lg overflow-hidden bg-white",
            "w-full h-full max-w-[min(100%,100vh-12rem)]",
            `grid-cols-${size}`
          )} 
          style={{ 
            aspectRatio: '1/1',
            gridTemplateColumns: `repeat(${size}, 1fr)`
          }}
        >
          {Array.from({ length: size }, (_, row) =>
            Array.from({ length: size }, (_, col) => (
              <div
                key={`${row}-${col}`}
                className={getCellClasses(row, col)}
                onClick={() => onCellClick(row, col)}
                data-testid={`cell-${row}-${col}`}
              >
                <span className={getTextClasses(row, col)}>
                  {currentGrid?.[row]?.[col] || ''}
                </span>
              </div>
            ))
          )}
        </div>
        
        {/* Constraint markers overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {renderConstraintMarkers()}
        </div>
      </div>
    </div>
  );
}

// Helper functions for game-specific styling
function getGameSpecificBorders(
  row: number, 
  col: number, 
  gameMode: GameMode, 
  size: number,
  boxWidth: number,
  boxHeight: number,
  constraints?: GameConstraints
): string {
  const classes: string[] = [];

  if (gameMode === 'jigsaw') {
    // Jigsaw regions have custom borders based on region shapes
    // This would need actual region data to implement properly
    return "border-gray-400";
  }

  // Standard box borders
  if (size === 9) {
    if (col === 2 || col === 5) classes.push("border-r-2 border-gray-800");
    if (row === 2 || row === 5) classes.push("border-b-2 border-gray-800");
  } else if (size === 6) {
    if (col === 2) classes.push("border-r-2 border-gray-800");
    if (row === 1 || row === 3) classes.push("border-b-2 border-gray-800");
  } else if (size === 4) {
    if (col === 1) classes.push("border-r-2 border-gray-800");
    if (row === 1) classes.push("border-b-2 border-gray-800");
  }

  return classes.join(" ");
}

function getGameSpecificBackground(
  row: number,
  col: number,
  gameMode: GameMode,
  constraints?: GameConstraints
): string {
  if (gameMode === 'diagonal') {
    // Highlight diagonal cells
    if (row === col || row + col === 8) {
      return "bg-purple-50";
    }
  }

  if (gameMode === 'hyper' && constraints?.hyperRegions) {
    // Highlight hyper regions
    for (const region of constraints.hyperRegions) {
      if (region.cells.some(cell => cell.row === row && cell.col === col)) {
        return "bg-orange-50";
      }
    }
  }

  if (gameMode === 'odd-even' && constraints?.oddEvenCells) {
    const constraint = constraints.oddEvenCells.find(c => c.row === row && c.col === col);
    if (constraint) {
      return constraint.type === 'odd' ? "bg-gray-100" : "bg-blue-50";
    }
  }

  if (gameMode === 'jigsaw' && constraints?.jigsawRegions) {
    const regionId = constraints.jigsawRegions[row][col];
    const colors = [
      "bg-red-50", "bg-blue-50", "bg-green-50", "bg-yellow-50", 
      "bg-purple-50", "bg-pink-50", "bg-indigo-50", "bg-gray-50", "bg-orange-50"
    ];
    return colors[regionId % colors.length];
  }

  if (gameMode === 'killer' && constraints?.killerCages) {
    // Find which cage this cell belongs to and give it a subtle background
    const cageIndex = constraints.killerCages.findIndex(cage => 
      cage.cells.some(cell => cell.row === row && cell.col === col)
    );
    if (cageIndex !== -1) {
      const colors = [
        "bg-red-25", "bg-blue-25", "bg-green-25", "bg-yellow-25", 
        "bg-purple-25", "bg-pink-25", "bg-indigo-25", "bg-gray-25"
      ];
      return colors[cageIndex % colors.length];
    }
  }

  return "";
}