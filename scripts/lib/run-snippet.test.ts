import { describe, expect, it } from "vitest";
import { runSnippet } from "./run-snippet";

describe("runSnippet", () => {
  it("captura console.log en orden, incluido el event loop", async () => {
    const out = await runSnippet(
      'console.log("A"); setTimeout(() => console.log("B")); Promise.resolve().then(() => console.log("C"));',
    );
    expect(out).toBe("A\nC\nB");
  });

  it("muestra errores no capturados como Uncaught <Tipo>", async () => {
    expect(await runSnippet('console.log(1); null.x;')).toBe("1\nUncaught TypeError");
    expect(await runSnippet("console.log(typeof x); let x = 1;")).toBe("Uncaught ReferenceError");
  });

  it("muestra promesas rechazadas sin manejar", async () => {
    const out = await runSnippet('Promise.reject(new RangeError("x")); console.log("después");');
    expect(out).toBe("después\nUncaught (in promise) RangeError");
  });
});
