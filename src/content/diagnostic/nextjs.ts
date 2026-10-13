import type { DiagnosticSection } from "../types";
import { code, opts } from "./helpers";

export const nextjs: DiagnosticSection = {
  id: "nextjs",
  title: "Next.js",
  description: "El modelo mental del App Router.",
  modules: ["m21"],
  questions: [
    {
      id: "diag-next-funcion-prop",
      kind: "opcion",
      concepts: ["next.serializacion", "next.server-client"],
      difficulty: "trampa",
      prompt:
        "Un Server Component define function onSave() { … } (sin \"use server\") y lo pasa como prop a un Client Component. ¿Qué pasa?",
      options: opts(
        "Funciona: el Client Component recibe la función",
        "Error: las props que cruzan del servidor al cliente deben ser serializables y una función normal no lo es (salvo las Server Actions)",
        "La función se ejecuta en el servidor y se pasa su resultado",
        "Next convierte la función en un endpoint automáticamente",
      ),
      correct: "b",
      explanation:
        "Lo que cruza la frontera se serializa (strings, números, objetos planos, promesas, JSX…). Una función normal no se puede enviar al navegador. Una Server Action (\"use server\") sí, porque se envía como una referencia que llama al servidor.",
    },
    {
      id: "diag-next-import-server-en-client",
      kind: "opcion",
      concepts: ["next.serializacion", "next.server-client"],
      difficulty: "trampa",
      prompt:
        "Un Modal marcado con \"use client\" importa directamente <Cart />, un Server Component async que consulta la base de datos. ¿Qué pasa?",
      options: opts(
        "Funciona igual que siempre",
        "Cart pasa a ser parte del bundle de cliente y deja de funcionar como Server Component; lo correcto es pasar <Cart /> como children desde un Server Component",
        "Next renderiza Cart en el servidor y el resto en el cliente automáticamente",
        "Solo falla en producción",
      ),
      correct: "b",
      explanation:
        "\"use client\" marca una frontera: todo lo que ese archivo importa se trata como código de cliente. Para tener Server Components dentro de un Client Component, pásalos como children o props desde un Server Component.",
    },
    {
      id: "diag-next-data-fetching",
      kind: "opcion",
      concepts: ["next.data-fetching"],
      difficulty: "base",
      prompt: "En el App Router, ¿cuál es la forma idiomática de cargar los datos de una página?",
      options: opts(
        "useEffect + useState en la página",
        "Hacer que el Server Component sea async y hacer await de los datos directamente",
        "getServerSideProps",
        "Un Route Handler llamado desde el cliente siempre",
      ),
      correct: "b",
      explanation:
        "Los Server Components pueden ser async y acceder a datos directamente en el servidor. getServerSideProps es del Pages Router. Los Route Handlers son para exponer APIs, no para que tus propias páginas se llamen a sí mismas.",
    },
    {
      id: "diag-next-action-auth",
      kind: "opcion",
      concepts: ["next.server-actions", "back.autorizacion"],
      difficulty: "trampa",
      prompt:
        "Una Server Action deleteUser solo se usa desde un botón que solo ven los administradores. ¿Hace falta comprobar permisos dentro de la action?",
      options: opts(
        "No, porque el botón ya está oculto para los demás",
        "Sí: una Server Action es un endpoint público que cualquiera puede invocar con una petición",
        "No, Next solo permite llamarla desde el componente que la importa",
        "Solo si la página es pública",
      ),
      correct: "b",
      explanation:
        "Ocultar UI no es seguridad. Cada Server Action se expone como un endpoint HTTP: valida la sesión, los permisos y los datos de entrada dentro de la propia action.",
    },
    {
      id: "diag-next-loading",
      kind: "opcion",
      concepts: ["next.streaming"],
      difficulty: "base",
      prompt: "¿Qué hace un archivo loading.tsx dentro de una carpeta de ruta?",
      options: opts(
        "Precarga los datos de la página",
        "Envuelve la página en un <Suspense> y muestra ese fallback mientras su contenido se resuelve, enviando el resto en streaming",
        "Muestra un spinner global mientras se carga el JavaScript",
        "Solo funciona en el Pages Router",
      ),
      correct: "b",
      explanation:
        "loading.tsx es azúcar sobre Suspense: el layout y el fallback se envían enseguida y el contenido llega por streaming cuando está listo.",
    },
    {
      id: "diag-next-cookies-suspense",
      kind: "opcion",
      concepts: ["next.prerender", "next.cache"],
      difficulty: "trampa",
      prompt:
        "Con Cache Components activado, un componente lee cookies() y no está dentro de ningún <Suspense>. ¿Qué pasa?",
      options: opts(
        "Nada especial: se cachea como el resto de la página",
        "Next lo señala (aviso blocking-route en desarrollo, error en next build): los datos de la petición no se pueden prerenderizar, así que ese componente debe ir dentro de un <Suspense> (un loading.tsx también cuenta)",
        "cookies() devuelve un objeto vacío",
        "La página se vuelve estática y las cookies se ignoran",
      ),
      correct: "b",
      explanation:
        "Con Cache Components, lo estático y lo cacheado forma un static shell que se sirve al instante. Lo que depende de la petición (cookies, headers, searchParams) debe quedar detrás de un <Suspense> para llegar después por streaming.",
    },
    {
      id: "diag-next-update-tag",
      kind: "opcion",
      concepts: ["next.cache", "next.server-actions"],
      difficulty: "base",
      prompt:
        "Las tareas se leen con una función \"use cache\" con cacheTag(\"tasks\"). Una Server Action crea una tarea, pero la lista no muestra la nueva. ¿Qué falta?",
      code: code("ts", `
async function createTask(formData: FormData) {
  "use server";
  await db.insert(tasks).values({ title: String(formData.get("title")) });
  // ¿?
}
`),
      options: opts(
        "Llamar a router.refresh() dentro de la action",
        "Llamar a updateTag(\"tasks\") en la action para expirar esa caché y que el siguiente render lea datos frescos",
        "Quitar \"use cache\" de toda la app",
        "Esperar unos segundos",
      ),
      correct: "b",
      explanation:
        "La caché no sabe que cambiaron los datos. updateTag (solo en Server Actions) expira las entradas con ese tag y la siguiente lectura obtiene datos frescos, ideal para que veas tus propios cambios. revalidateTag(tag, \"max\") sirve contenido viejo mientras revalida en segundo plano.",
    },
  ],
};
