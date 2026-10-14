import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "tipos-string-inmutable",
    kind: "predecir",
    concepts: ["js.valores-tipos"],
    difficulty: "trampa",
    prompt: "El código se ejecuta como módulo ES (modo estricto), igual que en un proyecto con Vite o Next. ¿Qué imprime?",
    code: code("js", `
const nombre = "ana";
const mayus = nombre.toUpperCase();
console.log(nombre, mayus);
nombre[0] = "A";
console.log(nombre);
`),
    options: opts(
      "ana ANA\nAna",
      "ANA ANA\nAna",
      "ana ANA\nana",
      "ana ANA\nUncaught TypeError",
    ),
    correct: "d",
    explanation:
      "Los strings son primitivos inmutables: toUpperCase devuelve un string nuevo y nombre sigue siendo \"ana\". Asignar a nombre[0] no puede cambiar el primitivo: en modo no estricto se ignora en silencio (imprimiría \"ana\"), pero los módulos ES son estrictos y ahí lanza un TypeError. Fíjate en que no tiene nada que ver con const: const impide reasignar la variable, no mutar el valor.",
  },
  {
    id: "operadores-incremento-potencia",
    kind: "predecir",
    concepts: ["js.operadores"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
let a = 1;
const b = a++ + ++a;
console.log(a, b);
console.log(2 ** 3 ** 2, -7 % 3);
`),
    options: opts(
      "3 4\n512 -1",
      "3 5\n64 2",
      "3 4\n64 -1",
      "2 3\n512 2",
    ),
    correct: "a",
    explanation:
      "a++ devuelve el valor viejo (1) y deja a en 2; ++a incrementa primero (a = 3) y devuelve 3; b = 1 + 3 = 4. ** es asociativo por la derecha: 2 ** (3 ** 2) = 2 ** 9 = 512. % es el resto, no el módulo matemático: conserva el signo del dividendo, así que -7 % 3 es -1.",
  },
  {
    id: "operadores-comparar-strings",
    kind: "predecir",
    concepts: ["js.operadores", "js.coercion"],
    difficulty: "trampa",
    prompt: "Los dos valores vienen de inputs de un formulario. ¿Qué imprime?",
    code: code("js", `
const max = "10";
const nuevo = "9";
console.log(nuevo > max ? "9 gana" : "10 gana");
console.log("10" < 9, "B" < "a", "Zoe" < "ana");
`),
    options: opts(
      "10 gana\nfalse true true",
      "9 gana\ntrue false false",
      "9 gana\nfalse true true",
      "10 gana\nfalse false false",
    ),
    correct: "c",
    explanation:
      "Si los dos operandos de < o > son strings, se comparan carácter a carácter por código UTF-16 (orden lexicográfico): \"9\" > \"1\", así que \"9\" > \"10\". Si uno es número, el otro se convierte a número: 10 < 9 es false. Las mayúsculas tienen códigos menores que las minúsculas (\"B\" es 66, \"a\" es 97), por eso \"B\" < \"a\" y \"Zoe\" < \"ana\" son true. Para ordenar texto para personas usa localeCompare.",
  },
  {
    id: "coercion-operadores-aritmeticos",
    kind: "predecir",
    concepts: ["js.coercion", "js.operadores"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
console.log("5" - 2, "5" + 2, "5" * "2", +"");
console.log(JSON.stringify([[] + [], [] + {}, [1, 2] + [3]]));
console.log(null + 1, undefined + 1, true + "1");
`),
    options: opts(
      "3 52 10 0\n[\"\",\"[object Object]\",\"1,23\"]\n1 NaN true1",
      "3 7 10 NaN\n[\"\",\"[object Object]\",\"1,23\"]\n1 NaN 2",
      "3 52 10 0\n[0,\"[object Object]\",\"1,2,3\"]\nNaN NaN true1",
      "3 52 \"10\" 0\n[\"\",\"{}\",\"1,23\"]\n1 undefined1 true1",
    ),
    correct: "a",
    explanation:
      "-, * y el + unario convierten a número (\"\" → 0). El + binario primero pasa los objetos a primitivo (los arrays se vuelven strings con join: [] → \"\", [1, 2] → \"1,2\"; un objeto plano → \"[object Object]\") y, si algún lado es string, concatena. Si no hay strings, suma números: null → 0 y undefined → NaN.",
  },
  {
    id: "coercion-falsy-truthy",
    kind: "predecir",
    concepts: ["js.coercion", "js.valores-tipos"],
    difficulty: "trampa",
    prompt: "¿Cuántos valores de la lista son truthy?",
    code: code("js", `
const valores = [0, "0", "", " ", [], {}, NaN, -0, 0n, "false", null, new Boolean(false)];
console.log(valores.filter(Boolean).length);
`),
    options: opts("4", "5", "6", "7"),
    correct: "c",
    explanation:
      "Los falsy son exactamente ocho: false, 0, -0, 0n, \"\", null, undefined y NaN. Todo lo demás es truthy, incluidos \"0\", \" \" (tiene un espacio), \"false\", [] y {}. Y new Boolean(false) es un objeto: todos los objetos son truthy, aunque envuelvan un false. Total: \"0\", \" \", [], {}, \"false\" y new Boolean(false) = 6.",
  },
  {
    id: "coercion-igualdad-nan",
    kind: "predecir",
    concepts: ["js.coercion", "js.operadores"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
console.log(isNaN("hola"), Number.isNaN("hola"));
console.log(NaN === NaN, Object.is(NaN, NaN), Object.is(0, -0), 0 === -0);
console.log("" == 0, "0" == false, null == 0, null >= 0);
`),
    options: opts(
      "true false\nfalse true false true\ntrue true false true",
      "false false\nfalse true true true\ntrue true false false",
      "true true\ntrue true false true\ntrue false false true",
      "true false\nfalse true false true\ntrue true true true",
    ),
    correct: "a",
    explanation:
      "isNaN global convierte antes de comprobar (Number(\"hola\") es NaN), así que da true; Number.isNaN solo es true para el valor NaN. === dice que NaN no es igual a sí mismo y que 0 y -0 son iguales; Object.is (lo que usa React para comparar estado y dependencias) dice lo contrario en ambos casos. Con ==, \"\" y \"0\" == false se convierten a número (0 == 0). Pero == trata null de forma especial: solo es igual a null y undefined, así que null == 0 es false, mientras que >= sí convierte null a 0 y 0 >= 0 es true.",
  },
];
