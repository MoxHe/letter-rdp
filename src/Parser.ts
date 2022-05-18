import Tokenizer, { Token } from './Tokenizer';

type ProgramType = { type: string; body: StatementListType };
type LiteralType = StringLiteralType | NumericLiteralType;
type StringLiteralType = { type: string; value: string };
type NumericLiteralType = { type: string; value: number };
type StatementListType = Array<StatementType>;
type StatementType = ExpressionStatementType | BlockStatementType | EmptyStatementType;
type ExpressionStatementType = { type: string; expression: ExpressionType };
type BlockStatementType = { type: string; body: StatementListType };
type EmptyStatementType = { type: string };
type ExpressionType = LiteralType;

/**
 * Letter Parser: recursive descent implementation.
 */
export default class Parser {
  private _string: string;
  private _tokenizer: Tokenizer;
  private _lookahead: Token | null;

  /**
   * Initializes the parser.
   */
  constructor() {
    this._string = '';
    this._tokenizer = new Tokenizer();
    this._lookahead = null;
  }

  /**
   * Parses a string into an AST.
   */
  parse(string: string): ProgramType {
    this._string = string;
    this._tokenizer = new Tokenizer();
    this._tokenizer.init(this._string);

    // Prime the tokenizer to obtain the first
    // toekn which is our lookahead. The lookahead is
    // used for predictive parsing.
    this._lookahead = this._tokenizer.getNextToken();

    // Parse recursively starting form the main
    // entry point, the Program:

    return this.Program();
  }

  /**
   * Main entry point.
   *
   * Program
   *  : StatementList
   *  ;
   */
  Program(): ProgramType {
    return {
      type: 'Program',
      body: this.StatementList(),
    };
  }

  /**
   * StatementList
   *   : Statement
   *   | StatementList Statement -> Statement Statement Statement Statement
   *   ;
   */
  StatementList(stopLookahead: string | null = null): StatementListType {
    const statementList = [this.Statement()];

    while (this._lookahead && this._lookahead.type !== stopLookahead) {
      statementList.push(this.Statement());
    }

    return statementList;
  }

  /**
   * Statement
   *  : ExpressionStatement
   *  | BlockStatement
   *  | EmptyStatement
   *  ;
   */
  Statement(): StatementType {
    if (!this._lookahead) {
      throw new SyntaxError(`Unexpected end of input, expected: Statement`);
    }
    switch (this._lookahead.type) {
      case ';':
        return this.EmptyStatement();
      case '{':
        return this.BlockStatement();
      default:
        return this.ExpressionStatement();
    }
  }

  /**
   * EmptyStatement
   *   : ';'
   *   ;
   */
  EmptyStatement(): EmptyStatementType {
    this._eat(';');

    return {
      type: 'EmptyStatement',
    };
  }

  /**
   * BlockStatement
   *   : '{'  optStatementList '}'
   *   ;
   */
  BlockStatement(): BlockStatementType {
    this._eat('{');
    if (!this._lookahead) {
      throw new SyntaxError(`Unexpected end of input, expected: "}"`);
    }

    const body: StatementListType =
      this._lookahead.type !== '}' ? this.StatementList('}') : [];

    this._eat('}');

    return {
      type: 'BlockStatement',
      body,
    };
  }

  /**
   * ExpressionStatement
   *   : Expression ';'
   *   ;
   */
  ExpressionStatement(): ExpressionStatementType {
    const expression = this.Expression();
    this._eat(';');

    return {
      type: 'ExpressionStatement',
      expression,
    };
  }

  /**
   * Expression
   *   : Literal
   *   ;
   */
  Expression(): ExpressionType {
    return this.Literal();
  }

  /**
   * Literal
   *   : NumericLiteral
   *   | StringLiteral
   *   ;
   */
  Literal(): LiteralType {
    if (!this._lookahead) {
      throw new SyntaxError(`Unexpected end of input, expected: Literal`);
    }

    switch (this._lookahead.type) {
      case 'NUMBER':
        return this.NumericLiteral();
      case 'STRING':
        return this.StringLiteral();
    }

    throw new SyntaxError(`Literal: unexpected literal production`);
  }

  /**
   * StringLiteral
   *   : STRING
   *   ;
   */
  StringLiteral(): StringLiteralType {
    const token = this._eat('STRING');
    return {
      type: 'StringLiteral',
      value: token.value.slice(1, -1),
    };
  }

  /**
   * NumericLiteral
   *  : NUMBER
   *  ;
   */
  NumericLiteral(): NumericLiteralType {
    const token = this._eat('NUMBER');
    return {
      type: 'NumericLiteral',
      value: Number(token.value),
    };
  }

  /**
   * Expects a token of a given type.
   */
  _eat(tokenType: string): Token {
    const token = this._lookahead;

    if (token === null) {
      throw new SyntaxError(
        `Unexpected end of input, expected: "${tokenType}"`
      );
    }

    if (token.type !== tokenType) {
      throw new SyntaxError(
        `Unexpected token: "${token.value}", expected: "${tokenType}"`
      );
    }

    // Advance to next token.
    this._lookahead = this._tokenizer.getNextToken();

    return token;
  }
}
