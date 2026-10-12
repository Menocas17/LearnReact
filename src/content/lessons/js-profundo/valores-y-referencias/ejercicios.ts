import type { ExerciseDef } from "@/content/types";

const actualizarAnidado: ExerciseDef = {
  id: "inmutabilidad-actualizar-anidado",
  title: "Actualizar estado anidado sin mutar",
  concepts: ["js.inmutabilidad", "js.valor-referencia"],
  instructions:
    "Este código actualiza un estado anidado mutándolo, así que React no detectaría los cambios. Reescribe setCity, toggleTodo y removeTodo para que devuelvan un estado nuevo sin tocar el original. Copia solo lo que está en el camino del cambio: las ramas que no cambian deben conservar su referencia (por ejemplo, settings tiene que ser el mismo objeto). Si removeTodo recibe un id que no existe, devuelve el mismo estado.",
  starter: {
    "/estado.js": `// Forma del estado:
// {
//   user: { name: "Ana", address: { city: "Lima", zip: "15001" } },
//   settings: { theme: "claro" },
//   todos: [{ id: 1, text: "Comprar pan", done: false }, ...]
// }

export function setCity(state, city) {
  state.user.address.city = city;
  return state;
}

export function toggleTodo(state, id) {
  const todo = state.todos.find((t) => t.id === id);
  todo.done = !todo.done;
  return { ...state };
}

export function removeTodo(state, id) {
  const index = state.todos.findIndex((t) => t.id === id);
  state.todos.splice(index, 1);
  return { ...state, todos: state.todos };
}
`,
  },
  tests: {
    "/estado.test.js": `import { setCity, toggleTodo, removeTodo } from "./estado";

function createState() {
  return {
    user: { name: "Ana", address: { city: "Lima", zip: "15001" } },
    settings: { theme: "claro" },
    todos: [
      { id: 1, text: "Comprar pan", done: false },
      { id: 2, text: "Llamar a Luis", done: true },
      { id: 3, text: "Estudiar JS", done: false },
    ],
  };
}

describe("setCity", () => {
  test("cambia la ciudad en el estado nuevo", () => {
    const next = setCity(createState(), "Quito");
    expect(next.user.address.city).toBe("Quito");
    expect(next.user.address.zip).toBe("15001");
    expect(next.user.name).toBe("Ana");
  });

  test("no modifica el estado original", () => {
    const state = createState();
    setCity(state, "Quito");
    expect(state).toEqual(createState());
  });

  test("crea objetos nuevos solo en el camino del cambio", () => {
    const state = createState();
    const next = setCity(state, "Quito");
    expect(next).not.toBe(state);
    expect(next.user).not.toBe(state.user);
    expect(next.user.address).not.toBe(state.user.address);
    expect(next.settings).toBe(state.settings);
    expect(next.todos).toBe(state.todos);
  });
});

describe("toggleTodo", () => {
  test("invierte done de la tarea indicada", () => {
    const next = toggleTodo(createState(), 2);
    expect(next.todos.map((t) => t.done)).toEqual([false, false, false]);
  });

  test("no modifica el estado original", () => {
    const state = createState();
    toggleTodo(state, 1);
    expect(state).toEqual(createState());
  });

  test("solo copia el array y la tarea que cambia", () => {
    const state = createState();
    const next = toggleTodo(state, 1);
    expect(next.todos).not.toBe(state.todos);
    expect(next.todos[0]).not.toBe(state.todos[0]);
    expect(next.todos[1]).toBe(state.todos[1]);
    expect(next.todos[2]).toBe(state.todos[2]);
    expect(next.user).toBe(state.user);
    expect(next.settings).toBe(state.settings);
  });
});

describe("removeTodo", () => {
  test("elimina la tarea sin tocar el original", () => {
    const state = createState();
    const next = removeTodo(state, 2);
    expect(next.todos.map((t) => t.id)).toEqual([1, 3]);
    expect(state.todos.length).toBe(3);
    expect(next.todos[0]).toBe(state.todos[0]);
    expect(next.user).toBe(state.user);
  });

  test("si el id no existe devuelve el mismo estado", () => {
    const state = createState();
    expect(removeTodo(state, 99)).toBe(state);
    expect(state.todos.length).toBe(3);
  });
});
`,
  },
  solution: {
    "/estado.js": `export function setCity(state, city) {
  return {
    ...state,
    user: {
      ...state.user,
      address: { ...state.user.address, city },
    },
  };
}

export function toggleTodo(state, id) {
  return {
    ...state,
    todos: state.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  };
}

export function removeTodo(state, id) {
  if (!state.todos.some((t) => t.id === id)) return state;
  return { ...state, todos: state.todos.filter((t) => t.id !== id) };
}
`,
  },
  hints: [
    "Recorre el camino desde la raíz hasta el valor que cambia: cada objeto de ese camino necesita una copia nueva con spread; todo lo demás se reutiliza tal cual.",
    "Para setCity anida tres spreads: el estado, user y address. Para las tareas, map devuelve un array nuevo: copia solo la tarea cuyo id coincide y devuelve las demás sin tocar.",
    "Para eliminar, filter crea un array nuevo sin mutar. Comprueba antes con some si el id existe; si no, devuelve state directamente.",
  ],
};

const reducer: ExerciseDef = {
  id: "inmutabilidad-reducer-tareas",
  title: "Reducer de tareas que no muta",
  concepts: ["js.inmutabilidad", "js.valor-referencia"],
  instructions:
    "Implementa todosReducer(todos, action), que recibe un array de tareas { id, text, done } y una acción, y devuelve el array siguiente sin mutar el recibido (los tests lo congelan en profundidad: cualquier mutación lanza un error). Acciones: { type: \"added\", id, text } añade al final una tarea con done: false; { type: \"toggled\", id } invierte done; { type: \"deleted\", id } la elimina; { type: \"sorted\" } ordena por text (usa localeCompare). Ante una acción desconocida, devuelve el mismo array.",
  starter: {
    "/reducer.js": `export function todosReducer(todos, action) {
  switch (action.type) {
    case "added":
      todos.push({ id: action.id, text: action.text, done: false });
      return todos;
    case "toggled": {
      const todo = todos.find((t) => t.id === action.id);
      todo.done = !todo.done;
      return [...todos];
    }
    case "deleted":
      todos.splice(todos.findIndex((t) => t.id === action.id), 1);
      return todos;
    case "sorted":
      return todos.sort((a, b) => a.text.localeCompare(b.text));
    default:
      return [...todos];
  }
}
`,
  },
  tests: {
    "/reducer.test.js": `import { todosReducer } from "./reducer";

function deepFreeze(value) {
  Object.values(value).forEach((v) => {
    if (typeof v === "object" && v !== null) deepFreeze(v);
  });
  return Object.freeze(value);
}

function createTodos() {
  return deepFreeze([
    { id: 1, text: "Pasear", done: false },
    { id: 2, text: "Comprar", done: true },
    { id: 3, text: "Leer", done: false },
  ]);
}

describe("todosReducer", () => {
  test("added añade una tarea al final", () => {
    const todos = createTodos();
    const next = todosReducer(todos, { type: "added", id: 4, text: "Cocinar" });
    expect(next.length).toBe(4);
    expect(next[3]).toEqual({ id: 4, text: "Cocinar", done: false });
    expect(todos.length).toBe(3);
  });

  test("toggled invierte done y solo copia esa tarea", () => {
    const todos = createTodos();
    const next = todosReducer(todos, { type: "toggled", id: 2 });
    expect(next[1].done).toBe(false);
    expect(todos[1].done).toBe(true);
    expect(next[1]).not.toBe(todos[1]);
    expect(next[0]).toBe(todos[0]);
  });

  test("deleted elimina la tarea", () => {
    const todos = createTodos();
    const next = todosReducer(todos, { type: "deleted", id: 1 });
    expect(next.map((t) => t.id)).toEqual([2, 3]);
    expect(todos.length).toBe(3);
  });

  test("sorted ordena por texto sin tocar el original", () => {
    const todos = createTodos();
    const next = todosReducer(todos, { type: "sorted" });
    expect(next.map((t) => t.text)).toEqual(["Comprar", "Leer", "Pasear"]);
    expect(todos.map((t) => t.text)).toEqual(["Pasear", "Comprar", "Leer"]);
    expect(next).not.toBe(todos);
  });

  test("una acción desconocida devuelve el mismo array", () => {
    const todos = createTodos();
    expect(todosReducer(todos, { type: "desconocida" })).toBe(todos);
  });
});
`,
  },
  solution: {
    "/reducer.js": `export function todosReducer(todos, action) {
  switch (action.type) {
    case "added":
      return [...todos, { id: action.id, text: action.text, done: false }];
    case "toggled":
      return todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case "deleted":
      return todos.filter((t) => t.id !== action.id);
    case "sorted":
      return todos.toSorted((a, b) => a.text.localeCompare(b.text));
    default:
      return todos;
  }
}
`,
  },
  hints: [
    "Identifica los métodos que mutan en el código inicial (push, sort, splice y la asignación a todo.done) y sustitúyelos por equivalentes que devuelvan un array nuevo.",
    "added: spread con el elemento nuevo al final. toggled: map copiando solo la tarea que coincide. deleted: filter. sorted: toSorted.",
    "En la acción desconocida no copies: devolver el mismo array es lo que permite que React (o cualquier comparación con ===) sepa que nada cambió.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [actualizarAnidado, reducer];
