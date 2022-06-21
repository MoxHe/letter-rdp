import Parser from '../src/Parser';
import literalTests from './literals-test';
import statementListTest from './statement-list-test';
import blockTest from './block-test';
import emptyStatementTest from './empty-statement-test';
import mathTest from './math-test';
import assignmentTest from './assignment-test';
import variableTest from './variable-test';
import ifTest from './if-test';
import relationalTests from './relational-test';
import equalityTest from './equality-test';
import logicalTests from './logical-test';
import unaryTest from './unary-test';
import assert from 'assert';
import whileTest from './while-test';
import doWhileTest from './do-while-test';
import forTest from './for-test';
import functionDeclarationTest from './function-declaration';
import memberTest from './member-test';
import callTest from './call-test';
import classTest from './class-test';

/**
 * Main test runner.
 */

/**
 * List of tests
 */
const tests = [
  literalTests,
  statementListTest,
  blockTest,
  emptyStatementTest,
  mathTest,
  assignmentTest,
  variableTest,
  ifTest,
  relationalTests,
  equalityTest,
  logicalTests,
  unaryTest,
  whileTest,
  doWhileTest,
  forTest,
  functionDeclarationTest,
  memberTest,
  callTest,
  classTest
];

const parser = new Parser();

/**
 * For manual test
 */
export function exec(): void {
  const program = `

    class Point {
      def constructor(x, y) {
        this.x = x;
        this.y = y;
      }

      def calc() {
        return this.x + this.y;
      }
    }
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
