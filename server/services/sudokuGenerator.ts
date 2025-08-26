type SudokuGrid = number[][];

export function generateSudoku(difficulty: string): { puzzle: SudokuGrid; solution: SudokuGrid } {
  // Generate a complete valid Sudoku grid
  const solution = generateCompleteSudoku();
  
  // Create puzzle by removing numbers based on difficulty
  const puzzle = createPuzzle(solution, difficulty);
  
  return { puzzle, solution };
}

function generateCompleteSudoku(): SudokuGrid {
  const grid: SudokuGrid = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // Fill the grid using backtracking
  fillGrid(grid);
  
  return grid;
}

function fillGrid(grid: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (const num of numbers) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            
            if (fillGrid(grid)) {
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

function isValidPlacement(grid: SudokuGrid, row: number, col: number, num: number): boolean {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false;
  }
  
  // Check column
  for (let i = 0; i < 9; i++) {
    if (grid[i][col] === num) return false;
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (grid[i][j] === num) return false;
    }
  }
  
  return true;
}

function createPuzzle(solution: SudokuGrid, difficulty: string): SudokuGrid {
  const puzzle = solution.map(row => [...row]);
  
  // Number of cells to remove based on difficulty
  const cellsToRemove = {
    easy: 35,
    medium: 45,
    hard: 55,
    expert: 65
  }[difficulty] || 45;
  
  // Randomly remove cells
  const positions = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
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

export function solveSudoku(grid: SudokuGrid): SudokuGrid | null {
  const solution = grid.map(row => [...row]);
  
  if (fillGrid(solution)) {
    return solution;
  }
  
  return null;
}

export function isValidMove(
  currentGrid: SudokuGrid,
  row: number,
  col: number,
  value: number,
  originalPuzzle: SudokuGrid
): boolean {
  // Can't modify pre-filled cells
  if (originalPuzzle[row][col] !== 0) {
    return false;
  }
  
  // Create a temporary grid without the current value at this position
  const tempGrid = currentGrid.map(r => [...r]);
  tempGrid[row][col] = 0; // Clear the current value first
  
  return isValidPlacement(tempGrid, row, col, value);
}

export function getHint(currentGrid: SudokuGrid, solution: SudokuGrid): { row: number; col: number; value: number } | null {
  // Find empty cells
  const emptyCells = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (currentGrid[row][col] === 0) {
        emptyCells.push({ row, col, value: solution[row][col] });
      }
    }
  }
  
  if (emptyCells.length === 0) return null;
  
  // Return a random empty cell with its solution
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
