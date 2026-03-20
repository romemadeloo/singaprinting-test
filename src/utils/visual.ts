import fs from 'node:fs';
import path from 'node:path';

import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export type VisualAssertOptions = {
  testInfo: TestInfo;
  page: Page;
  name: string;
  target?: Locator;
  fullPage?: boolean;
  maskSelectors?: string[];
  maxDiffRatio?: number;
};

function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-_]+/g, '-');
}

function projectBaselineDir(testInfo: TestInfo): string {
  return path.resolve(process.cwd(), 'visual-baseline', sanitizeName(testInfo.project.name));
}

function toMaskLocators(page: Page, selectors: string[] = []): Locator[] {
  return selectors.map((selector) => page.locator(selector));
}

function attachPng(testInfo: TestInfo, name: string, body: Buffer): Promise<void> {
  return testInfo.attach(name, {
    body,
    contentType: 'image/png',
  });
}

export async function assertVisualSnapshot(options: VisualAssertOptions): Promise<void> {
  const maskLocators = toMaskLocators(options.page, options.maskSelectors);
  const baselineDir = projectBaselineDir(options.testInfo);
  const safeName = sanitizeName(options.name);
  const baselinePath = path.join(baselineDir, `${safeName}.png`);
  const shouldUpdate = (process.env.UPDATE_VISUAL_BASELINE ?? 'false').toLowerCase() === 'true';
  const maxDiffRatio = options.maxDiffRatio ?? 0.01;

  const targetVisible = options.target
    ? await options.target.first().isVisible().catch(() => false)
    : false;

  const actualBuffer =
    options.target && targetVisible
      ? await options.target.first().screenshot({
          type: 'png',
          animations: 'disabled',
          caret: 'hide',
          mask: maskLocators,
        })
      : await options.page.screenshot({
          type: 'png',
          animations: 'disabled',
          caret: 'hide',
          fullPage: options.fullPage ?? false,
          mask: maskLocators,
        });

  await attachPng(options.testInfo, `${safeName}-actual`, actualBuffer);

  fs.mkdirSync(baselineDir, { recursive: true });

  if (!fs.existsSync(baselinePath) || shouldUpdate) {
    fs.writeFileSync(baselinePath, actualBuffer);
    await options.testInfo.attach(`${safeName}-baseline-created`, {
      body: Buffer.from(`Baseline written: ${baselinePath}`),
      contentType: 'text/plain',
    });
    return;
  }

  const baselineBuffer = fs.readFileSync(baselinePath);
  await attachPng(options.testInfo, `${safeName}-baseline`, baselineBuffer);

  const baselinePng = PNG.sync.read(baselineBuffer);
  const actualPng = PNG.sync.read(actualBuffer);

  if (baselinePng.width !== actualPng.width || baselinePng.height !== actualPng.height) {
    throw new Error(
      `Visual baseline size mismatch for "${options.name}". ` +
        `Baseline: ${baselinePng.width}x${baselinePng.height}, ` +
        `Actual: ${actualPng.width}x${actualPng.height}. ` +
        'Rebuild baseline with UPDATE_VISUAL_BASELINE=true.',
    );
  }

  const diffPng = new PNG({ width: baselinePng.width, height: baselinePng.height });
  const diffPixels = pixelmatch(
    baselinePng.data,
    actualPng.data,
    diffPng.data,
    baselinePng.width,
    baselinePng.height,
    {
      threshold: 0.15,
      includeAA: false,
    },
  );

  const totalPixels = baselinePng.width * baselinePng.height;
  const diffRatio = diffPixels / totalPixels;
  const diffBuffer = PNG.sync.write(diffPng);
  await attachPng(options.testInfo, `${safeName}-diff`, diffBuffer);

  expect(
    diffRatio,
    `Visual drift for "${options.name}" is too high (${(diffRatio * 100).toFixed(3)}%).`,
  ).toBeLessThanOrEqual(maxDiffRatio);
}
