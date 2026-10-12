// Ejecuta un snippet de una pregunta "predecir" e imprime su salida tal y como
// la vería el alumno en la consola. Uso: node snippet-runner.mjs <archivo.mjs>
// Los errores no capturados se imprimen como "Uncaught <Tipo>" y las promesas
// rechazadas sin manejar como "Uncaught (in promise) <Tipo>", igual que Chrome.
import { pathToFileURL } from "node:url";

const errorName = (e) => (e && e.constructor && e.constructor.name) || "Error";

process.on("uncaughtException", (e) => {
  console.log("Uncaught " + errorName(e));
  process.exit(0);
});
process.on("unhandledRejection", (e) => {
  console.log("Uncaught (in promise) " + errorName(e));
});

try {
  await import(pathToFileURL(process.argv[2]).href);
} catch (e) {
  console.log("Uncaught " + errorName(e));
}
