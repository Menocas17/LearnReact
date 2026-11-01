import type { BugDef } from "../types";
import { miniDom } from "./mini-dom";

/** Los tests de este módulo usan un mini DOM (no hay document en el Web Worker ni en Node). */
const dom = { "/mini-dom.js": miniDom };

/** Bugs del módulo 4, de principiante a avanzado. El módulo aún no tiene lecciones. */
export const bugsM04: readonly BugDef[] = [
  {
    id: "bug-comentario-innerhtml",
    title: "#D01 · Un comentario ejecuta código en la página",
    level: "principiante",
    moduleId: "m04",
    report: {
      reportedBy: "Seguridad · Irene",
      where: "Blog › comentarios",
      steps: [
        "Publica un comentario con el texto <img src=x onerror=alert(1)>.",
        "Recarga el artículo.",
      ],
      actual: "Sale una alerta: el navegador interpreta el comentario como HTML y ejecuta el onerror.",
      expected: "El comentario se muestra como texto plano: \"Ana: <img src=x onerror=alert(1)>\".",
    },
    concepts: ["dom.manipulacion"],
    instructions:
      "Seguridad: alguien publicó un comentario con una etiqueta <img onerror> y se ejecutó su código a todos los lectores. Lo que escribe un usuario nunca debe interpretarse como HTML. (En React, JSX ya escapa el texto; el agujero equivalente es dangerouslySetInnerHTML.)",
    starter: {
      "/comentario.js": `// el es el <p> del comentario; comment = { author, text } viene de la API
export function renderComment(el, comment) {
  el.innerHTML = comment.author + ": " + comment.text;
}
`,
    },
    tests: {
      ...dom,
      "/comentario.test.js": `import { Element } from "./mini-dom";
import { renderComment } from "./comentario";

const ataque = "<img src=x onerror=alert(1)>";

test("el texto del usuario no se interpreta como HTML", () => {
  const p = new Element("p");
  renderComment(p, { author: "Ana", text: ataque });
  expect(p.innerHTML).not.toContain("<img");
});

test("el comentario se ve tal cual lo escribió", () => {
  const p = new Element("p");
  renderComment(p, { author: "Ana", text: ataque });
  expect(p.textContent).toBe("Ana: " + ataque);
});

test("un comentario normal se pinta igual que antes", () => {
  const p = new Element("p");
  renderComment(p, { author: "Luis", text: "¡Gran artículo!" });
  expect(p.textContent).toBe("Luis: ¡Gran artículo!");
});
`,
    },
    solution: {
      "/comentario.js": `export function renderComment(el, comment) {
  el.textContent = comment.author + ": " + comment.text;
}
`,
    },
    hints: [
      "innerHTML parsea el string como HTML; hay otra propiedad que lo trata como texto.",
      "textContent nunca crea etiquetas: los < se muestran como caracteres.",
    ],
  },
  {
    id: "bug-buscador-recarga",
    title: "#D02 · El buscador recarga la página",
    level: "principiante",
    moduleId: "m04",
    report: {
      reportedBy: "QA · Lucía",
      where: "Tienda › buscador de la cabecera",
      steps: ["Escribe \"zapatillas\" en el buscador.", "Pulsa Enter."],
      actual: "Los resultados aparecen un instante y la página se recarga, con la URL terminada en ?.",
      expected: "Se buscan los resultados sin recargar. Si el campo está vacío (o solo tiene espacios), no se busca nada.",
    },
    concepts: ["dom.eventos", "dom.formularios"],
    instructions:
      "QA: al pulsar Enter en el buscador los resultados parpadean y la página se recarga. El listener del submit parece que se ejecuta, pero algo no se está cancelando.",
    starter: {
      "/buscador.js": `// form es el <form> del buscador; dentro hay un <input>
export function setupSearch(form, onSearch) {
  form.addEventListener("submit", (e) => {
    e.preventDefault;
    const query = form.querySelector("input").value.trim();
    if (query) onSearch(query);
  });
}
`,
    },
    tests: {
      ...dom,
      "/buscador.test.js": `import { Event, h } from "./mini-dom";
import { setupSearch } from "./buscador";

function montar(valor) {
  const input = h("input", { value: valor });
  const form = h("form", {}, input);
  const busquedas = [];
  setupSearch(form, (q) => busquedas.push(q));
  const evento = new Event("submit");
  form.dispatchEvent(evento);
  return { evento, busquedas };
}

test("cancela el envío nativo del formulario", () => {
  const { evento } = montar("zapatillas");
  expect(evento.defaultPrevented).toBe(true);
});

test("busca el texto sin espacios", () => {
  expect(montar("  zapatillas ").busquedas).toEqual(["zapatillas"]);
});

test("con el campo vacío no busca, pero tampoco recarga", () => {
  const { evento, busquedas } = montar("   ");
  expect(busquedas).toEqual([]);
  expect(evento.defaultPrevented).toBe(true);
});
`,
    },
    solution: {
      "/buscador.js": `export function setupSearch(form, onSearch) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = form.querySelector("input").value.trim();
    if (query) onSearch(query);
  });
}
`,
    },
    hints: [
      "Mira bien la primera línea del listener: ¿se está ejecutando algo?",
      "e.preventDefault es una función; nombrarla no la llama.",
    ],
  },
  {
    id: "bug-reserva-campos-texto",
    title: "#D03 · 2 adultos y 1 niño suman 21 personas",
    level: "principiante",
    moduleId: "m04",
    report: {
      reportedBy: "Soporte · Andrea",
      where: "Reservas › formulario de mesa",
      steps: [
        "Escribe 2 en adultos y 1 en niños.",
        "Deja sin marcar \"Quiero recibir ofertas\".",
        "Envía la reserva.",
      ],
      actual: "La reserva llega con total \"21\" y el cliente aparece suscrito a la newsletter.",
      expected: "{ adults: 2, kids: 1, total: 3, newsletter: false }. Un campo de niños vacío cuenta como 0.",
    },
    concepts: ["dom.formularios"],
    instructions:
      "Soporte: un cliente reservó para 2 adultos y 1 niño y en el panel aparece una mesa para 21. Además, todos salen suscritos a las ofertas aunque no marquen la casilla.",
    starter: {
      "/reserva.js": `// form contiene #adultos, #ninos (inputs numéricos) y #newsletter (checkbox)
export function readBooking(form) {
  const adults = form.querySelector("#adultos").value;
  const kids = form.querySelector("#ninos").value;
  return {
    adults,
    kids,
    total: adults + kids,
    newsletter: Boolean(form.querySelector("#newsletter").value),
  };
}
`,
    },
    tests: {
      ...dom,
      "/reserva.test.js": `import { h } from "./mini-dom";
import { readBooking } from "./reserva";

function formulario(adultos, ninos, marcado) {
  const check = h("input", { id: "newsletter", value: "on" });
  check.checked = marcado; // como un checkbox real: value siempre es "on"
  return h("form", {}, h("input", { id: "adultos", value: adultos }), h("input", { id: "ninos", value: ninos }), check);
}

test("convierte los campos a número y suma bien", () => {
  expect(readBooking(formulario("2", "1", false))).toEqual({ adults: 2, kids: 1, total: 3, newsletter: false });
});

test("un campo vacío cuenta como 0", () => {
  const r = readBooking(formulario("4", "", false));
  expect(r.kids).toBe(0);
  expect(r.total).toBe(4);
});

test("la casilla marcada suscribe", () => {
  expect(readBooking(formulario("1", "0", true)).newsletter).toBe(true);
});
`,
    },
    solution: {
      "/reserva.js": `export function readBooking(form) {
  const adults = Number(form.querySelector("#adultos").value);
  const kids = Number(form.querySelector("#ninos").value);
  return {
    adults,
    kids,
    total: adults + kids,
    newsletter: form.querySelector("#newsletter").checked,
  };
}
`,
    },
    hints: [
      "El value de un input siempre es un string, aunque sea type=\"number\".",
      "Un checkbox no cambia su value al marcarlo: lo que cambia es otra propiedad.",
    ],
  },
  {
    id: "bug-tarjeta-target-icono",
    title: "#D04 · \"Añadir\" falla si pulsas el icono del carrito",
    level: "principiante",
    moduleId: "m04",
    report: {
      reportedBy: "QA · Lucía",
      where: "Catálogo › botón Añadir de cada producto",
      steps: ["Pulsa el texto \"Añadir\" de un producto.", "Pulsa el icono 🛒 del mismo botón."],
      actual: "Con el texto funciona. Con el icono se añade un producto con id undefined.",
      expected: "Pulses donde pulses dentro del botón, se añade el producto de ese botón.",
    },
    concepts: ["dom.propagacion", "dom.eventos"],
    instructions:
      "QA: el botón Añadir solo funciona si pulsas justo el texto. Si pulsas el icono que lleva dentro, el carrito recibe un producto con id undefined. El listener está en el botón, pero lee el id de otro sitio.",
    starter: {
      "/catalogo.js": `// Cada botón: <button data-id="p1"><span class="icono">🛒</span><span>Añadir</span></button>
export function setupAddButtons(root, onAdd) {
  root.querySelectorAll("[data-id]").forEach((button) => {
    button.addEventListener("click", (e) => {
      onAdd(e.target.dataset.id);
    });
  });
}
`,
    },
    tests: {
      ...dom,
      "/catalogo.test.js": `import { Event, h } from "./mini-dom";
import { setupAddButtons } from "./catalogo";

function boton(id) {
  return h("button", { dataset: { id } }, h("span", { className: "icono", text: "🛒" }), h("span", { text: "Añadir" }));
}

function montar() {
  const root = h("section", {}, boton("p1"), boton("p2"));
  const ids = [];
  setupAddButtons(root, (id) => ids.push(id));
  return { root, ids };
}

test("pulsar el botón añade su producto", () => {
  const { root, ids } = montar();
  root.querySelectorAll("[data-id]")[1].dispatchEvent(new Event("click"));
  expect(ids).toEqual(["p2"]);
});

test("pulsar el icono de dentro también", () => {
  const { root, ids } = montar();
  root.querySelector(".icono").dispatchEvent(new Event("click"));
  expect(ids).toEqual(["p1"]);
});

test("pulsar el texto de dentro también", () => {
  const { root, ids } = montar();
  root.querySelectorAll("span")[3].dispatchEvent(new Event("click"));
  expect(ids).toEqual(["p2"]);
});
`,
    },
    solution: {
      "/catalogo.js": `export function setupAddButtons(root, onAdd) {
  root.querySelectorAll("[data-id]").forEach((button) => {
    button.addEventListener("click", (e) => {
      onAdd(e.currentTarget.dataset.id);
    });
  });
}
`,
    },
    hints: [
      "Cuando pulsas el icono, ¿qué elemento es e.target? ¿Tiene data-id?",
      "e.target es donde empezó el clic; e.currentTarget es el elemento que tiene el listener.",
    ],
  },
  {
    id: "bug-bandeja-items-nuevos",
    title: "#D05 · Los mensajes nuevos no se abren",
    level: "intermedio",
    moduleId: "m04",
    report: {
      reportedBy: "Producto · Nerea",
      where: "Bandeja de entrada › lista de mensajes",
      steps: ["Abre la bandeja.", "Espera a que llegue un mensaje nuevo (se añade arriba sin recargar).", "Pulsa el mensaje nuevo."],
      actual: "No pasa nada. Los mensajes que había al cargar sí se abren.",
      expected: "Cualquier mensaje de la lista se abre al pulsarlo, también los que llegan después. Pulsar el hueco vacío de la lista no hace nada.",
    },
    concepts: ["dom.delegacion"],
    instructions:
      "Producto: los mensajes que llegan en tiempo real aparecen en la lista, pero no se pueden abrir hasta recargar la página. Los listeners se ponen al montar la lista, uno por mensaje. (React evita este problema porque registra los eventos una sola vez en la raíz: delegación.)",
    starter: {
      "/bandeja.js": `// list es el <ul>; cada mensaje es un <li data-id="..."> con elementos dentro
export function setupInbox(list, onOpen) {
  list.querySelectorAll("[data-id]").forEach((item) => {
    item.addEventListener("click", () => onOpen(item.dataset.id));
  });
}
`,
    },
    tests: {
      ...dom,
      "/bandeja.test.js": `import { Event, h } from "./mini-dom";
import { setupInbox } from "./bandeja";

const mensaje = (id, asunto) => h("li", { dataset: { id } }, h("strong", { text: asunto }));

function montar() {
  const list = h("ul", {}, mensaje("m1", "Factura"), mensaje("m2", "Reunión"));
  const abiertos = [];
  setupInbox(list, (id) => abiertos.push(id));
  return { list, abiertos };
}

test("los mensajes iniciales se abren", () => {
  const { list, abiertos } = montar();
  list.querySelectorAll("strong")[1].dispatchEvent(new Event("click"));
  expect(abiertos).toEqual(["m2"]);
});

test("un mensaje añadido después también se abre", () => {
  const { list, abiertos } = montar();
  const nuevo = mensaje("m3", "Oferta");
  list.append(nuevo);
  nuevo.querySelector("strong").dispatchEvent(new Event("click"));
  expect(abiertos).toEqual(["m3"]);
});

test("pulsar la lista fuera de un mensaje no abre nada", () => {
  const { list, abiertos } = montar();
  list.dispatchEvent(new Event("click"));
  expect(abiertos).toEqual([]);
});
`,
    },
    solution: {
      "/bandeja.js": `export function setupInbox(list, onOpen) {
  list.addEventListener("click", (e) => {
    const item = e.target.closest("[data-id]");
    if (item) onOpen(item.dataset.id);
  });
}
`,
    },
    hints: [
      "querySelectorAll solo encuentra los elementos que existen en ese momento.",
      "Pon un único listener en la lista y averigua el mensaje con e.target.closest(\"[data-id]\").",
    ],
  },
  {
    id: "bug-tabla-borrar-icono",
    title: "#D06 · La papelera de la tabla a veces no borra",
    level: "intermedio",
    moduleId: "m04",
    report: {
      reportedBy: "Backoffice · Tomás",
      where: "Admin › tabla de usuarios",
      steps: ["Pulsa el borde del botón Borrar de una fila.", "Pulsa el icono 🗑 del centro del mismo botón."],
      actual: "Con el borde se borra; con el icono no pasa nada.",
      expected: "Pulsar cualquier parte del botón Borrar borra esa fila. Pulsar la fila fuera del botón no borra nada.",
    },
    concepts: ["dom.delegacion", "dom.propagacion"],
    instructions:
      "Backoffice: hay que pulsar el borde exacto del botón Borrar para que funcione; si pulsas el icono de la papelera, no hace nada. La tabla usa un único listener en el <tbody>.",
    starter: {
      "/usuarios.js": `// Cada fila: <tr data-id="u1"><td>Ana</td><td><button class="borrar"><span>🗑</span></button></td></tr>
export function setupUserTable(tbody, onDelete) {
  tbody.addEventListener("click", (e) => {
    if (e.target.matches(".borrar")) {
      onDelete(e.target.closest("tr").dataset.id);
    }
  });
}
`,
    },
    tests: {
      ...dom,
      "/usuarios.test.js": `import { Event, h } from "./mini-dom";
import { setupUserTable } from "./usuarios";

const fila = (id, nombre) =>
  h("tr", { dataset: { id } }, h("td", { text: nombre }), h("td", {}, h("button", { className: "borrar" }, h("span", { text: "🗑" }))));

function montar() {
  const tbody = h("tbody", {}, fila("u1", "Ana"), fila("u2", "Luis"));
  const borrados = [];
  setupUserTable(tbody, (id) => borrados.push(id));
  return { tbody, borrados };
}

test("pulsar el botón borra su fila", () => {
  const { tbody, borrados } = montar();
  tbody.querySelectorAll(".borrar")[0].dispatchEvent(new Event("click"));
  expect(borrados).toEqual(["u1"]);
});

test("pulsar el icono de dentro del botón también borra", () => {
  const { tbody, borrados } = montar();
  tbody.querySelectorAll("span")[1].dispatchEvent(new Event("click"));
  expect(borrados).toEqual(["u2"]);
});

test("pulsar el nombre no borra", () => {
  const { tbody, borrados } = montar();
  tbody.querySelector("td").dispatchEvent(new Event("click"));
  expect(borrados).toEqual([]);
});
`,
    },
    solution: {
      "/usuarios.js": `export function setupUserTable(tbody, onDelete) {
  tbody.addEventListener("click", (e) => {
    const button = e.target.closest(".borrar");
    if (button) {
      onDelete(button.closest("tr").dataset.id);
    }
  });
}
`,
    },
    hints: [
      "matches comprueba solo el elemento exacto que se pulsó.",
      "closest sube por los ancestros (empezando por el propio elemento) hasta encontrar uno que encaje.",
    ],
  },
  {
    id: "bug-favorito-stoppropagation",
    title: "#D07 · La estrella de favoritos deja el menú abierto",
    level: "intermedio",
    moduleId: "m04",
    report: {
      reportedBy: "Diseño · Marco",
      where: "Proyectos › lista con menú \"Más acciones\"",
      steps: ["Abre el menú \"Más acciones\" de la cabecera.", "Pulsa la estrella ☆ de un proyecto de la lista."],
      actual: "El proyecto se marca como favorito, pero el menú sigue abierto. Pulsando cualquier otra parte de la página sí se cierra.",
      expected: "La estrella marca el favorito sin abrir el proyecto, y el menú se cierra como con cualquier otro clic.",
    },
    concepts: ["dom.propagacion", "dom.delegacion"],
    instructions:
      "Diseño: cuando el menú de acciones está abierto y marco un favorito, el menú no se cierra. Alguien puso un stopPropagation en la estrella para que no se abriera el proyecto, y eso corta el clic para todos los que escuchan más arriba. (En React pasa igual: un e.stopPropagation() en un onClick deja ciegos a los \"clic fuera\" de otros componentes.)",
    starter: {
      "/proyectos.js": `// Fila: <li data-id="p1"><span>Web</span><button data-action="fav">☆</button></li>
export function setupRow(row, onOpen) {
  row.addEventListener("click", () => onOpen(row.dataset.id));
}

export function setupFavorite(button, onFav) {
  button.addEventListener("click", (e) => {
    e.stopPropagation(); // para que no se abra el proyecto
    onFav(button.closest("[data-id]").dataset.id);
  });
}

// No toques esta: cierra el menú con cualquier clic fuera de él
export function setupMenuClose(page, menu) {
  page.addEventListener("click", (e) => {
    if (!e.target.closest(".menu")) menu.classList.remove("abierto");
  });
}
`,
    },
    tests: {
      ...dom,
      "/proyectos.test.js": `import { Event, h } from "./mini-dom";
import { setupRow, setupFavorite, setupMenuClose } from "./proyectos";

function montar() {
  const estrella = h("button", { dataset: { action: "fav" }, text: "☆" });
  const nombre = h("span", { text: "Web" });
  const row = h("li", { dataset: { id: "p1" } }, nombre, estrella);
  const menu = h("div", { className: "menu abierto" });
  const page = h("main", {}, menu, h("ul", {}, row));
  const log = { abiertos: [], favs: [] };
  setupRow(row, (id) => log.abiertos.push(id));
  setupFavorite(estrella, (id) => log.favs.push(id));
  setupMenuClose(page, menu);
  return { estrella, nombre, menu, log };
}

test("la estrella marca favorito sin abrir el proyecto", () => {
  const { estrella, log } = montar();
  estrella.dispatchEvent(new Event("click"));
  expect(log.favs).toEqual(["p1"]);
  expect(log.abiertos).toEqual([]);
});

test("la estrella también cierra el menú abierto", () => {
  const { estrella, menu } = montar();
  estrella.dispatchEvent(new Event("click"));
  expect(menu.classList.contains("abierto")).toBe(false);
});

test("pulsar el nombre abre el proyecto", () => {
  const { nombre, log } = montar();
  nombre.dispatchEvent(new Event("click"));
  expect(log.abiertos).toEqual(["p1"]);
  expect(log.favs).toEqual([]);
});
`,
    },
    solution: {
      "/proyectos.js": `export function setupRow(row, onOpen) {
  row.addEventListener("click", (e) => {
    // Los botones de acción tienen su propio listener: la fila los ignora
    if (e.target.closest("[data-action]")) return;
    onOpen(row.dataset.id);
  });
}

export function setupFavorite(button, onFav) {
  button.addEventListener("click", () => {
    onFav(button.closest("[data-id]").dataset.id);
  });
}

export function setupMenuClose(page, menu) {
  page.addEventListener("click", (e) => {
    if (!e.target.closest(".menu")) menu.classList.remove("abierto");
  });
}
`,
    },
    hints: [
      "stopPropagation no solo frena a la fila: frena a todos los ancestros, también a la página.",
      "Deja que el clic suba y haz que la fila decida: si viene de un [data-action], que no abra el proyecto.",
    ],
  },
  {
    id: "bug-preferencias-storage",
    title: "#D08 · El modo oscuro se pierde al recargar",
    level: "intermedio",
    moduleId: "m04",
    report: {
      reportedBy: "Usuario · vía soporte",
      where: "Ajustes › apariencia",
      steps: ["Activa el modo oscuro.", "Recarga la página."],
      actual: "Vuelve el tema claro y en la consola sale prefs.tema is undefined. En Application › Local Storage, prefs vale \"[object Object]\".",
      expected: "Las preferencias se recuperan tal cual. Sin nada guardado, o con un valor corrupto, se usan { tema: \"claro\", tamano: 14 }; lo que falte se completa con esos valores.",
    },
    concepts: ["dom.storage"],
    instructions:
      "Soporte: varios usuarios dicen que el modo oscuro no se recuerda. En localStorage vemos \"[object Object]\" en vez de las preferencias. Los usuarios nuevos además ven un error al entrar. (En React es el mismo código, normalmente dentro de un useEffect o del inicializador de useState.)",
    starter: {
      "/preferencias.js": `export const DEFAULTS = { tema: "claro", tamano: 14 };

// storage es window.localStorage (o un sustituto en los tests)
export function savePrefs(storage, prefs) {
  storage.setItem("prefs", prefs);
}

export function loadPrefs(storage) {
  return storage.getItem("prefs");
}
`,
    },
    tests: {
      ...dom,
      "/preferencias.test.js": `import { savePrefs, loadPrefs, DEFAULTS } from "./preferencias";

// Como localStorage: solo guarda strings
function fakeStorage(inicial = {}) {
  const datos = new Map(Object.entries(inicial));
  return {
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: (k, v) => datos.set(k, String(v)),
  };
}

test("guarda y recupera las preferencias", () => {
  const storage = fakeStorage();
  savePrefs(storage, { tema: "oscuro", tamano: 16 });
  expect(loadPrefs(storage)).toEqual({ tema: "oscuro", tamano: 16 });
});

test("sin nada guardado usa los valores por defecto", () => {
  expect(loadPrefs(fakeStorage())).toEqual(DEFAULTS);
});

test("completa lo que falte con los valores por defecto", () => {
  const storage = fakeStorage({ prefs: '{"tema":"oscuro"}' });
  expect(loadPrefs(storage)).toEqual({ tema: "oscuro", tamano: 14 });
});

test("un valor corrupto no rompe la app", () => {
  expect(loadPrefs(fakeStorage({ prefs: "[object Object]" }))).toEqual(DEFAULTS);
});
`,
    },
    solution: {
      "/preferencias.js": `export const DEFAULTS = { tema: "claro", tamano: 14 };

export function savePrefs(storage, prefs) {
  storage.setItem("prefs", JSON.stringify(prefs));
}

export function loadPrefs(storage) {
  try {
    const saved = JSON.parse(storage.getItem("prefs"));
    return { ...DEFAULTS, ...saved };
  } catch {
    return { ...DEFAULTS };
  }
}
`,
    },
    hints: [
      "localStorage convierte todo lo que guardas a string con String(valor).",
      "JSON.stringify al guardar, JSON.parse al leer (dentro de un try) y mezcla con los DEFAULTS.",
    ],
  },
  {
    id: "bug-solo-lectura-captura",
    title: "#D09 · El modo solo lectura deja guardar",
    level: "avanzado",
    moduleId: "m04",
    report: {
      reportedBy: "Producto · Nerea",
      where: "Documentos › modo solo lectura",
      steps: [
        "Abre un documento compartido contigo como lector.",
        "Pulsa \"Guardar\" (o el icono de su interior).",
        "Pide permisos de edición y pulsa \"Guardar\" otra vez.",
      ],
      actual: "En solo lectura sale el aviso \"No tienes permisos\"… pero el documento ya se ha guardado. Al quitar el modo, el aviso sigue saliendo.",
      expected: "En solo lectura ningún [data-edita] ejecuta su acción (solo el aviso). Los botones sin data-edita funcionan. Al desactivar el modo, todo vuelve a funcionar.",
    },
    concepts: ["dom.propagacion", "dom.eventos"],
    instructions:
      "Producto: el guardián del modo solo lectura escucha en la raíz del documento y frena los clics sobre botones [data-edita], pero cuando actúa el botón ya ha guardado. Y al desactivar el modo, el guardián sigue ahí. Los botones tienen sus propios listeners y no queremos tocarlos uno a uno.",
    starter: {
      "/solo-lectura.js": `// Devuelve una función que desactiva el modo solo lectura
export function enableReadOnly(root, onBlocked) {
  const guard = (e) => {
    if (!e.target.closest("[data-edita]")) return;
    e.stopPropagation();
    e.preventDefault();
    onBlocked();
  };
  root.addEventListener("click", guard);
  return () => root.removeEventListener("click", guard, true);
}
`,
    },
    tests: {
      ...dom,
      "/solo-lectura.test.js": `import { Event, h } from "./mini-dom";
import { enableReadOnly } from "./solo-lectura";

function montar() {
  const icono = h("span", { text: "💾" });
  const guardar = h("button", { dataset: { edita: "" } }, icono);
  const imprimir = h("button", { text: "Imprimir" });
  const root = h("article", {}, h("header", {}, guardar, imprimir));
  const log = [];
  guardar.addEventListener("click", () => log.push("guardado"));
  imprimir.addEventListener("click", () => log.push("impreso"));
  const disable = enableReadOnly(root, () => log.push("aviso"));
  return { icono, guardar, imprimir, log, disable };
}

test("en solo lectura el botón no llega a guardar", () => {
  const { guardar, log } = montar();
  guardar.dispatchEvent(new Event("click"));
  expect(log).toEqual(["aviso"]);
});

test("tampoco pulsando el icono de dentro", () => {
  const { icono, log } = montar();
  icono.dispatchEvent(new Event("click"));
  expect(log).toEqual(["aviso"]);
});

test("los botones que no editan siguen funcionando", () => {
  const { imprimir, log } = montar();
  imprimir.dispatchEvent(new Event("click"));
  expect(log).toEqual(["impreso"]);
});

test("al desactivar el modo, guardar vuelve a funcionar sin aviso", () => {
  const { guardar, log, disable } = montar();
  disable();
  guardar.dispatchEvent(new Event("click"));
  expect(log).toEqual(["guardado"]);
});
`,
    },
    solution: {
      "/solo-lectura.js": `export function enableReadOnly(root, onBlocked) {
  const guard = (e) => {
    if (!e.target.closest("[data-edita]")) return;
    e.stopPropagation();
    e.preventDefault();
    onBlocked();
  };
  // En captura, la raíz ve el clic antes que el botón
  root.addEventListener("click", guard, true);
  return () => root.removeEventListener("click", guard, true);
}
`,
    },
    hints: [
      "Un listener normal en la raíz se ejecuta en la fase de burbuja: después del botón.",
      "En captura la raíz va primero; y removeEventListener solo quita el listener si le pasas el mismo capture con el que lo añadiste.",
    ],
  },
  {
    id: "bug-pestanas-listeners-duplicados",
    title: "#D10 · Analítica cuenta cada cambio de pestaña varias veces",
    level: "avanzado",
    moduleId: "m04",
    report: {
      reportedBy: "Datos · Julia",
      where: "Panel › pestañas Resumen / Ventas / Clientes",
      steps: ["Cambia a Ventas.", "Cambia a Clientes.", "Cambia a Resumen.", "Mira los eventos tab_change enviados."],
      actual: "Se envían 1, luego 2, luego 4 eventos por cada cambio. Al cerrar el panel, los clics siguen enviando eventos.",
      expected: "Un evento por cambio: [\"ventas\", \"clientes\", \"resumen\"]. Tras destroy(), ninguno.",
    },
    concepts: ["dom.eventos", "dom.render-desde-estado", "dom.delegacion"],
    instructions:
      "Datos: cada vez que alguien cambia de pestaña, el evento de analítica se envía más veces que la anterior. Y al desmontar el panel siguen llegando. Algo se registra en cada render y nunca se quita. (Es el mismo bug que un useEffect que añade un listener sin devolver la función de limpieza.)",
    starter: {
      "/pestanas.js": `// root contiene botones <button data-tab="resumen">…; el primero es el activo
export function setupTabs(root, onChange) {
  let active = root.querySelector("[data-tab]").dataset.tab;
  let onClick;

  function render() {
    root.querySelectorAll("[data-tab]").forEach((tab) => {
      tab.classList.toggle("activa", tab.dataset.tab === active);
    });
    onClick = (e) => {
      const tab = e.target.closest("[data-tab]");
      if (!tab) return;
      active = tab.dataset.tab;
      onChange(active);
      render();
    };
    root.addEventListener("click", onClick);
  }

  render();
  return function destroy() {
    root.removeEventListener("click", onClick);
  };
}
`,
    },
    tests: {
      ...dom,
      "/pestanas.test.js": `import { Event, h } from "./mini-dom";
import { setupTabs } from "./pestanas";

function montar() {
  const root = h("nav", {}, ...["resumen", "ventas", "clientes"].map((t) => h("button", { dataset: { tab: t }, text: t })));
  const enviados = [];
  const destroy = setupTabs(root, (t) => enviados.push(t));
  const pulsar = (i) => root.querySelectorAll("[data-tab]")[i].dispatchEvent(new Event("click"));
  return { root, enviados, destroy, pulsar };
}

test("marca la pestaña activa", () => {
  const { root, pulsar } = montar();
  pulsar(1);
  const tabs = root.querySelectorAll("[data-tab]");
  expect(tabs[1].classList.contains("activa")).toBe(true);
  expect(tabs[0].classList.contains("activa")).toBe(false);
});

test("un solo evento por cambio", () => {
  const { enviados, pulsar } = montar();
  pulsar(1);
  pulsar(2);
  pulsar(0);
  expect(enviados).toEqual(["ventas", "clientes", "resumen"]);
});

test("destroy quita todos los listeners", () => {
  const { root, enviados, destroy, pulsar } = montar();
  pulsar(1);
  pulsar(2);
  destroy();
  pulsar(0);
  expect(enviados).toEqual(["ventas", "clientes"]);
  expect(root.listeners).toHaveLength(0);
});
`,
    },
    solution: {
      "/pestanas.js": `export function setupTabs(root, onChange) {
  let active = root.querySelector("[data-tab]").dataset.tab;

  function render() {
    root.querySelectorAll("[data-tab]").forEach((tab) => {
      tab.classList.toggle("activa", tab.dataset.tab === active);
    });
  }

  // El listener se registra una sola vez; render solo pinta
  function onClick(e) {
    const tab = e.target.closest("[data-tab]");
    if (!tab) return;
    active = tab.dataset.tab;
    onChange(active);
    render();
  }

  root.addEventListener("click", onClick);
  render();
  return function destroy() {
    root.removeEventListener("click", onClick);
  };
}
`,
    },
    hints: [
      "¿Cuántas veces se llama a addEventListener después de tres clics?",
      "render debe limitarse a pintar a partir del estado; el listener (delegado) se registra una vez fuera de render.",
    ],
  },
  {
    id: "bug-lazy-load-observer",
    title: "#D11 · El lazy loading descarga todas las imágenes al entrar",
    level: "avanzado",
    moduleId: "m04",
    report: {
      reportedBy: "Rendimiento · Óscar",
      where: "Galería › carga diferida de fotos",
      steps: ["Abre la galería con la pestaña Network abierta.", "No hagas scroll.", "Luego baja y sube varias veces."],
      actual: "Nada más entrar se descargan las 200 fotos. Al hacer scroll, cada foto se vuelve a procesar cada vez que entra en pantalla.",
      expected: "Una foto solo se carga cuando entra en pantalla (isIntersecting) y después se deja de observar.",
    },
    concepts: ["dom.observadores"],
    instructions:
      "Rendimiento: el lazy loading no está haciendo nada. IntersectionObserver llama al callback nada más observar cada foto (con isIntersecting en false) y cada vez que entra o sale de pantalla. (En React este código iría en un useEffect que devuelve observer.disconnect.)",
    starter: {
      "/galeria.js": `// images: <img data-src="..."> sin src. Observer: IntersectionObserver (o un sustituto en los tests)
export function lazyLoad(images, Observer, onLoad) {
  const observer = new Observer((entries) => {
    for (const entry of entries) {
      const img = entry.target;
      img.src = img.dataset.src;
      onLoad(img.dataset.src);
    }
  });
  images.forEach((img) => observer.observe(img));
  return observer;
}
`,
    },
    tests: {
      ...dom,
      "/galeria.test.js": `import { Element } from "./mini-dom";
import { lazyLoad } from "./galeria";

// Simula IntersectionObserver: trigger() avisa como lo haría el navegador
class FakeObserver {
  constructor(callback) { this.callback = callback; this.targets = new Set(); }
  observe(el) { this.targets.add(el); }
  unobserve(el) { this.targets.delete(el); }
  disconnect() { this.targets.clear(); }
  trigger(entries) {
    const visibles = entries.filter((e) => this.targets.has(e.target));
    if (visibles.length) this.callback(visibles, this);
  }
}

function montar() {
  const imgs = ["a.jpg", "b.jpg", "c.jpg"].map((src) => {
    const img = new Element("img", { dataset: { src } });
    img.src = "";
    return img;
  });
  const cargadas = [];
  const observer = lazyLoad(imgs, FakeObserver, (src) => cargadas.push(src));
  return { imgs, cargadas, observer };
}

test("el aviso inicial (fuera de pantalla) no carga nada", () => {
  const { imgs, cargadas, observer } = montar();
  observer.trigger(imgs.map((target) => ({ target, isIntersecting: false })));
  expect(cargadas).toEqual([]);
  expect(imgs[0].src).toBe("");
});

test("carga la foto que entra en pantalla", () => {
  const { imgs, cargadas, observer } = montar();
  observer.trigger([{ target: imgs[1], isIntersecting: true }]);
  expect(imgs[1].src).toBe("b.jpg");
  expect(cargadas).toEqual(["b.jpg"]);
});

test("una foto cargada deja de observarse", () => {
  const { imgs, cargadas, observer } = montar();
  observer.trigger([{ target: imgs[0], isIntersecting: true }]);
  observer.trigger([{ target: imgs[0], isIntersecting: false }]);
  observer.trigger([{ target: imgs[0], isIntersecting: true }]);
  expect(cargadas).toEqual(["a.jpg"]);
  expect(observer.targets.size).toBe(2);
});
`,
    },
    solution: {
      "/galeria.js": `export function lazyLoad(images, Observer, onLoad) {
  const observer = new Observer((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const img = entry.target;
      img.src = img.dataset.src;
      onLoad(img.dataset.src);
      observer.unobserve(img);
    }
  });
  images.forEach((img) => observer.observe(img));
  return observer;
}
`,
    },
    hints: [
      "Cada entry trae isIntersecting: el callback también se llama cuando la foto sale de pantalla.",
      "Una vez cargada, observer.unobserve(img) para no volver a procesarla.",
    ],
  },
  {
    id: "bug-tareas-estado-en-dom",
    title: "#D12 · Al cambiar de filtro se desmarcan las tareas",
    level: "avanzado",
    moduleId: "m04",
    report: {
      reportedBy: "QA · Lucía",
      where: "Tareas › filtros Todas / Pendientes",
      steps: ["Marca \"Comprar pan\" como hecha (se tacha).", "Cambia el filtro a Pendientes."],
      actual: "\"Comprar pan\" sigue apareciendo y ya no está tachada. El contador del servidor dice que sigue pendiente.",
      expected: "La tarea marcada queda como hecha en el estado: con Pendientes se oculta y con Todas aparece tachada.",
    },
    concepts: ["dom.render-desde-estado", "dom.delegacion"],
    instructions:
      "QA: marco una tarea, cambio el filtro y la tarea vuelve a estar sin marcar. La vista se pinta con render() a partir de state, pero el clic cambia otra cosa. La regla es UI = f(estado): exactamente lo que hace React con setState y un nuevo render.",
    starter: {
      "/tareas.js": `// list: <ul> con un <li data-id="..."> por tarea; items: [{ id, text, done }]
export function createTodoView(list, items) {
  const state = { items: items.map((item) => ({ ...item })), filter: "todas" };

  function render() {
    for (const li of list.querySelectorAll("[data-id]")) {
      const item = state.items.find((i) => i.id === li.dataset.id);
      li.classList.toggle("hecha", item.done);
      li.hidden = state.filter === "pendientes" && item.done;
    }
  }

  list.addEventListener("click", (e) => {
    const li = e.target.closest("[data-id]");
    if (li) li.classList.toggle("hecha");
  });

  render();
  return {
    setFilter(filter) {
      state.filter = filter;
      render();
    },
    getItems: () => state.items,
  };
}
`,
    },
    tests: {
      ...dom,
      "/tareas.test.js": `import { Event, h } from "./mini-dom";
import { createTodoView } from "./tareas";

const items = [
  { id: "t1", text: "Comprar pan", done: false },
  { id: "t2", text: "Llamar al banco", done: true },
];

function montar() {
  const list = h("ul", {}, ...items.map((i) => h("li", { dataset: { id: i.id } }, h("span", { text: i.text }))));
  const view = createTodoView(list, items);
  const li = (id) => list.querySelectorAll("li").find((x) => x.dataset.id === id);
  return { view, li };
}

test("marcar una tarea la tacha", () => {
  const { li } = montar();
  li("t1").querySelector("span").dispatchEvent(new Event("click"));
  expect(li("t1").classList.contains("hecha")).toBe(true);
});

test("marcar actualiza el estado", () => {
  const { view, li } = montar();
  li("t1").dispatchEvent(new Event("click"));
  expect(view.getItems()[0].done).toBe(true);
});

test("el filtro respeta lo marcado", () => {
  const { view, li } = montar();
  li("t1").dispatchEvent(new Event("click"));
  view.setFilter("pendientes");
  expect(li("t1").hidden).toBe(true);
  view.setFilter("todas");
  expect(li("t1").hidden).toBe(false);
  expect(li("t1").classList.contains("hecha")).toBe(true);
});

test("desmarcar una tarea hecha la muestra en pendientes", () => {
  const { view, li } = montar();
  li("t2").dispatchEvent(new Event("click"));
  view.setFilter("pendientes");
  expect(li("t2").hidden).toBe(false);
  expect(li("t2").classList.contains("hecha")).toBe(false);
});
`,
    },
    solution: {
      "/tareas.js": `export function createTodoView(list, items) {
  const state = { items: items.map((item) => ({ ...item })), filter: "todas" };

  function render() {
    for (const li of list.querySelectorAll("[data-id]")) {
      const item = state.items.find((i) => i.id === li.dataset.id);
      li.classList.toggle("hecha", item.done);
      li.hidden = state.filter === "pendientes" && item.done;
    }
  }

  list.addEventListener("click", (e) => {
    const li = e.target.closest("[data-id]");
    if (!li) return;
    // Se cambia el estado y se vuelve a pintar todo desde él
    const item = state.items.find((i) => i.id === li.dataset.id);
    item.done = !item.done;
    render();
  });

  render();
  return {
    setFilter(filter) {
      state.filter = filter;
      render();
    },
    getItems: () => state.items,
  };
}
`,
    },
    hints: [
      "¿Qué cambia el clic: el estado o el DOM? ¿De dónde lee render?",
      "Actualiza state y llama a render(); nunca toques a mano lo que render ya pinta.",
    ],
  },
];
