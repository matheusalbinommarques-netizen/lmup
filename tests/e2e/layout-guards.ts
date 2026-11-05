import { expect, type Locator, type Page } from '@playwright/test';

// Geometry checks for defects that text assertions cannot see.
export async function expectMinWidth(
  target: Locator,
  minimum: number,
  context: string,
) {
  const box = await target.boundingBox();
  expect(box, `${context}: elemento visível`).not.toBeNull();
  expect(box!.width, `${context}: largura`).toBeGreaterThanOrEqual(minimum);
}

// Counts the rendered lines of the element's first text node only.
export async function expectMaxLines(
  target: Locator,
  maximum: number,
  context: string,
) {
  const lines = await target.evaluate((element) => {
    const text = [...element.childNodes].find(
      (node) => node.nodeType === Node.TEXT_NODE,
    );
    if (!text) return 0;
    const range = document.createRange();
    range.selectNodeContents(text);
    return new Set(
      [...range.getClientRects()].map((rect) => Math.round(rect.top)),
    ).size;
  });
  expect(lines, `${context}: linhas`).toBeGreaterThan(0);
  expect(lines, `${context}: linhas`).toBeLessThanOrEqual(maximum);
}

export async function expectNoPageOverflow(page: Page, context: string) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - innerWidth,
  );
  expect(overflow, `${context}: transbordo da página`).toBeLessThanOrEqual(0);
}

export async function expectInsideParent(target: Locator, context: string) {
  const overflow = await target.evaluate((element) => {
    const parent = element.parentElement!.getBoundingClientRect();
    const own = element.getBoundingClientRect();
    return Math.max(parent.left - own.left, own.right - parent.right);
  });
  expect(overflow, `${context}: fora do contêiner`).toBeLessThanOrEqual(1);
}
