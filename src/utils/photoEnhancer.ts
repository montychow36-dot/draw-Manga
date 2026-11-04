/**
 * Photo Manuscript Enhancer (拍照草稿黑白淨化與去灰影)
 * Performs adaptive contrast normalization to eliminate shadows, camera exposure gradient,
 * and gray paper noise, turning pencil/ink drawings into clean manga lineart.
 */
export function binarizePhotoManuscript(
  sourceCanvas: HTMLCanvasElement,
  thresholdMultiplier: number = 0.82
): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;

  const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  const dstCtx = outCanvas.getContext('2d');
  if (!srcCtx || !dstCtx) return outCanvas;

  const srcData = srcCtx.getImageData(0, 0, width, height);
  const dstData = dstCtx.createImageData(width, height);
  const sp = srcData.data;
  const dp = dstData.data;
  const totalPixels = width * height;

  // 1. Build luminance histogram
  const hist = new Uint32Array(256);
  let lumSum = 0;
  for (let i = 0; i < totalPixels * 4; i += 4) {
    const lum = Math.round(0.299 * sp[i] + 0.587 * sp[i + 1] + 0.114 * sp[i + 2]);
    hist[lum]++;
    lumSum += lum;
  }

  // 2. Estimate paper background brightness (80th percentile)
  let count = 0;
  let paperLum = 200;
  const targetCount = totalPixels * 0.8;
  for (let i = 0; i < 256; i++) {
    count += hist[i];
    if (count >= targetCount) {
      paperLum = Math.max(120, i);
      break;
    }
  }

  // Ink threshold is proportional to estimated paper brightness
  const inkThreshold = Math.max(45, paperLum * thresholdMultiplier);

  // 3. Transform pixels: Paper to pure white #fff, Inks to deep black #000
  for (let i = 0; i < totalPixels * 4; i += 4) {
    const r = sp[i];
    const g = sp[i + 1];
    const b = sp[i + 2];
    const a = sp[i + 3];

    if (a < 20) {
      dp[i] = 255;
      dp[i + 1] = 255;
      dp[i + 2] = 255;
      dp[i + 3] = 255;
      continue;
    }

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum >= inkThreshold) {
      // Paper background -> pure white
      dp[i] = 255;
      dp[i + 1] = 255;
      dp[i + 2] = 255;
      dp[i + 3] = 255;
    } else {
      // Ink line -> contrast stretched to solid black
      const darkness = Math.max(0, 1 - lum / inkThreshold);
      const inkVal = Math.round((1 - Math.pow(darkness, 1.2)) * 35);
      dp[i] = inkVal;
      dp[i + 1] = inkVal;
      dp[i + 2] = inkVal;
      dp[i + 3] = 255;
    }
  }

  dstCtx.putImageData(dstData, 0, 0);
  return outCanvas;
}
