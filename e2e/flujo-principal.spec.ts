import { expect, test } from "@playwright/test";

// El servidor de pruebas arranca con una base de datos vacía (ver playwright.config.ts).

test("diagnóstico → mapa → recomendación", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Empieza por el diagnóstico")).toBeVisible();

  await page.getByRole("link", { name: "Hacer el diagnóstico" }).click();
  await page.getByRole("button", { name: "Empezar diagnóstico" }).click();
  await page.getByRole("button", { name: "Empezar sección" }).click();

  // Primera pregunta: typeof null… La opción correcta es la tercera.
  await page.locator("fieldset label").nth(2).click();
  await page.getByRole("button", { name: "Responder: estoy seguro" }).click();
  await expect(page.getByRole("status")).toContainText("Correcto");
  await page.getByRole("button", { name: "Siguiente" }).click();

  // Segunda pregunta respondida mal y con dudas.
  await page.locator("fieldset label").nth(0).click();
  await page.getByRole("button", { name: "Responder: tengo dudas" }).click();
  await expect(page.getByRole("status")).toContainText("No es correcto");
  await page.getByRole("button", { name: "Siguiente" }).click();

  // El progreso se guarda: al recargar continúa en la tercera pregunta.
  await page.reload();
  await expect(page.getByText("pregunta 3 de 9")).toBeVisible();

  // Responde lo que queda de la primera sección.
  for (let i = 3; i <= 9; i++) {
    await page.locator("fieldset label").nth(0).click();
    await page.getByRole("button", { name: "Responder: estoy seguro" }).click();
    await page.getByRole("button", { name: /Siguiente|Ver resultado/ }).click();
  }
  // Salta las otras 10 secciones.
  for (let i = 0; i < 10; i++) {
    await page.getByRole("button", { name: "No lo he visto: marcar como hueco" }).click();
  }

  await page.getByRole("button", { name: "Finalizar y ver mi mapa" }).click();
  await page.waitForURL("**/mapa");
  await expect(page.getByRole("heading", { name: "Mapa de conceptos" })).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("Siguiente paso recomendado")).toBeVisible();
});

test("lección: pregunta con feedback y completar", async ({ page }) => {
  await page.goto("/modulos/js-profundo/closures");
  await expect(page.getByRole("heading", { name: "Closures", level: 1 })).toBeVisible();

  // Primera pregunta de la lección (makeGreeter): la correcta es la primera opción.
  const first = page.locator("fieldset").first();
  await first.locator("label").first().click();
  await page.getByRole("button", { name: "Responder: estoy seguro" }).first().click();
  await expect(page.getByRole("status").first()).toContainText("Correcto");

  await page.getByRole("button", { name: "Marcar como completada" }).click();
  await expect(page.getByText("✓ Lección completada")).toBeVisible();
});
