import Tokenizer, { Token } from './Tokenizer';
import * as Types from './types';

/**
 * Letter Parser: recursive descent implementation.
 */
export default class Parser {
  private _string: string;
  private _tokenizer: Tokenizer;
  private _lookahead?: Token;

  /**
   * Initializes the parser.
   */
  constructor() {
    this._string = '';
    this._tokenizer = new Tokenizer();
    this._lookahead = undefined;
  }

  /**
   * Parses a string into an AST.
   */
  parse(string: string): Types.ProgramType {
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
  Program(): Types.ProgramType {
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
  StatementList(stopLookahead: string | null = null): Types.StatementListType {
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
   *  | VariableStatement
   *  | IfStatement
   *  ;
   */
  Statement(): Types.StatementType {
    switch (this._lookahead?.type) {
      case ';':
        return this.EmptyStatement();
      case 'if':
        return this.IfStatement();
      case '{':
        return this.BlockStatement();
      case 'let':
        return this.VariableStatement();
      default:
        return this.ExpressionStatement();
    }
  }

  /**
   * IfStatement
   *   : 'if' '(' Expression ')' Statement
   *   | 'if' '(' Expression ')' Statement 'else' Statement
   *   ;
   */
  IfStatement(): Types.IfStatementType {
    this._eat('if');

    this._eat('(');
    const test = this.Expression();
    this._eat(')');

    const consequent = this.Statement();

    const alternate = this._lookahead && this._lookahead.type === 'else'
      ? this._eat('else') && this.Statement()
      : null;

    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate,
    }
  }

    /**
   * VariableStatement
   * : 'let' VariableDeclarationList ';'
   * ;
   */
  VariableStatement(): Types.VariableStatementType {
    this._eat('let');
    const declarations = this.VariableDeclarationList();
    this._eat(';');

    return {
      type: 'VariableStatement',
      declarations,
    };
  }

  /**
   * VariableDeclarationList
   * : VariableDeclaration
   * | VariableDeclarationList ',' VariableDeclaration
   * ;
   */
  VariableDeclarationList(): Types.VariableDeclarationType[] {
    const declarations = [];

    do {
      declarations.push(this.VariableDeclaration());
    } while (this._lookahead?.type === ',' && this._eat(','));

    return declarations;
  }

  /**
   * VariableDeclaration
   *  : Identifier OptVariableInitializer
   *  ;
   */
  VariableDeclaration(): Types.VariableDeclarationType {
    const id = this.Identifier();

    // OptVariableInitializer
    const init = this._lookahead && this._lookahead.type !== ';' && this._lookahead?.type !== ','
    ? this.VariableInitializer()
    : null;

    return {
      type: 'VariableDeclaration',
      id,
      init,
    }
  }

  /**
   * VariableInitializer
   *  : SIMPLE_ASSIGN AssignmentExpression
   *  ;
   */
  VariableInitializer(): Types.AssignmentExpressionType {
    this._eat('SIMPLE_ASSIGN');

    return this.AssignmentExpression();
  }

  /**
   * EmptyStatement
   *   : ';'
   *   ;
   */
  EmptyStatement(): Types.EmptyStatementType {
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
  BlockStatement(): Types.BlockStatementType {
    this._eat('{');

    const body: Types.StatementListType =
      this._lookahead?.type !== '}' ? this.StatementList('}') : [];

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
  ExpressionStatement(): Types.ExpressionStatementType {
    const expression: Types.ExpressionType = this.Expression();
    this._eat(';');

    return {
      type: 'ExpressionStatement',
      expression,
    };
  }

  /**
   * Expression
   *   : AssignmentExpression
   *   ;
   */
  Expression(): Types.ExpressionType {
    return this.AssignmentExpression();
  }

  /**
   * AssignmentExpression
   *   : RelationalExpression
   *   | LeftHandSideExpression AssignmentOperator AssignmentExpression
   *   ;
   */
  AssignmentExpression(): Types.AssignmentExpressionType {
    const left = this.AdditiveExpression();

    if (!this._isAssignmentOperator(this._lookahead?.type)) {
      return left;
    }

    return {
      type: 'AssignmentExpression',
      operator: this.AssignmentOperator().value,
      left: this._checkValidAssignmentTarget(left),
      right: this.AssignmentExpression(),
    };
  }

  /**
   * LeftHandSideExpression
   * : Identifier
   * ;
   */
  LeftHandSideExpression(): Types.IdentifierType {
    return this.Identifier();
  }

  /**
   * Identifier
   * : IDENTIFIER
   * ;
   */
  Identifier(): Types.IdentifierType {
    const name = this._eat('IDENTIFIER').value;

    return {
      type: 'Identifier',
      name,
    };
  }

  /**
   * Extra check whether it's a valid assinment target.
   */
  _checkValidAssignmentTarget(
    node: Types.BinaryExpressionType
  ): Types.IdentifierType {
    if (node.type === 'Identifier') {
      return node;
    }

    throw new SyntaxError('Invalid left-hand side assignment expression.');
  }

  /**
   * Whether the token is an assignment operator.
   */
  _isAssignmentOperator(tokenType?: string): boolean {
    return tokenType === 'SIMPLE_ASSIGN' || tokenType === 'COMPLEX_ASSIGN';
  }

  /**
   * AssignmentOperator
   * : SIMPLE_ASSIGN
   * | COMPLEX_ASSIGN
   * ;
   */
  AssignmentOperator(): Token {
    if (this._lookahead?.type === 'SIMPLE_ASSIGN') {
      return this._eat('SIMPLE_ASSIGN');
    }

    return this._eat('COMPLEX_ASSIGN');
  }

  /**
   * RELATIONAL_OPERATOR: >, >=, <, <=
   *
   *   x > y
   *   x >= y
   *   x < y
   *   x <= y
   *
   * RelationalExpression
   *   : AdditiveExpression
   *   | AdditiveExpression RELATIONAL_OPERATOR RelationalExpression
   *   ;
   */
  RelationalExpression(): Types.BinaryExpressionType {
    return this._BinaryExpression('AdditiveExpression', 'RELATIONAL_OPERATOR');
  }

  /**
   * AdditiveExpression
   *   : MultiplicativeExpression
   *   | AdditiveExpression ADDITIVE_OPERATOR MultiplicativeExpression -> MultiplicativeExpression ADDITIVE_OPERATOR MultiplicativeExpression ADDITIVE_OPERATOR MultiplicativeExpression
   *   ;
   */
  AdditiveExpression(): Types.BinaryExpressionType {
    return this._BinaryExpression(
      'MultiplicativeExpression',
      'ADDITIVE_OPERATOR'
    );
  }

  /**
   * MultiplicativeExpression
   *   : PrimaryExpression
   *   | MultiplicativeExpression MULTIPLICATIVE_OPERATOR PrimaryExpression -> PrimaryExpression ADDITIVE_OPERATOR PrimaryExpression ADDITIVE_OPERATOR PrimaryExpression
   *   ;
   */
  MultiplicativeExpression(): Types.BinaryExpressionType {
    return this._BinaryExpression(
      'PrimaryExpression',
      'MULTIPLICATIVE_OPERATOR'
    );
  }

  /**
   * Generic binary expression
   */
  _BinaryExpression(
    builderName: 'MultiplicativeExpression' | 'PrimaryExpression' | 'AdditiveExpression',
    operatorToken: 'ADDITIVE_OPERATOR' | 'MULTIPLICATIVE_OPERATOR' | 'RELATIONAL_OPERATOR'
  ): Types.BinaryExpressionType {
    let left = this[builderName]();

    while (this._lookahead?.type === operatorToken) {
      // Operator: +, -, *, /
      const operator = this._eat(operatorToken).value;

      const right = this[builderName]();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  /**
   * PrimaryExpression
   *  : Literal
   *  | ParenthesizedExpression
   *  | LeftHandSideExpression
   *  ;
   */
  PrimaryExpression(): Types.ExpressionType {
    if (this._isLiteral(this._lookahead?.type)) {
      return this.Literal();
    }
    switch (this._lookahead?.type) {
      case '(':
        return this.ParenthesizedExpression();
      default:
        return this.LeftHandSideExpression();
    }
  }

  _isLiteral(tokenType?: string): boolean {
    return tokenType === 'NUMBER' || tokenType === 'STRING';
  }

  /**
   * ParenthesizedExpression
   *   : '(' Expression ')'
   *   ;
   */
  ParenthesizedExpression(): Types.ExpressionType {
    this._eat('(');
    const expression: Types.ExpressionType = this.Expression();
    this._eat(')');

    return expression;
  }

  /**
   * Literal
   *   : NumericLiteral
   *   | StringLiteral
   *   ;
   */
  Literal(): Types.LiteralType {
    switch (this._lookahead?.type) {
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
  StringLiteral(): Types.StringLiteralType {
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
  NumericLiteral(): Types.NumericLiteralType {
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

    if (!token) {
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
