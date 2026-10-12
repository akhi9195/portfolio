import { expect, test, type Page } from '@playwright/test';

/** Open the ride and press Start once loading reaches 100. */
async function startRide(page: Page) {
  await page.goto('/');
  const start = page.getByRole('button', { name: 'Start' });
  await expect(start).toBeEnabled({ timeout: 60_000 });
  await start.click();
}

const progressOf = (page: Page) => page.locator('[data-progress]').getAttribute('data-progress').then(Number);

/** Ride to a fraction of the way: one mouse-wheel move on desktop, one swipe on phones. */
async function scrollTo(page: Page, p: number) {
  const current = await progressOf(page);
  const length = await page.evaluate(() => 11 * window.innerHeight);
  const px = (p - current) * length;
  const touch = await page.evaluate(() => navigator.maxTouchPoints > 0);
  if (touch) {
    await page.evaluate((dy) => {
      const fire = (type: string, y: number) => {
        const t = new Touch({ identifier: 1, target: document.body, clientX: 200, clientY: y });
        window.dispatchEvent(new TouchEvent(type, { touches: type === 'touchend' ? [] : [t], changedTouches: [t] }));
      };
      // Swipe distance on screen = ride distance / 1.6 (see RideExperience).
      fire('touchstart', 0);
      fire('touchmove', -dy / 1.6);
      fire('touchend', -dy / 1.6);
    }, px);
  } else {
    await page.mouse.move(300, 300);
    await page.mouse.wheel(0, px);
  }
  // CI renders 3D in software, so input can take a few seconds to arrive.
  await expect.poll(() => progressOf(page), { timeout: 20_000 }).toBeCloseTo(Math.min(1, Math.max(0, p)), 2);
}

test.describe('start screen', () => {
  test('loads, counts to 100 and starts the ride', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('loader')).toHaveText('100', { timeout: 60_000 });
    await expect(page.getByRole('link', { name: 'Plain résumé' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Terminal' })).toBeVisible();
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Akhilesh Bashettiwar' })).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('falls back when WebGL is missing', async ({ page }) => {
    await page.addInitScript(() => {
      const proto = HTMLCanvasElement.prototype as unknown as { getContext: (...a: unknown[]) => unknown };
      const orig = proto.getContext;
      proto.getContext = function (this: unknown, type: unknown, ...rest: unknown[]) {
        if (String(type).startsWith('webgl')) return null;
        return orig.call(this, type, ...rest);
      };
    });
    await page.goto('/');
    await expect(page.getByText(/needs WebGL/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Plain résumé' })).toBeVisible();
  });
});

test.describe('the ride', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } }); // no smoothing, so scroll positions apply at once

  test('scrolling shows each section in order', async ({ page }) => {
    await startRide(page);
    await scrollTo(page, 0.14);
    await expect(page.locator('[data-section="about"]')).toContainText('About me');
    await scrollTo(page, 0.32);
    await expect(page.locator('[data-section="skills"]')).toContainText('Backend & APIs');
    await scrollTo(page, 0.52);
    await expect(page.locator('[data-section="experience"]')).toContainText('Experience');
    await scrollTo(page, 0.8);
    await expect(page.getByTestId('stars')).toContainText('4 / 4 projects collected');
    await scrollTo(page, 1);
    await expect(page.locator('[data-section="contact"]')).toContainText("Let's talk");
    await expect(page.getByRole('link', { name: 'akhi9195@gmail.com' })).toBeVisible();
  });

  test('stars unlock projects and open the full card', async ({ page }) => {
    await startRide(page);
    await scrollTo(page, 0.67);
    await expect(page.getByTestId('stars')).toContainText('1 / 4');
    await page.getByRole('button', { name: 'Open project' }).click();
    const modal = page.getByTestId('modal');
    await expect(modal.getByRole('heading', { name: 'HelpDesk API' })).toBeVisible();
    await expect(modal).toContainText('optimistic locking');
    await modal.getByRole('button', { name: 'Next →' }).click();
    await expect(modal.getByRole('heading', { name: 'LoopMotion' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

  test('the menu jumps to any section', async ({ page, isMobile }) => {
    await startRide(page);
    await page.getByRole('button', { name: /Menu/ }).click();
    await page.locator('#ride-menu').getByRole('button', { name: 'Experience' }).click();
    await expect(page.locator('[data-section="experience"]')).toBeVisible({ timeout: 10_000 });
    if (!isMobile) {
      await page.getByRole('button', { name: 'Go to Contact' }).click();
      await expect(page.locator('[data-section="contact"]')).toBeVisible({ timeout: 10_000 });
    }
  });

  test('the mouse wheel moves the ride forward and back', async ({ page, isMobile }) => {
    test.skip(isMobile, 'phones swipe; covered by the swipe test');
    await startRide(page);
    await page.mouse.move(640, 400);
    await page.mouse.wheel(0, 900);
    await expect.poll(() => progressOf(page), { timeout: 30_000 }).toBeGreaterThan(0.05);
    const ahead = await progressOf(page);
    await page.mouse.wheel(0, -300);
    await expect.poll(() => progressOf(page), { timeout: 30_000 }).toBeLessThan(ahead);
  });

  test('a swipe up moves the ride forward', async ({ page }) => {
    await startRide(page);
    await page.evaluate(() => {
      const fire = (type: string, y: number) => {
        const t = new Touch({ identifier: 1, target: document.body, clientX: 200, clientY: y });
        window.dispatchEvent(new TouchEvent(type, { touches: type === 'touchend' ? [] : [t], changedTouches: [t], bubbles: true }));
      };
      fire('touchstart', 700);
      for (let y = 680; y >= 200; y -= 20) fire('touchmove', y);
      fire('touchend', 200);
    });
    await expect.poll(() => page.locator('[data-progress]').getAttribute('data-progress').then(Number)).toBeGreaterThan(0.05);
  });

  test('keyboard scrolling moves the ride', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard test runs on desktop');
    await startRide(page);
    await page.locator('body').click({ position: { x: 700, y: 500 } });
    for (let i = 0; i < 3; i++) await page.keyboard.press('PageDown');
    await expect(page.locator('[data-section="home"]')).toBeHidden();
  });
});

test.describe('terminal', () => {
  test('runs commands, suggests on typos and opens projects', async ({ page }) => {
    await page.goto('/terminal');
    const out = page.getByTestId('term-output');
    await expect(out).toContainText('Senior full-stack engineer', { timeout: 10_000 });
    const input = page.getByLabel(/Type a command/);
    await input.fill('help');
    await input.press('Enter');
    await expect(out).toContainText('List all commands');
    await input.fill('skils');
    await input.press('Enter');
    await expect(out).toContainText('Did you mean');
    await input.fill('cd helpdesk-api');
    await input.press('Enter');
    await expect(out).toContainText('optimistic locking');
  });

  test('deep link runs a command on load', async ({ page }) => {
    await page.goto('/terminal?cmd=cd%20wild-oasis');
    await expect(page.getByTestId('term-output')).toContainText('The Wild Oasis');
  });
});

test('résumé page shows all sections', async ({ page }) => {
  await page.goto('/resume');
  for (const h of ['Skills', 'Experience', 'Projects', 'Contact']) {
    await expect(page.getByRole('heading', { level: 2, name: h })).toBeVisible();
  }
  await expect(page.getByText('ServiceNow').first()).toBeVisible();
});
