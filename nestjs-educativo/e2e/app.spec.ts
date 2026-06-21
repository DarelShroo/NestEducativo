import { test, expect } from '@playwright/test';

test.describe('NestJS Educativo E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the main page
    await page.goto('http://localhost:3001');
  });

  test('should load the home page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/NestJS/);
    const title = page.locator('.welcome-title');
    await expect(title).toContainText('Aprende');
  });

  test('should navigate to the exercise list and hide progress sidebar with floating button', async ({ page }) => {
    // Click on Level 2
    await page.click('.level-card:has-text("Nivel 2")');
    
    // View exercises
    await page.click('#view-exercises-btn');
    
    // Check if exercise list is visible
    await expect(page.locator('#ejercicios-lista-section')).toBeVisible();
    await expect(page.locator('#ejercicios-grid')).toBeVisible();
    
    // Check hide progress sidebar
    const toggleBtn = page.locator('#toggle-progreso-btn');
    const sidebar = page.locator('#progreso-sidebar');
    const floatingBtn = page.locator('#floating-toggle-progreso-btn');
    
    await expect(sidebar).toBeVisible();
    await toggleBtn.click();
    await expect(sidebar).toHaveClass(/hidden/);
    await expect(floatingBtn).toBeVisible();

    await floatingBtn.click();
    await expect(sidebar).not.toHaveClass(/hidden/);
    await expect(floatingBtn).toHaveClass(/hidden/);
  });

  test('should persist the state after reloading the page', async ({ page }) => {
    // Navigate to an exercise
    await page.click('.level-card:has-text("Nivel 2")');
    await page.click('#view-exercises-btn');
    await page.click('.ejercicio-card:has-text("Archivos Base")');
    await expect(page.locator('#ejercicio-detalle-section')).toBeVisible();

    // Reload the page
    await page.reload();

    // Verify we are still in the exercise view
    await expect(page.locator('#ejercicio-detalle-section')).toBeVisible();
    await expect(page.locator('#ejercicio-titulo')).toContainText('Archivos Base');
  });

});
