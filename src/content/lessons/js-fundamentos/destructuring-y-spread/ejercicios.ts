import type { ExerciseDef } from "@/content/types";

export const mergeConfig: ExerciseDef = {
  id: "spread-merge-config",
  title: "mergeConfig(defaults, overrides)",
  concepts: ["js.spread-rest", "js.destructuring"],
  instructions:
    "Implementa mergeConfig(defaults, overrides) que devuelva un objeto nuevo con la configuración combinada. Reglas: (1) las claves de overrides pisan a las de defaults; (2) una clave cuyo valor en overrides es undefined se ignora (no borra el valor por defecto), pero null sí se respeta; (3) si en ambos lados el valor es un objeto plano (no array ni null), se combinan un nivel: { ...seccionPorDefecto, ...seccionOverride }, aplicando también la regla 2 dentro de la sección; (4) overrides puede ser undefined o null; (5) no mutes ninguno de los dos argumentos.",
  starter: {
    "/mergeConfig.js": `export function mergeConfig(defaults, overrides) {
  // Tu código aquí
  return { ...defaults, ...overrides };
}
`,
  },
  tests: {
    "/mergeConfig.test.js": `import { mergeConfig } from "./mergeConfig";

const defaults = {
  retries: 3,
  verbose: false,
  theme: { color: "blue", size: "md" },
  tags: ["base"],
};

describe("mergeConfig", () => {
  test("las claves de overrides pisan a las de defaults", () => {
    expect(mergeConfig(defaults, { retries: 5 })).toEqual({
      retries: 5,
      verbose: false,
      theme: { color: "blue", size: "md" },
      tags: ["base"],
    });
  });

  test("undefined no borra el valor por defecto, null sí se respeta", () => {
    const result = mergeConfig(defaults, { retries: undefined, verbose: null });
    expect(result.retries).toBe(3);
    expect(result.verbose).toBe(null);
  });

  test("combina las secciones anidadas un nivel", () => {
    const result = mergeConfig(defaults, { theme: { color: "red" } });
    expect(result.theme).toEqual({ color: "red", size: "md" });
  });

  test("ignora undefined también dentro de una sección", () => {
    const result = mergeConfig(defaults, { theme: { color: undefined, size: "lg" } });
    expect(result.theme).toEqual({ color: "blue", size: "lg" });
  });

  test("los arrays se reemplazan, no se combinan", () => {
    expect(mergeConfig(defaults, { tags: ["x"] }).tags).toEqual(["x"]);
  });

  test("acepta overrides undefined o null", () => {
    expect(mergeConfig(defaults)).toEqual(defaults);
    expect(mergeConfig(defaults, null)).toEqual(defaults);
  });

  test("no muta los argumentos", () => {
    const overrides = { theme: { color: "red" } };
    const result = mergeConfig(defaults, overrides);
    expect(result).not.toBe(defaults);
    expect(defaults.theme).toEqual({ color: "blue", size: "md" });
    expect(overrides).toEqual({ theme: { color: "red" } });
  });
});
`,
  },
  solution: {
    "/mergeConfig.js": `function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function withoutUndefined(obj) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

export function mergeConfig(defaults, overrides) {
  const result = { ...defaults };
  for (const [key, value] of Object.entries(withoutUndefined(overrides ?? {}))) {
    result[key] =
      isPlainObject(value) && isPlainObject(defaults[key])
        ? { ...defaults[key], ...withoutUndefined(value) }
        : value;
  }
  return result;
}
`,
  },
  hints: [
    "{ ...defaults, ...overrides } casi funciona, pero tiene dos problemas: una propiedad con valor undefined también se copia (y pisa el valor por defecto), y una sección anidada de overrides reemplaza entera a la de defaults.",
    "Escribe una función auxiliar que devuelva una copia del objeto sin las claves cuyo valor es undefined, y úsala antes de hacer spread.",
    "Object.entries(null) lanza TypeError, aunque { ...null } no falle. Normaliza overrides con ?? {} antes de recorrerlo.",
  ],
};

export const splitProps: ExerciseDef = {
  id: "destructuring-split-props",
  title: "splitProps y getButtonProps",
  concepts: ["js.destructuring", "js.spread-rest"],
  instructions:
    "Implementa dos funciones como las que usan las librerías de componentes. splitProps(props, keys) devuelve un array [picked, rest]: picked con solo las claves de keys que existen en props y rest con todas las demás; no debe mutar props. getButtonProps(options) recibe las props de un botón y devuelve las props finales para el <button>: variant (por defecto \"primary\") y size (por defecto \"md\") no se pasan al DOM; className es \"btn btn-<variant> btn-<size>\" seguido del className del padre si lo hay; el resto de props se pasan tal cual. Debe funcionar si se llama sin argumentos.",
  starter: {
    "/props.js": `export function splitProps(props, keys) {
  // Tu código aquí
  return [{}, props];
}

export function getButtonProps(options) {
  // Tu código aquí
}
`,
  },
  tests: {
    "/props.test.js": `import { getButtonProps, splitProps } from "./props";

describe("splitProps", () => {
  test("separa las claves pedidas del resto", () => {
    const onClick = () => {};
    const [picked, rest] = splitProps(
      { id: "a", title: "Hola", onClick, disabled: true },
      ["title", "disabled"],
    );
    expect(picked).toEqual({ title: "Hola", disabled: true });
    expect(rest).toEqual({ id: "a", onClick });
  });

  test("ignora claves que no existen en props", () => {
    const [picked, rest] = splitProps({ a: 1 }, ["b"]);
    expect(picked).toEqual({});
    expect(rest).toEqual({ a: 1 });
  });

  test("conserva claves presentes aunque valgan undefined", () => {
    const [picked] = splitProps({ a: undefined }, ["a"]);
    expect("a" in picked).toBe(true);
  });

  test("no muta props y devuelve objetos nuevos", () => {
    const props = { a: 1, b: 2 };
    const [, rest] = splitProps(props, ["a"]);
    expect(props).toEqual({ a: 1, b: 2 });
    expect(rest).not.toBe(props);
  });
});

describe("getButtonProps", () => {
  test("funciona sin argumentos", () => {
    expect(getButtonProps()).toEqual({ className: "btn btn-primary btn-md" });
  });

  test("usa variant y size sin pasarlos al DOM", () => {
    expect(getButtonProps({ variant: "danger", size: "sm" })).toEqual({
      className: "btn btn-danger btn-sm",
    });
  });

  test("undefined activa los valores por defecto", () => {
    expect(getButtonProps({ variant: undefined }).className).toBe("btn btn-primary btn-md");
  });

  test("añade el className del padre en vez de perderlo", () => {
    expect(getButtonProps({ className: "w-full" }).className).toBe(
      "btn btn-primary btn-md w-full",
    );
  });

  test("pasa el resto de props tal cual", () => {
    const onClick = () => {};
    const result = getButtonProps({ onClick, type: "submit", "aria-label": "Guardar" });
    expect(result.onClick).toBe(onClick);
    expect(result.type).toBe("submit");
    expect(result["aria-label"]).toBe("Guardar");
  });
});
`,
  },
  solution: {
    "/props.js": `export function splitProps(props, keys) {
  const picked = {};
  let rest = { ...props };
  for (const key of keys) {
    if (key in rest) {
      const { [key]: value, ...others } = rest;
      picked[key] = value;
      rest = others;
    }
  }
  return [picked, rest];
}

export function getButtonProps({ variant = "primary", size = "md", className, ...rest } = {}) {
  const classes = ["btn", "btn-" + variant, "btn-" + size];
  if (className) classes.push(className);
  return { ...rest, className: classes.join(" ") };
}
`,
  },
  hints: [
    "En splitProps puedes usar destructuring con clave calculada y rest: const { [key]: value, ...others } = obj saca una clave dinámica y deja el resto en others.",
    "Para saber si una clave existe aunque valga undefined, usa key in obj en vez de comparar con undefined.",
    "En getButtonProps destructura en la firma: ({ variant = \"primary\", size = \"md\", className, ...rest } = {}). El = {} final es lo que permite llamarla sin argumentos.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [mergeConfig, splitProps];
