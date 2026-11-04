# Manga Screentone Studio (漫畫網點與手稿後製應用程式)

A professional digital manga screentone and manuscript post-production web workstation benchmarked against Clip Studio Paint and ComicStudio, featuring dual-resolution proxy rendering for fluid 60 FPS editing, interactive 2-click magic wand tone filling, on-canvas 8-point free transform handles, authentic metal scraper blade hatching, floating layer management with lineart extraction, and print-grade 2400×3200 export.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Preloaded Lineart Manuscripts Confirmed**: The studio will ship with 3 authentic high-contrast manga lineart manuscripts (Shonen Action, Shojo Romance, and Sci-Fi/Mecha) ready for immediate tool testing, plus instantaneous local image upload to replace or import any custom manuscript.

- **Confirmed Decision 1 (Preloaded Manuscripts)**: Bundled multi-genre classic manga lineart presets (Shonen, Shojo, Mecha) enabled out-of-the-box, allowing users to start testing screentone tools, magic wand, and scraper blades with zero setup.
- **Confirmed Decision 2 (Resolution Strategy)**: 1200×1600 Working Proxy Canvas (75% memory reduction for lag-free 60 FPS mobile and desktop manipulation) paired with seamless 2400×3200 (or uploaded native resolution) high-definition export pipeline.
- **Decision 3 (Tone Library & Scraper Physics)**: 8 standard industrial manga tone presets (60L 10%, 60L 20%, 50L 30%, 80L 15%, 45° hatching, crosshatch, sand stipple, shojo sparkle) plus 4 scraper blades (Feathering, Crosshatch, Fade/Gradation, and White ink Highlight) and custom tone generator.

---

## 1. Overview & Core Concept

- **What It Does**: Manga Screentone Studio brings authentic comic book post-production directly to modern web browsers. Comic artists and illustrators can isolate lineart from white backgrounds, sample enclosed ink regions with an ultra-fast scanline Magic Wand, stamp and manipulate halftone screentones with live 8-point transform handles, scrape screentone textures with authentic blade physics, and export print-ready manuscripts or transparent tone layers.
- **Target Audience / Persona**: Manga artists, webtoon creators, comic colorists, print production assistants, and digital illustrators seeking the tactile precision of Japanese screentone sheets without heavyweight desktop software.
- **Key Value**: Replaces complex multi-step digital art processes with a dedicated, single-purpose manga studio workflow that operates at 60 FPS across both desktop (mouse, wheel zoom, hotkeys) and mobile/tablet (single-tap, pinch-to-zoom, two-finger pan).

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Manuscript Ingestion & Lineart Extraction**:
   - The user opens the app to an active Shonen manga sample manuscript (or switches to Shojo/Mecha, or clicks **更換手稿** to upload their own inked page).
   - In the Layer Panel, clicking **抽取墨線 (去白底)** runs a high-speed luminance extraction algorithm, converting white backing pixels into transparent alpha while preserving crisp black ink lines.

2. **Two-Click Magic Wand Tone Infill**:
   - The user selects the **Magic Wand (W)**. Clicking once on an enclosed region highlights the boundary with dynamic animated marching ants and a light translucent blue tint.
   - A floating luminous action button ✨ **立即填入網點 (新增圖層)** appears at the bottom viewport.
   - Clicking either inside the target region a 2nd time or pressing the floating button instantly fills the region with the currently selected screentone and appends a dedicated, transformable screentone layer.

3. **On-Canvas 8-Point Free Transformation**:
   - Selecting any tone layer reveals 8 white rectangular handles and 1 top circular rotation handle directly around the tone's bounding box.
   - Dragging corner handles performs proportional or free scaling; dragging side handles adjusts Scale X / Scale Y independently; dragging the top handle rotates the screentone frequency angle (0°–360°).
   - Real-time frequency lines (Lpi, e.g. 60L, 50L) and density sliders in the Layer Panel provide instant tactile feedback.

4. **Authentic Scraper Blade Finishing**:
   - Selecting the **Tone Scraper (K)** allows the artist to feather edges or carve highlights into tone layers.
   - Artists select between Feathering (羽化排線), Crosshatching (交叉排線), Gradual Fade (漸變消退), or White Highlight (高光刮網), adjusting blade width, angle, and cutting pressure.

5. **Print-Grade Masterpiece Export**:
   - Clicking **匯出 (Export)** opens a high-resolution dialog supporting full page compilation or isolated transparent screentone PNGs at 100% (2400×3200) and 50% scaling.

### Visual Identity & Theme

- **Aesthetic Direction**: Studio Darkroom utilitarian workstation. Deep slate/charcoal frames (`#121316`, `#1A1D23`) inspired by professional Japanese manga authoring suites, placing 100% visual contrast on the clean paper-white manuscript.
- **Color Palette**:
  - Dominant Neutral: Studio Obsidian `#0E1015` (canvas backdrop) and `#181B20` (toolbars and panels).
  - Structural Borders: Hairline charcoal `#2B303C` with subtle paper drop shadows (`shadow-2xl`).
  - Active Accent: Vivid Cobalt `#3B82F6` and Electric Cyan `#06B6D4` strictly reserved for tool activations, selection bounding boxes, handle outlines, and floating commit buttons.
  - Paper & Tone Swatches: Pure paper white `#FFFFFF` swatches so screen frequencies and stipples are impeccably sharp.
- **Typography**: `Plus Jakarta Sans` for clean, professional studio UI controls, paired with `JetBrains Mono` / `tabular-nums` for precise coordinate readouts, DPI, scale percentages, and line screen counts (`60L 20%`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Resolution Canvas Architecture (1200×1600 Proxy + 2400×3200 Export)**:
  - *Chosen Approach*: The live editing canvas and all intermediate wand calculations run on a 1200×1600 buffer. When exporting, vector-like tone patterns and transform matrices are rasterized onto a high-definition 2400×3200 or original manuscript buffer.
  - *Why*: Direct 2400×3200 bitmap flood-fills and continuous scraper stroke calculations stutter on mobile Safari and midrange laptops. The proxy architecture guarantees 60 FPS while preserving print-perfect export resolution.
  - *Alternatives Considered*: Single 2400×3200 buffer (rejected due to frame drops and memory crashes on mobile devices).

- **Decision 2: 2-Click Wand Paradigm with Marching Ants & Floating Commit Affordance**:
  - *Chosen Approach*: First click scans the ink bounds and shows an animated outline with translucent blue preview; second click on canvas or the floating bottom button commits the fill and creates a new layer.
  - *Why*: Eliminates accidental fills in complex hair strands or open ink gaps, providing immediate visual verification before committing layer state.

- **Decision 3: Floating Movable & Resizable Layer Panel**:
  - *Chosen Approach*: The Layer Panel can be toggled from the top bar, dragged across the canvas, and resized via bottom-right grip, with internal scrolling tabs ("全部檢視", "🔲 方格變形", "📋 圖層列表").
  - *Why*: Allows artists working on wide screens to position layer controls right next to their active drawing area without obscuring the canvas.

- **Decision 4: Seamless Algorithmic Halftone Patterns with Transform Invariants**:
  - *Chosen Approach*: Generate screentones using HTML5 Canvas patterns calculated with screen frequency ($L$), angle ($\theta$), and dot diameter ($r = f(\text{density})$), rendered through Canvas 2D matrix transformations.
  - *Why*: Screentones remain razor sharp at any zoom level, avoiding pixelation artifacts inherent to static tiled bitmaps.

---

## 4. Technical Architecture & Data Strategy

### System Component Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Bar                              │
│ [Manuscript Dimension Tag] [圖層 Panel Toggle] ── [Zoom & Fit] ── [Export / Tone Modals]│
└────────────────────────────────────────────────────────────────────────┘
          │                                                    │
┌─────────┴─────────┐                                ┌─────────┴─────────┐
│ Left Tool Palette │                                │ Right Tone Drawer │
│  - Magic Wand (W) │                                │  - 24+ Deleter Tones
│  - Tone Fill (G)  │                                │  - Category Chips │
│  - Manga Pen (P)  │                                │  - Docked Right   │
│  - Scraper (K)    │                                │  - Fill Selection │
│  - Tone Brush (B) │                                │  - New Tone Layer │
│  - Eraser (E)     │                                │  - PNG Export     │
│  - Comic Text (T) │                                └───────────────────┘
│  - Hand Pan (H)   │                                          ▲
└─────────┬─────────┘                                          │
          │                                                    │
          ▼                                                    │
┌──────────────────────────────────────────────────────────────┴─────────┐
│                     Central Viewport Canvas                            │
│  - Interactive Pan/Zoom Stage (Wheel / Touch Pinch-to-zoom)            │
│  - Manuscript Base Canvas (Original / Lineart Extracted)               │
│  - Stacked Tone & Ink Layer Canvases with Blend Modes                  │
│  - On-Canvas 8-Point Bounding Box Handles + Rotation Pivot             │
│  - Marching Ants Selection Overlay                                     │
│  - Floating Commit Action: [ ✨ 立即填入網點 (新增圖層) ]               │
└────────────────────────────────────────────────────────────────────────┘
          ▲                                                    ▲
          │                                                    │
┌─────────┴────────────────────────────────────────────────────┴─────────┐
│             Draggable & Resizable Floating Layer Panel                 │
│  - Top Utilities: 抽取墨線 (去白底) · 淺藍透視 Toggle                 │
│  - Tabs: [全部檢視] · [🔲 方格變形] · [📋 圖層列表]                     │
│  - Transform Controls: Proportional Toggle, Scale X/Y, Presets         │
│  - Tone Controls: 20L-70L Quick Line Buttons, Density Slider, Opacity │
│  - Layer Stack: Reorder, Visibility, Blend Modes, Replace Base Sheet   │
└────────────────────────────────────────────────────────────────────────┘
```

### State Store Structure (`src/App.tsx` & State Models)

- **`DocumentState`**: `workingWidth: 1200`, `workingHeight: 1600`, `exportWidth: 2400`, `exportHeight: 3200`, `zoom: 1`, `panX: 0`, `panY: 0`.
- **`Layer`**:
  - `id: string`, `name: string`, `type: 'base' | 'lineart' | 'tone' | 'ink'`, `visible: boolean`, `opacity: number`, `blendMode: 'source-over' | 'multiply' | 'screen'`.
  - `transform`: `{ x: number, y: number, scaleX: number, scaleY: number, rotation: number }`.
  - `toneConfig`: `{ lineCount: number, density: number, dotType: 'circle' | 'line' | 'cross' | 'sand' | 'star', angle: number }`.
  - `canvas: HTMLCanvasElement` (proxy resolution), `maskCanvas?: HTMLCanvasElement`.
- **`SelectionState`**: Active polygon/mask path, bounding box `{ minX, minY, maxX, maxY }`, march offset for animated ants, isPendingConfirm: boolean.
- **`HistoryState`**: Stack of layer snapshots for multi-step Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`).

---

## 5. Implementation Roadmap & Verification Plan

1. **Preset Manga Linearts & Extractor**:
   - Provide 3 authentic pre-rendered vector/bitmap lineart manuscripts (Shonen dynamic action, Shojo portrait, Mecha robot) and custom image upload parser.
   - Implement luminance lineart extraction algorithm in `src/utils/lineartExtractor.ts`.
2. **Algorithmic Screentone Engine & Scraper Physics**:
   - Create `src/utils/mangaScreentone.ts` for dynamic screen generation (20L to 80L, circles, lines, sand stipple, sparkles).
   - Create `src/utils/toneScraper.ts` supporting 4 distinct metal blade carving styles.
   - Implement optimized scanline flood fill with bounding box expansion in `src/utils/magicWand.ts`.
3. **Interactive Viewport Canvas with 8-Point Transform Handles**:
   - Canvas coordinate mapping, mouse/touch gestures (pinch-to-zoom, two-finger pan, spacebar hand).
   - 8-point on-canvas resize handles + top circular rotation handle with visual cursor feedback.
   - 2-click magic wand detection and glowing commit button.
4. **Draggable & Resizable Floating Layer Manager**:
   - Draggable header and corner resize grip.
   - Integrated tabbed view ("全部檢視", "🔲 方格變形", "📋 圖層列表") with real-time controls.
5. **Tone Catalog, Custom Tone Generator & High-Res Export**:
   - Right-side quick tone shelf and modal dialogues (`SavedTonesModal`, `DesignToneModal`, `ExportModal`).
   - Dual-resolution rasterization pipeline supporting full manuscript or isolated transparent tone PNGs.
