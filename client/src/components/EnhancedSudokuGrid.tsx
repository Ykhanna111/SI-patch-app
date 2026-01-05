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
    if (size === 16) {
      cellSize = "aspect-square text-[0.5rem] sm:text-xs";
    } else if (size === 9) {
      cellSize = "aspect-square text-sm sm:text-base lg:text-lg";
    } else if (size === 6) {
      cellSize = "aspect-square text-sm sm:text-base";
    }

    return cn(
      `${cellSize} border border-gray-300/40 flex items-center justify-center font-bold cursor-pointer transition-colors`,
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
        "text-gray-400 dark:text-gray-500": isPrefilled,
        "text-sudoku-primary dark:text-blue-400": !isPrefilled && currentValue !== 0,
      }
    );
  };

  // Convert number to display format (1-9,A-F for hexadoku)
  const numberToDisplay = (num: number) => {
    if (gameMode === 'hexadoku' && num > 9) {
      return String.fromCharCode(65 + num - 10); // A-F
    }
    return num > 0 ? num.toString() : '';
  };

  const renderConstraintMarkers = () => {
    if (!constraints) return null;

    const markers: JSX.Element[] = [];

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

    // Killer Sudoku cages
    if (constraints.killerCages && gameMode === 'killer') {
      constraints.killerCages.forEach((cage, cageIndex) => {
        // Find the top-left cell of the cage for the sum label
        const topLeftCell = cage.cells.reduce((min, cell) => {
          if (cell.row < min.row || (cell.row === min.row && cell.col < min.col)) {
            return cell;
          }
          return min;
        }, cage.cells[0]);

        // Render sum label
        markers.push(
          <div
            key={`cage-sum-${cageIndex}`}
            className="absolute text-[0.65rem] font-bold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 px-0.5 rounded pointer-events-none"
            style={{
              left: `${(topLeftCell.col * (100 / size)) + 0.5}%`,
              top: `${(topLeftCell.row * (100 / size)) + 0.5}%`,
              zIndex: 5
            }}
          >
            {cage.sum}
          </div>
        );

        // Render cage borders
        const cageColors = [
          '#ef4444', // red-500
          '#3b82f6', // blue-500
          '#10b981', // green-500
          '#f59e0b', // orange-500
          '#8b5cf6', // purple-500
          '#ec4899', // pink-500
          '#06b6d4', // cyan-500
          '#84cc16', // lime-500
        ];
        const cageColor = cageColors[cageIndex % cageColors.length];

        cage.cells.forEach((cell, cellIndex) => {
          const cageSet = new Set(cage.cells.map(c => `${c.row},${c.col}`));
          
          const hasBorderTop = !cageSet.has(`${cell.row - 1},${cell.col}`);
          const hasBorderBottom = !cageSet.has(`${cell.row + 1},${cell.col}`);
          const hasBorderLeft = !cageSet.has(`${cell.row},${cell.col - 1}`);
          const hasBorderRight = !cageSet.has(`${cell.row},${cell.col + 1}`);

          if (hasBorderTop || hasBorderBottom || hasBorderLeft || hasBorderRight) {
            markers.push(
              <div
                key={`cage-border-${cageIndex}-${cellIndex}`}
                className="absolute pointer-events-none"
                style={{
                  left: `${(cell.col * (100 / size))}%`,
                  top: `${(cell.row * (100 / size))}%`,
                  width: `${100 / size}%`,
                  height: `${100 / size}%`,
                  borderTop: hasBorderTop ? `2.5px solid ${cageColor}` : 'none',
                  borderBottom: hasBorderBottom ? `2.5px solid ${cageColor}` : 'none',
                  borderLeft: hasBorderLeft ? `2.5px solid ${cageColor}` : 'none',
                  borderRight: hasBorderRight ? `2.5px solid ${cageColor}` : 'none',
                  backgroundColor: `${cageColor}10`, // 10 opacity hex
                  zIndex: 3
                }}
              />
            );
          }
        });
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
            "grid gap-0 border-[3px] border-black rounded-sm overflow-hidden bg-white",
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
                  {numberToDisplay(currentGrid?.[row]?.[col] || 0)}
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
  if (size === 16) {
    if (col === 3 || col === 7 || col === 11) classes.push("border-r-[2.5px] border-black dark:border-gray-400");
    if (row === 3 || row === 7 || row === 11) classes.push("border-b-[2.5px] border-black dark:border-gray-400");
  } else if (size === 9) {
    if (col === 2 || col === 5) classes.push("border-r-[2.5px] border-black dark:border-gray-400");
    if (row === 2 || row === 5) classes.push("border-b-[2.5px] border-black dark:border-gray-400");
  } else if (size === 6) {
    if (col === 2) classes.push("border-r-2 border-gray-800 dark:border-gray-600");
    if (row === 1 || row === 3) classes.push("border-b-2 border-gray-800 dark:border-gray-600");
  } else if (size === 4) {
    if (col === 1) classes.push("border-r-2 border-gray-800 dark:border-gray-600");
    if (row === 1) classes.push("border-b-2 border-gray-800 dark:border-gray-600");
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
      return "bg-purple-200/60 border-purple-300";
    }
  }

  if (gameMode === 'hyper' && constraints?.hyperRegions) {
    // Highlight hyper regions
    for (const region of constraints.hyperRegions) {
      if (region.cells.some(cell => cell.row === row && cell.col === col)) {
        return "bg-orange-200/60 border-orange-300";
      }
    }
  }

  if (gameMode === 'odd-even' && constraints?.oddEvenCells) {
    const constraint = constraints.oddEvenCells.find(c => c.row === row && c.col === col);
    if (constraint) {
      return constraint.type === 'odd' ? "bg-gray-300" : "bg-blue-300";
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

  return "";
}