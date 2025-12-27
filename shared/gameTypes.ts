// Game mode definitions and types for various Sudoku variations

export type GameMode = 
  | 'standard'      // Classic 9x9 Sudoku
  | 'hexadoku'      // 16x16 Sudoku
  | 'diagonal'      // Sudoku X - diagonals must contain 1-9
  | 'killer'        // Cages with sum constraints
  | 'hyper'         // Windoku - extra 3x3 regions
  | 'odd-even';     // Some cells restricted to odd/even numbers

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
  },
  hexadoku: {
    id: 'hexadoku',
    name: 'Hexadoku 16×16',
    description: 'Large 16×16 grid with numbers 1–16 (or A-P)',
    icon: '🔷',
    gridSize: 16,
    difficulty: ['easy', 'medium', 'hard', 'expert'],
    rules: [
      'Fill the 16×16 grid so every row contains digits 1–16',
      'Every column must contain digits 1–16',
      'Every 4×4 box must contain digits 1–16',
      'No digit can repeat in any row, column, or box',
      'Numbers can be displayed as 1-9,A,B,C,D,E,F,10 or 1-16'
    ]
  },
  diagonal: {
    id: 'diagonal',
    name: 'Diagonal Sudoku (Sudoku X)',
    description: 'Standard rules plus both main diagonals must contain 1–9',
    icon: '❌',
    gridSize: 9,
    difficulty: ['easy', 'medium', 'hard', 'expert'],
    rules: [
      'All standard Sudoku rules apply',
      'Each main diagonal must also contain digits 1–9',
      'Top-left to bottom-right diagonal: 1–9',
      'Top-right to bottom-left diagonal: 1–9'
    ]
  },
  killer: {
    id: 'killer',
    name: 'Killer Sudoku',
    description: 'Cages with sum constraints, no given numbers',
    icon: '🔺',
    gridSize: 9,
    difficulty: ['easy', 'medium', 'hard', 'expert'],
    rules: [
      'All standard Sudoku rules apply',
      'Numbers in each cage must sum to the target',
      'No number can repeat within a cage',
      'Cages are shown with sum labels'
    ]
  },
  hyper: {
    id: 'hyper',
    name: 'Hyper Sudoku (Windoku)',
    description: 'Standard rules plus four extra shaded 3×3 regions',
    icon: '🔶',
    gridSize: 9,
    difficulty: ['easy', 'medium', 'hard', 'expert'],
    rules: [
      'All standard Sudoku rules apply',
      'Four extra shaded 3×3 regions must contain 1–9',
      'Shaded regions are positioned between normal boxes',
      'Total of 13 regions must each contain digits 1–9'
    ]
  },
  'odd-even': {
    id: 'odd-even',
    name: 'Odd-Even Sudoku',
    description: 'Some cells restricted to odd or even numbers only',
    icon: '⚫',
    gridSize: 9,
    difficulty: ['easy', 'medium', 'hard', 'expert'],
    rules: [
      'All standard Sudoku rules apply',
      'Gray shaded cells can only contain odd numbers (1,3,5,7,9)',
      'White cells can only contain even numbers (2,4,6,8)',
      'Unshaded cells can contain any number'
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
  switch (gameMode) {
    case 'hexadoku':
      return { size: 16, boxWidth: 4, boxHeight: 4 };
    default:
      return { size: 9, boxWidth: 3, boxHeight: 3 };
  }
}

export function getValidNumbers(gameMode: GameMode): number[] {
  const { size } = getGridDimensions(gameMode);
  return Array.from({ length: size }, (_, i) => i + 1);
}

export function isModeSupported(gameMode: GameMode, difficulty: Difficulty): boolean {
  return GAME_MODES[gameMode]?.difficulty.includes(difficulty) || false;
}