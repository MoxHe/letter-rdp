export type Token = { type: string; value: string };

/**
 * Tokenizer spec.
 */
const Spec: Array<[RegExp, string | null]> = [
  // -----------------------------------
  // Whitespaces:
  [/^\s+/, null],

  // -----------------------------------
  // Comments:

  //  Skip single-line comments:
  [/^\/\/.*/, null],

  // Skip multi-line comments:
  [/^\/\*[\s\S]*?\*\//, null],

  // -----------------------------------
  // Symbols, delimiters:
  [/^;/, ';'],
  [/^\{/, '{'],
  [/^\}/, '}'],
  [/^\(/, '('],
  [/^\)/, ')'],
  [/^,/, ','],
  [/^\./, '.'],
  [/^\[/, '['],
  [/^\]/, ']'],

  // -----------------------------------
  // Keywords:
  [/^\blet\b/, 'let'],
  [/^\bif\b/, 'if'],
  [/^\belse\b/, 'else'],
  [/^\btrue\b/, 'true'],
  [/^\bfalse\b/, 'false'],
  [/^\bnull\b/, 'null'],
  [/^\bwhile\b/, 'while'],
  [/^\bdo\b/, 'do'],
  [/^\bfor\b/, 'for'],
  [/^\bdef\b/, 'def'],
  [/^\breturn\b/, 'return'],
  [/^\bclass\b/, 'class'],
  [/^\bextends\b/, 'extends'],
  [/^\bsuper\b/, 'super'],
  [/^\bnew\b/, 'new'],
  [/^\bthis\b/, 'this'],

  // -----------------------------------
  // Numbers:
  [/^\d+/, 'NUMBER'],

  // -----------------------------------
  // Identifiers:
  [/^\w+/, 'IDENTIFIER'],

  // -----------------------------------
  // Equality operators: ==, !=
  [/^[=!]=/, 'EQUALITY_OPERATOR'],

  // -----------------------------------
  // Assignments operators: =, *=, /=, +=, -=,
  [/^=/, 'SIMPLE_ASSIGN'],
  [/^[\*\/\+\-]=/, 'COMPLEX_ASSIGN'],

  // -----------------------------------
  // Math operators: +, -, *, /
  [/^[+\-]/, 'ADDITIVE_OPERATOR'],
  [/^[*\/]/, 'MULTIPLICATIVE_OPERATOR'],


  // -----------------------------------
  // Relational operators: >, >=, <, <=
  [/^[><]=?/, 'ADDITIVE_OPERATOR'],

  // -----------------------------------
  // Logical operators: &&, ||, !
  [/^&&/, 'LOGICAL_AND'],
  [/^\|\|/, 'LOGICAL_OR'],
  [/^!/, 'LOGICAL_NOT'],

  // -----------------------------------
  // Strings:
  [/^"[^"]*"/, 'STRING'],
  [/^'[^']*'/, 'STRING'],
];

/**
 * Tokenizer class
 *
 * Lazily pulls a token from a stream.
 */
export default class Tokenizer {
  private _string: string;
  private _cursor: number;

  constructor() {
    this._string = '';
    this._cursor = 0;
  }

  /**
   * Initializes the string.
   */
  init(string: string): void {
    this._string = string;
  }

  /**
   * Whether the tokenizer reached EOF.
   */
  isEOF(): boolean {
    return this._cursor === this._string.length;
  }

  /**
   * Whether we still have more tokens.
   */
  hasMoreTokens(): boolean {
    return this._cursor < this._string.length;
  }

  /**
   * Obtains next token.
   */
  getNextToken(): Token | undefined {
    if (!this.hasMoreTokens()) {
      return undefined;
    }

    const string = this._string.slice(this._cursor);

    for (const [regexp, tokenType] of Spec) {
      const tokenValue = this._match(regexp, string);

      // can't match this rule, continue
      if (!tokenValue) {
        continue;
      }

      // Should skip token e.g. whitespacec.
      if (!tokenType) {
        return this.getNextToken();
      }

      return {
        type: tokenType,
        value: tokenValue,
      };
    }

    throw new SyntaxError(`Unexpected token: "${string[0]}".`);
  }

  _match(regexp: RegExp, string: string): string | null {
    const matched = regexp.exec(string);
    if (!matched) {
      return null;
    }
    this._cursor += matched[0].length;

    return matched[0];
  }
}
