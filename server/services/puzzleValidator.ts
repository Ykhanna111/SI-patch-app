type SudokuGrid = number[][];

export function hasUniqueSolution(puzzle: SudokuGrid, gameMode: string = 'standard'): boolean {
  const size = puzzle.length;
  if (size === 0 || puzzle[0].length !== size) return false;
  
  let solutionCount = 0;
  const maxSolutions = 2;
  
  function countSolutions(grid: SudokuGrid): void {
    if (solutionCount >= maxSolutions) return;
    
    const emptyCell = findEmptyCell(grid);
    if (!emptyCell) {
      solutionCount++;
      return;
    }
    
    const [row, col] = emptyCell;
    const maxNum = size;
    
    for (let num = 1; num <= maxNum; num++) {
      if (isValidPlacement(grid, row, col, num, gameMode, size)) {
        grid[row][col] = num;
        countSolutions(grid);
        grid[row][col] = 0;
        
        if (solutionCount >= maxSolutions) return;
      }
    }
  }
  
  const gridCopy = puzzle.map(row => [...row]);
  countSolutions(gridCopy);
  
  return solutionCount === 1;
}

function findEmptyCell(grid: SudokuGrid): [number, number] | null {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === 0) {
        return [row, col];
      }
    }
  }
  return null;
}

function isValidPlacement(grid: SudokuGrid, row: number, col: number, num: number, gameMode: string, size: number): boolean {
  for (let i = 0; i < size; i++) {
    if (grid[row][i] === num) return false;
  }
  
  for (let i = 0; i < size; i++) {
    if (grid[i][col] === num) return false;
  }
  
  let boxRowSize: number, boxColSize: number;
  if (size === 4) {
    boxRowSize = 2;
    boxColSize = 2;
  } else if (size === 6) {
    boxRowSize = 2;
    boxColSize = 3;
  } else if (size === 9) {
    boxRowSize = 3;
    boxColSize = 3;
  } else if (size === 16) {
    boxRowSize = 4;
    boxColSize = 4;
  } else {
    const sqrt = Math.sqrt(size);
    boxRowSize = Math.floor(sqrt);
    boxColSize = Math.ceil(sqrt);
  }
  
  const boxRow = Math.floor(row / boxRowSize) * boxRowSize;
  const boxCol = Math.floor(col / boxColSize) * boxColSize;
  
  for (let i = boxRow; i < boxRow + boxRowSize && i < size; i++) {
    for (let j = boxCol; j < boxCol + boxColSize && j < size; j++) {
      if (grid[i][j] === num) return false;
    }
  }
  
  if (gameMode === 'diagonal' && size === 9) {
    if (row === col) {
      for (let i = 0; i < 9; i++) {
        if (grid[i][i] === num) return false;
      }
    }
    
    if (row + col === 8) {
      for (let i = 0; i < 9; i++) {
        if (grid[i][8 - i] === num) return false;
      }
    }
  }
  
  return true;
}

export function validateMoveAgainstSolution(
  solution: SudokuGrid,
  row: number,
  col: number,
  value: number
): boolean {
  if (!solution || solution.length === 0) return false;
  if (row < 0 || row >= solution.length) return false;
  if (col < 0 || col >= solution[0].length) return false;
  if (value < 1) return false;
  
  return solution[row][col] === value;
}

export function checkPuzzleCompletion(
  currentState: SudokuGrid,
  solution: SudokuGrid
): boolean {
  if (!currentState || !solution) return false;
  if (currentState.length !== solution.length) return false;
  
  for (let row = 0; row < solution.length; row++) {
    if (!currentState[row] || currentState[row].length !== solution[row].length) {
      return false;
    }
    for (let col = 0; col < solution[row].length; col++) {
      if (currentState[row][col] !== solution[row][col]) {
        return false;
      }
    }
  }
  
  return true;
}

export function validatePuzzleIntegrity(puzzle: SudokuGrid, solution: SudokuGrid): boolean {
  if (!puzzle || !solution) return false;
  if (puzzle.length === 0 || solution.length === 0) return false;
  if (puzzle.length !== solution.length) return false;
  
  for (let row = 0; row < puzzle.length; row++) {
    if (!puzzle[row] || !solution[row]) return false;
    if (puzzle[row].length !== solution[row].length) return false;
    
    for (let col = 0; col < puzzle[row].length; col++) {
      if (puzzle[row][col] !== 0 && puzzle[row][col] !== solution[row][col]) {
        return false;
      }
    }
  }
  
  return true;
}

export function isPuzzleDuplicate(
  newPuzzle: SudokuGrid,
  existingPuzzles: SudokuGrid[]
): boolean {
  if (!newPuzzle || !existingPuzzles) return false;
  
  for (const existing of existingPuzzles) {
    if (arePuzzlesEqual(newPuzzle, existing)) {
      return true;
    }
  }
  return false;
}

function arePuzzlesEqual(puzzle1: SudokuGrid, puzzle2: SudokuGrid): boolean {
  if (!puzzle1 || !puzzle2) return false;
  if (puzzle1.length !== puzzle2.length) return false;
  
  for (let row = 0; row < puzzle1.length; row++) {
    if (!puzzle1[row] || !puzzle2[row]) return false;
    if (puzzle1[row].length !== puzzle2[row].length) return false;
    
    for (let col = 0; col < puzzle1[row].length; col++) {
      if (puzzle1[row][col] !== puzzle2[row][col]) {
        return false;
      }
    }
  }
  
  return true;
}
