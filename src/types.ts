export interface ProgramType {
  type: 'Program';
  body: Array<StatementType>;
}

export interface CallExpressionType {
  type: 'CallExpression';
  callee: ExpressionType;
  arguments: Array<ExpressionType>;
}

export interface ClassDeclarationType {
  type: 'ClassDeclaration';
  id: IdentifierType;
  superClass: IdentifierType | null;
  body: BlockStatementType;
}

export interface IfStatementType {
  type: 'IfStatement';
  test: ExpressionType;
  consequent: StatementType;
  alternate: StatementType | null;
}

export interface FunctionDeclarationType {
  type: 'FunctionDeclaration';
  name: IdentifierType;
  params: Array<IdentifierType>;
  body: StatementType;
}

export interface ReturnStatementType {
  type: 'ReturnStatement';
  argument: ExpressionType | null;
}

export interface WhileStatementType {
  type: 'WhileStatement';
  test: ExpressionType;
  body: StatementType;
}

export interface DoWhileStatementType {
  type: 'DoWhileStatement';
  test: ExpressionType;
  body: StatementType;
}

export interface ForStatementType {
  type: 'ForStatement';
  init: ForStatementInitType | null;
  test:  ExpressionType | null;
  update: ExpressionType | null;
  body: StatementType;
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
  left: IdentifierType | MemberExpressionType;
  right: ExpressionType;
}

export interface MemberExpressionType {
  type: 'MemberExpression';
  computed: boolean;
  object: ExpressionType;
  property: ExpressionType;
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

export interface ThisExpressionType {
  type: 'ThisExpression'
}

export interface NewExpressionType {
  type: 'NewExpression',
  callee: ExpressionType,
  arguments: Array<ExpressionType>,
}

export interface SuperType {
  type: 'Super'
}

export type ForStatementInitType = VariableStatementType | ExpressionType;

export type IterationStatementType =
  | WhileStatementType
  | DoWhileStatementType
  | ForStatementType;

export type ExpressionType =
  | IdentifierType
  | LiteralType
  | AssignmentExpressionNodeType
  | BinaryExpressionNodeType
  | UnaryExpressionNodeType
  | MemberExpressionType
  | CallExpressionType
  | ThisExpressionType
  | NewExpressionType
  | SuperType
  | LogicalExpressionNodeType;

export type StatementType =
  | ExpressionStatementType
  | BlockStatementType
  | IfStatementType
  | VariableStatementType
  | EmptyStatementType
  | IterationStatementType
  | ReturnStatementType
  | ClassDeclarationType
  | FunctionDeclarationType;

export type LiteralType =
  | StringLiteralType
  | NumericLiteralType
  | BooleanLiteralType
  | NullLiteralType;

