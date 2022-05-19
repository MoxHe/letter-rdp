export type ProgramType = { type: string; body: StatementListType };

export type StatementListType = Array<StatementType>;

export type StatementType =
  | ExpressionStatementType
  | BlockStatementType
  | EmptyStatementType;

export type ExpressionStatementType = {
  type: string;
  expression: ExpressionType;
};

export type BlockStatementType = { type: string; body: StatementListType };

export type EmptyStatementType = { type: string };

export type ExpressionType = BinaryExpressionType;

export type BinaryExpressionType =
  | LiteralType
  | {
      type: string;
      operator: string;
      left: LiteralType | BinaryExpressionType;
      right: LiteralType | BinaryExpressionType;
    };

export type LiteralType = StringLiteralType | NumericLiteralType;

export type StringLiteralType = { type: string; value: string };

export type NumericLiteralType = { type: string; value: number };

