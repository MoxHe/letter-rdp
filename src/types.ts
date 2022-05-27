export type ProgramType = { type: string; body: StatementListType };

export type StatementListType = Array<StatementType>;

export type StatementType =
  | ExpressionStatementType
  | BlockStatementType
  | EmptyStatementType;

export type VariableStatement =  {
  type: string,
  declarations: VariableDeclarationType[]
}

export type VariableDeclarationType = {
  type: string,
  id: IdentifierType,
  init: AssignmentExpressionType | null,
}

export type ExpressionStatementType = {
  type: string;
  expression: ExpressionType;
};

export type BlockStatementType = { type: string; body: StatementListType };

export type EmptyStatementType = { type: string };

export type ExpressionType = AssignmentExpressionType;

export type AssignmentExpressionType =
  | BinaryExpressionType
  | {
      type: string;
      operator: string;
      left: IdentifierType;
      right: AssignmentExpressionType;
    };

export type IdentifierType = { type: string; name: string };

export type BinaryExpressionType =
  | IdentifierType
  | LiteralType
  | {
      type: string;
      operator: string;
      left: LiteralType | BinaryExpressionType | IdentifierType;
      right: LiteralType | BinaryExpressionType;
    };

export type LiteralType = StringLiteralType | NumericLiteralType;

export type StringLiteralType = { type: string; value: string };

export type NumericLiteralType = { type: string; value: number };

