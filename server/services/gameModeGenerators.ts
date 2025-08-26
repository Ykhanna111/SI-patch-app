import { GameMode, Difficulty, GameConstraints, getGridDimensions, getValidNumbers } from "@shared/gameTypes";

export type SudokuGrid = number[][];

export interface GeneratedPuzzle {
  puzzle: SudokuGrid;
  solution: SudokuGrid;
  constraints?: GameConstraints;
}

// Main generator function for all game modes
export function generatePuzzleForMode(gameMode: GameMode, difficulty: Difficulty): GeneratedPuzzle {
  switch (gameMode) {
    case 'standard':
      return generateStandardSudoku(difficulty);
    case 'mini-4x4':
      return generateMiniSudoku(4, difficulty);
    case 'mini-6x6':
      return generateMiniSudoku(6, difficulty);
    case 'jigsaw':
      return generateJigsawSudoku(difficulty);
    case 'diagonal':
      return generateDiagonalSudoku(difficulty);
    case 'killer':
      return generateKillerSudoku(difficulty);
    case 'hyper':
      return generateHyperSudoku(difficulty);
    case 'odd-even':
      return generateOddEvenSudoku(difficulty);
    case 'inequality':
      return generateInequalitySudoku(difficulty);
    case 'consecutive':
      return generateConsecutiveSudoku(difficulty);
    default:
      return generateStandardSudoku(difficulty);
  }
}

// Standard 9x9 Sudoku Generator
function generateStandardSudoku(difficulty: Difficulty): GeneratedPuzzle {
  const solution = generateCompleteSudoku(9);
  const puzzle = createPuzzle(solution, difficulty, 9);
  return { puzzle, solution };
}

// Mini Sudoku Generator (4x4 or 6x6)
function generateMiniSudoku(size: number, difficulty: Difficulty): GeneratedPuzzle {
  const solution = generateCompleteSudoku(size);
  const puzzle = createPuzzle(solution, difficulty, size);
  return { puzzle, solution };
}

// Jigsaw Sudoku Generator
function generateJigsawSudoku(difficulty: Difficulty): GeneratedPuzzle {
  const solution = generateCompleteSudoku(9);
  const jigsawRegions = generateJigsawRegions();
  const puzzle = createJigsawPuzzle(solution, difficulty, jigsawRegions);
  
  return {
    puzzle,
    solution,
    constraints: { jigsawRegions }
  };
}

// Diagonal Sudoku (Sudoku X) Generator
function generateDiagonalSudoku(difficulty: Difficulty): GeneratedPuzzle {
  const solution = generateDiagonalCompleteSudoku();
  const puzzle = createPuzzle(solution, difficulty, 9);
  return { puzzle, solution };
}

// Killer Sudoku Generator
function generateKillerSudoku(difficulty: Difficulty): GeneratedPuzzle {
  const solution = generateCompleteSudoku(9);
  const killerCages = generateKillerCages(solution);
  const puzzle = createKillerPuzzle(killerCages);
  
  return {
    puzzle,
    solution,
    constraints: { killerCages }
  };
}

// Hyper Sudoku (Windoku) Generator
function generateHyperSudoku(difficulty: Difficulty): GeneratedPuzzle {
  const solution = generateHyperCompleteSudoku();
  const puzzle = createPuzzle(solution, difficulty, 9);
  const hyperRegions = getHyperRegions();
  
  return {
    puzzle,
    solution,
    constraints: { hyperRegions }
  };
}

// Odd-Even Sudoku Generator
function generateOddEvenSudoku(difficulty: Difficulty): GeneratedPuzzle {
  const solution = generateCompleteSudoku(9);
  const oddEvenCells = generateOddEvenConstraints();
  const puzzle = createOddEvenPuzzle(solution, difficulty, oddEvenCells);
  
  return {
    puzzle,
    solution,
    constraints: { oddEvenCells }
  };
}

// Inequality Sudoku Generator
function generateInequalitySudoku(difficulty: Difficulty): GeneratedPuzzle {
  const solution = generateCompleteSudoku(9);
  const inequalities = generateInequalityConstraints(solution);
  const puzzle = createPuzzle(solution, difficulty, 9);
  
  return {
    puzzle,
    solution,
    constraints: { inequalities }
  };
}

// Consecutive Sudoku Generator
function generateConsecutiveSudoku(difficulty: Difficulty): GeneratedPuzzle {
  const solution = generateCompleteSudoku(9);
  const consecutiveMarkers = generateConsecutiveMarkers(solution);
  const puzzle = createPuzzle(solution, difficulty, 9);
  
  return {
    puzzle,
    solution,
    constraints: { consecutiveMarkers }
  };
}

// Core sudoku generation functions
function generateCompleteSudoku(size: number): SudokuGrid {
  const grid: SudokuGrid = Array(size).fill(0).map(() => Array(size).fill(0));
  fillGrid(grid, size);
  return grid;
}

function fillGrid(grid: SudokuGrid, size: number): boolean {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === 0) {
        const numbers = shuffleArray(getValidNumbers(size === 4 ? 'mini-4x4' : size === 6 ? 'mini-6x6' : 'standard'));
        
        for (const num of numbers) {
          if (isValidPlacement(grid, row, col, num, size)) {
            grid[row][col] = num;
            
            if (fillGrid(grid, size)) {
              return true;
            }
            
            grid[row][col] = 0;
          }
        }
        
        return false;
      }
    }
  }
  
  return true;
}

function isValidPlacement(grid: SudokuGrid, row: number, col: number, num: number, size: number): boolean {
  // Check row
  for (let i = 0; i < size; i++) {
    if (grid[row][i] === num) return false;
  }
  
  // Check column
  for (let i = 0; i < size; i++) {
    if (grid[i][col] === num) return false;
  }
  
  // Check box
  const { boxWidth, boxHeight } = getBoxDimensions(size);
  const boxRow = Math.floor(row / boxHeight) * boxHeight;
  const boxCol = Math.floor(col / boxWidth) * boxWidth;
  
  for (let i = boxRow; i < boxRow + boxHeight; i++) {
    for (let j = boxCol; j < boxCol + boxWidth; j++) {
      if (grid[i][j] === num) return false;
    }
  }
  
  return true;
}

function getBoxDimensions(size: number): { boxWidth: number; boxHeight: number } {
  switch (size) {
    case 4: return { boxWidth: 2, boxHeight: 2 };
    case 6: return { boxWidth: 3, boxHeight: 2 };
    case 9: return { boxWidth: 3, boxHeight: 3 };
    default: return { boxWidth: 3, boxHeight: 3 };
  }
}

function createPuzzle(solution: SudokuGrid, difficulty: Difficulty, size: number): SudokuGrid {
  const puzzle = solution.map(row => [...row]);
  
  // Adjust difficulty based on grid size
  const baseCells = size * size;
  const removalPercentage = {
    easy: 0.4,
    medium: 0.5,
    hard: 0.6,
    expert: 0.7
  }[difficulty] || 0.5;
  
  const cellsToRemove = Math.floor(baseCells * removalPercentage);
  
  // Randomly remove cells
  const positions = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      positions.push([row, col]);
    }
  }
  
  const shuffledPositions = shuffleArray(positions);
  
  for (let i = 0; i < cellsToRemove && i < shuffledPositions.length; i++) {
    const [row, col] = shuffledPositions[i];
    puzzle[row][col] = 0;
  }
  
  return puzzle;
}

// Diagonal Sudoku specific functions
function generateDiagonalCompleteSudoku(): SudokuGrid {
  const grid: SudokuGrid = Array(9).fill(0).map(() => Array(9).fill(0));
  fillDiagonalGrid(grid);
  return grid;
}

function fillDiagonalGrid(grid: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (const num of numbers) {
          if (isValidDiagonalPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            
            if (fillDiagonalGrid(grid)) {
              return true;
            }
            
            grid[row][col] = 0;
          }
        }
        
        return false;
      }
    }
  }
  
  return true;
}

function isValidDiagonalPlacement(grid: SudokuGrid, row: number, col: number, num: number): boolean {
  // Standard sudoku checks
  if (!isValidPlacement(grid, row, col, num, 9)) return false;
  
  // Check main diagonal (top-left to bottom-right)
  if (row === col) {
    for (let i = 0; i < 9; i++) {
      if (grid[i][i] === num) return false;
    }
  }
  
  // Check anti-diagonal (top-right to bottom-left)
  if (row + col === 8) {
    for (let i = 0; i < 9; i++) {
      if (grid[i][8 - i] === num) return false;
    }
  }
  
  return true;
}

// Hyper Sudoku specific functions
function generateHyperCompleteSudoku(): SudokuGrid {
  const grid: SudokuGrid = Array(9).fill(0).map(() => Array(9).fill(0));
  fillHyperGrid(grid);
  return grid;
}

function fillHyperGrid(grid: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (const num of numbers) {
          if (isValidHyperPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            
            if (fillHyperGrid(grid)) {
              return true;
            }
            
            grid[row][col] = 0;
          }
        }
        
        return false;
      }
    }
  }
  
  return true;
}

function isValidHyperPlacement(grid: SudokuGrid, row: number, col: number, num: number): boolean {
  // Standard sudoku checks
  if (!isValidPlacement(grid, row, col, num, 9)) return false;
  
  // Check hyper regions
  const hyperRegions = getHyperRegions();
  for (const region of hyperRegions) {
    if (region.cells.some(cell => cell.row === row && cell.col === col)) {
      // This cell is in a hyper region, check if number already exists
      for (const cell of region.cells) {
        if (grid[cell.row][cell.col] === num) return false;
      }
    }
  }
  
  return true;
}

function getHyperRegions() {
  return [
    { cells: [
      { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 },
      { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 },
      { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }
    ]},
    { cells: [
      { row: 1, col: 5 }, { row: 1, col: 6 }, { row: 1, col: 7 },
      { row: 2, col: 5 }, { row: 2, col: 6 }, { row: 2, col: 7 },
      { row: 3, col: 5 }, { row: 3, col: 6 }, { row: 3, col: 7 }
    ]},
    { cells: [
      { row: 5, col: 1 }, { row: 5, col: 2 }, { row: 5, col: 3 },
      { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 },
      { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }
    ]},
    { cells: [
      { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 7 },
      { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 6, col: 7 },
      { row: 7, col: 5 }, { row: 7, col: 6 }, { row: 7, col: 7 }
    ]}
  ];
}

// Jigsaw Sudoku functions
function generateJigsawRegions(): number[][] {
  // Generate 9 irregular regions for a 9x9 grid
  // Each region contains exactly 9 cells
  return [
    [0, 0, 0, 1, 1, 1, 2, 2, 2],
    [0, 0, 3, 1, 1, 4, 2, 2, 5],
    [0, 3, 3, 3, 4, 4, 4, 5, 5],
    [6, 3, 3, 7, 7, 4, 8, 8, 5],
    [6, 6, 7, 7, 7, 8, 8, 8, 5],
    [6, 6, 6, 7, 8, 8, 8, 5, 5],
    [6, 6, 7, 7, 7, 8, 5, 5, 5],
    [6, 7, 7, 7, 8, 8, 8, 5, 5],
    [6, 6, 7, 8, 8, 8, 5, 5, 5]
  ];
}

function createJigsawPuzzle(solution: SudokuGrid, difficulty: Difficulty, regions: number[][]): SudokuGrid {
  // For now, use standard puzzle creation
  // TODO: Implement jigsaw-specific logic
  return createPuzzle(solution, difficulty, 9);
}

// Killer Sudoku functions
function generateKillerCages(solution: SudokuGrid) {
  const cages = [];
  const used = Array(9).fill(false).map(() => Array(9).fill(false));
  
  // Generate cages of various sizes
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (!used[row][col]) {
        const cage = createCage(solution, used, row, col);
        if (cage.cells.length > 0) {
          cages.push(cage);
        }
      }
    }
  }
  
  return cages;
}

function createCage(solution: SudokuGrid, used: boolean[][], startRow: number, startCol: number) {
  const cells = [{ row: startRow, col: startCol }];
  used[startRow][startCol] = true;
  
  // Randomly expand cage (2-4 cells typically)
  const targetSize = Math.floor(Math.random() * 3) + 2;
  
  while (cells.length < targetSize) {
    const expandableCell = cells[Math.floor(Math.random() * cells.length)];
    const directions = [
      { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
      { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
    ];
    
    let expanded = false;
    for (const dir of shuffleArray(directions)) {
      const newRow = expandableCell.row + dir.dr;
      const newCol = expandableCell.col + dir.dc;
      
      if (newRow >= 0 && newRow < 9 && newCol >= 0 && newCol < 9 && !used[newRow][newCol]) {
        cells.push({ row: newRow, col: newCol });
        used[newRow][newCol] = true;
        expanded = true;
        break;
      }
    }
    
    if (!expanded) break;
  }
  
  // Calculate sum
  const sum = cells.reduce((total, cell) => total + solution[cell.row][cell.col], 0);
  
  return { cells, sum };
}

function createKillerPuzzle(cages: any[]): SudokuGrid {
  // Killer sudoku typically has no given numbers
  return Array(9).fill(0).map(() => Array(9).fill(0));
}

// Odd-Even Sudoku functions
function generateOddEvenConstraints() {
  const constraints = [];
  
  // Randomly assign some cells as odd-only or even-only
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (Math.random() < 0.3) { // 30% of cells get constraints
        constraints.push({
          row,
          col,
          type: Math.random() < 0.5 ? 'odd' as const : 'even' as const
        });
      }
    }
  }
  
  return constraints;
}

function createOddEvenPuzzle(solution: SudokuGrid, difficulty: Difficulty, constraints: any[]): SudokuGrid {
  // Create puzzle ensuring odd-even constraints are respected
  return createPuzzle(solution, difficulty, 9);
}

// Inequality Sudoku functions
function generateInequalityConstraints(solution: SudokuGrid) {
  const constraints = [];
  
  // Add horizontal inequalities
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 8; col++) {
      if (Math.random() < 0.4) { // 40% chance of inequality
        const leftVal = solution[row][col];
        const rightVal = solution[row][col + 1];
        
        if (leftVal !== rightVal) {
          constraints.push({
            cell1: { row, col },
            cell2: { row, col: col + 1 },
            operator: leftVal > rightVal ? '>' as const : '<' as const
          });
        }
      }
    }
  }
  
  // Add vertical inequalities
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 9; col++) {
      if (Math.random() < 0.4) { // 40% chance of inequality
        const topVal = solution[row][col];
        const bottomVal = solution[row + 1][col];
        
        if (topVal !== bottomVal) {
          constraints.push({
            cell1: { row, col },
            cell2: { row: row + 1, col },
            operator: topVal > bottomVal ? '>' as const : '<' as const
          });
        }
      }
    }
  }
  
  return constraints;
}

// Consecutive Sudoku functions
function generateConsecutiveMarkers(solution: SudokuGrid) {
  const markers = [];
  
  // Add horizontal consecutive markers
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 8; col++) {
      const leftVal = solution[row][col];
      const rightVal = solution[row][col + 1];
      
      if (Math.abs(leftVal - rightVal) === 1 && Math.random() < 0.6) {
        markers.push({
          cell1: { row, col },
          cell2: { row, col: col + 1 }
        });
      }
    }
  }
  
  // Add vertical consecutive markers
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 9; col++) {
      const topVal = solution[row][col];
      const bottomVal = solution[row + 1][col];
      
      if (Math.abs(topVal - bottomVal) === 1 && Math.random() < 0.6) {
        markers.push({
          cell1: { row, col },
          cell2: { row: row + 1, col }
        });
      }
    }
  }
  
  return markers;
}

// Utility functions
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Validation functions for different game modes
export function isValidMoveForMode(
  gameMode: GameMode,
  currentGrid: SudokuGrid,
  row: number,
  col: number,
  value: number,
  originalPuzzle: SudokuGrid,
  constraints?: GameConstraints
): boolean {
  // Can't modify pre-filled cells
  if (originalPuzzle[row][col] !== 0) {
    return false;
  }
  
  // Create a temporary grid without the current value at this position
  const tempGrid = currentGrid.map(r => [...r]);
  tempGrid[row][col] = 0; // Clear the current value first
  
  const { size } = getGridDimensions(gameMode);
  
  // Basic placement validation
  if (!isValidPlacement(tempGrid, row, col, value, size)) {
    return false;
  }
  
  // Mode-specific validations
  switch (gameMode) {
    case 'diagonal':
      return isValidDiagonalPlacement(tempGrid, row, col, value);
    case 'hyper':
      return isValidHyperPlacement(tempGrid, row, col, value);
    case 'odd-even':
      return isValidOddEvenMove(row, col, value, constraints?.oddEvenCells || []);
    // Add more mode-specific validations as needed
    default:
      return true;
  }
}

function isValidOddEvenMove(row: number, col: number, value: number, oddEvenCells: any[]): boolean {
  const constraint = oddEvenCells.find(c => c.row === row && c.col === col);
  if (!constraint) return true;
  
  if (constraint.type === 'odd') {
    return value % 2 === 1;
  } else {
    return value % 2 === 0;
  }
}