import assert from "assert";

// * Use `npm run build:parser` and import
import { parse } from "./peggyParser.js";

// * or rebuild parser each execution
// import fs from "fs";
// import peggy from "peggy";
// const grammar = fs.readFileSync("./include/grammar.pegjs", "utf-8");
// const parser = peggy.generate(grammar);
// const parse = (s: string) => parser.parse(s);

export type BinaryOperator = "+" | "-" | "*" | "/" | "&&" | "||" | ">" | "<" | "===";

export type Expression =
  | { kind: "boolean"; value: boolean }
  | { kind: "number"; value: number }
  | { kind: "variable"; name: string }
  | { kind: "operator"; operator: BinaryOperator; left: Expression; right: Expression }
  // Optional: You do not need to support the below expressions
  | { kind: "function"; parameters: string[]; body: Statement[] }
  | { kind: "call"; callee: string; arguments: Expression[] };

export type Statement =
  | { kind: "let"; name: string; expression: Expression }
  | { kind: "assignment"; name: string; expression: Expression }
  | { kind: "if"; test: Expression; truePart: Statement[]; falsePart: Statement[] }
  | { kind: "while"; test: Expression; body: Statement[] }
  | { kind: "print"; expression: Expression }
  // Optional: You do not need to support the below statements
  | { kind: "expression"; expression: Expression }
  | { kind: "return"; expression: Expression };


export function parseExpression(expression: string): Expression {
  const result = parse(`${expression};`) as Statement[];
  assert(result.length === 1, "Parse result had more than one statement. Only provide expressions.");
  const expressionAST = result[0];
  assert(
    expressionAST.kind === "expression",
    "Parse result was not an expression statement. Only provide expression constructs."
  );

  return expressionAST.expression;
}

export function parseProgram(program: string): Statement[] {
  return parse(program) as Statement[];
}
