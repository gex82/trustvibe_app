import { expect, test } from "@playwright/test";
import { resolveDemoWebUrl } from "./helpers/runtime";

const requiredAssets = [
  "/images/contractors/carlos-vega.png",
  "/images/contractors/juan-reyes.png",
  "/images/contractors/maria-rodriguez.png",
  "/images/contractors/rosa-morales.png",
  "/images/jobs/bathroom-before-after.png",
  "/images/jobs/bathroom-renovation.png",
  "/images/jobs/bedroom-interior.png",
  "/images/jobs/exterior-painting.png",
  "/images/jobs/kitchen-cabinets.png",
  "/images/jobs/living-room-reno.png",
  "/images/jobs/roof-repair.png",
  "/images/jobs/solar-install.png",
];

test("assets smoke: demo-web image bundle is available", async ({ request }) => {
  const base = resolveDemoWebUrl();

  for (const path of requiredAssets) {
    const response = await request.get(`${base}${path}`);
    expect(response.status(), `asset ${path} should be reachable`).toBe(200);
  }
});
