import { DotType, ToneConfig } from '../types/manga';

export const STANDARD_TONES: ToneConfig[] = [
  // --- 1. 經典點網 (Classic Halftone Dots) ---
  {
    id: 'tone-60l-05',
    name: '極淺微影 60L 5%',
    lineCount: 60,
    density: 0.05,
    dotType: 'circle',
    angle: 45,
    category: 'dots',
  },
  {
    id: 'tone-60l-10',
    name: '標準微影 60L 10%',
    lineCount: 60,
    density: 0.1,
    dotType: 'circle',
    angle: 45,
    category: 'dots',
  },
  {
    id: 'tone-60l-20',
    name: '標準中灰 60L 20%',
    lineCount: 60,
    density: 0.2,
    dotType: 'circle',
    angle: 45,
    category: 'dots',
  },
  {
    id: 'tone-60l-30',
    name: '深色陰影 60L 30%',
    lineCount: 60,
    density: 0.3,
    dotType: 'circle',
    angle: 45,
    category: 'dots',
  },
  {
    id: 'tone-60l-40',
    name: '重布料暗面 60L 40%',
    lineCount: 60,
    density: 0.4,
    dotType: 'circle',
    angle: 45,
    category: 'dots',
  },
  {
    id: 'tone-60l-50',
    name: '正棋盤半調 60L 50%',
    lineCount: 60,
    density: 0.5,
    dotType: 'circle',
    angle: 45,
    category: 'dots',
  },
  {
    id: 'tone-60l-70',
    name: '濃夜深灰 60L 70%',
    lineCount: 60,
    density: 0.7,
    dotType: 'circle',
    angle: 45,
    category: 'dots',
  },
  {
    id: 'tone-40l-15',
    name: '復古粗網 40L 15%',
    lineCount: 40,
    density: 0.15,
    dotType: 'circle',
    angle: 45,
    category: 'dots',
  },
  {
    id: 'tone-50l-30',
    name: '經典粗目 50L 30%',
    lineCount: 50,
    density: 0.3,
    dotType: 'circle',
    angle: 45,
    category: 'dots',
  },
  {
    id: 'tone-80l-15',
    name: '超細絲光 80L 15%',
    lineCount: 80,
    density: 0.15,
    dotType: 'circle',
    angle: 45,
    category: 'dots',
  },
  {
    id: 'tone-85l-30',
    name: '細緻絹印 85L 30%',
    lineCount: 85,
    density: 0.3,
    dotType: 'circle',
    angle: 45,
    category: 'dots',
  },

  // --- 2. 漸層霞網 (Deleter JR Gradations) ---
  {
    id: 'tone-grad-sky',
    name: '天空漸變 (JR-400 0%~40%)',
    lineCount: 60,
    density: 0.35,
    dotType: 'gradient',
    angle: 0,
    category: 'gradient',
  },
  {
    id: 'tone-grad-dusk',
    name: '濃烈晚霞 (JR-403 5%~85%)',
    lineCount: 50,
    density: 0.55,
    dotType: 'gradient',
    angle: 0,
    category: 'gradient',
  },
  {
    id: 'tone-grad-vignette',
    name: '聚光放射暈染網',
    lineCount: 45,
    density: 0.45,
    dotType: 'gradient',
    angle: 45,
    category: 'gradient',
  },

  // --- 3. 手繪砂目與質感 (Sand & Textures) ---
  {
    id: 'tone-sand-fine',
    name: '細砂目 12% (微肌理)',
    lineCount: 60,
    density: 0.12,
    dotType: 'sand',
    angle: 0,
    category: 'sand',
  },
  {
    id: 'tone-sand-medium',
    name: '標準手繪砂目 25% (牆面)',
    lineCount: 50,
    density: 0.25,
    dotType: 'sand',
    angle: 0,
    category: 'sand',
  },
  {
    id: 'tone-sand-heavy',
    name: '荒砂目 45% (岩石粗糙)',
    lineCount: 40,
    density: 0.45,
    dotType: 'sand',
    angle: 0,
    category: 'sand',
  },

  // --- 4. 線條、效果與氣氛網 (Patterns & Atmosphere) ---
  {
    id: 'tone-line-45',
    name: '45° 單向斜排線',
    lineCount: 40,
    density: 0.25,
    dotType: 'line',
    angle: 45,
    category: 'pattern',
  },
  {
    id: 'tone-line-90',
    name: '90° 垂直豎排線',
    lineCount: 40,
    density: 0.28,
    dotType: 'line',
    angle: 90,
    category: 'pattern',
  },
  {
    id: 'tone-cross-45',
    name: '雙向十字排線網',
    lineCount: 40,
    density: 0.32,
    dotType: 'cross',
    angle: 45,
    category: 'pattern',
  },
  {
    id: 'tone-speed-focus',
    name: '漫畫速度線網',
    lineCount: 35,
    density: 0.3,
    dotType: 'speed',
    angle: 0,
    category: 'pattern',
  },
  {
    id: 'tone-check-pattern',
    name: '千鳥格子呢布紋',
    lineCount: 35,
    density: 0.35,
    dotType: 'check',
    angle: 0,
    category: 'pattern',
  },
  {
    id: 'tone-diamond-mesh',
    name: '菱形幾何網目',
    lineCount: 45,
    density: 0.28,
    dotType: 'diamond',
    angle: 45,
    category: 'pattern',
  },
  {
    id: 'tone-shojo-sparkle',
    name: '少女漫夢幻星芒',
    lineCount: 30,
    density: 0.2,
    dotType: 'star',
    angle: 45,
    category: 'pattern',
  },
  {
    id: 'tone-sakura-petals',
    name: '櫻花落瓣氣氛網',
    lineCount: 25,
    density: 0.22,
    dotType: 'sakura',
    angle: 15,
    category: 'pattern',
  },
  {
    id: 'tone-romance-heart',
    name: '心動泡泡浪漫網',
    lineCount: 25,
    density: 0.22,
    dotType: 'heart',
    angle: 25,
    category: 'pattern',
  },
];

/**
 * Creates a seamless tile canvas for the given tone configuration.
 */
export function createTonePatternCanvas(
  config: ToneConfig,
  scaleFactor: number = 1
): HTMLCanvasElement {
  const patternCanvas = document.createElement('canvas');
  const ctx = patternCanvas.getContext('2d');
  if (!ctx) return patternCanvas;

  // Working resolution baseline: 1200px / 60 lines per inch approx
  // spacing in px depends on lineCount and scaleFactor
  const baseSpacing = Math.max(4, Math.round((600 / config.lineCount) * scaleFactor));
  const tileSize = Math.max(baseSpacing * 2, 16);

  patternCanvas.width = tileSize;
  patternCanvas.height = tileSize;

  ctx.clearRect(0, 0, tileSize, tileSize);
  ctx.fillStyle = '#000000';

  const dotRadius = Math.max(
    0.6,
    Math.sqrt((tileSize * tileSize * config.density) / (4 * Math.PI))
  );

  if (config.dotType === 'circle') {
    // Halftone 45-degree diamond arrangement
    const centers = [
      { x: 0, y: 0 },
      { x: tileSize, y: 0 },
      { x: 0, y: tileSize },
      { x: tileSize, y: tileSize },
      { x: tileSize / 2, y: tileSize / 2 },
    ];

    for (const pt of centers) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (config.dotType === 'line') {
    ctx.lineWidth = Math.max(1, tileSize * config.density * 0.7);
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(0, tileSize / 2);
    ctx.lineTo(tileSize, tileSize / 2);
    ctx.stroke();
  } else if (config.dotType === 'cross') {
    ctx.lineWidth = Math.max(1, tileSize * config.density * 0.4);
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(0, tileSize / 2);
    ctx.lineTo(tileSize, tileSize / 2);
    ctx.moveTo(tileSize / 2, 0);
    ctx.lineTo(tileSize / 2, tileSize);
    ctx.stroke();
  } else if (config.dotType === 'star') {
    // Draw 4-point comic sparkle
    const drawStar = (cx: number, cy: number, size: number) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.quadraticCurveTo(cx, cy, cx + size, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + size);
      ctx.quadraticCurveTo(cx, cy, cx - size, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - size);
      ctx.closePath();
      ctx.fill();
    };

    drawStar(tileSize / 2, tileSize / 2, dotRadius * 1.6);
    drawStar(0, 0, dotRadius * 0.9);
    drawStar(tileSize, 0, dotRadius * 0.9);
    drawStar(0, tileSize, dotRadius * 0.9);
    drawStar(tileSize, tileSize, dotRadius * 0.9);
  } else if (config.dotType === 'sand') {
    // Deterministic procedural sand stipple
    const count = Math.round(tileSize * tileSize * config.density * 0.35);
    for (let i = 0; i < count; i++) {
      const rx = (Math.sin(i * 997.13 + config.density * 100) * 0.5 + 0.5) * tileSize;
      const ry = (Math.cos(i * 349.57 + config.density * 50) * 0.5 + 0.5) * tileSize;
      const r = 0.5 + (Math.sin(i * 123.4) * 0.5 + 0.5) * 0.9;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (config.dotType === 'gradient') {
    // Deleter Jr style halftone gradation
    const rows = 4;
    const cols = 4;
    const stepX = tileSize / cols;
    const stepY = tileSize / rows;
    for (let r = 0; r < rows; r++) {
      const gradDensity = Math.min(0.85, config.density * (0.15 + (r / (rows - 1)) * 1.2));
      const curRadius = Math.max(0.6, Math.sqrt((stepX * stepY * gradDensity) / (Math.PI * 1.2)));
      for (let c = 0; c < cols; c++) {
        const cx = (c + 0.5) * stepX;
        const cy = (r + 0.5) * stepY;
        ctx.beginPath();
        ctx.arc(cx, cy, curRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (config.dotType === 'diamond') {
    const drawDiamond = (cx: number, cy: number, w: number, h: number) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - h);
      ctx.lineTo(cx + w, cy);
      ctx.lineTo(cx, cy + h);
      ctx.lineTo(cx - w, cy);
      ctx.closePath();
      ctx.fill();
    };
    const dw = dotRadius * 1.3;
    const dh = dotRadius * 1.8;
    drawDiamond(0, 0, dw, dh);
    drawDiamond(tileSize, 0, dw, dh);
    drawDiamond(0, tileSize, dw, dh);
    drawDiamond(tileSize, tileSize, dw, dh);
    drawDiamond(tileSize / 2, tileSize / 2, dw, dh);
  } else if (config.dotType === 'check') {
    const half = tileSize / 2;
    ctx.fillRect(0, 0, half, half);
    ctx.fillRect(half, half, half, half);
    ctx.lineWidth = Math.max(1, tileSize * 0.08);
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(0, half * 0.5);
    ctx.lineTo(tileSize, half * 0.5);
    ctx.moveTo(half * 0.5, 0);
    ctx.lineTo(half * 0.5, tileSize);
    ctx.stroke();
  } else if (config.dotType === 'speed') {
    ctx.strokeStyle = '#000000';
    const lines = [
      { y: tileSize * 0.15, w: 2, len: tileSize * 0.8 },
      { y: tileSize * 0.35, w: 1, len: tileSize * 0.6 },
      { y: tileSize * 0.55, w: 2.5, len: tileSize * 0.95 },
      { y: tileSize * 0.75, w: 1.5, len: tileSize * 0.7 },
      { y: tileSize * 0.95, w: 2, len: tileSize * 0.85 },
    ];
    for (const l of lines) {
      ctx.lineWidth = l.w;
      ctx.beginPath();
      ctx.moveTo(0, l.y);
      ctx.lineTo(l.len, l.y);
      ctx.stroke();
    }
  } else if (config.dotType === 'sakura') {
    const drawPetal = (cx: number, cy: number, rot: number, size: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-size * 0.4, -size * 0.6, -size * 0.3, -size, 0, -size * 0.8);
      ctx.bezierCurveTo(size * 0.3, -size, size * 0.4, -size * 0.6, 0, 0);
      ctx.fill();
      ctx.restore();
    };
    drawPetal(tileSize / 2, tileSize / 2, 0.4, dotRadius * 2);
    drawPetal(0, 0, -0.6, dotRadius * 1.4);
    drawPetal(tileSize, 0, 0.8, dotRadius * 1.4);
    drawPetal(0, tileSize, 1.2, dotRadius * 1.4);
    drawPetal(tileSize, tileSize, -0.3, dotRadius * 1.4);
  } else if (config.dotType === 'heart') {
    const drawHeart = (cx: number, cy: number, size: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      ctx.moveTo(0, size * 0.3);
      ctx.bezierCurveTo(-size * 0.5, -size * 0.3, -size * 0.6, size * 0.2, 0, size * 0.7);
      ctx.bezierCurveTo(size * 0.6, size * 0.2, size * 0.5, -size * 0.3, 0, size * 0.3);
      ctx.fill();
      ctx.restore();
    };
    drawHeart(tileSize / 2, tileSize / 2, dotRadius * 1.8);
    drawHeart(0, 0, dotRadius * 1.2);
    drawHeart(tileSize, 0, dotRadius * 1.2);
    drawHeart(0, tileSize, dotRadius * 1.2);
    drawHeart(tileSize, tileSize, dotRadius * 1.2);
  }

  return patternCanvas;
}

/**
 * Generates a preview data URL for UI display (with pure white background).
 */
export function generateTonePreviewUrl(config: ToneConfig, size: number = 72): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Fill clean white paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // 2. Rotate if needed
  const patternCanvas = createTonePatternCanvas(config, 0.8);
  const pattern = ctx.createPattern(patternCanvas, 'repeat');
  if (pattern) {
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((config.angle * Math.PI) / 180);
    ctx.translate(-size / 2, -size / 2);
    ctx.fillStyle = pattern;
    ctx.fillRect(-size, -size, size * 3, size * 3);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}

/**
 * Fills a target canvas with the screentone pattern according to its transform.
 * Rotates and scales the internal pattern around the local bounds center,
 * preserving the mask boundary shape strictly in-place.
 */
export function renderToneToCanvas(
  targetCanvas: HTMLCanvasElement,
  config: ToneConfig,
  transform: { scaleX: number; scaleY: number; rotation: number; x: number; y: number },
  maskCanvas?: HTMLCanvasElement | null,
  scaleMultiplier: number = 1,
  bounds?: { minX: number; minY: number; maxX: number; maxY: number } | null
): void {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const w = targetCanvas.width;
  const h = targetCanvas.height;

  // Create temporary buffer
  const toneBuffer = document.createElement('canvas');
  toneBuffer.width = w;
  toneBuffer.height = h;
  const bCtx = toneBuffer.getContext('2d');
  if (!bCtx) return;

  const patternCanvas = createTonePatternCanvas(config, scaleMultiplier);
  const pattern = bCtx.createPattern(patternCanvas, 'repeat');
  if (!pattern) return;

  // Localized rotation center (defaults to center of region bounds if available, else canvas center)
  const centerX = bounds ? (bounds.minX + bounds.maxX) / 2 : w / 2;
  const centerY = bounds ? (bounds.minY + bounds.maxY) / 2 : h / 2;

  bCtx.save();
  // Apply rotation and scaling around the localized center of the manga frame / selection
  bCtx.translate(centerX + transform.x, centerY + transform.y);
  bCtx.rotate((((config.angle + transform.rotation) % 360) * Math.PI) / 180);
  bCtx.scale(transform.scaleX, transform.scaleY);
  bCtx.translate(-centerX, -centerY);

  bCtx.fillStyle = pattern;
  bCtx.fillRect(-w * 3, -h * 3, w * 7, h * 7);
  bCtx.restore();

  // If a mask canvas exists, composite with destination-in so outer boundaries remain 100% locked
  if (maskCanvas) {
    bCtx.globalCompositeOperation = 'destination-in';
    bCtx.drawImage(maskCanvas, 0, 0, w, h);
    bCtx.globalCompositeOperation = 'source-over';
  }

  // Draw buffer to target canvas
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(toneBuffer, 0, 0);
}

