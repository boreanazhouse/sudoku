class SudokuSolver {

  validate(puzzleString) {
    if (puzzleString === undefined) return { error: "Required field missing" };
    // Using strings for this
    if (typeof puzzleString !== "string") return { error: "Expected puzzle to be a typeof string" };
    // Cleanup
    const safePuzzle = puzzleString.trim();
    // Checks
    if (safePuzzle.length !== 81) return { error: "Expected puzzle to be 81 characters long" };
    if (!/^[0-9.]+$/.test(safePuzzle)) return { error: "Invalid characters in puzzle" };

    return {
      valid: true
    };
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const rowStart = (row * 9);
    const rowEnd = (rowStart + 9);
    const rowValues = puzzleString.slice(rowStart, rowEnd).split("");

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

  solve(puzzleString) {
    const puzzleArray = puzzleString.split("");
  
    function findEmptyCell() {
      return puzzleArray.indexOf(".");
    }
  
    function backtrack() { // ✅ Regular function so `this` works
      const emptyIndex = findEmptyCell();
      
      if (emptyIndex === -1) {
        return true; // No empty cells left → SOLVED!
      }
  
      const row = Math.floor(emptyIndex / 9);
      const col = emptyIndex % 9;
  
      for (let num = 1; num <= 9; num++) {
        const value = String(num);
  
        if (
          this.checkRowPlacement(puzzleArray.join(""), row, col, value) &&
          this.checkColPlacement(puzzleArray.join(""), row, col, value) &&
          this.checkRegionPlacement(puzzleArray.join(""), row, col, value)
        ) {
          puzzleArray[emptyIndex] = value; 
          
          if (backtrack.call(this)) {  // ✅ Call `this` explicitly
            return true; // If solved, return success
          }
          
          puzzleArray[emptyIndex] = "."; // Undo move (backtrack)
        }
      }
  
      return false; // No solution found
    }
  
    if (!backtrack.call(this)) { // ✅ Ensure `this` is preserved
      return false; // Puzzle is unsolvable
    }
  
    return puzzleArray.join(""); // Return solved puzzle
  }
}

module.exports = SudokuSolver;

