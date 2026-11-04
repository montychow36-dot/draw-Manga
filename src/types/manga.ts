export type ToolType =
  | 'wand'
  | 'fill'
  | 'pen'
  | 'scraper'
  | 'toneBrush'
  | 'eraser'
  | 'text'
  | 'hand';

export type ScraperStyle = 'feather' | 'cross' | 'fade' | 'highlight';

export type DotType =
  | 'circle'
  | 'line'
  | 'cross'
  | 'sand'
  | 'star'
  | 'gradient'
  | 'diamond'
  | 'check'
  | 'speed'
  | 'sakura'
  | 'heart';

export type BlendMode = 'source-over' | 'multiply' | 'screen';

export interface ToneConfig {
  id: string;
  name: string;
  lineCount: number; // e.g. 60L, 50L, 80L
  density: number; // 0.05 to 0.95
  dotType: DotType;
  angle: number; // in degrees, e.g. 45
  category?: 'dots' | 'gradient' | 'sand' | 'pattern' | 'character' | 'clothing' | 'background' | 'custom';
}

export interface TransformState {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // in degrees
}

export interface TextSettings {
  text: string;
  fontSize: number; // 12 - 72
  direction: 'vertical' | 'horizontal';
  fontFamily: string;
  color: string;
  bold: boolean;
  hasOutline: boolean;
  outlineColor: string;
  outlineWidth: number;
  lineHeight: number;
}

export interface MangaTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  direction: 'vertical' | 'horizontal';
  fontFamily: string;
  color: string;
  bold: boolean;
  hasOutline: boolean;
  outlineColor: string;
  outlineWidth: number;
  lineHeight: number;
}

export interface Layer {
  id: string;
  name: string;
  type: 'base' | 'lineart' | 'tone' | 'ink' | 'text';
  visible: boolean;
  opacity: number; // 0 to 1
  blendMode: BlendMode;
  transform: TransformState;
  toneConfig?: ToneConfig;
  canvas: HTMLCanvasElement; // Working proxy resolution (1200x1600)
  maskCanvas?: HTMLCanvasElement; // Persistent clipping mask for localized fills
  bounds?: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface WandSettings {
  tolerance: number; // 0 - 255 (Line sensitivity threshold)
  expand: number; // 0 - 5 px dilation
  gapBridging: number; // 0 - 4 px gap bridging for hand-drawn line gaps
  sampleMode: 'all' | 'lineart' | 'current';
}

export interface ScraperSettings {
  style: ScraperStyle;
  width: number; // blade width in px
  angle: number; // blade angle in degrees
  pressure: number; // 0.1 to 1
  hardness: number; // 0.1 to 1
}

export interface PenSettings {
  size: number;
  opacity: number;
}

export interface EraserSettings {
  size: number;
  opacity: number;
}

export interface ToneBrushSettings {
  size: number;
  opacity: number;
}

export interface SelectionState {
  hasSelection: boolean;
  maskCanvas: HTMLCanvasElement | null;
  bounds: { minX: number; minY: number; maxX: number; maxY: number } | null;
  pathSegments?: { x: number; y: number }[];
  clickPoint?: { x: number; y: number };
  timestamp: number;
}

export interface HistorySnapshot {
  layers: {
    id: string;
    name: string;
    type: Layer['type'];
    visible: boolean;
    opacity: number;
    blendMode: BlendMode;
    transform: TransformState;
    toneConfig?: ToneConfig;
    imageData: ImageData;
    maskImageData?: ImageData;
    bounds?: { minX: number; minY: number; maxX: number; maxY: number };
  }[];
  activeLayerId: string;
}
