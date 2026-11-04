import { ScraperSettings } from '../types/manga';

/**
 * Simulates physical Japanese manga scraper knives (美工鎅刀刮網)
 * Carves authentic metal blade hatchings, feathers, and highlights into tone layers.
 */
export function applyScraperStroke(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  settings: ScraperSettings
): void {
  const { style, width, angle, pressure, hardness } = settings;

  ctx.save();
  // Using destination-out removes tone dots like a physical steel blade scraping off toner film
  ctx.globalCompositeOperation = 'destination-out';

  const bladeAngleRad = (angle * Math.PI) / 180;
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(1, Math.ceil(dist / 2));

  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const curX = x1 + (x2 - x1) * t;
    const curY = y1 + (y2 - y1) * t;

    if (style === 'feather') {
      // 羽化排線刮網: multiple fine scratch blades along blade angle
      const lineCount = Math.max(3, Math.round(width * 0.4 * hardness));
      const spread = width / 2;

      ctx.lineWidth = Math.max(0.6, 1.4 * pressure * hardness);
      ctx.strokeStyle = `rgba(0, 0, 0, ${pressure})`;

      for (let i = -lineCount; i <= lineCount; i++) {
        const offset = (i / lineCount) * spread;
        const perpX = Math.cos(bladeAngleRad + Math.PI / 2) * offset;
        const perpY = Math.sin(bladeAngleRad + Math.PI / 2) * offset;

        // Blade length with organic jitter
        const bladeLen = (width * 0.8 + (Math.sin(s * 13 + i * 7) * 0.3) * width) * pressure;
        const startLen = -bladeLen / 2;
        const endLen = bladeLen / 2;

        const bx1 = curX + perpX + Math.cos(bladeAngleRad) * startLen;
        const by1 = curY + perpY + Math.sin(bladeAngleRad) * startLen;
        const bx2 = curX + perpX + Math.cos(bladeAngleRad) * endLen;
        const by2 = curY + perpY + Math.sin(bladeAngleRad) * endLen;

        ctx.beginPath();
        ctx.moveTo(bx1, by1);
        ctx.lineTo(bx2, by2);
        ctx.stroke();
      }
    } else if (style === 'cross') {
      // 交叉排線: dual criss-crossing blade cuts
      const spread = width / 2;
      const lines = Math.max(2, Math.round(width * 0.3 * hardness));
      ctx.lineWidth = Math.max(0.5, 1.2 * pressure);
      ctx.strokeStyle = `rgba(0, 0, 0, ${pressure * 0.85})`;

      const angles = [bladeAngleRad - Math.PI / 6, bladeAngleRad + Math.PI / 6];
      for (const a of angles) {
        for (let i = -lines; i <= lines; i++) {
          const offset = (i / lines) * spread;
          const perpX = Math.cos(a + Math.PI / 2) * offset;
          const perpY = Math.sin(a + Math.PI / 2) * offset;
          const len = width * 0.7 * pressure;

          ctx.beginPath();
          ctx.moveTo(curX + perpX - Math.cos(a) * (len / 2), curY + perpY - Math.sin(a) * (len / 2));
          ctx.lineTo(curX + perpX + Math.cos(a) * (len / 2), curY + perpY + Math.sin(a) * (len / 2));
          ctx.stroke();
        }
      }
    } else if (style === 'fade') {
      // 漸變消退: soft feathering blade with radial falloff
      const grad = ctx.createRadialGradient(curX, curY, 0, curX, curY, width / 2);
      grad.addColorStop(0, `rgba(0, 0, 0, ${pressure * hardness})`);
      grad.addColorStop(0.6 * hardness, `rgba(0, 0, 0, ${pressure * 0.4})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(curX, curY, width / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'highlight') {
      // 高光刮網: solid crisp edge carve
      ctx.fillStyle = `rgba(0, 0, 0, ${pressure})`;
      ctx.beginPath();
      // Elongated diamond or oval along blade angle
      ctx.ellipse(
        curX,
        curY,
        width / 2,
        Math.max(1, (width / 6) * hardness),
        bladeAngleRad,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  ctx.restore();
}
