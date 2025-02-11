class SudokuSolver {

  validate(puzzle) {
    if (/[^1-9.]/.test(puzzle)) return { error: "Invalid characters in puzzle" };
    if (puzzle.length !== 81) return { error: "Expected puzzle to be 81 characters long" };
    
    return null;
  }

  checkCoordinate(coordinate) {
    coordinate = coordinate.toUpperCase();
    if(!/^[A-I][1-9]$/.test(coordinate)) return { error: "Invalid coordinate" };

    return null;
  }

  checkValue(value) {
    if(!/^[1-9]$/.test(value)) return { error: "Invalid value" };
    
    return null;
  }

  convertCoordinate(coordinate) {
    const [letter, digit] = coordinate.toUpperCase().split("");
    const row = letter.charCodeAt(0) - 65;
    const col = parseInt(digit, 10) - 1;

    return { row, col };
  }

  checkCell(puzzle, row, col, value) {
    return puzzle[row * 9 + col] === value;
  }

  checkRowPlacement(puzzle, row, column, value) {
    const rowValues = puzzle.slice(row * 9, row * 9 + 9).split("");
    return !rowValues.includes(value);
  }

  checkColPlacement(puzzleString, row, column, value) {
    // Create an empty array of length 9
    // Use some to extract the index positions of values in an arbitrary column
    // Compare the values of the derived indicies user input
    // If the value exists, some returns true
    // Meaning column cannot accept user input, so we prepend ! to return false
    // False: column cannot accept user input 
    return ![...Array(9)].some((_, r) => puzzleString[(r * 9) + column] === value);
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const boxRowStart = Math.floor(row / 3) * 3;
    const boxColStart = Math.floor(column / 3) * 3;

    return ![...Array(3)].some((_, r) => 
        [...Array(3)].some((_, c) => 
            puzzleString[(boxRowStart + r) * 9 + (boxColStart + c)] === value
      )
    );  
  }

  solve(puzzle) {
    // Convert puzzle string -> 2D grid
    const grid = [];
    for (let r = 0; r < 9; r++) {
      grid[r] = puzzle.slice(r * 9, r * 9 + 9).split("");
    }
  
    // Helper to convert current grid -> puzzle string
    const convertGridToString = (g) => g.map(row => row.join("")).join("");
  
    // The backtracking function
    const backtrack = () => {
      // 1. Find the next empty cell (denoted by '.')
      let row = -1;
      let col = -1;
      let foundEmpty = false;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r][c] === ".") {
            row = r;
            col = c;
            foundEmpty = true;
            break;
          }
        }
        if (foundEmpty) break;
      }
  
      // 2. If no empty cell is found, the grid is fully filled.
      //    Validate the filled grid. If it’s invalid, return false.
      if (!foundEmpty) {
        if (this.isGridValid(grid)) {
          return true;
        } else {
          return false;
        }
      }
  
      // 3. Try digits 1 through 9 in the empty cell
      for (let num = 1; num <= 9; num++) {
        const charVal = String(num);
        // Build a temporary puzzle string from the current grid for checks
        const tempPuzzle = convertGridToString(grid);
  
        if (
          this.checkRowPlacement(tempPuzzle, row, col, charVal) &&
          this.checkColPlacement(tempPuzzle, row, col, charVal) &&
          this.checkRegionPlacement(tempPuzzle, row, col, charVal)
        ) {
          grid[row][col] = charVal; // Place the digit
  
          if (backtrack()) {
            return true;
          }
  
          // Undo the placement if it doesn't lead to a solution
          grid[row][col] = ".";
        }
      }
      // 4. If no digit works, trigger backtracking.
      return false;
    };
  
    // Run the backtracking solver
    const success = backtrack();
    if (!success) {
      return { error: "Puzzle cannot be solved" };
    }
  
    // Convert the solved grid back to a string and return it.
    const solvedString = convertGridToString(grid);
    return { solution: solvedString };
  }
  
  isGridValid(grid) {
    // Validate each row
    for (let r = 0; r < 9; r++) {
      const seen = new Set();
      for (let c = 0; c < 9; c++) {
        const val = grid[r][c];
        if (val !== ".") {
          if (seen.has(val)) return false;
          seen.add(val);
        }
      }
    }
    // Validate each column
    for (let c = 0; c < 9; c++) {
      const seen = new Set();
      for (let r = 0; r < 9; r++) {
        const val = grid[r][c];
        if (val !== ".") {
          if (seen.has(val)) return false;
          seen.add(val);
        }
      }
    }
    // Validate each 3x3 region
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {
      for (let boxCol = 0; boxCol < 9; boxCol += 3) {
        const seen = new Set();
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const val = grid[boxRow + r][boxCol + c];
            if (val !== ".") {
              if (seen.has(val)) return false;
              seen.add(val);
            }
          }
        }
      }
    }
    return true;
  }
}

module.exports = SudokuSolver;
