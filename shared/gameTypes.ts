// Game mode definitions and types for various Sudoku variations

export type GameMode = 'standard';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface GameModeInfo {
  id: GameMode;
  name: string;
  description: string;
  icon: string;
  gridSize: number;
  difficulty: Difficulty[];
  rules: string[];
  example?: string;
  constraints?: {
    oddEvenCells?: { row: number; col: number; type: 'odd' | 'even' }[];
    killerCages?: { cells: { row: number; col: number }[]; sum: number }[];
    jigsawRegions?: number[][];
    hyperRegions?: { row: number; col: number }[][];
    inequalities?: { cell1: { row: number; col: number }; cell2: { row: number; col: number }; operator: '>' | '<' }[];
    consecutiveMarks?: { cell1: { row: number; col: number }; cell2: { row: number; col: number } }[];
  };
}

export const GAME_MODES: Record<GameMode, GameModeInfo> = {
  standard: {
    id: 'standard',
    name: 'Standard Sudoku',
    description: 'Classic 9×9 Sudoku with 3×3 boxes',
    icon: '🔢',
    gridSize: 9,
    difficulty: ['easy', 'medium', 'hard', 'expert'],
    rules: [
      'Fill the 9×9 grid so every row contains digits 1–9',
      'Every column must contain digits 1–9',
      'Every 3×3 box must contain digits 1–9',
      'No digit can repeat in any row, column, or box'
    ]
  }
};

// Constraint types for different game modes
export interface KillerCage {
  cells: { row: number; col: number }[];
  sum: number;
}

export interface OddEvenCell {
  row: number;
  col: number;
  type: 'odd' | 'even';
}

export interface InequalityConstraint {
  cell1: { row: number; col: number };
  cell2: { row: number; col: number };
  operator: '>' | '<';
}

export interface ConsecutiveMarker {
  cell1: { row: number; col: number };
  cell2: { row: number; col: number };
}

export interface HyperRegion {
  cells: { row: number; col: number }[];
}

export interface GameConstraints {
  killerCages?: KillerCage[];
  oddEvenCells?: OddEvenCell[];
  jigsawRegions?: number[][];
  hyperRegions?: HyperRegion[];
  inequalities?: InequalityConstraint[];
  consecutiveMarkers?: ConsecutiveMarker[];
}

// Helper functions
export function getGridDimensions(gameMode: GameMode): { size: number; boxWidth: number; boxHeight: number } {
  return { size: 9, boxWidth: 3, boxHeight: 3 };
}

export function getValidNumbers(gameMode: GameMode): number[] {
  const { size } = getGridDimensions(gameMode);
  return Array.from({ length: size }, (_, i) => i + 1);
}

export function isModeSupported(gameMode: GameMode, difficulty: Difficulty): boolean {
  return GAME_MODES[gameMode]?.difficulty.includes(difficulty) || false;
}