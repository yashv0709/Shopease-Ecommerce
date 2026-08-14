const { test, expect } = require('@playwright/test');

test.describe('ShopEase Customer Happy Path E2E Flow', () => {
  const uniqueEmail = `john_doe_${Date.now()}@gmail.com`;

  test('Should complete the register-login-browse-cart-checkout journey', async ({ page }) => {
    // 1. Visit website
    await page.goto('http://localhost:5173');
    await expect(page).toHaveTitle(/ShopEase/i);

    // 2. Navigate to Register
    await page.click('button:has-text("Sign Up")');
    await expect(page.locator('h2')).toHaveText('Create Account');

    // 3. Fill registration details
    await page.fill('input[placeholder="John Doe"]', 'John E2E Customer');
    await page.fill('input[placeholder="you@example.com"]', uniqueEmail);
    await page.fill('input[placeholder="At least 6 characters"]', 'securepassword123');
    await page.click('button:has-text("Register")');

    // 4. Registration logs us in automatically and redirects to store catalog page
    await expect(page.locator('h1')).toHaveText('Explore Products');
    await expect(page.locator('span:has-text("John E2E Customer")')).toBeVisible();

    // 5. Search for a product (e.g., 'Nike')
    await page.fill('input[placeholder="Search products..."]', 'Nike');
    await page.press('input[placeholder="Search products..."]', 'Enter');

    // 6. Tap/click on the Nike product card to go to product details
    const productCard = page.locator('h3:has-text("Nike")').first();
    await expect(productCard).toBeVisible();
    await productCard.click();

    // 7. Verify we are on details view
    await expect(page.locator('h1')).toContainText('Nike');

    // 8. Add product to cart
    await page.click('button:has-text("Add to Cart")');
    
    // 9. Open Cart page
    await page.click('button:has-text("Cart")');
    await expect(page.locator('h1')).toHaveText('Your Shopping Cart');
    await expect(page.locator('h3:has-text("Nike")')).toBeVisible();

    // 10. Enter Shipping Address & Place Order
    await page.fill('textarea[placeholder*="delivery address"]', '123 E2E Boulevard, Playwright City, 99999');
    await page.click('button:has-text("Checkout")');

    // 11. Verify Checkout success screen appears
    await expect(page.locator('h1')).toHaveText('Order Confirmed!');

    // 12. Wait for redirect or click to orders tracker
    await page.waitForTimeout(3000);
    await expect(page.locator('h1')).toHaveText('Your Orders');
    await expect(page.locator('span:has-text("Placed")')).toBeVisible();
  });
});
