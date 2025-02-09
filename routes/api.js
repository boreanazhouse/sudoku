'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  const solver = new SudokuSolver();
  const validate = puzzle => solver.validate(puzzle);
  const solve = puzzle => solver.solve(puzzle);

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;

      if (puzzle === undefined || coordinate === undefined || value === undefined) return res.json({ error: "Required field(s) missing" });
      // We will be using strings for this
      if (typeof puzzle !== "string" || typeof coordinate !== "string" || typeof value !== "string") return res.json({ error: "Expected field(s) to be typeof string" });
      // Cleanup
      const safePuzzle = puzzle.trim();
      const safeCoordinate = coordinate.trim();
      const safeValue = value.trim();

      // Verify schema of arguments
      if(!/^[1-9]$/.test(safeValue)) return res.json({ error: "Invalid value" });
      if (safePuzzle.length !== 81) return res.json({ error: "Expected puzzle to be 81 characters long" });
      if (!/^[0-9.]+$/.test(safePuzzle)) return res.json({ error: "Invalid characters in puzzle" });
      if (!/^[a-i][1-9]$/.test(safeCoordinate)) return res.json({ error: "Invalid coordinate" });


    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;
      // Verify schema of puzzle
      const validatePuzzle = validate(puzzle);
      if (validatePuzzle.error) return res.json(validatePuzzle);
      // Cleanup
      const safePuzzle = puzzle.trim();

      const isPuzzleSolved = solve(safePuzzle);
      if (isPuzzleSolved === false) return res.json({
        error: "Puzzle cannot be solved"
      })

      return res.json({
        solution: isPuzzleSolved
      })
    });
};
