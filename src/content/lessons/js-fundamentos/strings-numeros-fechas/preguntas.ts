import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "strings-inmutables-at",
    kind: "predecir",
    concepts: ["js.strings"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const name = "  Ana  ";
name.trim();
const tag = "react";
tag.toUpperCase();
console.log("[" + name + "]", tag);
console.log("hola".at(-1), "hola"[-1], "👍".length);
`),
    options: opts(
      "[Ana] REACT\na a 1",
      "[  Ana  ] react\na undefined 2",
      "[Ana] REACT\na undefined 2",
      "[  Ana  ] react\na a 1",
    ),
    correct: "b",
    explanation:
      "Los strings son inmutables: trim() y toUpperCase() devuelven un string nuevo que aquí se descarta, así que name y tag no cambian. at(-1) cuenta desde el final, pero [-1] busca una propiedad llamada \"-1\", que no existe (undefined). length cuenta unidades UTF-16, y el emoji 👍 ocupa dos.",
  },
  {
    id: "strings-ordenar-acentos",
    kind: "predecir",
    concepts: ["js.strings"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const nombres = ["Óscar", "ana", "Zoe", "Ñandú", "Nico"];
console.log([...nombres].sort().join(","));
console.log([...nombres].sort((a, b) => a.localeCompare(b, "es")).join(","));
`),
    options: opts(
      "ana,Nico,Ñandú,Óscar,Zoe\nana,Nico,Ñandú,Óscar,Zoe",
      "Nico,Zoe,ana,Ñandú,Óscar\nNico,Zoe,ana,Ñandú,Óscar",
      "Nico,Zoe,ana,Ñandú,Óscar\nana,Nico,Ñandú,Óscar,Zoe",
      "ana,Nico,Óscar,Zoe,Ñandú\nana,Nico,Ñandú,Óscar,Zoe",
    ),
    correct: "c",
    explanation:
      "sort() sin comparador compara unidades UTF-16: todas las mayúsculas sin acento (N, Z) van antes que las minúsculas, y las letras con tilde (Ñ = U+00D1, Ó = U+00D3) van después de todo el ASCII. localeCompare con \"es\" aplica las reglas del idioma: trata mayúsculas y minúsculas como una diferencia menor (solo desempatan), trata Ó como una variante de O y coloca la ñ entre la n y la o.",
  },
  {
    id: "numeros-tofixed-epsilon",
    kind: "predecir",
    concepts: ["js.numeros"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const total = 0.1 + 0.2;
console.log(total.toFixed(2) + 1);
console.log(Math.abs(total - 0.3) < Number.EPSILON);
console.log((10 + 20) / 100);
`),
    options: opts(
      "1.3\ntrue\n0.3",
      "0.301\nfalse\n0.30000000000000004",
      "0.301\ntrue\n0.3",
      "1.3\nfalse\n0.3",
    ),
    correct: "c",
    explanation:
      "toFixed devuelve un string (\"0.30\"), así que + 1 concatena: \"0.301\". La diferencia entre 0.1 + 0.2 y 0.3 (unos 5.5e-17) es menor que Number.EPSILON (unos 2.2e-16), así que la comparación con tolerancia da true. Y sumar enteros (céntimos) es exacto: 30 / 100 se redondea al double más cercano a 0.3, que se imprime como 0.3.",
  },
  {
    id: "numeros-parse-redondeo",
    kind: "predecir",
    concepts: ["js.numeros"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
console.log(Number(""), parseInt("08"), parseInt("1e3"), Number("1e3"));
console.log(Math.round(-2.5), Math.floor(-2.5), Math.trunc(-2.5));
console.log((1.005).toFixed(2), Number.MAX_SAFE_INTEGER + 2);
`),
    options: opts(
      "0 8 1 1000\n-2 -3 -2\n1.00 9007199254740992",
      "NaN 8 1000 1000\n-3 -3 -2\n1.01 9007199254740993",
      "0 0 1 1000\n-2 -2 -2\n1.01 9007199254740992",
      "NaN 8 1 1000\n-3 -3 -3\n1.00 9007199254740993",
    ),
    correct: "a",
    explanation:
      "Number(\"\") es 0 (un string vacío o solo con espacios se convierte en 0, no en NaN). parseInt lee dígitos hasta el primer carácter inválido: \"1e3\" da 1, mientras que Number entiende la notación científica. Math.round redondea los .5 hacia +∞ (-2.5 → -2), floor siempre baja (-3) y trunc corta los decimales (-2). 1.005 se guarda como 1.00499999…, así que toFixed(2) da \"1.00\". Por encima de MAX_SAFE_INTEGER no todos los enteros son representables: 2^53 + 1 se redondea a 2^53.",
  },
  {
    id: "fechas-mutable-desborde",
    kind: "predecir",
    concepts: ["js.fechas-intl"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const inicio = new Date("2026-01-31T00:00:00Z");
const fin = inicio;
fin.setUTCMonth(1);
console.log(inicio.toISOString().slice(0, 10));
console.log(inicio.getUTCMonth());
`),
    options: opts(
      "2026-01-31\n0",
      "2026-02-28\n1",
      "2026-03-03\n2",
      "2026-03-03\n3",
    ),
    correct: "c",
    explanation:
      "fin y inicio son el mismo objeto Date, y los setters lo mutan: cambiar fin cambia inicio. setUTCMonth(1) significa febrero (los meses empiezan en 0) y conserva el día 31; como el 31 de febrero no existe, Date desborda hacia delante: 2026 no es bisiesto, así que queda en el 3 de marzo. getUTCMonth() devuelve 2, que es marzo.",
  },
  {
    id: "fechas-dia-anterior",
    kind: "predecir",
    concepts: ["js.fechas-intl"],
    difficulty: "base",
    prompt: "Un <input type=\"date\"> devuelve \"2026-10-14\". ¿Qué imprime?",
    code: code("js", `
const fecha = new Date("2026-10-14");
const opciones = { day: "numeric", month: "numeric", year: "numeric" };
console.log(fecha.toLocaleDateString("es-ES", { ...opciones, timeZone: "UTC" }));
console.log(fecha.toLocaleDateString("es-ES", { ...opciones, timeZone: "America/Mexico_City" }));
`),
    options: opts(
      "14/10/2026\n14/10/2026",
      "14/10/2026\n13/10/2026",
      "14/10/2026\n15/10/2026",
      "13/10/2026\n14/10/2026",
    ),
    correct: "b",
    explanation:
      "Un string con solo fecha (\"2026-10-14\") se interpreta como medianoche UTC. En Ciudad de México (UTC−6) ese instante es el 13 de octubre a las 18:00, así que al formatear en esa zona aparece el día anterior. Es el mismo instante: lo que cambia es la zona con la que se muestra.",
  },
  {
    id: "fechas-hydration-mismatch",
    kind: "opcion",
    concepts: ["js.fechas-intl"],
    difficulty: "trampa",
    prompt:
      "Este Client Component se renderiza en un servidor con TZ=UTC y luego se hidrata en un navegador en Ciudad de México. React avisa de un hydration mismatch. ¿Qué cambio hace que servidor y navegador generen exactamente el mismo texto?",
    code: code("jsx", `
"use client";

export function FechaPedido({ iso }) {
  // iso = "2026-10-14T03:00:00Z"
  return <p>{new Date(iso).toLocaleString("es-MX")}</p>;
}
`),
    options: opts(
      "Cambiar toLocaleString por toLocaleDateString, para no mostrar la hora",
      "Pasar una zona horaria explícita, p. ej. toLocaleString(\"es-MX\", { timeZone: \"America/Mexico_City\" })",
      "Envolver el cálculo en useMemo para que solo se haga una vez",
      "Crear la fecha con new Date(Date.parse(iso)) en vez de new Date(iso)",
    ),
    correct: "b",
    explanation:
      "Sin timeZone, el formateo usa la zona del entorno: en el servidor sale \"14/10/2026, 3:00:00 a.m.\" y en el navegador \"13/10/2026, 9:00:00 p.m.\". Con locale y zona fijos, ambos producen el mismo texto. Quitar la hora no basta (la fecha también cambia de día), useMemo no evita que el render se ejecute en los dos entornos y new Date(Date.parse(iso)) produce el mismo Date. Si necesitas la zona del usuario, tienes que conocerla en el servidor (guardada en su perfil) o formatear solo en el cliente.",
  },
];
