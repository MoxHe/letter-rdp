export type ProgramType = { type: 'Program'; body: StatementListType };

export type IfStatementType = {
  type: 'IfStatement';
  test: ExpressionType;
  consequent: StatementType;
  alternate: StatementType | null;
};

export type VariableStatementType = {
  type: 'VariableStatement';
  declarations: Array<VariableDeclarationType>;
};

export type VariableDeclarationType = {
  type: 'VariableDeclaration';
  id: IdentifierType;
  init: AssignmentExpressionType | null;
};

export type ExpressionStatementType = {
  type: 'ExpressionStatement';
  expression: ExpressionType;
};

export type BlockStatementType = {
  type: 'BlockStatement';
  body: StatementListType;
};

export type EmptyStatementType = { type: 'EmptyStatement' };

export type AssignmentExpressionNodeType = {
  type: 'AssignmentExpression';
  operator: string;
  left: IdentifierType;
  right: AssignmentExpressionType;
};

export type IdentifierType = { type: 'Identifier'; name: string };

export type BinaryExpressionNodeType = {
  type: 'BinaryExpression';
  operator: string;
  left: ExpressionType;
  right: ExpressionType;
};

export type StringLiteralType = { type: 'StringLiteral'; value: string };

export type NumericLiteralType = { type: 'NumericLiteral'; value: number };

export type ExpressionType = AssignmentExpressionType;

export type StatementListType = Array<StatementType>;

export type StatementType =
  | ExpressionStatementType
  | BlockStatementType
  | IfStatementType
  | VariableStatementType
  | EmptyStatementType;

export type AssignmentExpressionType =
  | BinaryExpressionType
  | AssignmentExpressionNodeType;

export type BinaryExpressionType =
  | IdentifierType
  | LiteralType
  | AssignmentExpressionNodeType
  | BinaryExpressionNodeType;

export type LiteralType = StringLiteralType | NumericLiteralType;


