import { expect, type Page } from '@playwright/test';

export async function expectHomeSpanish(page: Page): Promise<void> {
  await expect(page.getByText(/Resumen financiero/i)).toBeVisible();
  await expect(page.getByText(/Proyectos activos/i)).toBeVisible();
}

export async function expectHomeEnglish(page: Page): Promise<void> {
  await expect(page.getByText(/Financial Overview/i)).toBeVisible();
  await expect(page.getByText(/Active Projects/i)).toBeVisible();
}

export async function expectSearchDisabledStates(page: Page): Promise<void> {
  await expect(page.getByText(/Recomendaciones deshabilitadas|Recommendations disabled/i)).toBeVisible();
  await expect(page.getByText(/Destacados deshabilitados|Featured listings disabled/i)).toBeVisible();
}