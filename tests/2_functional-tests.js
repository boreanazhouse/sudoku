const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

// Example puzzle strings for testing:
const validPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
const validPuzzleSolution = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';

chai.use(chaiHttp);

suite('Functional Tests', () => {

  suite('POST /api/solve', () => {

    test('Solve a puzzle with valid puzzle string', (done) => {
      chai.request(server)
        .post('/api/solve')
        .send({ puzzle: validPuzzle })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'solution');
          assert.isString(res.body.solution);
          // If you know the exact solution:
          // assert.equal(res.body.solution, validPuzzleSolution);
          done();
        });
    });

    test('Solve a puzzle with missing puzzle string', (done) => {
      chai.request(server)
        .post('/api/solve')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'Required field missing');
          done();
        });
    });

    test('Solve a puzzle with invalid characters', (done) => {
      const puzzleWithInvalidChars = '1.5..2.84..63.12.7.2..5....Z..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
      chai.request(server)
        .post('/api/solve')
        .send({ puzzle: puzzleWithInvalidChars })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'Invalid characters in puzzle');
          done();
        });
    });

    test('Solve a puzzle with incorrect length', (done) => {
      const shortPuzzle = validPuzzle.slice(0, 80); // 80 chars instead of 81
      chai.request(server)
        .post('/api/solve')
        .send({ puzzle: shortPuzzle })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'Expected puzzle to be 81 characters long');
          done();
        });
    });

    test('Solve a puzzle that cannot be solved', (done) => {
      const unsolvablePuzzle = '9'.repeat(81); // All '9', definitely invalid
      chai.request(server)
        .post('/api/solve')
        .send({ puzzle: unsolvablePuzzle })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'Puzzle cannot be solved');
          done();
        });
    });

  });

  suite('POST /api/check', () => {

    test('Check a puzzle placement with all fields', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'A1',
          value: '7'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'valid', true);
          done();
        });
    });

    test('Check a puzzle placement with single placement conflict', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'A3',
           value: '5'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'valid', false);
          assert.isArray(res.body.conflict);
          assert.lengthOf(res.body.conflict, 1);
          done();
        });
    });

    test('Check a puzzle placement with multiple placement conflicts', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'A1',
          value: '8' // Suppose '8' conflicts with row AND region, etc.
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'valid', false);
          assert.isArray(res.body.conflict);
          // For example, row & region => 2 conflicts
          assert.isAtLeast(res.body.conflict.length, 2);
          done();
        });
    });

    test('Check a puzzle placement with all placement conflicts', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'A1',
          value: '9' // Suppose '9' conflicts in row, column, and region
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'valid', false);
          assert.isArray(res.body.conflict);
          // Expect it to conflict in row, column, region => 3
          assert.lengthOf(res.body.conflict, 3);
          done();
        });
    });

    test('Check a puzzle placement with missing required fields', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({
          // Omit "value" for example
          puzzle: validPuzzle,
          coordinate: 'A1'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'Required field(s) missing');
          done();
        });
    });

    test('Check a puzzle placement with invalid characters', (done) => {
      const puzzleWithInvalidChars = validPuzzle.replace('.', 'Z');
      chai.request(server)
        .post('/api/check')
        .send({
          puzzle: puzzleWithInvalidChars,
          coordinate: 'A1',
          value: '5'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'Invalid characters in puzzle');
          done();
        });
    });

    test('Check a puzzle placement with incorrect length', (done) => {
      const shortPuzzle = validPuzzle.slice(0, 80);
      chai.request(server)
        .post('/api/check')
        .send({
          puzzle: shortPuzzle,
          coordinate: 'A1',
          value: '5'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'Expected puzzle to be 81 characters long');
          done();
        });
    });

    test('Check a puzzle placement with invalid placement coordinate', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'Z1', // Invalid letter
          value: '5'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'Invalid coordinate');
          done();
        });
    });

    test('Check a puzzle placement with invalid placement value', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({
          puzzle: validPuzzle,
          coordinate: 'A1',
          value: '0' // or '10' or 'X'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'Invalid value');
          done();
        });
    });

  });

});