import type { ExerciseDef } from "@/content/types";

export const withDefaults: ExerciseDef = {
  id: "cortocircuito-with-defaults",
  title: "Valores por defecto que respetan el 0",
  concepts: ["js.cortocircuito"],
  instructions:
    "Implementa withDefaults(options), que devuelve un objeto nuevo { timeout, retries, label, cache, theme } con estos valores por defecto: timeout 3000, retries 3, label \"sin nombre\", cache true y theme \"claro\" (theme se lee de options.ui.theme). Solo se usa el valor por defecto cuando el valor es null o undefined: 0, \"\" y false son valores legítimos. options y options.ui pueden no existir. Implementa también notify(options, message): si options.onError existe, la llama con message y devuelve su resultado; si no existe (o devuelve null/undefined), devuelve \"sin manejador\". Intenta resolverlo sin ningún if.",
  starter: {
    "/config.js": `export function withDefaults(options) {
  return {
    timeout: options.timeout || 3000,
    retries: options.retries || 3,
    label: options.label || "sin nombre",
    cache: options.cache || true,
    theme: options.ui.theme || "claro",
  };
}

export function notify(options, message) {
  return options.onError(message) || "sin manejador";
}
`,
  },
  tests: {
    "/config.test.js": `import { withDefaults, notify } from "./config";

const DEFAULTS = {
  timeout: 3000,
  retries: 3,
  label: "sin nombre",
  cache: true,
  theme: "claro",
};

describe("withDefaults", () => {
  test("rellena todo si no hay opciones", () => {
    expect(withDefaults()).toEqual(DEFAULTS);
    expect(withDefaults(null)).toEqual(DEFAULTS);
    expect(withDefaults({})).toEqual(DEFAULTS);
  });

  test("respeta 0, cadena vacía y false", () => {
    expect(withDefaults({ timeout: 0, retries: 0, label: "", cache: false })).toEqual({
      timeout: 0,
      retries: 0,
      label: "",
      cache: false,
      theme: "claro",
    });
  });

  test("rellena null y undefined explícitos", () => {
    expect(withDefaults({ timeout: null, label: undefined, cache: null })).toEqual(DEFAULTS);
  });

  test("lee theme de ui aunque ui no exista", () => {
    expect(withDefaults({ ui: { theme: "oscuro" } }).theme).toBe("oscuro");
    expect(withDefaults({ ui: {} }).theme).toBe("claro");
    expect(withDefaults({ ui: null }).theme).toBe("claro");
    expect(withDefaults({ ui: { theme: "" } }).theme).toBe("");
  });

  test("no muta el objeto recibido", () => {
    const options = { timeout: 0 };
    withDefaults(options);
    expect(options).toEqual({ timeout: 0 });
  });
});

describe("notify", () => {
  test("llama a onError con el mensaje", () => {
    const received = [];
    const result = notify(
      {
        onError: (m) => {
          received.push(m);
          return "avisado";
        },
      },
      "falló",
    );
    expect(received).toEqual(["falló"]);
    expect(result).toBe("avisado");
  });

  test("respeta resultados falsy que no son null/undefined", () => {
    expect(notify({ onError: () => 0 }, "x")).toBe(0);
    expect(notify({ onError: () => false }, "x")).toBe(false);
  });

  test("sin manejador no lanza", () => {
    expect(notify({}, "x")).toBe("sin manejador");
    expect(notify(undefined, "x")).toBe("sin manejador");
    expect(notify({ onError: () => undefined }, "x")).toBe("sin manejador");
  });
});
`,
  },
  solution: {
    "/config.js": `export function withDefaults(options) {
  return {
    timeout: options?.timeout ?? 3000,
    retries: options?.retries ?? 3,
    label: options?.label ?? "sin nombre",
    cache: options?.cache ?? true,
    theme: options?.ui?.theme ?? "claro",
  };
}

export function notify(options, message) {
  return options?.onError?.(message) ?? "sin manejador";
}
`,
  },
  hints: [
    "|| descarta cualquier valor falsy (0, \"\", false, NaN…). ¿Qué operador descarta solo null y undefined?",
    "options puede ser undefined: options.timeout lanzaría un TypeError. Usa ?. en cada acceso que pueda fallar, también en options?.ui?.theme.",
    "Para llamar a una función que puede no existir, usa ?.() después del nombre: options?.onError?.(message).",
  ],
};

export const guardClauses: ExerciseDef = {
  id: "control-guard-clauses",
  title: "De ifs anidados a guard clauses",
  concepts: ["js.control-flujo", "js.cortocircuito"],
  instructions:
    "shippingCost(order) tiene bugs y es difícil de leer. Reescríbela con guard clauses (returns tempranos), un switch y for...of para que cumpla esta especificación, en este orden: 1) si order es null o undefined, devuelve null; 2) si order.status es \"cancelled\", devuelve 0; 3) si no hay items (no existe o está vacío), devuelve 0; 4) si el subtotal (suma de price * qty) es 100 o más, el envío es gratis (0); 5) el costo base depende de order.country: \"ES\" 5; \"MX\", \"AR\" y \"CO\" 10; \"US\" 15; cualquier otro, 25; 6) si order.express es true, el costo se duplica.",
  starter: {
    "/shipping.js": `export function shippingCost(order) {
  if (order) {
    if (order.status != "cancelled") {
      if (order.items.length) {
        let subtotal = 0;
        for (const i in order.items) {
          subtotal += order.items[i].price * order.items[i].qty;
        }
        if (subtotal > 100) {
          return 0;
        } else {
          let cost = 25;
          if (order.country == "ES") {
            cost = 5;
          } else {
            if (order.country == "MX" || order.country == "AR") {
              cost = 10;
            } else {
              if (order.country == "US") cost = 15;
            }
          }
          return order.express ? cost * 2 : cost;
        }
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
  return null;
}
`,
  },
  tests: {
    "/shipping.test.js": `import { shippingCost } from "./shipping";

const item = (price, qty = 1) => ({ price, qty });

describe("shippingCost", () => {
  test("sin pedido devuelve null", () => {
    expect(shippingCost(null)).toBe(null);
    expect(shippingCost(undefined)).toBe(null);
  });

  test("pedidos cancelados no pagan envío", () => {
    expect(shippingCost({ status: "cancelled", country: "US", items: [item(10)] })).toBe(0);
  });

  test("sin items no paga envío (aunque falte la propiedad)", () => {
    expect(shippingCost({ country: "ES", items: [] })).toBe(0);
    expect(shippingCost({ country: "ES" })).toBe(0);
  });

  test("envío gratis desde 100 (incluido)", () => {
    expect(shippingCost({ country: "US", items: [item(50, 2)] })).toBe(0);
    expect(shippingCost({ country: "US", items: [item(60), item(40)] })).toBe(0);
    expect(shippingCost({ country: "US", items: [item(99.5)] })).toBe(15);
  });

  test("costo base por país", () => {
    const cost = (country) => shippingCost({ country, items: [item(10)] });
    expect(cost("ES")).toBe(5);
    expect(cost("MX")).toBe(10);
    expect(cost("AR")).toBe(10);
    expect(cost("CO")).toBe(10);
    expect(cost("US")).toBe(15);
    expect(cost("FR")).toBe(25);
    expect(cost(undefined)).toBe(25);
  });

  test("express duplica el costo", () => {
    expect(shippingCost({ country: "CO", express: true, items: [item(10)] })).toBe(20);
    expect(shippingCost({ country: "ES", express: true, items: [item(200)] })).toBe(0);
  });
});
`,
  },
  solution: {
    "/shipping.js": `function baseCost(country) {
  switch (country) {
    case "ES":
      return 5;
    case "MX":
    case "AR":
    case "CO":
      return 10;
    case "US":
      return 15;
    default:
      return 25;
  }
}

export function shippingCost(order) {
  if (order == null) return null;
  if (order.status === "cancelled") return 0;
  if (!order.items?.length) return 0;

  let subtotal = 0;
  for (const { price, qty } of order.items) {
    subtotal += price * qty;
  }
  if (subtotal >= 100) return 0;

  const cost = baseCost(order.country);
  return order.express ? cost * 2 : cost;
}
`,
  },
  hints: [
    "Empieza por los casos que terminan pronto: cada condición de la especificación que devuelve algo fijo es un if con return al principio de la función.",
    "order.items puede no existir: order.items?.length es undefined en ese caso, y !undefined es true.",
    "En el switch, varios case seguidos sin código entre ellos comparten el mismo bloque (fallthrough intencionado). Si cada case hace return, no necesitas break.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [withDefaults, guardClauses];
