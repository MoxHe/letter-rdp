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
  StatementList(
    stopLookahead: string | null = null
  ): Array<Types.StatementType> {
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
   *  | IterationStatement
   *  | FunctionDeclaration
   *  | ReturnStatement
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
      case 'def':
        return this.FunctionDeclaration();
      case 'return':
        return this.ReturnStatement();
      case 'while':
      case 'do':
      case 'for':
        return this.IterationStatement();
      default:
        return this.ExpressionStatement();
    }
  }

  /**
   * FunctionDeclaration
   *   : 'def' Identifier '(' OptFormalParameterList ')' BlockStatement
   *   ;
   */
  FunctionDeclaration(): Types.FunctionDeclarationType  {
    this._eat('def');
    const name = this.Identifier();

    this._eat('(');

    // OptFormalParameterList
    const params =
      this._lookahead?.type !== ')' ? this.FormalParameterList() : [];

    this._eat(')');

    const body = this.BlockStatement();

    return {
      type: 'FunctionDeclaration',
      name,
      params,
      body,
    }
  }

  /**
   * FormalParameterList
   *   : Identifier
   *   | FormalParameterList ',' Identifier
   *   ;
   */
  FormalParameterList(): Array<Types.IdentifierType> {
    const params = [];

    do {
      params.push(this.Identifier());
    } while (this._lookahead?.type === ',' && this._eat(','));

    return params;
  }

  /**
   * ReturnStatement
   *   : 'return' OptExpression ';'
   *   ;
   */
  ReturnStatement(): Types.ReturnStatementType {
    this._eat('return');
    const argument = this._lookahead?.type !== ';' ? this.Expression() : null;
    this._eat(';');

    return {
      type: 'ReturnStatement',
      argument,
    };
  }

  /**
   * IterationStatement
   *   : WhileStatement
   *   | DoWhileStatement
   *   | ForStatement
   *   ;
   */
  IterationStatement(): Types.IterationStatementType {
    switch (this._lookahead?.type) {
      case 'while':
        return this.WhileStatement();
      case 'do':
        return this.DoWhileStatement();
      default:
        return this.ForStatement();
    }
  }

  /**
   * WhileStatement
   *  : 'while' '(' Expression ')' Statement
   *  ;
   */
  WhileStatement(): Types.WhileStatementType {
    this._eat('while');

    this._eat('(');
    const test = this.Expression();
    this._eat(')');

    const body = this.Statement();

    return {
      type: 'WhileStatement',
      test,
      body,
    };
  }

  /**
   * DoWhileStatement
   *   : 'do' Statement 'while' '(' Expression ')' ';'
   */
  DoWhileStatement(): Types.DoWhileStatementType {
    this._eat('do');

    const body = this.Statement();

    this._eat('while');

    this._eat('(');
    const test = this.Expression();
    this._eat(')');

    this._eat(';')

    return {
      type: 'DoWhileStatement',
      body,
      test,
    };
  }

  /**
   * ForStatement
   *   : 'for' '(' OptForStatementInit ';' OptExpression ';' 'OptExpression' ')' Statement
   *   ;
   */
  ForStatement(): Types.ForStatementType {
    this._eat('for');
    this._eat('(');

    const init = this._lookahead?.type !== ';' ? this.ForStatementInit() : null;
    this._eat(';');

    const test = this._lookahead?.type !== ';' ? this.Expression() : null;
    this._eat(';');

    const update = this._lookahead?.type !== ')' ? this.Expression() : null;
    this._eat(')');

    const body = this.Statement();

    return {
      type: 'ForStatement',
      init,
      test,
      update,
      body,
    };
  }

  /**
   * ForStatementInit
   *   : VariableStatementInit
   *   | Expression
   *   ;
   */
  ForStatementInit(): Types.ForStatementInitType {
    if (this._lookahead?.type === 'let') {
      return this.VariableStatementInit();
    }

    return this.Expression();
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

    const alternate =
      this._lookahead && this._lookahead.type === 'else'
        ? this._eat('else') && this.Statement()
        : null;

    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate,
    };
  }

  /**
   * VariableStatementInit
   *  : 'let' VariableDeclarationList
   *  ;
   */
  VariableStatementInit(): Types.VariableStatementType {
    this._eat('let');
    const declarations = this.VariableDeclarationList();

    return {
      type: 'VariableStatement',
      declarations,
    };
  }

  /**
   * VariableStatement
   * : 'let' VariableDeclarationList ';'
   * ;
   */
  VariableStatement(): Types.VariableStatementType {
    const variableStatement = this.VariableStatementInit();
    this._eat(';');

    return variableStatement;
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
    const init =
      this._lookahead &&
      this._lookahead.type !== ';' &&
      this._lookahead?.type !== ','
        ? this.VariableInitializer()
        : null;

    return {
      type: 'VariableDeclaration',
      id,
      init,
    };
  }

  /**
   * VariableInitializer
   *  : SIMPLE_ASSIGN AssignmentExpression
   *  ;
   */
  VariableInitializer(): Types.ExpressionType {
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

    const body: Array<Types.StatementType> =
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
   *   : LogicalORExpression
   *   | LeftHandSideExpression AssignmentOperator AssignmentExpression
   *   ;
   */
  AssignmentExpression(): Types.ExpressionType {
    const left = this.LogicalORExpression();

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
    node: Types.ExpressionType
  ): Types.IdentifierType | Types.MemberExpressionType {
    if (node.type === 'Identifier' || node.type === 'MemberExpression') {
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
   * Logical OR expression.
   *
   *   x || y
   *
   * LogicalORExpression
   *   : LogicalORExpression
   *   | LogicalORExpression LOGICAL_OR LogicalANDExpression
   *   ;
   */
  LogicalORExpression(): Types.ExpressionType {
    return this._LogicalExpression('LogicalANDExpression', 'LOGICAL_OR');
  }

  /**
   * Logical AND expression.
   *
   *   x && y
   *
   * LogicalANDExpression
   *   | EqualityExpression
   *   : LogicalANDExpression EQUALITY_OPERATOR EqualityExpression
   *   ;
   */
  LogicalANDExpression(): Types.ExpressionType {
    return this._LogicalExpression('EqualityExpression', 'LOGICAL_AND');
  }

  /**
   * EQUALITY_OPERATOR: ==, !=
   *
   *   x == y
   *   x != y
   *
   * EqualityExpression
   *   : RelationalExpression
   *   | EqualityExpression EQUALITY_OPERATOR RelationalExpression
   *   ;
   */
  EqualityExpression(): Types.ExpressionType {
    return this._BinaryExpression('RelationalExpression', 'EQUALITY_OPERATOR');
  }

  /**
   * RELATIONAL_OPERATOR: >, >=, <, <=
   *
   *   x > y
   *   x >= ytrue
   *   x < y
   *   x <= y
   *
   * RelationalExpression
   *   : AdditiveExpression
   *   | RelationalExpression RELATIONAL_OPERATOR AdditiveExpression
   *   ;
   */
  RelationalExpression(): Types.ExpressionType {
    return this._BinaryExpression('AdditiveExpression', 'RELATIONAL_OPERATOR');
  }

  /**
   * AdditiveExpression
   *   : MultiplicativeExpression
   *   | AdditiveExpression ADDITIVE_OPERATOR MultiplicativeExpression -> MultiplicativeExpression ADDITIVE_OPERATOR MultiplicativeExpression ADDITIVE_OPERATOR MultiplicativeExpression
   *   ;
   */
  AdditiveExpression(): Types.ExpressionType {
    return this._BinaryExpression(
      'MultiplicativeExpression',
      'ADDITIVE_OPERATOR'
    );
  }

  /**
   * MultiplicativeExpression
   *   : PrimaryExpression
   *   | MultiplicativeExpression MULTIPLICATIVE_OPERATOR UnaryExpression -> UnaryExpression ADDITIVE_OPERATOR UnaryExpression ADDITIVE_OPERATOR UnaryExpression
   *   ;
   */
  MultiplicativeExpression(): Types.ExpressionType {
    return this._BinaryExpression('UnaryExpression', 'MULTIPLICATIVE_OPERATOR');
  }

  /**
   * Generic helper for logicalExpression nodes.
   */
  _LogicalExpression(
    builderName: 'LogicalANDExpression' | 'EqualityExpression',
    operatorToken: 'LOGICAL_OR' | 'LOGICAL_AND'
  ): Types.ExpressionType {
    let left = this[builderName]();

    while (this._lookahead?.type === operatorToken) {
      // Operator: +, -, *, /
      const operator = this._eat(operatorToken).value;

      const right = this[builderName]();

      left = {
        type: 'LogicalExpression',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  /**
   * Generic binary expression
   */
  _BinaryExpression(
    builderName:
      | 'MultiplicativeExpression'
      | 'PrimaryExpression'
      | 'AdditiveExpression'
      | 'RelationalExpression'
      | 'UnaryExpression',
    operatorToken:
      | 'ADDITIVE_OPERATOR'
      | 'MULTIPLICATIVE_OPERATOR'
      | 'RELATIONAL_OPERATOR'
      | 'EQUALITY_OPERATOR'
  ): Types.ExpressionType {
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
   * UnaryExpression
   *  : LeftHandSideExpression
   *  | ADDITIVE_OPERATOR UnaryExpression
   *  | LOGICAL_NOT UnaryExpression
   *  ;
   */
  UnaryExpression(): Types.ExpressionType {
    let operator;
    switch (this._lookahead?.type) {
      case 'ADDITIVE_OPERATOR':
        operator = this._eat('ADDITIVE_OPERATOR').value;
        break;
      case 'LOGICAL_NOT':
        operator = this._eat('LOGICAL_NOT').value;
    }

    if (operator) {
      return {
        type: 'UnaryExpression',
        operator,
        argument: this.UnaryExpression(),
      };
    }

    return this.LeftHandSideExpression();
  }

  /**
   * LeftHandSideExpression
   * : MemberExpression
   * ;
   */
  LeftHandSideExpression(): Types.ExpressionType {
    return this.MemberExpression();
  }

  /**
   * MemberExpression
   *   : PrimaryExpression
   *   | MemberExpression '.' Identifier
   *   | MemberExpression '[' Expression ']'
   *   ;
   */
  MemberExpression(): Types.ExpressionType {
    let object = this.PrimaryExpression();

    while (this._lookahead?.type === '.' || this._lookahead?.type === '[') {
      // MemberExpression '.' Identifier
      if (this._lookahead?.type === '.') {
        this._eat('.');
        const property = this.Identifier();
        object = {
          type: 'MemberExpression',
          computed: false,
          object,
          property,
        };
      };

      // MemberExpression '[' Expression ']'
      if (this._lookahead?.type === '[') {
        this._eat('[');
        const property = this.Expression();
        this._eat(']');
        object = {
          type: 'MemberExpression',
          computed: true,
          object,
          property,
        };
      }
    }

    return object;
  }

  /**
   * PrimaryExpression
   *  : Literal
   *  | ParenthesizedExpression
   *  | Identifier
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
        return this.Identifier();
    }
  }

  _isLiteral(tokenType?: string): boolean {
    return (
      tokenType === 'NUMBER' ||
      tokenType === 'STRING' ||
      tokenType === 'true' ||
      tokenType === 'false' ||
      tokenType === 'null'
    );
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
   *   | BooleanLiteral
   *   | NumericLiteral
   *   ;
   */
  Literal(): Types.LiteralType {
    switch (this._lookahead?.type) {
      case 'NUMBER':
        return this.NumericLiteral();
      case 'STRING':
        return this.StringLiteral();
      case 'true':
        return this.BooleanLiteral(true);
      case 'false':
        return this.BooleanLiteral(false);
      case 'null':
        return this.NullLiteral();
    }

    throw new SyntaxError(`Literal: unexpected literal production`);
  }

  /**
   * BooleanLiteral
   *   : 'true'
   *   | 'false'
   *   ;
   */
  BooleanLiteral(value: boolean): Types.BooleanLiteralType {
    this._eat(value ? 'true' : 'false');

    return {
      type: 'BooleanLiteral',
      value,
    };
  }

  /**
   * NullLiteral
   *   : 'null'
   *   ;
   */
  NullLiteral(): Types.NullLiteralType {
    this._eat('null');

    return {
      type: 'NullLiteral',
      value: null,
    };
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
