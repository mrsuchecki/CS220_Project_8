import { Expression, Statement } from "../include/parser.js";

type RuntimeValue = number | boolean;
export type State = { [key: string]: State | RuntimeValue };

const PARENT_STATE_KEY = "[[PARENT]]";

export function interpExpression(state: State, exp: Expression): RuntimeValue {
  switch (exp.kind) {
    case "boolean":
      return exp.value;
    case "number":
      return exp.value;
    case "variable":
      const { name } = exp;
      if (state.hasOwnProperty(name)) {
        const value = state[name];
        if (typeof value === "object" && PARENT_STATE_KEY in value) {
          const parentState = value[PARENT_STATE_KEY];
          if (typeof parentState === "object") {
            const nestedState = { ...parentState, ...value } as State;
            return interpExpression(nestedState, exp);
          }
        }
        return value as RuntimeValue;
      } else {
        throw new Error(`ReferenceError: ${name} is not defined.`);
      }
    case "operator":
      const { operator, left, right } = exp;
      return evalBinaryExpression(state, operator, left, right);
    default:
      throw new Error(`Invalid expression kind: ${exp.kind}`);
  }
}

function evalBinaryExpression(state: State, operator: string, left: Expression, right: Expression): RuntimeValue {
  const lV = interpExpression(state, left);
  const rV = interpExpression(state, right);

  switch (operator) {
    case "+":
      if (typeof lV === "number" && typeof rV === "number") {
        return lV + rV;
      } else {
        throw new Error("Invalid operand types for '+' operator. Both operands must be numbers.");
      }
    case "-":
      if (typeof lV === "number" && typeof rV === "number") {
        return lV - rV;
      } else {
        throw new Error("Invalid operand types for '-' operator. Both operands must be numbers.");
      }
    case "*":
      if (typeof lV === "number" && typeof rV === "number") {
        return lV * rV;
      } else {
        throw new Error("Invalid operand types for '*' operator. Both operands must be numbers.");
      }
    case "/":
      if (typeof lV === "number" && typeof rV === "number") {
        return lV / rV;
      } else {
        throw new Error("Invalid operand types for '/' operator. Both operands must be numbers.");
      }
    case "&&":
      if (typeof lV === "boolean" && typeof rV === "boolean") {
        return lV && rV;
      } else {
        throw new Error("Invalid operand types for '&&' operator. Both operands must be booleans.");
      }
    case "||":
      if (typeof lV === "boolean" && typeof rV === "boolean") {
        return lV || rV;
      } else {
        throw new Error("Invalid operand types for '||' operator. Both operands must be booleans.");
      }
    case ">":
      if (typeof lV === "number" && typeof rV === "number") {
        return lV > rV;
      } else {
        throw new Error("Invalid operand types for '>' operator. Both operands must be numbers.");
      }
    case "<":
      if (typeof lV === "number" && typeof rV === "number") {
        return lV < rV;
      } else {
        throw new Error("Invalid operand types for '<' operator. Both operands must be numbers.");
      }
    case "===":
      return lV === rV;
    default:
      throw new Error(`Invalid binary operator: ${operator}`);
  }
}

export function interpStatement(state: State, stmt: Statement): void {
  switch (stmt.kind) {
    case "let":
      const letValue = interpExpression(state, stmt.expression);
      state[stmt.name] = letValue;
      break;
    case "assignment":
      if (state.hasOwnProperty(stmt.name)) {
        const assignValue = interpExpression(state, stmt.expression);
        state[stmt.name] = assignValue;
      } else {
        throw new Error(`ReferenceError: ${stmt.name} is not defined.`);
      }
      break;
    case "if":
      const condition = interpExpression(state, stmt.test);
      if (typeof condition === "boolean") {
        const branch = condition ? stmt.truePart : stmt.falsePart;
        interpStatements(state, branch);
      } else {
        throw new Error("Invalid condition type. Expected a boolean.");
      }
      break;
    case "while":
      let loopCondition = interpExpression(state, stmt.test);
      if (typeof loopCondition === "boolean") {
        while (loopCondition) {
          interpStatements(state, stmt.body);
          loopCondition = interpExpression(state, stmt.test);
        }
      } else {
        throw new Error("Invalid condition type. Expected a boolean.");
      }
      break;
    case "print":
      const printValue = interpExpression(state, stmt.expression);
      console.log(printValue);
      break;
    default:
      throw new Error(`Invalid statement type: ${stmt.kind}`);
  }
}

function interpStatements(state: State, stmts: Statement[]): void {
  for (const stmt of stmts) {
    interpStatement(state, stmt);
  }
}

export function interpProgram(program: Statement[]): State {
  const state: State = {};
  interpStatements(state, program);
  return state;
}
