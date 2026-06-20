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

  test('should open an exercise and interact with IDE, Terminal, and HTTP Simulator', async ({ page }) => {
    // Navigate to exercise
    await page.click('.level-card:has-text("Nivel 2")');
    await page.click('#view-exercises-btn');
    await page.click('.ejercicio-card:has-text("Desafío Final: Courses")');

    // IDE Layout check
    await expect(page.locator('#ejercicio-detalle-section')).toBeVisible();
    await expect(page.locator('#file-tree-container')).toBeVisible();
    
    // Terminal check
    const terminalInput = page.locator('#terminal-input');
    await terminalInput.fill('nest g res courses');
    await terminalInput.press('Enter');
    
    // Check if terminal output reflects command
    await expect(page.locator('#terminal-output')).toContainText('CREATE');

    // HTTP Simulator check
    await page.click('#open-http-simulator-btn');
    const modal = page.locator('#http-simulator-modal');
    await expect(modal).not.toHaveClass(/hidden/);
    
    // Set route to /courses and method to GET
    await page.locator('#http-route').fill('/courses');
    await page.locator('#http-method').selectOption('GET');

    // Simulate HTTP request
    await page.click('#http-send-btn');
    
    // Wait for the button to be disabled and then enabled again, indicating completion
    await expect(page.locator('#http-send-btn')).toHaveText('Cargando...');
    await expect(page.locator('#http-send-btn')).toHaveText('Enviar', { timeout: 15000 });
    
    // Validate output status
    await expect(page.locator('#http-response-status')).not.toBeEmpty();
    // Validate that it returns an array (from the generated controller)
    await expect(page.locator('#http-response-body')).toContainText('[');
    
    // Close modal
    await page.click('#close-http-modal-btn');
    await expect(modal).toHaveClass(/hidden/);

    // Validate project check
    await page.click('#validar-btn');
    await expect(page.locator('#loading-indicator')).toBeVisible();
    // Wait for validation to finish
    await expect(page.locator('#resultado-panel')).not.toHaveClass(/hidden/, { timeout: 20000 });
  });
});
