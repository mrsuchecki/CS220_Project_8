import { parseExpression, parseProgram } from "../include/parser.js";
import { State, interpExpression, interpProgram, interpStatement } from "./interpreter.js";

function expectStateToBe(program: string, state: State) {
  expect(interpProgram(parseProgram(program))).toEqual(state);
}

describe("interpExpression", () => {
  it("evaluates multiplication with a variable properly", () => {
    const r = interpExpression({ x: 10 }, parseExpression("x * 2"));

    expect(r).toEqual(20);
  });

  it("evaluates addition with numbers properly", () => {
    const r = interpExpression({}, parseExpression("2 + 3"));

    expect(r).toEqual(5);
  });
  it("evaluates logical AND operation properly", () => {
    const r = interpExpression({ x: true, y: false }, parseExpression("x && y"));

    expect(r).toEqual(false);
  });

  it("evaluates logical OR operation properly", () => {
    const r = interpExpression({ x: true, y: false }, parseExpression("x || y"));

    expect(r).toEqual(true);
  });

  it("evaluates greater than comparison properly", () => {
    const r = interpExpression({ x: 5, y: 10 }, parseExpression("x > y"));

    expect(r).toEqual(false);
  });

  it("evaluates less than comparison properly", () => {
    const r = interpExpression({ x: 5, y: 10 }, parseExpression("x < y"));

    expect(r).toEqual(true);
  });

  it("evaluates strict equality comparison properly", () => {
    const r = interpExpression({ x: 5, y: 5 }, parseExpression("x === y"));

    expect(r).toEqual(true);
  });
  it("evaluates subtraction with numbers properly", () => {
    const r = interpExpression({}, parseExpression("5 - 2"));

    expect(r).toEqual(3);
  });

  it("evaluates division with numbers properly", () => {
    const r = interpExpression({}, parseExpression("10 / 2"));

    expect(r).toEqual(5);
  });
  it("evaluates division by zero as Infinity", () => {
    const r = interpExpression({}, parseExpression("10 / 0"));

    expect(r).toEqual(Infinity);
  });
});

describe("interpStatement", () => {
  it("handles let declarations properly", () => {
    const state = {};
    interpStatement(state, { kind: "let", name: "x", expression: parseExpression("5") });

    expect(state).toEqual({ x: 5 });
  });

  it("handles variable assignment properly", () => {
    const state = { x: 10 };
    interpStatement(state, { kind: "assignment", name: "x", expression: parseExpression("20") });

    expect(state).toEqual({ x: 20 });
  });

  it("handles if statements with only the true part properly", () => {
    const state = { x: 5 };
    interpStatement(state, {
      kind: "if",
      test: parseExpression("x > 0"),
      truePart: [{ kind: "assignment", name: "x", expression: parseExpression("10") }],
      falsePart: [],
    });

    expect(state).toEqual({ x: 10 });
  });

  it("handles while statements properly", () => {
    const state = { x: 5 };
    interpStatement(state, {
      kind: "while",
      test: parseExpression("x > 0"),
      body: [{ kind: "assignment", name: "x", expression: parseExpression("x - 1") }],
    });

    expect(state).toEqual({ x: 0 });
  });

  it("handles print statements properly", () => {
    const state = { x: 10 };
    let output = "";
    console.log = jest.fn(text => {
      output += text;
    });

    interpStatement(state, { kind: "print", expression: parseExpression("x * 2") });

    expect(output).toEqual("20");
  });

  it("handles if statements with both true and false parts properly", () => {
    const state = { x: 5 };
    interpStatement(state, {
      kind: "if",
      test: parseExpression("x > 0"),
      truePart: [{ kind: "assignment", name: "x", expression: parseExpression("10") }],
      falsePart: [{ kind: "assignment", name: "x", expression: parseExpression("20") }],
    });

    expect(state).toEqual({ x: 10 });
  });

  it("handles while statements with multiple iterations properly", () => {
    const state = { x: 3 };
    interpStatement(state, {
      kind: "while",
      test: parseExpression("x > 0"),
      body: [{ kind: "assignment", name: "x", expression: parseExpression("x - 1") }],
    });

    expect(state).toEqual({ x: 0 });
  });

  it("handles other print statements properly", () => {
    const state = { x: 10 };
    let output = "";
    console.log = jest.fn(text => {
      output += text;
    });

    interpStatement(state, { kind: "print", expression: parseExpression("x * 2") });

    expect(output).toEqual("20");
  });

  it("handles if statements with only the false part properly", () => {
    const state = { x: 0 };
    interpStatement(state, {
      kind: "if",
      test: parseExpression("x > 0"),
      truePart: [],
      falsePart: [{ kind: "assignment", name: "x", expression: parseExpression("10") }],
    });

    expect(state).toEqual({ x: 10 });
  });

  it("handles nested if statements properly", () => {
    const state = { x: 5, y: 10 };
    interpStatement(state, {
      kind: "if",
      test: parseExpression("x > 0"),
      truePart: [
        {
          kind: "if",
          test: parseExpression("y > 5"),
          truePart: [{ kind: "assignment", name: "x", expression: parseExpression("20") }],
          falsePart: [],
        },
      ],
      falsePart: [],
    });
    expect(state).toEqual({ x: 20, y: 10 });
  });

  it("handles more if statements with only the false part properly", () => {
    const state = { x: 0 };
    interpStatement(state, {
      kind: "if",
      test: parseExpression("x > 0"),
      truePart: [],
      falsePart: [{ kind: "assignment", name: "x", expression: parseExpression("10") }],
    });

    expect(state).toEqual({ x: 10 });
  });

  it("handles more nested if statements properly", () => {
    const state = { x: 5, y: 10 };
    interpStatement(state, {
      kind: "if",
      test: parseExpression("x > 0"),
      truePart: [
        {
          kind: "if",
          test: parseExpression("y > 5"),
          truePart: [{ kind: "assignment", name: "x", expression: parseExpression("20") }],
          falsePart: [],
        },
      ],
      falsePart: [],
    });
    expect(state).toEqual({ x: 20, y: 10 });
  });
});

describe("interpProgram", () => {
  it("handles declarations and reassignment properly", () => {
    expectStateToBe(
      `
      let x = 10;
      x = 20;
    `,
      { x: 20 }
    );
  });

  it("handles statements properly", () => {
    expectStateToBe(
      `
      let x = 10;
      x = 20;
      x = 30;
      `,
      { x: 30 }
    );
  });

  it("handles multiple statements properly", () => {
    expectStateToBe(
      `
      let x = 10;
      x = 20;
      x = 30;
      x = 40;
      `,
      { x: 40 }
    );
  });

  it("handles if statements with both true and false parts properly", () => {
    expectStateToBe(
      `
      let x = 5;
      if (x > 0) {
        x = 10;
      } else {
        x = 20;
      }
      `,
      { x: 10 }
    );
  });

  it("handles while statements with multiple iterations properly", () => {
    expectStateToBe(
      `
      let x = 3;
      while (x > 0) {
        x = x - 1;
      }
      `,
      { x: 0 }
    );
  });

  it("handles variable declarations with initializations properly", () => {
    expectStateToBe(
      `
      let x = 10;
      let y = 20;
    `,
      { x: 10, y: 20 }
    );
  });

  it("handles while statements with no iterations properly", () => {
    expectStateToBe(
      `
      let x = 0;
      while (x > 0) {
        x = x - 1;
      }
      `,
      { x: 0 }
    );
  });
});
