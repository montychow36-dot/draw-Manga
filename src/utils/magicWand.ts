import { WandSettings } from '../types/manga';

export interface WandResult {
  maskCanvas: HTMLCanvasElement;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  pixelCount: number;
  clickPoint: { x: number; y: number };
}

/**
 * Line-Centric Enclosed Region Wand (漫畫線條拓撲封閉辨識)
 * Reads lines and frames directly, ignoring paper grayscale/shadows.
 * Encloses whatever space is surrounded by darker strokes and frame borders.
 */
export function performMagicWand(
  sourceCanvas: HTMLCanvasElement,
  startX: number,
  startY: number,
  settings: WandSettings
): WandResult | null {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
    return null;
  }

  const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!srcCtx) return null;

  const srcImgData = srcCtx.getImageData(0, 0, width, height);
  const srcPixels = srcImgData.data;

  // 1. Sample seed pixel brightness (3x3 neighborhood)
  let seedLumSum = 0;
  let sampleCount = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const sx = Math.max(0, Math.min(width - 1, startX + dx));
      const sy = Math.max(0, Math.min(height - 1, startY + dy));
      const idx = (sy * width + sx) * 4;
      const a = srcPixels[idx + 3];
      if (a >= 25) {
        seedLumSum += 0.299 * srcPixels[idx] + 0.587 * srcPixels[idx + 1] + 0.114 * srcPixels[idx + 2];
        sampleCount++;
      }
    }
  }

  const startLum = sampleCount > 0 ? seedLumSum / sampleCount : 255;

  // If clicked directly onto a solid line/stroke, return null
  if (startLum < 38) {
    return null;
  }

  // 2. Line Barrier Threshold calculation:
  // Tolerance (10 - 180): higher tolerance means more sensitive to fainter pencil lines.
  // In real manga sketches, lines are significantly darker than their adjacent paper.
  const contrastDelta = Math.max(14, Math.min(95, settings.tolerance * 0.7));
  const lineThreshold = Math.max(30, startLum - contrastDelta);
  const absoluteBlackFrame = 55; // Solid black frames are always barriers

  // 3. Fast line barrier evaluator with smart gap bridging
  const gap = Math.max(0, Math.min(4, settings.gapBridging || 2));

  const isRawLine = (x: number, y: number): boolean => {
    if (x < 0 || x >= width || y < 0 || y >= height) return true; // Canvas edge is barrier
    const idx = (y * width + x) * 4;
    const a = srcPixels[idx + 3];
    if (a < 25) return false;
    const lum = 0.299 * srcPixels[idx] + 0.587 * srcPixels[idx + 1] + 0.114 * srcPixels[idx + 2];
    return lum < lineThreshold || lum < absoluteBlackFrame;
  };

  // Gap-bridged barrier check
  const isBarrier = (x: number, y: number): boolean => {
    if (isRawLine(x, y)) return true;

    if (gap > 0) {
      // Horizontal gap check (e.g. line on left and line on right within gap distance)
      let hasLeft = false;
      let hasRight = false;
      for (let d = 1; d <= gap; d++) {
        if (isRawLine(x - d, y)) {
          hasLeft = true;
          break;
        }
      }
      for (let d = 1; d <= gap; d++) {
        if (isRawLine(x + d, y)) {
          hasRight = true;
          break;
        }
      }
      if (hasLeft && hasRight) return true;

      // Vertical gap check (e.g. line on top and line on bottom within gap distance)
      let hasTop = false;
      let hasBottom = false;
      for (let d = 1; d <= gap; d++) {
        if (isRawLine(x, y - d)) {
          hasTop = true;
          break;
        }
      }
      for (let d = 1; d <= gap; d++) {
        if (isRawLine(x, y + d)) {
          hasBottom = true;
          break;
        }
      }
      if (hasTop && hasBottom) return true;
    }

    return false;
  };

  // 4. Scanline Flood-Fill across the enclosed region
  const visited = new Uint8Array(width * height);
  let minX = startX;
  let maxX = startX;
  let minY = startY;
  let maxY = startY;
  let pixelCount = 0;

  const stack: number[][] = [];

  // Initial horizontal scanline
  let xLeft = startX;
  while (xLeft > 0 && !isBarrier(xLeft - 1, startY) && visited[startY * width + (xLeft - 1)] === 0) {
    xLeft--;
  }

  let xRight = startX;
  while (xRight < width - 1 && !isBarrier(xRight + 1, startY) && visited[startY * width + (xRight + 1)] === 0) {
    xRight++;
  }

  for (let x = xLeft; x <= xRight; x++) {
    visited[startY * width + x] = 1;
    pixelCount++;
  }
  minX = Math.min(minX, xLeft);
  maxX = Math.max(maxX, xRight);

  if (startY > 0) stack.push([xLeft, xRight, startY - 1, -1]);
  if (startY < height - 1) stack.push([xLeft, xRight, startY + 1, 1]);

  let iterations = 0;
  const maxIterations = 250000;

  while (stack.length > 0 && iterations++ < maxIterations) {
    const item = stack.pop();
    if (!item) break;
    const [x1, x2, y, dy] = item;

    let x = x1;
    while (x <= x2) {
      if (visited[y * width + x] === 0 && !isBarrier(x, y)) {
        let left = x;
        while (left > 0 && visited[y * width + (left - 1)] === 0 && !isBarrier(left - 1, y)) {
          left--;
        }

        let right = x;
        while (right < width - 1 && visited[y * width + (right + 1)] === 0 && !isBarrier(right + 1, y)) {
          right++;
        }

        for (let ix = left; ix <= right; ix++) {
          visited[y * width + ix] = 1;
          pixelCount++;
        }

        minX = Math.min(minX, left);
        maxX = Math.max(maxX, right);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);

        if (y + dy >= 0 && y + dy < height) {
          stack.push([left, right, y + dy, dy]);
        }
        if (y - dy >= 0 && y - dy < height && (left < x1 || right > x2)) {
          stack.push([left, right, y - dy, -dy]);
        }

        x = right + 1;
      } else {
        x++;
      }
    }
  }

  if (pixelCount === 0) return null;

  // 5. Create Mask Canvas
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) return null;

  const maskImg = maskCtx.createImageData(width, height);
  const maskData = maskImg.data;

  // 6. Boundary expansion / dilation (tucks screentone under black strokes)
  const expand = Math.max(0, Math.min(5, settings.expand));

  if (expand > 0) {
    const dilated = new Uint8Array(width * height);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (visited[y * width + x] === 1) {
          dilated[y * width + x] = 1;
          for (let dy = -expand; dy <= expand; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -expand; dx <= expand; dx++) {
              if (dx * dx + dy * dy <= expand * expand) {
                const nx = x + dx;
                if (nx >= 0 && nx < width) {
                  dilated[ny * width + nx] = 1;
                }
              }
            }
          }
        }
      }
    }

    minX = Math.max(0, minX - expand);
    minY = Math.max(0, minY - expand);
    maxX = Math.min(width - 1, maxX + expand);
    maxY = Math.min(height - 1, maxY + expand);

    for (let i = 0; i < width * height; i++) {
      if (dilated[i] === 1) {
        const idx = i * 4;
        maskData[idx] = 0;
        maskData[idx + 1] = 0;
        maskData[idx + 2] = 0;
        maskData[idx + 3] = 255;
      }
    }
  } else {
    for (let i = 0; i < width * height; i++) {
      if (visited[i] === 1) {
        const idx = i * 4;
        maskData[idx] = 0;
        maskData[idx + 1] = 0;
        maskData[idx + 2] = 0;
        maskData[idx + 3] = 255;
      }
    }
  }

  maskCtx.putImageData(maskImg, 0, 0);

  return {
    maskCanvas,
    bounds: { minX, minY, maxX, maxY },
    pixelCount,
    clickPoint: { x: startX, y: startY },
  };
}

/**
 * Checks if a point is within the selection mask or within 50px tolerance buffer.
 */
export function isPointInSelection(
  x: number,
  y: number,
  maskCanvas: HTMLCanvasElement | null,
  bounds: { minX: number; minY: number; maxX: number; maxY: number } | null,
  tolerancePx: number = 50
): boolean {
  if (!maskCanvas || !bounds) return false;

  // First fast test against expanded bounding box
  if (
    x < bounds.minX - tolerancePx ||
    x > bounds.maxX + tolerancePx ||
    y < bounds.minY - tolerancePx ||
    y > bounds.maxY + tolerancePx
  ) {
    return false;
  }

  // Exact pixel check within mask canvas
  const ctx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;

  const px = Math.round(x);
  const py = Math.round(y);
  if (px >= 0 && px < maskCanvas.width && py >= 0 && py < maskCanvas.height) {
    const pixel = ctx.getImageData(px, py, 1, 1).data;
    if (pixel[3] > 50) return true;
  }

  // If inside the bounding box + tolerancePx buffer, also accept as 2nd click tolerance
  return (
    x >= bounds.minX - tolerancePx &&
    x <= bounds.maxX + tolerancePx &&
    y >= bounds.minY - tolerancePx &&
    y <= bounds.maxY + tolerancePx
  );
}
