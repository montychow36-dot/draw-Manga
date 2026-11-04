/**
 * Extracts pure ink lineart from a paper manuscript by stripping the white background.
 * Converts brightness into inverted opacity, yielding a crisp transparent lineart layer.
 */
export function extractLineartFromCanvas(
  sourceCanvas: HTMLCanvasElement,
  threshold: number = 220,
  contrastBoost: number = 1.3
): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = width;
  resultCanvas.height = height;

  const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  const dstCtx = resultCanvas.getContext('2d');
  if (!srcCtx || !dstCtx) return resultCanvas;

  const srcData = srcCtx.getImageData(0, 0, width, height);
  const dstData = dstCtx.createImageData(width, height);

  const sp = srcData.data;
  const dp = dstData.data;
  const len = width * height * 4;

  for (let i = 0; i < len; i += 4) {
    const r = sp[i];
    const g = sp[i + 1];
    const b = sp[i + 2];
    const srcA = sp[i + 3];

    if (srcA < 10) {
      // Already transparent
      dp[i] = 0;
      dp[i + 1] = 0;
      dp[i + 2] = 0;
      dp[i + 3] = 0;
      continue;
    }

    // Relative luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum >= threshold) {
      // Pure paper white, eliminate completely
      dp[i] = 0;
      dp[i + 1] = 0;
      dp[i + 2] = 0;
      dp[i + 3] = 0;
    } else {
      // Dark lineart: invert luminance into opacity
      // Closer to 0 (black) -> alpha close to 255
      const normalizedDarkness = 1 - lum / threshold;
      const boostedDarkness = Math.min(1, Math.pow(normalizedDarkness, 1 / contrastBoost));
      const finalAlpha = Math.round(boostedDarkness * 255 * (srcA / 255));

      // Pure black ink
      dp[i] = 0;
      dp[i + 1] = 0;
      dp[i + 2] = 0;
      dp[i + 3] = finalAlpha;
    }
  }

  dstCtx.putImageData(dstData, 0, 0);
  return resultCanvas;
}
