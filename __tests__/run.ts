import Parser from '../src/Parser';
import literalTests from './literals-test';
import statementListTest from './statement-list-test';
import blockTest from './block-test';
import emptyStatementTest from './empty-statement-test';
import assert from 'assert';

/**
 * Main test runner.
 */

/**
 * List of tests
 */
const tests = [literalTests, statementListTest, blockTest, emptyStatementTest];

const parser = new Parser();

/**
 * For manual test
 */
export function exec(): void {
  const program = `
  x + x;
`;
  const ast = parser.parse(program);

  console.log(JSON.stringify(ast, null, 2));
}

// Manual test
exec();

/**
 * Test function.
 */
function test(program: string, expected: object): void {
  const ast = parser.parse(program);
  assert.deepStrictEqual(ast, expected);
}

// Run all tests:
tests.forEach((testRun) => testRun(test));

console.log('All assertions passed!');
