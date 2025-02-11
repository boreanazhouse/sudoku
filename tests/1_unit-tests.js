const chai = require('chai');
const assert = chai.assert;
const SudokuSolver = require('../controllers/sudoku-solver.js');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');
suite('Unit Tests', () => {
  let solver;

  suiteSetup(() => {
    solver = new SudokuSolver();
  });

  const [puzzle, solution] = puzzlesAndSolutions[0]; 

  test('Logic handles a valid puzzle string of 81 characters', () => {
    const result = solver.validate(puzzle);
  
    assert.isNull(result, 'Valid puzzle should return null');
  });

  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
    const invalidPuzzle = '1.5..2.84..63.12.7...1..6..7.1...5...98.1....4..A..8.3.2.....4..5..2.....8.6'; // Contains 'A'
    const result = solver.validate(invalidPuzzle);
    
    assert.deepEqual(result, { error: "Invalid characters in puzzle" }, 'Puzzle with invalid characters should return an error');
  });

  test('Logic handles a puzzle string that is not 81 characters in length', () => {
    const shortPuzzle = '1.5..2.84..63.12.7...1..6..7.1...5...98.1.'; // Too short
    const longPuzzle = '1.5..2.84..63.12.7...1..6..7.1...5...98.1....4....8.3.2.....4..5..2.....8.6123'; // Too long
  
    assert.deepEqual(solver.validate(shortPuzzle), { error: "Expected puzzle to be 81 characters long" }, 'Short puzzle should return length error');
    assert.deepEqual(solver.validate(longPuzzle), { error: "Expected puzzle to be 81 characters long" }, 'Long puzzle should return length error');
  });

  test('Logic handles a valid row placement', () => {
    assert.isTrue(solver.checkRowPlacement(puzzle, 0, 1, "3"), 'Valid row placement should return true');
  });

  test('Logic handles an invalid row placement', () => {
    assert.isFalse(solver.checkRowPlacement(puzzle, 0, 1, "5"), 'Invalid row placement should return false');
  });

  test('Logic handles a valid column placement', () => {
    assert.isTrue(solver.checkColPlacement(puzzle, 0, 1, "4"), 'Valid column placement should return true');
  });

  test('Logic handles an invalid column placement', () => {
    assert.isFalse(solver.checkColPlacement(puzzle, 0, 2, "9"));
  });

  test('Logic handles a valid region (3x3 grid) placement', () => {
    assert.isTrue(solver.checkRegionPlacement(puzzle, 0, 1, "4"), 'Valid region placement should return true');
  });

  test('Logic handles an invalid region (3x3 grid) placement', () => {
    assert.isFalse(solver.checkRegionPlacement(puzzle, 0, 1, "2"), 'Invalid region placement should return false');
  });

  test('Valid puzzle strings pass the solver', () => {
    // Example of a valid, solvable puzzle
    const result = solver.solve(puzzle);

    assert.property(result, 'solution', 'Solver should return an object with a solution property');
    assert.isString(result.solution, 'Solution property should be a string');
    assert.lengthOf(result.solution, 81, 'Solution should be 81 characters long');
  });

  test('Invalid puzzle strings fail the solver', () => {
    const invalidPuzzle = '999999999999999999999999999999999999999999999999999999999999999999999999999999';
    const result = solver.solve(invalidPuzzle);
  
    assert.property(result, 'error');
    assert.strictEqual(result.error, 'Puzzle cannot be solved');
  });

  test('Solver returns the expected solution for an incomplete puzzle', () => {
    // Example from your puzzlesAndSolutions array
    const puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    const expectedSolution = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';

    const result = solver.solve(puzzle);

    assert.property(result, 'solution', 'Solver should return a solution');
    assert.strictEqual(result.solution, expectedSolution, 'Solver should return the correct solution for the puzzle');
  });
});