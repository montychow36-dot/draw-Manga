export interface SampleManuscript {
  id: string;
  name: string;
  genre: 'shonen' | 'shojo' | 'mecha' | 'custom';
  description: string;
  render: (canvas: HTMLCanvasElement, onDone?: () => void) => void;
}

export const SAMPLE_MANUSCRIPTS: SampleManuscript[] = [
  {
    id: 'user-photo-sketch',
    name: '您拍攝的手繪多格草稿 (100% 原生真實灰階)',
    genre: 'custom',
    description: '保留您親手繪製的真實灰階筆觸與手稿質感，程式直接透過線條與分鏡黑框邊界進行拓撲封閉填網。',
    render: (canvas: HTMLCanvasElement, onDone?: () => void) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      const img = new Image();
      img.onload = () => {
        const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        const ox = (w - dw) / 2;
        const oy = (h - dh) / 2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        // Render 100% untouched original image with authentic pencil/ink grayscale
        ctx.drawImage(img, ox, oy, dw, dh);
        if (onDone) onDone();
      };
      img.onerror = () => {
        // Fallback drawing if local photo asset fails to load in remote environments
        SAMPLE_MANUSCRIPTS[1].render(canvas, onDone);
      };
      const base = (import.meta.env.BASE_URL || './').replace(/\/+$/, '');
      img.src = `${base}/assets/aistudio/20261101_102828463__1__11af9466.JPG`;
    },
  },
  {
    id: 'shonen-sword',
    name: '熱血少年 · 劍道疾風 (Shonen)',
    genre: 'shonen',
    description: '動態多格漫畫手稿，包含持刀武士、飄逸羽織、髮絲與速度線封閉區域。',
    render: (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Fill white manuscript paper
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Comic Page Outer Margin & Panels
      ctx.lineWidth = 6;
      // Top panel (Action face close-up)
      ctx.strokeRect(60, 60, w - 120, 520);
      // Bottom left panel (Katana thrust)
      ctx.strokeRect(60, 610, (w - 150) * 0.58, h - 670);
      // Bottom right panel (Impact & speed)
      ctx.strokeRect(60 + (w - 150) * 0.58 + 30, 610, (w - 150) * 0.42, h - 670);

      // Panel 1: Hero close-up
      ctx.save();
      ctx.beginPath();
      ctx.rect(60, 60, w - 120, 520);
      ctx.clip();

      // Manga Speed lines in background
      ctx.lineWidth = 3;
      for (let i = 0; i < 28; i++) {
        const x = 70 + i * 40;
        ctx.beginPath();
        ctx.moveTo(x, 60);
        ctx.lineTo(w / 2 + (x - w / 2) * 0.3, 300);
        ctx.stroke();
      }

      // Hero Headband
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(420, 240);
      ctx.quadraticCurveTo(600, 220, 780, 240);
      ctx.lineTo(770, 280);
      ctx.quadraticCurveTo(600, 260, 430, 280);
      ctx.closePath();
      ctx.stroke();

      // Headband metal emblem (closed shape for tone fill)
      ctx.beginPath();
      ctx.arc(600, 250, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(600, 250, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Spiky Anime Hair (Enclosed locks for tone fill)
      const hairPoints = [
        [430, 240], [380, 180], [450, 190], [420, 120], [510, 150],
        [490, 80], [580, 130], [600, 70], [640, 130], [710, 80],
        [690, 150], [770, 130], [740, 200], [820, 190], [770, 250]
      ];
      ctx.beginPath();
      ctx.moveTo(hairPoints[0][0], hairPoints[0][1]);
      for (let i = 1; i < hairPoints.length; i++) {
        ctx.lineTo(hairPoints[i][0], hairPoints[i][1]);
      }
      ctx.closePath();
      ctx.stroke();

      // Face contour
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(460, 280);
      ctx.lineTo(470, 360);
      ctx.lineTo(590, 450); // Chin
      ctx.lineTo(730, 360);
      ctx.lineTo(740, 280);
      ctx.stroke();

      // Eyes (Fierce shonen gaze with closed iris zones)
      // Left eye
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(500, 320);
      ctx.quadraticCurveTo(535, 305, 565, 318);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(510, 335);
      ctx.lineTo(555, 335);
      ctx.stroke();
      // Left Iris (closed zone)
      ctx.beginPath();
      ctx.arc(535, 323, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Right eye
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(635, 318);
      ctx.quadraticCurveTo(665, 305, 700, 320);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(645, 335);
      ctx.lineTo(690, 335);
      ctx.stroke();
      // Right Iris (closed zone)
      ctx.beginPath();
      ctx.arc(665, 323, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Nose & Mouth & Scarf
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(595, 355);
      ctx.lineTo(600, 380);
      ctx.lineTo(590, 385);
      ctx.stroke();

      // Determined mouth
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(555, 415);
      ctx.lineTo(645, 412);
      ctx.stroke();

      // Scarf / Kimono Collar (large closed tone zones)
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(430, 430);
      ctx.quadraticCurveTo(590, 480, 770, 430);
      ctx.lineTo(820, 560);
      ctx.lineTo(380, 560);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();

      // Panel 2: Katana Thrust & Arm
      ctx.save();
      ctx.beginPath();
      ctx.rect(60, 610, (w - 150) * 0.58, h - 670);
      ctx.clip();

      // Sword Blade (diagonal gleaming katana with bevel)
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(120, 1480);
      ctx.lineTo(620, 720);
      ctx.lineTo(640, 740);
      ctx.lineTo(160, 1520);
      ctx.closePath();
      ctx.stroke();

      // Blade center ridge line
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(140, 1500);
      ctx.lineTo(630, 730);
      ctx.stroke();

      // Tsuba (Handguard)
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(140, 1500, 45, 25, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();

      // Blade Habaki collar
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.rect(170, 1420, 50, 40);
      ctx.stroke();

      // Arm / Gauntlet sleeve
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(100, 1520);
      ctx.quadraticCurveTo(240, 1450, 320, 1550);
      ctx.lineTo(260, 1600);
      ctx.lineTo(60, 1600);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();

      // Panel 3: Speed slash explosion
      ctx.save();
      ctx.beginPath();
      ctx.rect(60 + (w - 150) * 0.58 + 30, 610, (w - 150) * 0.42, h - 670);
      ctx.clip();

      const cx = 60 + (w - 150) * 0.58 + 30 + ((w - 150) * 0.42) / 2;
      const cy = 610 + (h - 670) / 2;

      // Radial shockwave burst lines
      ctx.lineWidth = 4;
      for (let a = 0; a < 32; a++) {
        const rad = (a / 32) * Math.PI * 2;
        const r1 = 50 + (a % 3) * 20;
        const r2 = 340;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
        ctx.lineTo(cx + Math.cos(rad) * r2, cy + Math.sin(rad) * r2);
        ctx.stroke();
      }

      // Sharp central burst star
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let p = 0; p < 8; p++) {
        const a1 = (p / 8) * Math.PI * 2;
        const a2 = ((p + 0.5) / 8) * Math.PI * 2;
        const ro = 110;
        const ri = 35;
        if (p === 0) ctx.moveTo(cx + Math.cos(a1) * ro, cy + Math.sin(a1) * ro);
        else ctx.lineTo(cx + Math.cos(a1) * ro, cy + Math.sin(a1) * ro);
        ctx.lineTo(cx + Math.cos(a2) * ri, cy + Math.sin(a2) * ri);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    },
  },
  {
    id: 'shojo-flower',
    name: '少女浪漫 · 微風眼眸與花瓣 (Shojo)',
    genre: 'shojo',
    description: '細膩日系少女漫畫手稿，擁有層次豐富的波浪長髮、大眼高光與蕾絲緞帶。',
    render: (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Elegant framed panel
      ctx.lineWidth = 6;
      ctx.strokeRect(80, 80, w - 160, h - 160);

      // Character Center
      const headX = w / 2;
      const headY = 460;

      // Soft Shojo Face Contour
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(headX - 180, headY - 120);
      ctx.quadraticCurveTo(headX - 170, headY + 80, headX - 80, headY + 180);
      ctx.quadraticCurveTo(headX, headY + 230, headX + 80, headY + 180);
      ctx.quadraticCurveTo(headX + 170, headY + 80, headX + 180, headY - 120);
      ctx.stroke();

      // Slender Neck & Ribbon Collar
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(headX - 60, headY + 210);
      ctx.lineTo(headX - 80, headY + 360);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(headX + 60, headY + 210);
      ctx.lineTo(headX + 80, headY + 360);
      ctx.stroke();

      // Ribbon Tie (large enclosed tone zone)
      ctx.beginPath();
      ctx.arc(headX, headY + 320, 22, 0, Math.PI * 2);
      ctx.stroke();
      // Left bow
      ctx.beginPath();
      ctx.moveTo(headX - 20, headY + 320);
      ctx.bezierCurveTo(headX - 160, headY + 260, headX - 160, headY + 390, headX - 20, headY + 340);
      ctx.closePath();
      ctx.stroke();
      // Right bow
      ctx.beginPath();
      ctx.moveTo(headX + 20, headY + 320);
      ctx.bezierCurveTo(headX + 160, headY + 260, headX + 160, headY + 390, headX + 20, headY + 340);
      ctx.closePath();
      ctx.stroke();

      // Shojo Eyes (sparkling multi-layered circles)
      const drawShojoEye = (ex: number, ey: number, flip: boolean) => {
        // Upper eyelash
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(ex - 55, ey - 10);
        ctx.quadraticCurveTo(ex, ey - 35, ex + 55, ey - 5);
        ctx.stroke();

        // Delicate lash flicks
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(flip ? ex - 45 : ex + 45, ey - 22);
        ctx.lineTo(flip ? ex - 65 : ex + 65, ey - 38);
        ctx.stroke();

        // Lower eyelid
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ex - 40, ey + 35);
        ctx.quadraticCurveTo(ex, ey + 45, ex + 40, ey + 38);
        ctx.stroke();

        // Big Iris
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(ex, ey + 8, 36, 46, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Pupil (inner circle)
        ctx.beginPath();
        ctx.ellipse(ex, ey + 18, 18, 24, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Highlight stars/ovals (to leave white against tones)
        ctx.beginPath();
        ctx.arc(ex - 12, ey - 6, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ex + 14, ey + 22, 6, 0, Math.PI * 2);
        ctx.stroke();
      };

      drawShojoEye(headX - 90, headY + 30, false);
      drawShojoEye(headX + 90, headY + 30, true);

      // Sweet Nose & Lips
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(headX, headY + 115, 3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(headX - 25, headY + 155);
      ctx.quadraticCurveTo(headX, headY + 162, headX + 25, headY + 155);
      ctx.stroke();

      // Flowing Wavy Manga Locks (many enclosed hair locks for tone fills)
      ctx.lineWidth = 4;
      const bangs = [
        [headX - 160, headY - 80, headX - 120, headY + 20],
        [headX - 120, headY - 120, headX - 50, headY + 10],
        [headX - 50, headY - 140, headX + 20, headY - 10],
        [headX + 20, headY - 140, headX + 80, headY + 15],
        [headX + 80, headY - 110, headX + 150, headY + 30],
      ];

      for (const b of bangs) {
        ctx.beginPath();
        ctx.moveTo(b[0], headY - 180);
        ctx.quadraticCurveTo(b[0] + 15, headY - 60, b[2], b[3]);
        ctx.quadraticCurveTo(b[0] + 35, headY - 40, b[0] + 50, headY - 180);
        ctx.closePath();
        ctx.stroke();
      }

      // Outer voluminous hair locks
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(headX - 200, headY - 160);
      ctx.bezierCurveTo(headX - 380, headY + 200, headX - 260, headY + 600, headX - 140, headY + 800);
      ctx.bezierCurveTo(headX - 220, headY + 580, headX - 180, headY + 300, headX - 120, headY + 220);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(headX + 200, headY - 160);
      ctx.bezierCurveTo(headX + 380, headY + 200, headX + 260, headY + 600, headX + 140, headY + 800);
      ctx.bezierCurveTo(headX + 220, headY + 580, headX + 180, headY + 300, headX + 120, headY + 220);
      ctx.stroke();

      // Rose & Petals in corner (shojo background motif)
      const drawPetal = (px: number, py: number, rot: number) => {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rot);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 32, 18, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      };

      drawPetal(200, 240, 0.4);
      drawPetal(260, 290, 0.8);
      drawPetal(160, 360, 1.2);
      drawPetal(w - 200, 220, -0.5);
      drawPetal(w - 250, 280, -0.9);
      drawPetal(w - 180, 340, -1.3);
    },
  },
  {
    id: 'mecha-armor',
    name: '科幻機甲 · 重裝甲構造 (Sci-Fi Mecha)',
    genre: 'mecha',
    description: '剛硬精密機甲裝甲線稿，具備護甲板件、雷達光學感測器與散熱閥門。',
    render: (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';

      // Outer panel frame with corner chamfers
      ctx.lineWidth = 6;
      ctx.strokeRect(70, 70, w - 140, h - 140);

      const cx = w / 2;
      const cy = h / 2 - 40;

      // Mecha V-Fin Antenna
      ctx.lineWidth = 6;
      ctx.beginPath();
      // Center jewel emblem
      ctx.moveTo(cx - 30, cy - 220);
      ctx.lineTo(cx, cy - 260);
      ctx.lineTo(cx + 30, cy - 220);
      ctx.lineTo(cx, cy - 180);
      ctx.closePath();
      ctx.stroke();

      // Left antenna fin
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 230);
      ctx.lineTo(cx - 340, cy - 420);
      ctx.lineTo(cx - 310, cy - 380);
      ctx.lineTo(cx - 20, cy - 200);
      ctx.closePath();
      ctx.stroke();

      // Right antenna fin
      ctx.beginPath();
      ctx.moveTo(cx + 20, cy - 230);
      ctx.lineTo(cx + 340, cy - 420);
      ctx.lineTo(cx + 310, cy - 380);
      ctx.lineTo(cx + 20, cy - 200);
      ctx.closePath();
      ctx.stroke();

      // Main Helmet Brow Plate
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 150, cy - 180);
      ctx.lineTo(cx - 90, cy - 140);
      ctx.lineTo(cx + 90, cy - 140);
      ctx.lineTo(cx + 150, cy - 180);
      ctx.lineTo(cx + 120, cy - 100);
      ctx.lineTo(cx - 120, cy - 100);
      ctx.closePath();
      ctx.stroke();

      // Optical Visor Sensor (angular slit for high-contrast tone)
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 110, cy - 90);
      ctx.lineTo(cx - 40, cy - 70);
      ctx.lineTo(cx + 40, cy - 70);
      ctx.lineTo(cx + 110, cy - 90);
      ctx.lineTo(cx + 90, cy - 40);
      ctx.lineTo(cx, cy - 25);
      ctx.lineTo(cx - 90, cy - 40);
      ctx.closePath();
      ctx.stroke();

      // Face Mask & Vents (twin intake slots)
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 70, cy - 30);
      ctx.lineTo(cx, cy - 10);
      ctx.lineTo(cx + 70, cy - 30);
      ctx.lineTo(cx + 60, cy + 90);
      ctx.lineTo(cx, cy + 130); // Chin
      ctx.lineTo(cx - 60, cy + 90);
      ctx.closePath();
      ctx.stroke();

      // Left mouth intake slot
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - 45, cy + 15 + i * 22);
        ctx.lineTo(cx - 15, cy + 25 + i * 22);
        ctx.lineTo(cx - 18, cy + 32 + i * 22);
        ctx.lineTo(cx - 48, cy + 22 + i * 22);
        ctx.closePath();
        ctx.stroke();
      }
      // Right mouth intake slot
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + 45, cy + 15 + i * 22);
        ctx.lineTo(cx + 15, cy + 25 + i * 22);
        ctx.lineTo(cx + 18, cy + 32 + i * 22);
        ctx.lineTo(cx + 48, cy + 22 + i * 22);
        ctx.closePath();
        ctx.stroke();
      }

      // Massive Shoulder Pauldrons (left & right armor blocks)
      const drawPauldron = (px: number, sign: number) => {
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(px, cy - 20);
        ctx.lineTo(px + sign * 180, cy - 80);
        ctx.lineTo(px + sign * 260, cy + 40);
        ctx.lineTo(px + sign * 240, cy + 220);
        ctx.lineTo(px + sign * 60, cy + 250);
        ctx.lineTo(px, cy + 120);
        ctx.closePath();
        ctx.stroke();

        // Bolt sockets
        ctx.beginPath();
        ctx.arc(px + sign * 100, cy + 30, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px + sign * 180, cy + 120, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Recessed exhaust panel
        ctx.strokeRect(px + sign * (sign > 0 ? 50 : 170), cy + 150, 60, 45);
      };

      drawPauldron(cx - 130, -1);
      drawPauldron(cx + 130, 1);

      // Chest Cockpit Hatch (Central Heavy Armor)
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 120, cy + 150);
      ctx.lineTo(cx + 120, cy + 150);
      ctx.lineTo(cx + 160, cy + 340);
      ctx.lineTo(cx, cy + 440);
      ctx.lineTo(cx - 160, cy + 340);
      ctx.closePath();
      ctx.stroke();

      // Hatch Lock Mechanism
      ctx.beginPath();
      ctx.arc(cx, cy + 260, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + 260, 12, 0, Math.PI * 2);
      ctx.stroke();
    },
  },
];
