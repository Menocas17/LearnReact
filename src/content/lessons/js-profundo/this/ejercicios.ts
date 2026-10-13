import type { ExerciseDef } from "@/content/types";

const carrito: ExerciseDef = {
  id: "this-carrito-callbacks",
  title: "Métodos que no pierden this",
  concepts: ["js.this", "js.modo-estricto"],
  instructions:
    "La clase Cart funciona cuando llamas cart.add(item), pero se rompe al pasar sus métodos como callbacks (como haría onClick={cart.add} o items.forEach(cart.add)). Arréglala para que add, remove y total funcionen aunque se extraigan del objeto, sin cambiar cómo se usan. Cada carrito debe seguir teniendo sus propios items.",
  starter: {
    "/cart.js": `export class Cart {
  items = [];

  add(item) {
    this.items.push(item);
    return this.items.length;
  }

  remove(name) {
    this.items = this.items.filter((item) => item.name !== name);
    return this.items.length;
  }

  total() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
`,
  },
  tests: {
    "/cart.test.js": `import { Cart } from "./cart";

describe("Cart", () => {
  test("funciona llamando a los métodos sobre la instancia", () => {
    const cart = new Cart();
    cart.add({ name: "pan", price: 2 });
    cart.add({ name: "leche", price: 1 });
    expect(cart.total()).toBe(3);
    expect(cart.remove("pan")).toBe(1);
  });

  test("los métodos funcionan desestructurados", () => {
    const cart = new Cart();
    const { add, remove, total } = cart;
    add({ name: "pan", price: 2 });
    add({ name: "queso", price: 5 });
    remove("pan");
    expect(total()).toBe(5);
  });

  test("add funciona como callback de forEach", () => {
    const cart = new Cart();
    [
      { name: "a", price: 1 },
      { name: "b", price: 2 },
    ].forEach((item) => cart.add(item));
    const otro = new Cart();
    [
      { name: "c", price: 3 },
      { name: "d", price: 4 },
    ].forEach(otro.add);
    expect(cart.total()).toBe(3);
    expect(otro.total()).toBe(7);
  });

  test("funciona como si fuera un handler llamado por otro código", () => {
    const cart = new Cart();
    const button = { onClick: null };
    button.onClick = cart.add;
    button.onClick({ name: "x", price: 10 });
    expect(cart.total()).toBe(10);
    expect(button.items).toBeUndefined();
  });

  test("cada carrito es independiente", () => {
    const a = new Cart();
    const b = new Cart();
    const addA = a.add;
    addA({ name: "x", price: 1 });
    expect(a.items.length).toBe(1);
    expect(b.items.length).toBe(0);
  });
});
`,
  },
  solution: {
    "/cart.js": `export class Cart {
  items = [];

  // Un campo con arrow function se crea por instancia y captura
  // el this de esa instancia: no depende de cómo se llame.
  add = (item) => {
    this.items.push(item);
    return this.items.length;
  };

  remove = (name) => {
    this.items = this.items.filter((item) => item.name !== name);
    return this.items.length;
  };

  total = () => {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  };
}
`,
  },
  hints: [
    "Cuando haces const { add } = cart y luego add(…), es una llamada simple. El cuerpo de una clase es siempre estricto, así que this es undefined y this.items lanza TypeError.",
    "Necesitas que cada instancia tenga funciones cuyo this no dependa de la llamada. Hay dos formas: enlazarlas en el constructor (this.add = this.add.bind(this)) o declararlas como campos con arrow function.",
    "Ojo con el test del button: si add usa el this de quien lo llama, escribirá en button.items. Con bind o con arrow, this siempre es el carrito.",
  ],
};

const myBind: ExerciseDef = {
  id: "this-my-bind",
  title: "Tu propio bind",
  concepts: ["js.call-apply-bind", "js.this"],
  instructions:
    "Implementa myBind(fn, thisArg, ...presetArgs) sin usar Function.prototype.bind. Debe devolver una función nueva que, al llamarse, ejecute fn con this igual a thisArg y con los argumentos presetArgs seguidos de los que reciba, y que devuelva el resultado de fn. Como el bind real, el this enlazado no debe poder cambiarse después (ni con call ni con otro myBind).",
  starter: {
    "/myBind.js": `export function myBind(fn, thisArg, ...presetArgs) {
  // Tu código aquí
  return fn;
}
`,
  },
  tests: {
    "/myBind.test.js": `import { myBind } from "./myBind";

function describir(saludo, signo) {
  return saludo + ", soy " + this.name + signo;
}

describe("myBind", () => {
  test("fija this", () => {
    const ana = { name: "Ana" };
    const f = myBind(describir, ana);
    expect(f("Hola", "!")).toBe("Hola, soy Ana!");
  });

  test("devuelve una función nueva", () => {
    const f = myBind(describir, { name: "Ana" });
    expect(typeof f).toBe("function");
    expect(f).not.toBe(describir);
  });

  test("aplicación parcial: antepone los argumentos fijados", () => {
    const sumar = (a, b, c) => a + b + c;
    const mas10 = myBind(sumar, null, 10);
    expect(mas10(1, 2)).toBe(13);
    const mas10y20 = myBind(sumar, null, 10, 20);
    expect(mas10y20(3)).toBe(33);
  });

  test("call no cambia el this enlazado", () => {
    const f = myBind(describir, { name: "Ana" }, "Hola");
    expect(f.call({ name: "Luis" }, "?")).toBe("Hola, soy Ana?");
  });

  test("volver a enlazar no cambia el this", () => {
    const f = myBind(describir, { name: "Ana" });
    const g = myBind(f, { name: "Luis" }, "Hey");
    expect(g(".")).toBe("Hey, soy Ana.");
  });

  test("funciona con un método extraído", () => {
    const counter = {
      count: 0,
      inc() {
        this.count++;
        return this.count;
      },
    };
    const inc = myBind(counter.inc, counter);
    inc();
    expect(inc()).toBe(2);
    expect(counter.count).toBe(2);
  });

  test("no usa Function.prototype.bind", () => {
    const original = Function.prototype.bind;
    Function.prototype.bind = function () {
      throw new Error("No uses bind");
    };
    try {
      const f = myBind(describir, { name: "Ana" }, "Hola");
      expect(f("!")).toBe("Hola, soy Ana!");
    } finally {
      Function.prototype.bind = original;
    }
  });
});
`,
  },
  solution: {
    "/myBind.js": `export function myBind(fn, thisArg, ...presetArgs) {
  // La función devuelta ignora su propio this: siempre llama a fn
  // con thisArg. Por eso call o un segundo myBind no pueden cambiarlo.
  return function (...args) {
    return fn.apply(thisArg, [...presetArgs, ...args]);
  };
}
`,
  },
  hints: [
    "myBind debe devolver una función nueva. Dentro de ella, llama a fn fijando this a mano: call y apply te permiten hacerlo.",
    "Combina los argumentos guardados con los nuevos: [...presetArgs, ...args]. apply los recibe como array; con call usarías spread.",
    "¿Por qué no se puede re-enlazar? La función que devuelves nunca usa su propio this, solo thisArg (que recuerda por closure). Da igual con qué this la llames.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [carrito, myBind];
