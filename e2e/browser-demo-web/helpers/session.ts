import { expect, type Page } from "@playwright/test";
import { resolveDemoWebUrl } from "./runtime";

export const customerCreds = {
  email: "maria.rodriguez@trustvibe.test",
  password: "DemoCustomer!123",
};

export const contractorCreds = {
  email: "juan.services@trustvibe.test",
  password: "DemoContractor!123",
};

export const adminCreds = {
  email: "admin@trustvibe.test",
  password: "DemoAdmin!123",
};

export async function openRoleSelect(page: Page): Promise<void> {
  await page.goto(`${resolveDemoWebUrl()}/role`, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("role-select-customer")).toBeVisible();
}

export async function loginAs(
  page: Page,
  role: "customer" | "contractor" | "admin",
  email: string,
  password: string
): Promise<void> {
  await openRoleSelect(page);
  const roleId =
    role === "customer"
      ? "role-select-customer"
      : role === "contractor"
        ? "role-select-contractor"
        : "role-select-admin";
  await page.getByTestId(roleId).click();
  await page.getByTestId("login-email-input").fill(email);
  await page.getByTestId("login-password-input").fill(password);
  await page.getByTestId("login-submit").click();
}

export async function goToTab(
  page: Page,
  tabId:
    | "tab-home"
    | "tab-search"
    | "tab-projects"
    | "tab-profile"
    | "tab-messages"
    | "tab-earnings"
): Promise<void> {
  await page.getByTestId(tabId).click();
}
