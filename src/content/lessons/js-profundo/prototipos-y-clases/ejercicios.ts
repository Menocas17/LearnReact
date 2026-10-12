import type { ExerciseDef } from "@/content/types";

export const erroresHttp: ExerciseDef = {
  id: "prototipos-y-clases-errores-http",
  title: "Jerarquía de errores HTTP",
  concepts: ["js.clases"],
  instructions:
    "Implementa dos clases de error. HttpError extiende Error: su constructor recibe (status, message, options), pasa message y options (para cause) al constructor de Error, guarda status y fija name a \"HttpError\". Tiene un getter isClientError (true si status está entre 400 y 499) y un método estático fromStatus(status, url) que devuelve un NotFoundError si status es 404 y, si no, un HttpError con el mensaje \"HTTP \" + status. NotFoundError extiende HttpError: su constructor recibe (url, options), usa status 404 y el mensaje \"No encontrado: \" + url, guarda url y fija name a \"NotFoundError\".",
  starter: {
    "/errores.js": `export class HttpError {
  // Tu código aquí
}

export class NotFoundError {
  // Tu código aquí
}
`,
  },
  tests: {
    "/errores.test.js": `import { HttpError, NotFoundError } from "./errores";

describe("HttpError", () => {
  test("es un Error con status, message y name", () => {
    const e = new HttpError(500, "Fallo del servidor");
    expect(e instanceof Error).toBe(true);
    expect(e instanceof HttpError).toBe(true);
    expect(e.status).toBe(500);
    expect(e.message).toBe("Fallo del servidor");
    expect(e.name).toBe("HttpError");
  });

  test("conserva la causa original", () => {
    const original = new TypeError("Failed to fetch");
    const e = new HttpError(503, "Sin conexión", { cause: original });
    expect(e.cause).toBe(original);
  });

  test("isClientError es un getter", () => {
    expect(new HttpError(404, "x").isClientError).toBe(true);
    expect(new HttpError(500, "x").isClientError).toBe(false);
    expect(new HttpError(399, "x").isClientError).toBe(false);
    expect(Object.hasOwn(new HttpError(400, "x"), "isClientError")).toBe(false);
  });
});

describe("NotFoundError", () => {
  test("hereda de HttpError y de Error", () => {
    const e = new NotFoundError("/api/users/7");
    expect(e instanceof NotFoundError).toBe(true);
    expect(e instanceof HttpError).toBe(true);
    expect(e instanceof Error).toBe(true);
    expect(Object.getPrototypeOf(NotFoundError.prototype)).toBe(HttpError.prototype);
  });

  test("tiene status 404, url, mensaje y name propios", () => {
    const e = new NotFoundError("/api/users/7");
    expect(e.status).toBe(404);
    expect(e.url).toBe("/api/users/7");
    expect(e.message).toBe("No encontrado: /api/users/7");
    expect(e.name).toBe("NotFoundError");
    expect(e.isClientError).toBe(true);
  });

  test("también acepta cause", () => {
    const original = new Error("404 del backend");
    expect(new NotFoundError("/x", { cause: original }).cause).toBe(original);
  });
});

describe("HttpError.fromStatus", () => {
  test("es estático y elige la clase según el status", () => {
    const notFound = HttpError.fromStatus(404, "/a");
    expect(notFound instanceof NotFoundError).toBe(true);
    expect(notFound.url).toBe("/a");

    const other = HttpError.fromStatus(500, "/a");
    expect(other instanceof NotFoundError).toBe(false);
    expect(other instanceof HttpError).toBe(true);
    expect(other.message).toBe("HTTP 500");
    expect(new HttpError(500, "x").fromStatus).toBe(undefined);
  });
});
`,
  },
  solution: {
    "/errores.js": `export class HttpError extends Error {
  constructor(status, message, options) {
    super(message, options);
    this.name = "HttpError";
    this.status = status;
  }

  get isClientError() {
    return this.status >= 400 && this.status <= 499;
  }

  static fromStatus(status, url) {
    if (status === 404) return new NotFoundError(url);
    return new HttpError(status, "HTTP " + status);
  }
}

export class NotFoundError extends HttpError {
  constructor(url, options) {
    super(404, "No encontrado: " + url, options);
    this.name = "NotFoundError";
    this.url = url;
  }
}
`,
  },
  hints: [
    "class HttpError extends Error. En el constructor, lo primero es llamar a super(message, options): hasta entonces this no existe.",
    "El getter se declara con get isClientError() { … } y el método estático con static fromStatus(status, url) { … }. Ambos quedan fuera de las instancias.",
    "NotFoundError extiende HttpError: su constructor llama a super(404, \"No encontrado: \" + url, options) y después asigna name y url.",
  ],
};

export const sinClass: ExerciseDef = {
  id: "prototipos-y-clases-sin-class",
  title: "Herencia sin class",
  concepts: ["js.prototipos"],
  instructions:
    "Sin usar class, construye una herencia con Object.create. animal ya está hecho. Crea dog: un objeto cuyo prototipo es animal y que tapa sound() para devolver \"guau\". Implementa createAnimal(name) y createDog(name): devuelven un objeto nuevo cuyo prototipo es animal (o dog) y cuya única propiedad propia es name. Los métodos no se copian: se heredan, y todos los perros comparten las mismas funciones.",
  starter: {
    "/animales.js": `export const animal = {
  describe() {
    return this.name + " hace " + this.sound();
  },
  sound() {
    return "...";
  },
};

export const dog = {
  sound() {
    return "guau";
  },
};

export function createAnimal(name) {
  return { ...animal, name };
}

export function createDog(name) {
  // Tu código aquí
}
`,
  },
  tests: {
    "/animales.test.js": `import { animal, dog, createAnimal, createDog } from "./animales";

describe("cadena de prototipos", () => {
  test("dog hereda de animal", () => {
    expect(Object.getPrototypeOf(dog)).toBe(animal);
    expect(dog.describe).toBe(animal.describe);
  });

  test("createAnimal y createDog enlazan con el prototipo correcto", () => {
    expect(Object.getPrototypeOf(createAnimal("Nemo"))).toBe(animal);
    expect(Object.getPrototypeOf(createDog("Rex"))).toBe(dog);
  });
});

describe("propiedades propias vs heredadas", () => {
  test("la única propiedad propia es name", () => {
    const rex = createDog("Rex");
    const nemo = createAnimal("Nemo");
    expect(Object.keys(rex)).toEqual(["name"]);
    expect(Object.keys(nemo)).toEqual(["name"]);
    expect(Object.hasOwn(rex, "describe")).toBe(false);
    expect(Object.hasOwn(rex, "sound")).toBe(false);
  });

  test("los métodos se comparten entre instancias", () => {
    expect(createDog("a").describe).toBe(createDog("b").describe);
    expect(createDog("a").sound).toBe(createDog("b").sound);
  });
});

describe("búsqueda y shadowing", () => {
  test("describe usa el sound más cercano en la cadena", () => {
    expect(createAnimal("Nemo").describe()).toBe("Nemo hace ...");
    expect(createDog("Rex").describe()).toBe("Rex hace guau");
  });

  test("cambiar el prototipo afecta a todas las instancias", () => {
    const rex = createDog("Rex");
    const original = dog.sound;
    dog.sound = () => "woof";
    try {
      expect(rex.describe()).toBe("Rex hace woof");
    } finally {
      dog.sound = original;
    }
  });
});
`,
  },
  solution: {
    "/animales.js": `export const animal = {
  describe() {
    return this.name + " hace " + this.sound();
  },
  sound() {
    return "...";
  },
};

export const dog = Object.create(animal);
dog.sound = function () {
  return "guau";
};

export function createAnimal(name) {
  const obj = Object.create(animal);
  obj.name = name;
  return obj;
}

export function createDog(name) {
  const obj = Object.create(dog);
  obj.name = name;
  return obj;
}
`,
  },
  hints: [
    "Object.create(proto) devuelve un objeto vacío cuyo [[Prototype]] es proto. Úsalo para dog y para cada instancia.",
    "El spread ({ ...animal }) copia los métodos como propiedades propias: eso es justo lo que no quieres. Crea el objeto con Object.create y asígnale solo name.",
    "Para dog: crea el objeto con Object.create(animal) y después asígnale su propio sound, que tapará al de animal.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [erroresHttp, sinClass];
