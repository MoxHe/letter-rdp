import Parser from '../src/Parser';

/**
 * Main test runner.
 */

const parser = new Parser();

const program = `
  /**
   * Documentation
   */
   'hello'
`;

const ast = parser.parse(program);

console.log(JSON.stringify(ast, null, 2));



