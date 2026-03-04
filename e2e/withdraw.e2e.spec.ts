import { test, expect } from "@playwright/test";

test.describe("Withdraw flow (E2E)", () => {
  test("happy path submit", async ({ page }) => {
    await page.goto("/withdraw");

    const amountInput = page.getByLabel(/сумма/i);
    const destinationInput = page.getByLabel(/адрес назначения/i);
    const confirmCheckbox = page.getByLabel(/я подтверждаю/i);
    const submitButton = page.getByRole("button", { name: /отправить заявку/i });

    await expect(submitButton).toBeDisabled();

    await amountInput.fill("123");
    await destinationInput.fill("wallet-e2e");
    await confirmCheckbox.check();

    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    await expect(submitButton).toBeDisabled();

    await expect(page.getByText(/заявка создана/i)).toBeVisible();
    await expect(page.getByText(/wallet-e2e/)).toBeVisible();
  });
});

