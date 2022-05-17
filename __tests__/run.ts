import Parser from '../src/Parser';
import literalTests from './literals-test';
import statementListTest from './statement-list-test';
import assert from 'assert';

/**
 * Main test runner.
 */

/**
 * List of tests
 */
const tests = [literalTests, statementListTest]

const parser = new Parser();

/**
 * For manual test
 */
export function exec(): void {
  const program = `
  /**
   * Documentation
   */
   'hello';

   // Number
   42;
`;
  const ast = parser.parse(program);

  console.log(JSON.stringify(ast, null, 2));
}

exec();

/**
 * Test function.
 */
function test(program: string, expected: object): void {
   const ast = parser.parse(program);
   assert.deepStrictEqual(ast, expected)
}

// Run all tests:
tests.forEach(testRun => testRun(test));

console.log('All assertions passed!');
