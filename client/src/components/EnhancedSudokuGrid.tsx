import { memo, useMemo } from "react";
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

const SudokuCell = memo(({ 
  row, 
  col, 
  value, 
  isPrefilled, 
  isSelected, 
  isHighlighted, 
  isNumberHighlighted, 
  isPaused,
  gameMode,
  size,
  boxWidth,
  boxHeight,
  constraints,
  onClick,
}: any) => {
  const cellClasses = useMemo(() => {
    return cn(
      "aspect-square flex items-center justify-center font-bold cursor-pointer transition-colors border border-gray-300",
      size === 16 ? "text-[0.5rem] sm:text-xs" : size === 9 ? "text-sm sm:text-base lg:text-lg" : "text-sm sm:text-base",
      getGameSpecificBorders(row, col, gameMode, size, boxWidth, boxHeight, constraints),
      {
        "bg-blue-50 border-2 border-sudoku-primary": isSelected,
        "bg-blue-25": isHighlighted && !isSelected,
        "bg-yellow-50": isNumberHighlighted && !isSelected,
        "hover:bg-blue-50": !isSelected && !isPaused,
      },
      getGameSpecificBackground(row, col, gameMode, constraints)
    );
  }, [row, col, gameMode, size, boxWidth, boxHeight, constraints, isSelected, isHighlighted, isNumberHighlighted, isPaused]);

  const textClasses = useMemo(() => {
    return cn("select-none", {
      "text-gray-400 dark:text-gray-500": isPrefilled,
      "text-sudoku-primary dark:text-blue-400": !isPrefilled && value !== 0,
    });
  }, [isPrefilled, value]);

  const displayValue = useMemo(() => {
    if (gameMode === 'hexadoku' && value > 9) {
      return String.fromCharCode(65 + value - 10);
    }
    return value > 0 ? value.toString() : '';
  }, [value, gameMode]);

  return (
    <div className={cellClasses} onClick={() => onClick(row, col)} data-testid={`cell-${row}-${col}`} style={{ touchAction: 'manipulation' }}>
      <span className={textClasses}>{displayValue}</span>
    </div>
  );
});

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
    <div className="flex justify-center w-full">
      <div className="relative py-2 sm:py-4 w-full max-w-[min(95vw,500px)]">
        <div 
          className={cn(
            "grid gap-0 border-2 border-gray-800 rounded-sm overflow-hidden bg-white shadow-xl w-full",
            `grid-cols-${size}`
          )} 
          style={{ 
            aspectRatio: '1/1',
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            touchAction: 'none',
          }}
        >
          {Array.from({ length: size }, (_, row) =>
            Array.from({ length: size }, (_, col) => {
              const originalValue = originalPuzzle?.[row]?.[col] || 0;
              const currentValue = currentGrid?.[row]?.[col] || 0;
              const isSelected = selectedCell?.row === row && selectedCell?.col === col;
              const isNumberHighlighted = selectedNumber && currentValue === selectedNumber && currentValue !== 0;
              
              let isHighlighted = false;
              if (selectedCell) {
                if (selectedCell.row === row || selectedCell.col === col) isHighlighted = true;
                if (!isHighlighted) {
                  const selectedBoxRow = Math.floor(selectedCell.row / boxHeight);
                  const selectedBoxCol = Math.floor(selectedCell.col / boxWidth);
                  const currentBoxRow = Math.floor(row / boxHeight);
                  const currentBoxCol = Math.floor(col / boxWidth);
                  if (selectedBoxRow === currentBoxRow && selectedBoxCol === currentBoxCol) isHighlighted = true;
                }
              }

              return (
                <SudokuCell
                  key={`${row}-${col}`}
                  row={row}
                  col={col}
                  value={currentValue}
                  isPrefilled={originalValue !== 0}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  isNumberHighlighted={isNumberHighlighted}
                  isPaused={isPaused}
                  gameMode={gameMode}
                  size={size}
                  boxWidth={boxWidth}
                  boxHeight={boxHeight}
                  constraints={constraints}
                  onClick={onCellClick}
                />
              );
            })
          )}
          
          {/* Overlay container inside the grid to ensure alignment with cells */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {renderConstraintMarkers(constraints, size, gameMode)}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderConstraintMarkers(constraints: any, size: number, gameMode: string) {
  if (!constraints) return null;
  const markers: JSX.Element[] = [];

  // Killer Sudoku cages - Single SVG overlay for pixel-perfect alignment
  if (constraints.killerCages && gameMode === 'killer') {
    // 1. Sum labels
    constraints.killerCages.forEach((cage: any, cageIndex: number) => {
      const topLeftCell = cage.cells.reduce((min: any, cell: any) => 
        (cell.row < min.row || (cell.row === min.row && cell.col < min.col)) ? cell : min, 
        cage.cells[0]
      );
      markers.push(
        <div 
          key={`sum-${cageIndex}`} 
          className="absolute text-[0.6rem] font-bold text-gray-700 bg-white/90 px-0.5 rounded-sm pointer-events-none z-30" 
          style={{ 
            left: `${(topLeftCell.col * 100) / size}%`, 
            top: `${(topLeftCell.row * 100) / size}%`, 
            padding: '1px 2px',
            margin: '2px'
          }}
        >
          {cage.sum}
        </div>
      );
    });

    // 2. SVG Overlay for Cage Boundaries
    markers.push(
      <svg 
        key="killer-svg-overlay"
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="none"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {constraints.killerCages.map((cage: any, cageIndex: number) => {
          const cageColor = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'][cageIndex % 8];
          const cageSet = new Set(cage.cells.map((c: any) => `${c.row},${c.col}`));
          const paths: string[] = [];

          cage.cells.forEach((cell: any) => {
            const { row: r, col: c } = cell;
            // Draw cage boundaries (dashed lines)
            if (!cageSet.has(`${r-1},${c}`)) paths.push(`M${c},${r} h1`); // Top
            if (!cageSet.has(`${r+1},${c}`)) paths.push(`M${c},${r+1} h1`); // Bottom
            if (!cageSet.has(`${r},${c-1}`)) paths.push(`M${c},${r} v1`); // Left
            if (!cageSet.has(`${r},${c+1}`)) paths.push(`M${c+1},${r} v1`); // Right
          });

          return (
            <g key={`cage-${cageIndex}`}>
              {/* Cage background fill */}
              <path 
                d={cage.cells.map((cell: any) => `M${cell.col},${cell.row} h1 v1 h-1 z`).join(' ')} 
                fill={cageColor} 
                fillOpacity="0.05" 
              />
              {/* Cage dashed outline - reduced by 10% (0.05 inset on all sides) */}
              <path 
                d={cage.cells.map((cell: any) => {
                  const { row: r, col: c } = cell;
                  const cageSet = new Set(cage.cells.map((cc: any) => `${cc.row},${cc.col}`));
                  const hasT = !cageSet.has(`${r-1},${c}`);
                  const hasB = !cageSet.has(`${r+1},${c}`);
                  const hasL = !cageSet.has(`${r},${c-1}`);
                  const hasR = !cageSet.has(`${r},${c+1}`);
                  
                  const segments = [];
                  const padding = 0.02; // 2% inset for sub-pixel safety while looking "full size"
                  
                  if (hasT) segments.push(`M${c},${r} h1`);
                  if (hasB) segments.push(`M${c},${r+1} h1`);
                  if (hasL) segments.push(`M${c},${r} v1`);
                  if (hasR) segments.push(`M${c+1},${r} v1`);
                  
                  return segments.join(' ');
                }).join(' ')}
                stroke={cageColor} 
                strokeWidth="0.08" 
                strokeDasharray="0.1, 0.05" 
                strokeLinecap="round"
                fill="none" 
              />
            </g>
          );
        })}
      </svg>
    );
  }

  // Inequality markers
  if (constraints.inequalities && gameMode === 'inequality') {
    constraints.inequalities.forEach((ineq: any, index: number) => {
      const isHorizontal = ineq.cell1.row === ineq.cell2.row;
      const x = isHorizontal ? (ineq.cell1.col + ineq.cell2.col + 1) / 2 : ineq.cell1.col + 0.5;
      const y = isHorizontal ? ineq.cell1.row + 0.5 : (ineq.cell1.row + ineq.cell2.row + 1) / 2;
      markers.push(
        <div key={`ineq-${index}`} className="absolute text-lg font-bold text-purple-600 pointer-events-none z-10" style={{ left: `${(x * 100) / size}%`, top: `${(y * 100) / size}%`, transform: 'translate(-50%, -50%)' }}>
          {ineq.operator}
        </div>
      );
    });
  }

  // Consecutive markers
  if (constraints.consecutiveMarkers && gameMode === 'consecutive') {
    constraints.consecutiveMarkers.forEach((marker: any, index: number) => {
      const isHorizontal = marker.cell1.row === marker.cell2.row;
      const x = isHorizontal ? (marker.cell1.col + marker.cell2.col + 1) / 2 : marker.cell1.col + 0.5;
      const y = isHorizontal ? marker.cell1.row + 0.5 : (marker.cell1.row + marker.cell2.row + 1) / 2;
      markers.push(
        <div key={`cons-${index}`} className="absolute w-2 h-2 bg-white border-2 border-gray-600 rounded-full pointer-events-none z-10" style={{ left: `${(x * 100) / size}%`, top: `${(y * 100) / size}%`, transform: 'translate(-50%, -50%)' }} />
      );
    });
  }

  return markers;
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

  if ((gameMode as string) === 'jigsaw') {
    return "border-gray-400";
  }

  // Standard box borders
  if (size === 16) {
    if (col % 4 === 0) classes.push("border-l-2 border-gray-600 dark:border-gray-500");
    if (row % 4 === 0) classes.push("border-t-2 border-gray-600 dark:border-gray-500");
    if (col === 3 || col === 7 || col === 11 || col === 15) classes.push("border-r-2 border-gray-600 dark:border-gray-500");
    if (row === 3 || row === 7 || row === 11 || row === 15) classes.push("border-b-2 border-gray-600 dark:border-gray-500");
  } else if (size === 9) {
    if (col % 3 === 0) classes.push("border-l-2 border-gray-600 dark:border-gray-500");
    if (row % 3 === 0) classes.push("border-t-2 border-gray-600 dark:border-gray-500");
    if (col === 2 || col === 5 || col === 8) classes.push("border-r-2 border-gray-600 dark:border-gray-500");
    if (row === 2 || row === 5 || row === 8) classes.push("border-b-2 border-gray-600 dark:border-gray-500");
  } else if (size === 6) {
    if (col % 3 === 0) classes.push("border-l-2 border-gray-800 dark:border-gray-600");
    if (row % 2 === 0) classes.push("border-t-2 border-gray-800 dark:border-gray-600");
    if (col === 2 || col === 5) classes.push("border-r-2 border-gray-800 dark:border-gray-600");
    if (row === 1 || row === 3 || row === 5) classes.push("border-b-2 border-gray-800 dark:border-gray-600");
  } else if (size === 4) {
    if (col % 2 === 0) classes.push("border-l-2 border-gray-800 dark:border-gray-600");
    if (row % 2 === 0) classes.push("border-t-2 border-gray-800 dark:border-gray-600");
    if (col === 1 || col === 3) classes.push("border-r-2 border-gray-800 dark:border-gray-600");
    if (row === 1 || row === 3) classes.push("border-b-2 border-gray-800 dark:border-gray-600");
  }

  return classes.join(" ");
}

function getGameSpecificBackground(
  row: number,
  col: number,
  gameMode: GameMode,
  constraints?: GameConstraints
): string {
  if ((gameMode as string) === 'diagonal') {
    if (row === col || row + col === 8) {
      return "bg-purple-200/60 border-purple-300";
    }
  }

  if ((gameMode as string) === 'hyper' && constraints?.hyperRegions) {
    for (const region of constraints.hyperRegions) {
      if (region.cells.some(cell => cell.row === row && cell.col === col)) {
        return "bg-orange-200/60 border-orange-300";
      }
    }
  }

  if ((gameMode as string) === 'odd-even' && constraints?.oddEvenCells) {
    const constraint = constraints.oddEvenCells.find(c => c.row === row && c.col === col);
    if (constraint) {
      return constraint.type === 'odd' ? "bg-gray-300" : "bg-blue-300";
    }
  }

  if ((gameMode as string) === 'jigsaw' && constraints?.jigsawRegions) {
    const regionId = constraints.jigsawRegions[row][col];
    const colors = [
      "bg-red-50", "bg-blue-50", "bg-green-50", "bg-yellow-50", 
      "bg-purple-50", "bg-pink-50", "bg-indigo-50", "bg-gray-50", "bg-orange-50"
    ];
    return colors[regionId % colors.length];
  }

  return "";
}