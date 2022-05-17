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
  // Numbers:
  [/^\d+/, 'NUMBER'],

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
  private _string = '';
  private _cursor = 0;

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
  getNextToken(): Token | null {
    if (!this.hasMoreTokens()) {
      return null;
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
