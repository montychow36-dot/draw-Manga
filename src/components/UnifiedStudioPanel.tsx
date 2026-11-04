import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Layers,
  Grid,
  X,
  Eye,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Maximize2,
  Minimize2,
  Sliders,
  PaintBucket,
  Plus,
  Download,
  RotateCw,
  Sun,
  Eye as PeekIcon,
  ChevronDown,
  Move,
  Lock,
  Unlock,
  SplitSquareVertical,
  Brush,
  PanelRight,
} from 'lucide-react';
import { Layer, BlendMode, ToneConfig } from '../types/manga';
import {
  STANDARD_TONES,
  generateTonePreviewUrl,
  createTonePatternCanvas,
} from '../utils/mangaScreentone';

export type StudioPanelMode = 'docked-right' | 'floating' | 'fullscreen';
export type StudioTopTab = 'tones' | 'layers';
type LayerSubTab = 'all' | 'transform' | 'layers';

interface UnifiedStudioPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isCanvasInteracting: boolean;
  // Tone features
  selectedTone: ToneConfig;
  onSelectTone: (tone: ToneConfig) => void;
  hasSelection: boolean;
  onFillSelection: () => void;
  onCreateToneLayer: (tone: ToneConfig) => void;
  onOpenDesignToneModal: () => void;
  savedTones?: ToneConfig[];
  // Layer features
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onMoveLayerUp: (id: string) => void;
  onMoveLayerDown: (id: string) => void;
  onExtractLineart: () => void;
  showOverlayHighlight: boolean;
  onToggleOverlayHighlight: (val: boolean) => void;
  onUpdateTransform: (
    id: string,
    transform: { scaleX?: number; scaleY?: number; rotation?: number; x?: number; y?: number }
  ) => void;
  onUpdateToneConfig: (id: string, updates: Partial<ToneConfig>) => void;
  onUpdateLayerOpacity: (id: string, opacity: number) => void;
  onUpdateLayerBlendMode: (id: string, mode: BlendMode) => void;
  onReplaceBaseImage: (file: File) => void;
  onBinarizeManuscript?: () => void;
  onCreateBlankLayer?: (type: 'tone' | 'ink') => void;
}

export const UnifiedStudioPanel: React.FC<UnifiedStudioPanelProps> = ({
  isOpen,
  onClose,
  isCanvasInteracting,
  selectedTone,
  onSelectTone,
  hasSelection,
  onFillSelection,
  onCreateToneLayer,
  onOpenDesignToneModal,
  savedTones = STANDARD_TONES,
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onDeleteLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onExtractLineart,
  showOverlayHighlight,
  onToggleOverlayHighlight,
  onUpdateTransform,
  onUpdateToneConfig,
  onUpdateLayerOpacity,
  onUpdateLayerBlendMode,
  onReplaceBaseImage,
  onBinarizeManuscript,
  onCreateBlankLayer,
}) => {
  // Top Tabs: 'tones' (網點倉庫) vs 'layers' (圖層與變形)
  const [topTab, setTopTab] = useState<StudioTopTab>('tones');
  const [layerSubTab, setLayerSubTab] = useState<LayerSubTab>('all');
  const [isProportional, setIsProportional] = useState<boolean>(true);

  // Window Display Modes: docked-right (default medium size docked to right), floating, fullscreen
  const [panelMode, setPanelMode] = useState<StudioPanelMode>('docked-right');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'dots' | 'gradient' | 'sand' | 'pattern'>('all');

  // Floating Window Geometry (responsive defaults positioned on the right)
  const [panelPos, setPanelPos] = useState(() => ({
    x: typeof window !== 'undefined' ? Math.max(10, window.innerWidth - 380) : 20,
    y: 64,
  }));
  const [panelSize, setPanelSize] = useState(() => ({
    width: typeof window !== 'undefined' && window.innerWidth > 768 ? 370 : 330,
    height: typeof window !== 'undefined' && window.innerHeight > 700 ? 580 : 460,
  }));

  // Ghost Mode: State for interacting with sliders or holding peek
  const [isAdjustingControl, setIsAdjustingControl] = useState<boolean>(false);
  const [isManualPeek, setIsManualPeek] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => {
      setActionToast((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  const isResizingRef = useRef(false);
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, startW: 0, startH: 0 });

  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];

  // Precompute tone preview thumbnails
  const previewUrls = useMemo(() => {
    const urls: Record<string, string> = {};
    for (const t of STANDARD_TONES) {
      urls[t.id] = generateTonePreviewUrl(t, 80);
    }
    for (const t of savedTones) {
      if (!urls[t.id]) {
        urls[t.id] = generateTonePreviewUrl(t, 80);
      }
    }
    return urls;
  }, [savedTones]);

  // Dragging event handlers for floating mode
  const handleDragPointerDown = (e: React.PointerEvent) => {
    if (panelMode === 'fullscreen') return;
    isDraggingRef.current = true;
    let startX = panelPos.x;
    let startY = panelPos.y;
    if (panelMode === 'docked-right') {
      startX = Math.max(10, window.innerWidth - (window.innerWidth > 768 ? 380 : 340) - 10);
      startY = 56;
      setPanelPos({ x: startX, y: startY });
      setPanelMode('floating');
    }
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: startX,
      posY: startY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDragPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    const maxX = Math.max(10, window.innerWidth - panelSize.width - 10);
    const maxY = Math.max(55, window.innerHeight - 80);
    setPanelPos({
      x: Math.max(10, Math.min(maxX, dragStartRef.current.posX + dx)),
      y: Math.max(55, Math.min(maxY, dragStartRef.current.posY + dy)),
    });
  };

  const handleDragPointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Resizing event handlers
  const handleResizePointerDown = (e: React.PointerEvent) => {
    if (panelMode !== 'floating') return;
    isResizingRef.current = true;
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: panelSize.width,
      startH: panelSize.height,
    };
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (!isResizingRef.current) return;
    const dw = e.clientX - resizeStartRef.current.mouseX;
    const dh = e.clientY - resizeStartRef.current.mouseY;
    setPanelSize({
      width: Math.max(280, Math.min(window.innerWidth - 20, resizeStartRef.current.startW + dw)),
      height: Math.max(300, Math.min(window.innerHeight - 80, resizeStartRef.current.startH + dh)),
    });
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    isResizingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Slider interaction handlers for Ghost Transparency
  const handleSliderStart = () => {
    setIsAdjustingControl(true);
  };
  const handleSliderEnd = () => {
    setIsAdjustingControl(false);
  };

  // Global pointer up cleanup to ensure ghost mode always releases
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      setIsAdjustingControl(false);
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('touchend', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
    };
  }, []);

  if (!isOpen) return null;

  // Determine whether ghost mode is active
  const isGhostActive = isAdjustingControl || isCanvasInteracting || isManualPeek;

  // Compute container positioning and style based on panelMode
  let positionStyle: React.CSSProperties = {};
  let containerClasses = '';

  if (panelMode === 'fullscreen') {
    containerClasses = 'fixed top-14 left-0 right-0 bottom-0 z-40 rounded-none border-t border-[#2b3140]';
  } else if (panelMode === 'docked-right') {
    // Medium size docked strictly on the right side
    containerClasses = 'fixed top-14 bottom-2 right-2 w-[340px] md:w-[380px] z-40 rounded-xl border border-[#2b3140] shadow-2xl';
  } else {
    // Floating
    positionStyle = {
      left: `${panelPos.x}px`,
      top: `${panelPos.y}px`,
      width: `${panelSize.width}px`,
      height: `${panelSize.height}px`,
    };
    containerClasses = 'fixed z-40 rounded-xl border border-[#2b3140] shadow-2xl';
  }

  // Export transparent screentone PNG
  const handleExportTransparentTone = (tone: ToneConfig) => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1200;
    exportCanvas.height = 1600;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    const patternCanvas = createTonePatternCanvas(tone, 1);
    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    if (pattern) {
      ctx.save();
      ctx.translate(600, 800);
      ctx.rotate((tone.angle * Math.PI) / 180);
      ctx.translate(-600, -800);
      ctx.fillStyle = pattern;
      ctx.fillRect(-1200, -1600, 3600, 4800);
      ctx.restore();
    }

    const link = document.createElement('a');
    link.download = `screentone_${tone.name.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_')}_transparent.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  const handleScalePreset = (factor: number) => {
    if (!activeLayer) return;
    onUpdateTransform(activeLayer.id, {
      scaleX: factor,
      scaleY: factor,
    });
  };

  const handleRotationPreset = (deg: number) => {
    if (!activeLayer) return;
    onUpdateTransform(activeLayer.id, {
      rotation: deg,
    });
  };

  const handleLineCountPreset = (lines: number) => {
    if (!activeLayer || !activeLayer.toneConfig) return;
    onUpdateToneConfig(activeLayer.id, {
      lineCount: lines,
    });
  };

  return (
    <div
      style={positionStyle}
      className={`${containerClasses} bg-[#141720]/95 backdrop-blur-md flex flex-col select-none overflow-hidden transition-opacity duration-150 ${
        isGhostActive
          ? 'opacity-5 pointer-events-none'
          : 'opacity-100'
      }`}
    >
      {/* 1. HIGHEST BAR: Primary Tab Switcher (🔲 網點倉庫 vs 📋 圖層與變形) & Window Controls */}
      <div
        onPointerDown={handleDragPointerDown}
        onPointerMove={handleDragPointerMove}
        onPointerUp={handleDragPointerUp}
        className={`h-11 bg-[#1a1e28] border-b border-[#2b3140] flex items-center justify-between px-2.5 shrink-0 ${
          panelMode === 'floating' ? 'cursor-move' : ''
        }`}
      >
        {/* Top-Level Primary Tabs */}
        <div className="flex items-center gap-1 bg-[#12141c] p-0.5 rounded-lg border border-[#2b3140]">
          <button
            onClick={() => setTopTab('tones')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
              topTab === 'tones'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2430]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>網點倉庫</span>
          </button>

          <button
            onClick={() => setTopTab('layers')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
              topTab === 'layers'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2430]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>圖層與變形</span>
            <span className="text-[10px] bg-black/40 text-blue-300 px-1 rounded-full font-mono">
              {layers.length}
            </span>
          </button>
        </div>

        {/* Window Mode Controls (Ghost Peek, Full, Half, Float, Close) */}
        <div className="flex items-center gap-1">
          {/* Quick Peek Button: Click or hold to see background */}
          <button
            onPointerDown={() => setIsManualPeek(true)}
            onPointerUp={() => setIsManualPeek(false)}
            onPointerLeave={() => setIsManualPeek(false)}
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-[#252b38] rounded transition-colors"
            title="按住即可透視背後手稿 (Ghost Peek)"
          >
            <PeekIcon className="w-3.5 h-3.5" />
          </button>

          {/* Dock Right (中等大小靠右側固定) */}
          <button
            onClick={() => setPanelMode((prev) => (prev === 'docked-right' ? 'floating' : 'docked-right'))}
            className={`p-1.5 rounded transition-colors ${
              panelMode === 'docked-right'
                ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#252b38]'
            }`}
            title="中等大小靠右側固定 (Dock Right)"
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>

          {/* Full Screen Toggle */}
          <button
            onClick={() => setPanelMode((prev) => (prev === 'fullscreen' ? 'floating' : 'fullscreen'))}
            className={`p-1.5 rounded transition-colors ${
              panelMode === 'fullscreen'
                ? 'bg-blue-600/30 text-blue-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#252b38]'
            }`}
            title="全螢幕模式"
          >
            {panelMode === 'fullscreen' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close Panel */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#252b38] rounded transition-colors"
            title="收合面板"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionToast && (
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-xs px-3 py-1.5 flex items-center justify-between shrink-0 shadow animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="font-medium truncate">{actionToast}</span>
          <button
            onClick={() => setActionToast(null)}
            className="text-blue-200 hover:text-white ml-2 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. BODY CONTENT: Switches based on topTab */}
      {topTab === 'tones' ? (
        /* ================= TAB 1: 網點倉庫 (TONES) ================= */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Active Tone Action Bar */}
          <div className="p-3 bg-[#181c25] border-b border-[#262c3b] flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-400 text-[10px] block">當前選用網點</span>
                <span className="font-semibold text-slate-100">{selectedTone.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-cyan-300 bg-[#12141c] border border-cyan-800/40 px-1.5 py-0.5 rounded">
                  {selectedTone.lineCount}L / {Math.round(selectedTone.density * 100)}%
                </span>
                <button
                  onClick={onOpenDesignToneModal}
                  className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-100 bg-cyan-950/70 hover:bg-cyan-900/80 px-2 py-0.5 rounded border border-cyan-700/50 shadow-sm transition-all"
                  title="調配自訂網點參數並保存至倉庫"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>設計自訂網點</span>
                </button>
              </div>
            </div>

            {/* 3 Clear Action Buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => {
                  onFillSelection();
                  setTopTab('layers');
                  setLayerSubTab('layers');
                  showToast('✅ 已填入選區並建立網點圖層！已切換至圖層清單。');
                }}
                disabled={!hasSelection}
                className={`flex items-center justify-center gap-1 px-1.5 py-2 text-[11px] rounded-md font-bold transition-all ${
                  hasSelection
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30'
                    : 'bg-[#202532] text-slate-500 cursor-not-allowed'
                }`}
                title={hasSelection ? '填入當前魔術棒圈選區域' : '請先使用魔術棒點選封閉輪廓'}
              >
                <PaintBucket className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">填入所選區</span>
              </button>

              <button
                onClick={() => {
                  onCreateToneLayer(selectedTone);
                  setTopTab('layers');
                  setLayerSubTab('layers');
                  showToast(`✅ 已新增滿版網點圖層 (${selectedTone.name})！已切換至圖層清單。`);
                }}
                className="flex items-center justify-center gap-1 px-1.5 py-2 text-[11px] rounded-md font-semibold bg-[#222938] hover:bg-[#2d364a] text-slate-200 border border-[#2f374a] transition-colors"
                title="以此網點建立整張滿版獨立圖層"
              >
                <Plus className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                <span className="truncate">滿版網點層</span>
              </button>

              <button
                onClick={() => {
                  onCreateBlankLayer?.('tone');
                  setTopTab('layers');
                  setLayerSubTab('layers');
                  showToast('🖌️ 已新增空白網點層，並切換至網點筆刷！可在畫面自由塗抹。');
                }}
                className="flex items-center justify-center gap-1 px-1.5 py-2 text-[11px] rounded-md font-semibold bg-[#1a2333] hover:bg-[#223046] text-blue-200 border border-blue-800/50 transition-colors"
                title="新增空白網點層，配合網點筆刷或橡皮擦自由局部繪製"
              >
                <Brush className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                <span className="truncate">手繪空白層</span>
              </button>
            </div>
          </div>

          {/* Standard Presets & Saved Tones List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs shrink-0 no-scrollbar">
              {[
                { id: 'all', label: `全部 (${STANDARD_TONES.length})` },
                { id: 'dots', label: '⚪ 點網' },
                { id: 'gradient', label: '🌈 漸層霞網' },
                { id: 'sand', label: '🏜️ 砂目質感' },
                { id: 'pattern', label: '✨ 效果紋樣' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-[#1e2330] text-slate-400 hover:text-slate-200 hover:bg-[#252c3d]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
              <span>
                專業漫畫網點 (
                {
                  STANDARD_TONES.filter(
                    (t) => selectedCategory === 'all' || t.category === selectedCategory
                  ).length
                }{' '}
                款)
              </span>
              <span className="text-[10px] text-slate-500">點擊選用 / 下載透明 PNG</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STANDARD_TONES.filter(
                (t) => selectedCategory === 'all' || t.category === selectedCategory
              ).map((tone) => {
                const isSelected = selectedTone.id === tone.id;
                const previewUrl = previewUrls[tone.id];

                return (
                  <div
                    key={tone.id}
                    onClick={() => onSelectTone(tone)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow-sm'
                        : 'bg-[#181c25] border-[#262c3b] hover:border-[#384157] hover:bg-[#1d222e]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded bg-white border border-slate-300 shadow-inner shrink-0 relative flex items-center justify-center overflow-hidden">
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt={tone.name}
                          className="w-full h-full object-cover"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-slate-200 truncate">{tone.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{tone.lineCount}L</span>
                        <span>•</span>
                        <span>{Math.round(tone.density * 100)}%</span>
                        <span>•</span>
                        <span>{tone.angle}°</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportTransparentTone(tone);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-[#283042] rounded transition-colors shrink-0"
                      title="下載透明背景網點 PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Custom Saved Tones in Tone Warehouse */}
            <div className="pt-3 border-t border-[#232835]">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1 mb-2">
                <span>我的自訂網點庫</span>
                <button
                  onClick={onOpenDesignToneModal}
                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-normal hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>調配新網點</span>
                </button>
              </div>

              {savedTones.filter((t) => !STANDARD_TONES.some((st) => st.id === t.id)).length === 0 ? (
                <div
                  onClick={onOpenDesignToneModal}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-[#2b3242] hover:border-cyan-600/50 bg-[#161a23]/60 hover:bg-[#1a202c] cursor-pointer text-center transition-all group"
                  title="點擊調配並儲存自訂線數、密度與點形的網點"
                >
                  <Sparkles className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 mb-1 transition-colors" />
                  <span className="text-xs text-slate-300 group-hover:text-white font-medium">
                    + 設計並入庫自訂新網點
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    自訂線數 (L)、黑度 (10%~90%)、角度與點形 (圓點/沙目/線條)
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedTones
                    .filter((t) => !STANDARD_TONES.some((st) => st.id === t.id))
                    .map((tone) => {
                      const isSelected = selectedTone.id === tone.id;
                      const previewUrl = previewUrls[tone.id];
                      return (
                        <div
                          key={tone.id}
                          onClick={() => onSelectTone(tone)}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-600/15 border-blue-500 shadow-sm'
                              : 'bg-[#181c25] border-[#262c3b] hover:border-[#384157] hover:bg-[#1d222e]'
                          }`}
                        >
                          <div className="w-12 h-12 rounded bg-white border border-slate-300 shadow-inner shrink-0 relative flex items-center justify-center overflow-hidden">
                            {previewUrl && (
                              <img
                                src={previewUrl}
                                alt={tone.name}
                                className="w-full h-full object-cover"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs text-slate-200 truncate">{tone.name}</div>
                            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{tone.lineCount}L</span>
                              <span>•</span>
                              <span>{Math.round(tone.density * 100)}%</span>
                              <span>•</span>
                              <span>{tone.angle}°</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= TAB 2: 圖層與變形 (LAYERS & TRANSFORM) ================= */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Quick Sub-Tools: 抽取墨線, 去灰淨化, 淺藍透視 */}
          <div className="p-2 bg-[#14171f] border-b border-[#252b38] flex items-center justify-between gap-1.5 shrink-0">
            <button
              onClick={onExtractLineart}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded text-xs font-semibold shadow transition-all truncate"
              title="一鍵分離手稿白底，只保留透明純黑線稿層"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200 shrink-0" />
              <span className="truncate">抽取墨線 (去白底)</span>
            </button>

            {onBinarizeManuscript && (
              <button
                onClick={onBinarizeManuscript}
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#202738] hover:bg-[#283248] text-amber-300 border border-amber-800/40 rounded text-xs font-medium transition-all"
                title="消除手機拍照陰影，將灰底紙張淨化為純白並強化墨線"
              >
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>去灰淨化</span>
              </button>
            )}

            <label className="flex items-center gap-1 cursor-pointer text-xs text-slate-300 hover:text-white px-2 py-1 bg-[#1d222e] rounded border border-[#2a3142] shrink-0">
              <input
                type="checkbox"
                checked={showOverlayHighlight}
                onChange={(e) => onToggleOverlayHighlight(e.target.checked)}
                className="accent-blue-500 rounded"
              />
              <span className="text-[11px]">淺藍透視</span>
            </label>
          </div>

          {/* 3 View Tabs: 全部檢視, 方格變形, 圖層列表 */}
          <div className="flex items-center bg-[#181c25] border-b border-[#262c3b] p-1 gap-1 shrink-0 text-xs font-medium">
            {[
              { id: 'all', label: '全部檢視' },
              { id: 'transform', label: '🔲 方格變形' },
              { id: 'layers', label: '📋 圖層列表' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLayerSubTab(tab.id as LayerSubTab)}
                className={`flex-1 py-1 rounded text-center transition-all ${
                  layerSubTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#202533]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable Main Layer Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
            {/* SUB-SECTION A: TRANSFORM & GEOMETRY */}
            {(layerSubTab === 'all' || layerSubTab === 'transform') && activeLayer && (
              <div className="bg-[#181c25] border border-[#262c3b] rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#242938]">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {activeLayer.type === 'tone' ? '網點花紋角度與密度調配 (原框鎖定)' : '作用中圖層幾何變形 (8 點手柄)'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                    {activeLayer.name}
                  </span>
                </div>

                {/* Mask Locked Reassurance Notice for Screentone */}
                {activeLayer.type === 'tone' && (
                  <div className="flex items-start gap-2 p-2.5 bg-blue-950/40 border border-blue-500/40 rounded-lg text-xs text-blue-200">
                    <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-semibold text-blue-300">原方格遮罩鎖定 (Mask Locked)</div>
                      <div className="text-[11px] text-blue-200/80 leading-relaxed">
                        貼網形狀牢牢固定在原手稿方格內。旋轉與縮放僅改變<strong>格子內部的網點花紋與大小</strong>，絕不破壞原形狀或溢出框外。
                      </div>
                    </div>
                  </div>
                )}

                {/* Proportional Toggle */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">等比例縮放</span>
                  <button
                    onClick={() => setIsProportional(!isProportional)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors ${
                      isProportional
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                        : 'bg-[#222836] text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isProportional ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    <span>{isProportional ? '等比鎖定' : '自由拉伸'}</span>
                  </button>
                </div>

                {/* Scale X & Scale Y Sliders */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{activeLayer.type === 'tone' ? '網點花紋大小 (Scale X)' : '水平拉伸 (Scale X)'}</span>
                      <span className="font-mono text-slate-200">
                        {Math.round(activeLayer.transform.scaleX * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.05"
                      value={activeLayer.transform.scaleX}
                      onPointerDown={handleSliderStart}
                      onPointerUp={handleSliderEnd}
                      onTouchStart={handleSliderStart}
                      onTouchEnd={handleSliderEnd}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onUpdateTransform(activeLayer.id, {
                          scaleX: val,
                          ...(isProportional ? { scaleY: val } : {}),
                        });
                      }}
                      className="w-full h-1.5 bg-[#252b3a] rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {!isProportional && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>垂直拉伸 (Scale Y)</span>
                        <span className="font-mono text-slate-200">
                          {Math.round(activeLayer.transform.scaleY * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.05"
                        value={activeLayer.transform.scaleY}
                        onPointerDown={handleSliderStart}
                        onPointerUp={handleSliderEnd}
                        onTouchStart={handleSliderStart}
                        onTouchEnd={handleSliderEnd}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          onUpdateTransform(activeLayer.id, { scaleY: val });
                        }}
                        className="w-full h-1.5 bg-[#252b3a] rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  )}

                  {/* Common Scale Presets */}
                  <div className="flex items-center gap-1 pt-1">
                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((factor) => (
                      <button
                        key={factor}
                        onClick={() => handleScalePreset(factor)}
                        className={`flex-1 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                          Math.abs(activeLayer.transform.scaleX - factor) < 0.02
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                            : 'bg-[#202534] text-slate-400 border-[#2b3345] hover:text-white'
                        }`}
                      >
                        {Math.round(factor * 100)}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rotation Slider */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3 h-3 text-cyan-400" />
                      <span>{activeLayer.type === 'tone' ? '網點花紋旋轉 (角度)' : '圖層旋轉角度'}</span>
                    </span>
                    <span className="font-mono text-slate-200">
                      {Math.round(activeLayer.transform.rotation)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={activeLayer.transform.rotation}
                    onPointerDown={handleSliderStart}
                    onPointerUp={handleSliderEnd}
                    onTouchStart={handleSliderStart}
                    onTouchEnd={handleSliderEnd}
                    onChange={(e) => {
                      onUpdateTransform(activeLayer.id, {
                        rotation: parseInt(e.target.value, 10),
                      });
                    }}
                    className="w-full h-1.5 bg-[#252b3a] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex items-center gap-1 pt-0.5">
                    {[0, 45, 90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => handleRotationPreset(deg)}
                        className={`flex-1 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                          activeLayer.transform.rotation === deg
                            ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/50'
                            : 'bg-[#202534] text-slate-400 border-[#2b3345] hover:text-white'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                    <button
                      onClick={() => handleRotationPreset(0)}
                      className="px-1.5 py-0.5 text-[10px] bg-[#222836] hover:bg-[#2b3345] text-slate-300 rounded border border-slate-700"
                      title="重設角度為 0°"
                    >
                      還原
                    </button>
                  </div>
                </div>

                {/* Screentone Parameter Tuning if active layer is Tone */}
                {activeLayer.toneConfig && (
                  <div className="space-y-2 pt-2 border-t border-[#252b3a]">
                    <div className="text-xs font-semibold text-cyan-300 flex items-center justify-between">
                      <span>網點實時參數調配 (L 數 / 濃度)</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {activeLayer.toneConfig.lineCount}L / {Math.round(activeLayer.toneConfig.density * 100)}%
                      </span>
                    </div>

                    {/* Line count (L frequency) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>線數頻率 (Line Count)</span>
                        <span className="font-mono text-slate-200">
                          {activeLayer.toneConfig.lineCount} 線 (L)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="80"
                        step="2"
                        value={activeLayer.toneConfig.lineCount}
                        onPointerDown={handleSliderStart}
                        onPointerUp={handleSliderEnd}
                        onTouchStart={handleSliderStart}
                        onTouchEnd={handleSliderEnd}
                        onChange={(e) => {
                          onUpdateToneConfig(activeLayer.id, {
                            lineCount: parseInt(e.target.value, 10),
                          });
                        }}
                        className="w-full h-1.5 bg-[#252b3a] rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="flex items-center gap-1 pt-0.5">
                        {[40, 50, 60, 70, 80].map((l) => (
                          <button
                            key={l}
                            onClick={() => handleLineCountPreset(l)}
                            className={`flex-1 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                              activeLayer.toneConfig?.lineCount === l
                                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                                : 'bg-[#202534] text-slate-400 border-[#2b3345]'
                            }`}
                          >
                            {l}L
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Density */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>黑色濃度 (Density / Darkness)</span>
                        <span className="font-mono text-slate-200">
                          {Math.round(activeLayer.toneConfig.density * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.9"
                        step="0.05"
                        value={activeLayer.toneConfig.density}
                        onPointerDown={handleSliderStart}
                        onPointerUp={handleSliderEnd}
                        onTouchStart={handleSliderStart}
                        onTouchEnd={handleSliderEnd}
                        onChange={(e) => {
                          onUpdateToneConfig(activeLayer.id, {
                            density: parseFloat(e.target.value),
                          });
                        }}
                        className="w-full h-1.5 bg-[#252b3a] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-SECTION B: LAYER STACK LIST */}
            {(layerSubTab === 'all' || layerSubTab === 'layers') && (
              <div className="bg-[#181c25] border border-[#262c3b] rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#242938]">
                  <span className="text-xs font-bold text-slate-200">圖層清單堆疊 (Layers)</span>
                  <span className="text-[10px] text-slate-400">共 {layers.length} 層</span>
                </div>

                {/* New Layer Actions */}
                {onCreateBlankLayer && (
                  <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#141720] rounded-lg border border-[#232938]">
                    <button
                      onClick={() => onCreateBlankLayer('tone')}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-white rounded text-xs font-medium shadow-sm transition-all"
                      title="建立新的空白網點圖層，可直接使用網點畫筆 (B) 塗抹網點"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ 空白網點層</span>
                    </button>

                    <button
                      onClick={() => onCreateBlankLayer('ink')}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#202738] hover:bg-[#283248] text-slate-200 hover:text-white border border-[#2f384d] rounded text-xs font-medium transition-all"
                      title="建立新的透明墨線圖層，可使用漫畫墨線筆 (P) 進行手繪線稿"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-400" />
                      <span>+ 墨水線稿層</span>
                    </button>
                  </div>
                )}

                {/* Layer Opacity & Blend Mode of Active Layer */}
                {activeLayer && (
                  <div className="grid grid-cols-2 gap-2 p-2 bg-[#141720] rounded border border-[#242938]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>不透明度</span>
                        <span className="font-mono text-slate-200">
                          {Math.round(activeLayer.opacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={activeLayer.opacity}
                        onPointerDown={handleSliderStart}
                        onPointerUp={handleSliderEnd}
                        onTouchStart={handleSliderStart}
                        onTouchEnd={handleSliderEnd}
                        onChange={(e) => onUpdateLayerOpacity(activeLayer.id, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#252b3a] rounded appearance-none accent-blue-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block">混合模式</span>
                      <select
                        value={activeLayer.blendMode}
                        onChange={(e) => onUpdateLayerBlendMode(activeLayer.id, e.target.value as BlendMode)}
                        className="w-full bg-[#1b1f2b] text-slate-200 text-xs rounded border border-[#2b3345] px-1.5 py-1 focus:outline-none"
                      >
                        <option value="normal">Normal (正常)</option>
                        <option value="multiply">Multiply (色彩增值)</option>
                        <option value="screen">Screen (濾色)</option>
                        <option value="overlay">Overlay (覆蓋)</option>
                        <option value="darken">Darken (變暗)</option>
                        <option value="lighten">Lighten (變亮)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Reorderable Stack (Top to Bottom) */}
                <div className="space-y-1.5">
                  {[...layers].reverse().map((layer, revIdx) => {
                    const originalIdx = layers.length - 1 - revIdx;
                    const isSelected = layer.id === activeLayerId;
                    const isBase = layer.type === 'base';

                    return (
                      <div
                        key={layer.id}
                        onClick={() => onSelectLayer(layer.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 shadow-sm'
                            : 'bg-[#1b1f2a] border-[#272e3d] hover:bg-[#202534]'
                        }`}
                      >
                        {/* Visibility Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility(layer.id);
                          }}
                          className={`p-1 rounded ${
                            layer.visible ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-400'
                          }`}
                          title={layer.visible ? '隱藏圖層' : '顯示圖層'}
                        >
                          {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        {/* Layer Mini Thumbnail */}
                        <div className="w-8 h-10 bg-white rounded border border-slate-400 overflow-hidden shrink-0 flex items-center justify-center relative">
                          <span className="text-[8px] font-bold text-slate-800">
                            {layer.type === 'base' ? '手稿' : layer.type === 'lineart' ? '墨線' : '網點'}
                          </span>
                        </div>

                        {/* Name & Type info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
                            <span>{layer.name}</span>
                            {layer.toneConfig && (
                              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1 rounded">
                                {layer.toneConfig.lineCount}L
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span>{layer.blendMode}</span>
                            <span>•</span>
                            <span>{Math.round(layer.opacity * 100)}%</span>
                          </div>
                        </div>

                        {/* Actions (Move Up, Move Down, Delete) */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveLayerUp(layer.id);
                            }}
                            disabled={originalIdx === layers.length - 1}
                            className={`p-1 rounded ${
                              originalIdx === layers.length - 1
                                ? 'text-slate-700 cursor-not-allowed'
                                : 'text-slate-400 hover:text-white hover:bg-[#282f40]'
                            }`}
                            title="上移圖層"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveLayerDown(layer.id);
                            }}
                            disabled={originalIdx === 0}
                            className={`p-1 rounded ${
                              originalIdx === 0
                                ? 'text-slate-700 cursor-not-allowed'
                                : 'text-slate-400 hover:text-white hover:bg-[#282f40]'
                            }`}
                            title="下移圖層"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {!isBase && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteLayer(layer.id);
                              }}
                              className="p-1 text-slate-400 hover:text-red-400 hover:bg-[#282f40] rounded"
                              title="刪除此圖層"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Mode Bottom-Right Resize Grip */}
      {panelMode === 'floating' && (
        <div
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center text-slate-500 hover:text-white z-50 select-none"
          title="拖曳以縮放面板長寬"
        >
          <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400" />
        </div>
      )}
    </div>
  );
};
