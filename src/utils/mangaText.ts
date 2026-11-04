import { MangaTextItem } from '../types/manga';

/**
 * Renders Japanese/Chinese vertical or horizontal comic dialogue text onto a canvas context.
 * Includes white balloon outline stroke for clear legibility over screentones.
 */
export function renderMangaTextToCanvas(
  ctx: CanvasRenderingContext2D,
  item: MangaTextItem,
  scale: number = 1
): void {
  ctx.save();
  ctx.font = `${item.bold ? 'bold ' : ''}${Math.round(item.fontSize * scale)}px ${item.fontFamily}, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  const scaledOutlineWidth = Math.max(1, Math.round(item.outlineWidth * scale * 2));
  const lineSpacing = item.fontSize * scale * item.lineHeight;

  if (item.direction === 'vertical') {
    // Traditional manga vertical dialogue (Right-to-Left columns)
    const lines = item.text.split('\n');
    const startX = item.x * scale;
    const startY = item.y * scale;

    lines.forEach((line, colIndex) => {
      // In vertical East-Asian typesetting, subsequent columns flow to the LEFT
      const colX = startX - colIndex * (item.fontSize * scale * 1.35);
      const chars = Array.from(line);

      chars.forEach((char, charIndex) => {
        const charY = startY + charIndex * lineSpacing;

        // Punctuation rotation or adjustments
        ctx.save();
        ctx.translate(colX, charY);

        // Rotate brackets and dashes for vertical layout
        if (char === '—' || char === '–' || char === '…' || char === '～') {
          ctx.rotate(Math.PI / 2);
        } else if (char === '（' || char === '(' || char === '｛' || char === '{') {
          ctx.rotate(Math.PI / 2);
        } else if (char === '）' || char === ')' || char === '｝' || char === '}') {
          ctx.rotate(Math.PI / 2);
        }

        // 1. Draw outline stroke first (usually white for screentone contrast)
        if (item.hasOutline) {
          ctx.strokeStyle = item.outlineColor || '#ffffff';
          ctx.lineWidth = scaledOutlineWidth;
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          ctx.strokeText(char, 0, 0);
        }

        // 2. Draw fill text
        ctx.fillStyle = item.color || '#000000';
        ctx.fillText(char, 0, 0);
        ctx.restore();
      });
    });
  } else {
    // Horizontal dialogue typesetting
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const lines = item.text.split('\n');
    const startX = item.x * scale;
    const startY = item.y * scale;

    lines.forEach((line, index) => {
      const curY = startY + index * lineSpacing;

      if (item.hasOutline) {
        ctx.strokeStyle = item.outlineColor || '#ffffff';
        ctx.lineWidth = scaledOutlineWidth;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(line, startX, curY);
      }

      ctx.fillStyle = item.color || '#000000';
      ctx.fillText(line, startX, curY);
    });
  }

  ctx.restore();
}
