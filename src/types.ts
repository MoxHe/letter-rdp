export interface ProgramType {
  type: 'Program';
  body: Array<StatementType>;
}

export interface IfStatementType {
  type: 'IfStatement';
  test: ExpressionType;
  consequent: StatementType;
  alternate: StatementType | null;
}

export interface VariableStatementType {
  type: 'VariableStatement';
  declarations: Array<VariableDeclarationType>;
}

export interface VariableDeclarationType {
  type: 'VariableDeclaration';
  id: IdentifierType;
  init: ExpressionType | null;
}

export interface ExpressionStatementType {
  type: 'ExpressionStatement';
  expression: ExpressionType;
}

export interface BlockStatementType {
  type: 'BlockStatement';
  body: Array<StatementType>;
}

export interface EmptyStatementType {
  type: 'EmptyStatement';
}

export interface AssignmentExpressionNodeType {
  type: 'AssignmentExpression';
  operator: string;
  left: IdentifierType;
  right: ExpressionType;
}

export interface IdentifierType {
  type: 'Identifier';
  name: string;
}

export interface UnaryExpressionNodeType {
  type: 'UnaryExpression';
  operator: string;
  argument: ExpressionType;
}

export interface BinaryExpressionNodeType {
  type: 'BinaryExpression';
  operator: string;
  left: ExpressionType;
  right: ExpressionType;
}

export interface LogicalExpressionNodeType {
  type: 'LogicalExpression';
  operator: string;
  left: ExpressionType;
  right: ExpressionType;
}

export interface StringLiteralType {
  type: 'StringLiteral';
  value: string;
}

export interface NumericLiteralType {
  type: 'NumericLiteral';
  value: number;
}

export interface BooleanLiteralType {
  type: 'BooleanLiteral';
  value: boolean;
}

export interface NullLiteralType {
  type: 'NullLiteral';
  value: null;
}

export type ExpressionType =
  | IdentifierType
  | LiteralType
  | AssignmentExpressionNodeType
  | BinaryExpressionNodeType
  | UnaryExpressionNodeType
  | LogicalExpressionNodeType;

export type StatementType =
  | ExpressionStatementType
  | BlockStatementType
  | IfStatementType
  | VariableStatementType
  | EmptyStatementType;

export type LiteralType =
  | StringLiteralType
  | NumericLiteralType
  | BooleanLiteralType
  | NullLiteralType;

