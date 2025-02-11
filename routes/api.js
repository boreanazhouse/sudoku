'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');
const solver = new SudokuSolver();

module.exports = function (app) {
  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;
      // Check undefined
      if (puzzle === undefined || coordinate === undefined || value === undefined) return res.json({ error: "Required field(s) missing" });
      // Validate value
      const valueError = solver.checkValue(value);
      if (valueError) return res.json(valueError);
      // Validate coordinate
      const coordinateError = solver.checkCoordinate(coordinate);
      if (coordinateError) return res.json(coordinateError);
      // Validate puzzle
      const puzzleError = solver.validate(puzzle);
      if (puzzleError) return res.json(puzzleError);
      // Convert coordinate to row and col
      const { row, col } = solver.convertCoordinate(coordinate);
      // Check cell
      const canPutInCell = solver.checkCell(puzzle, row, col, value);
      if (canPutInCell) return res.json({ valid: true });
      // Check row
      const canPutInRow = solver.checkRowPlacement(puzzle, row, col, value);
      // Check col
      const canPutInCol = solver.checkColPlacement(puzzle, row, col, value);
      // Check region
      const canPutInRegion = solver.checkRegionPlacement(puzzle, row, col, value);
      // Conflict array
      let conflict = [];
      if(!canPutInRow) conflict.push("row");
      if(!canPutInCol) conflict.push("column");
      if(!canPutInRegion) conflict.push("region");
      // Return conditions
      const valid = canPutInRow && canPutInCol && canPutInRegion;

      return res.json(valid ? { valid } : { valid, conflict });
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;
      // Check undefined
      if (puzzle === undefined) return res.json({ error: "Required field missing" });
      // Validate puzzle
      const puzzleError = solver.validate(puzzle);
      if (puzzleError) return res.json(puzzleError);
      // Solve
      const solution = solver.solve(puzzle);
      if (solution.error) return res.json(solution);
      // Return
      return res.json(solution);
    });
};
