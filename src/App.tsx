import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Layer,
  ToolType,
  ToneConfig,
  SelectionState,
  WandSettings,
  ScraperSettings,
  PenSettings,
  EraserSettings,
  ToneBrushSettings,
  TextSettings,
  MangaTextItem,
  BlendMode,
  HistorySnapshot,
} from './types/manga';
import { STANDARD_TONES, renderToneToCanvas } from './utils/mangaScreentone';
import { renderMangaTextToCanvas } from './utils/mangaText';
import { SAMPLE_MANUSCRIPTS, SampleManuscript } from './utils/sampleManuscripts';
import { extractLineartFromCanvas } from './utils/lineartExtractor';
import { binarizePhotoManuscript } from './utils/photoEnhancer';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { UnifiedStudioPanel } from './components/UnifiedStudioPanel';
import { ViewportCanvas } from './components/ViewportCanvas';
import { SavedTonesModal } from './components/modals/SavedTonesModal';
import { DesignToneModal } from './components/modals/DesignToneModal';
import { ExportModal } from './components/modals/ExportModal';
import { ManuscriptSelectorModal } from './components/modals/ManuscriptSelectorModal';

export default function App() {
  // Dual-resolution Canvas Setup: 1200x1600 proxy, 2400x3200 export standard
  const [workingWidth] = useState<number>(1200);
  const [workingHeight] = useState<number>(1600);
  const [exportWidth, setExportWidth] = useState<number>(2400);
  const [exportHeight, setExportHeight] = useState<number>(3200);

  // Viewport Zoom
  const [zoom, setZoom] = useState<number>(0.75);

  // Active Tool & Settings
  const [activeTool, setActiveTool] = useState<ToolType>('wand');
  const [selectedTone, setSelectedTone] = useState<ToneConfig>(STANDARD_TONES[1]); // 60L 20%
  const [savedTones, setSavedTones] = useState<ToneConfig[]>(STANDARD_TONES);

  const [wandSettings, setWandSettings] = useState<WandSettings>({
    tolerance: 55,
    expand: 2,
    gapBridging: 2,
    sampleMode: 'all',
  });

  const [scraperSettings, setScraperSettings] = useState<ScraperSettings>({
    style: 'feather',
    width: 24,
    angle: 45,
    pressure: 0.85,
    hardness: 0.8,
  });

  const [penSettings, setPenSettings] = useState<PenSettings>({
    size: 4,
    opacity: 1,
  });

  const [eraserSettings, setEraserSettings] = useState<EraserSettings>({
    size: 24,
    opacity: 1,
  });

  const [toneBrushSettings, setToneBrushSettings] = useState<ToneBrushSettings>({
    size: 24,
    opacity: 1,
  });

  const [textSettings, setTextSettings] = useState<TextSettings>({
    text: '請在此輸入對話…',
    fontSize: 24,
    direction: 'vertical',
    fontFamily: 'sans-serif',
    color: '#000000',
    bold: false,
    hasOutline: true,
    outlineColor: '#ffffff',
    outlineWidth: 3,
    lineHeight: 1.25,
  });

  // Layer State
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>('');
  const [showOverlayHighlight, setShowOverlayHighlight] = useState<boolean>(true);
  const layerCounterRef = useRef<number>(1);

  // Selection State (for Magic Wand 2-click & Tone Fill)
  const [selection, setSelection] = useState<SelectionState>({
    hasSelection: false,
    maskCanvas: null,
    bounds: null,
    timestamp: 0,
  });

  // History Stacks (Undo / Redo)
  const undoStackRef = useRef<HistorySnapshot[]>([]);
  const redoStackRef = useRef<HistorySnapshot[]>([]);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Modals & Panels Visibility
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState<boolean>(true);
  const [isCanvasInteracting, setIsCanvasInteracting] = useState<boolean>(false);
  const [isSavedTonesOpen, setIsSavedTonesOpen] = useState<boolean>(false);
  const [isDesignToneOpen, setIsDesignToneOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isManuscriptSelectorOpen, setIsManuscriptSelectorOpen] = useState<boolean>(false);
  const [activeManuscriptId, setActiveManuscriptId] = useState<string>('user-photo-sketch');

  // Save Snapshot for Undo
  const saveHistorySnapshot = useCallback(() => {
    if (layers.length === 0) return;
    const snap: HistorySnapshot = {
      activeLayerId,
      layers: layers.map((l) => {
        const ctx = l.canvas.getContext('2d');
        const imgData = ctx
          ? ctx.getImageData(0, 0, l.canvas.width, l.canvas.height)
          : new ImageData(l.canvas.width, l.canvas.height);

        let maskImgData: ImageData | undefined = undefined;
        if (l.maskCanvas) {
          const mCtx = l.maskCanvas.getContext('2d');
          if (mCtx) {
            maskImgData = mCtx.getImageData(0, 0, l.maskCanvas.width, l.maskCanvas.height);
          }
        }

        return {
          id: l.id,
          name: l.name,
          type: l.type,
          visible: l.visible,
          opacity: l.opacity,
          blendMode: l.blendMode,
          transform: { ...l.transform },
          toneConfig: l.toneConfig ? { ...l.toneConfig } : undefined,
          imageData: imgData,
          maskImageData: maskImgData,
          bounds: l.bounds ? { ...l.bounds } : undefined,
        };
      }),
    };

    undoStackRef.current.push(snap);
    if (undoStackRef.current.length > 25) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, [layers, activeLayerId]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const currentSnap: HistorySnapshot = {
      activeLayerId,
      layers: layers.map((l) => {
        const ctx = l.canvas.getContext('2d');
        const imgData = ctx
          ? ctx.getImageData(0, 0, l.canvas.width, l.canvas.height)
          : new ImageData(l.canvas.width, l.canvas.height);

        let maskImgData: ImageData | undefined = undefined;
        if (l.maskCanvas) {
          const mCtx = l.maskCanvas.getContext('2d');
          if (mCtx) {
            maskImgData = mCtx.getImageData(0, 0, l.maskCanvas.width, l.maskCanvas.height);
          }
        }

        return {
          id: l.id,
          name: l.name,
          type: l.type,
          visible: l.visible,
          opacity: l.opacity,
          blendMode: l.blendMode,
          transform: { ...l.transform },
          toneConfig: l.toneConfig ? { ...l.toneConfig } : undefined,
          imageData: imgData,
          maskImageData: maskImgData,
          bounds: l.bounds ? { ...l.bounds } : undefined,
        };
      }),
    };
    redoStackRef.current.push(currentSnap);

    const prevSnap = undoStackRef.current.pop()!;
    const restoredLayers: Layer[] = prevSnap.layers.map((l) => {
      const c = document.createElement('canvas');
      c.width = workingWidth;
      c.height = workingHeight;
      const ctx = c.getContext('2d');
      if (ctx) ctx.putImageData(l.imageData, 0, 0);

      let maskCanvas: HTMLCanvasElement | undefined = undefined;
      if (l.maskImageData) {
        maskCanvas = document.createElement('canvas');
        maskCanvas.width = workingWidth;
        maskCanvas.height = workingHeight;
        const mCtx = maskCanvas.getContext('2d');
        if (mCtx) mCtx.putImageData(l.maskImageData, 0, 0);
      }

      return {
        id: l.id,
        name: l.name,
        type: l.type,
        visible: l.visible,
        opacity: l.opacity,
        blendMode: l.blendMode,
        transform: l.transform,
        toneConfig: l.toneConfig,
        canvas: c,
        maskCanvas,
        bounds: l.bounds,
      };
    });

    setLayers(restoredLayers);
    setActiveLayerId(prevSnap.activeLayerId);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
  }, [layers, activeLayerId, workingWidth, workingHeight]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const currentSnap: HistorySnapshot = {
      activeLayerId,
      layers: layers.map((l) => {
        const ctx = l.canvas.getContext('2d');
        const imgData = ctx
          ? ctx.getImageData(0, 0, l.canvas.width, l.canvas.height)
          : new ImageData(l.canvas.width, l.canvas.height);

        let maskImgData: ImageData | undefined = undefined;
        if (l.maskCanvas) {
          const mCtx = l.maskCanvas.getContext('2d');
          if (mCtx) {
            maskImgData = mCtx.getImageData(0, 0, l.maskCanvas.width, l.maskCanvas.height);
          }
        }

        return {
          id: l.id,
          name: l.name,
          type: l.type,
          visible: l.visible,
          opacity: l.opacity,
          blendMode: l.blendMode,
          transform: { ...l.transform },
          toneConfig: l.toneConfig ? { ...l.toneConfig } : undefined,
          imageData: imgData,
          maskImageData: maskImgData,
          bounds: l.bounds ? { ...l.bounds } : undefined,
        };
      }),
    };
    undoStackRef.current.push(currentSnap);

    const nextSnap = redoStackRef.current.pop()!;
    const restoredLayers: Layer[] = nextSnap.layers.map((l) => {
      const c = document.createElement('canvas');
      c.width = workingWidth;
      c.height = workingHeight;
      const ctx = c.getContext('2d');
      if (ctx) ctx.putImageData(l.imageData, 0, 0);

      let maskCanvas: HTMLCanvasElement | undefined = undefined;
      if (l.maskImageData) {
        maskCanvas = document.createElement('canvas');
        maskCanvas.width = workingWidth;
        maskCanvas.height = workingHeight;
        const mCtx = maskCanvas.getContext('2d');
        if (mCtx) mCtx.putImageData(l.maskImageData, 0, 0);
      }

      return {
        id: l.id,
        name: l.name,
        type: l.type,
        visible: l.visible,
        opacity: l.opacity,
        blendMode: l.blendMode,
        transform: l.transform,
        toneConfig: l.toneConfig,
        canvas: c,
        maskCanvas,
        bounds: l.bounds,
      };
    });

    setLayers(restoredLayers);
    setActiveLayerId(nextSnap.activeLayerId);
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
  }, [layers, activeLayerId, workingWidth, workingHeight]);

  // Initialize Manuscript
  const loadManuscript = useCallback(
    (manuscript: SampleManuscript) => {
      const baseCanvas = document.createElement('canvas');
      baseCanvas.width = workingWidth;
      baseCanvas.height = workingHeight;
      manuscript.render(baseCanvas, () => {
        setLayers((prev) =>
          prev.map((l) => (l.id === 'layer-base' ? { ...l, canvas: baseCanvas } : l))
        );
      });

      const baseLayer: Layer = {
        id: 'layer-base',
        name: '主要手稿底圖',
        type: 'base',
        visible: true,
        opacity: 1,
        blendMode: 'source-over',
        transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
        canvas: baseCanvas,
      };

      setLayers([baseLayer]);
      setActiveLayerId('layer-base');
      setActiveManuscriptId(manuscript.id);
      setSelection({ hasSelection: false, maskCanvas: null, bounds: null, timestamp: 0 });
      undoStackRef.current = [];
      redoStackRef.current = [];
      setCanUndo(false);
      setCanRedo(false);
    },
    [workingWidth, workingHeight]
  );

  useEffect(() => {
    loadManuscript(SAMPLE_MANUSCRIPTS[0]);
  }, [loadManuscript]);

  // Replace Base Image from user upload
  const handleReplaceBaseImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Update export dimensions to match user's native image
        setExportWidth(img.naturalWidth);
        setExportHeight(img.naturalHeight);

        const newBaseCanvas = document.createElement('canvas');
        newBaseCanvas.width = workingWidth;
        newBaseCanvas.height = workingHeight;
        const ctx = newBaseCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, workingWidth, workingHeight);
          // Scale keeping aspect ratio without distorting camera photos
          const scale = Math.min(workingWidth / img.naturalWidth, workingHeight / img.naturalHeight);
          const drawW = img.naturalWidth * scale;
          const drawH = img.naturalHeight * scale;
          const offX = (workingWidth - drawW) / 2;
          const offY = (workingHeight - drawH) / 2;
          ctx.drawImage(img, offX, offY, drawW, drawH);
        }

        const newBaseLayer: Layer = {
          id: 'layer-base',
          name: '主要手稿底圖',
          type: 'base',
          visible: true,
          opacity: 1,
          blendMode: 'source-over',
          transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
          canvas: newBaseCanvas,
        };

        setLayers([newBaseLayer]);
        setActiveLayerId('layer-base');
        setActiveManuscriptId('custom-uploaded');
        setSelection({ hasSelection: false, maskCanvas: null, bounds: null, timestamp: 0 });
        undoStackRef.current = [];
        redoStackRef.current = [];
        setCanUndo(false);
        setCanRedo(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Photo Manuscript Binarization (拍照草稿黑白淨化與去灰影)
  const handleBinarizeBaseManuscript = () => {
    const baseLayer = layers.find((l) => l.type === 'base') || layers[0];
    if (!baseLayer) return;
    saveHistorySnapshot();
    const cleaned = binarizePhotoManuscript(baseLayer.canvas);
    setLayers((prev) =>
      prev.map((l) => (l.id === baseLayer.id ? { ...l, canvas: cleaned } : l))
    );
  };

  // Extract Lineart (去白底)
  const handleExtractLineart = () => {
    const baseLayer = layers.find((l) => l.type === 'base') || layers[0];
    if (!baseLayer) return;

    saveHistorySnapshot();

    const extractedCanvas = extractLineartFromCanvas(baseLayer.canvas);

    const lineartLayer: Layer = {
      id: `layer-lineart-${Date.now()}`,
      name: '純墨線稿 (去白底)',
      type: 'lineart',
      visible: true,
      opacity: 1,
      blendMode: 'multiply',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      canvas: extractedCanvas,
    };

    // Place lineart layer above base
    setLayers((prev) => [...prev, lineartLayer]);
    setActiveLayerId(lineartLayer.id);
  };

  // Commit Tone Fill (2nd Click of Magic Wand or ✨ 立即填入網點 button)
  const handleCommitToneFill = useCallback(() => {
    if (!selection.hasSelection || !selection.maskCanvas) return;

    saveHistorySnapshot();

    const newLayerId = `layer-tone-${Date.now()}`;
    const newLayerName = `網點圖層 ${layerCounterRef.current++} (${selectedTone.name})`;

    const toneCanvas = document.createElement('canvas');
    toneCanvas.width = workingWidth;
    toneCanvas.height = workingHeight;

    const initialTransform = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 };

    // Render screentone pattern clipped to the mask canvas with localized bounds center
    renderToneToCanvas(toneCanvas, selectedTone, initialTransform, selection.maskCanvas, 1, selection.bounds);

    const newToneLayer: Layer = {
      id: newLayerId,
      name: newLayerName,
      type: 'tone',
      visible: true,
      opacity: 1,
      blendMode: 'multiply',
      transform: initialTransform,
      toneConfig: { ...selectedTone },
      canvas: toneCanvas,
      maskCanvas: selection.maskCanvas, // Solution 3: Store maskCanvas permanently on the layer!
      bounds: selection.bounds ? { ...selection.bounds } : undefined,
    };

    // If there's an extracted lineart layer, insert tone below lineart; otherwise top
    setLayers((prev) => {
      const lineartIndex = prev.findIndex((l) => l.type === 'lineart');
      if (lineartIndex !== -1) {
        const next = [...prev];
        next.splice(lineartIndex, 0, newToneLayer);
        return next;
      }
      return [...prev, newToneLayer];
    });

    setActiveLayerId(newLayerId);
    // Clear selection
    setSelection({ hasSelection: false, maskCanvas: null, bounds: null, timestamp: 0 });
  }, [selection, selectedTone, workingWidth, workingHeight, saveHistorySnapshot]);

  // Create Standalone Tone Layer
  const handleCreateToneLayer = (tone: ToneConfig) => {
    saveHistorySnapshot();
    const newLayerId = `layer-tone-${Date.now()}`;
    const newLayerName = `網點層 ${layerCounterRef.current++} (${tone.name})`;

    const toneCanvas = document.createElement('canvas');
    toneCanvas.width = workingWidth;
    toneCanvas.height = workingHeight;
    const initialTransform = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 };

    renderToneToCanvas(toneCanvas, tone, initialTransform, undefined, 1);

    const newToneLayer: Layer = {
      id: newLayerId,
      name: newLayerName,
      type: 'tone',
      visible: true,
      opacity: 1,
      blendMode: 'multiply',
      transform: initialTransform,
      toneConfig: { ...tone },
      canvas: toneCanvas,
    };

    setLayers((prev) => [...prev, newToneLayer]);
    setActiveLayerId(newLayerId);
  };

  // Create Blank Layer (Tone or Ink)
  const handleCreateBlankLayer = (type: 'tone' | 'ink') => {
    saveHistorySnapshot();
    const newLayerId = `layer-${type}-${Date.now()}`;
    const newLayerName =
      type === 'tone'
        ? `空白網點層 ${layerCounterRef.current++} (${selectedTone.name})`
        : `手繪墨線層 ${layerCounterRef.current++}`;

    const newCanvas = document.createElement('canvas');
    newCanvas.width = workingWidth;
    newCanvas.height = workingHeight;

    const newMaskCanvas = document.createElement('canvas');
    newMaskCanvas.width = workingWidth;
    newMaskCanvas.height = workingHeight;

    const newLayer: Layer = {
      id: newLayerId,
      name: newLayerName,
      type: type === 'tone' ? 'tone' : 'ink',
      visible: true,
      opacity: 1,
      blendMode: 'multiply',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      canvas: newCanvas,
      maskCanvas: newMaskCanvas,
      toneConfig: type === 'tone' ? { ...selectedTone } : undefined,
    };

    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newLayerId);
    if (type === 'tone') {
      setActiveTool('toneBrush');
    } else {
      setActiveTool('pen');
    }
  };

  // Add Comic Dialogue Text Layer (蓋印對話框文字至圖層)
  const handleAddTextLayer = (item: MangaTextItem) => {
    saveHistorySnapshot();
    const newLayerId = `layer-text-${Date.now()}`;
    const newCanvas = document.createElement('canvas');
    newCanvas.width = workingWidth;
    newCanvas.height = workingHeight;
    const ctx = newCanvas.getContext('2d');
    if (ctx) {
      renderMangaTextToCanvas(ctx, item);
    }
    const cleanSnippet = item.text.replace(/[\n\r\t]/g, ' ').slice(0, 8);
    const newLayer: Layer = {
      id: newLayerId,
      name: `對話文字 (${cleanSnippet}...)`,
      type: 'text',
      visible: true,
      opacity: 1,
      blendMode: 'source-over',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      canvas: newCanvas,
    };
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newLayerId);
  };

  // Invert Selection (Ctrl+Shift+I)
  const handleInvertSelection = () => {
    if (!selection.hasSelection || !selection.maskCanvas) return;
    const m = selection.maskCanvas;
    const ctx = m.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, m.width, m.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i + 3] = d[i + 3] > 50 ? 0 : 255;
    }
    ctx.putImageData(imgData, 0, 0);
    setSelection({
      ...selection,
      bounds: { minX: 0, minY: 0, maxX: workingWidth, maxY: workingHeight },
      timestamp: Date.now(),
    });
  };

  // Deselect (Ctrl+D)
  const handleDeselect = () => {
    setSelection({ hasSelection: false, maskCanvas: null, bounds: null, timestamp: 0 });
  };

  // Layer Panel Updates
  const handleUpdateLayerTransform = (
    layerId: string,
    transform: { scaleX?: number; scaleY?: number; rotation?: number; x?: number; y?: number }
  ) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== layerId) return l;
        const newTransform = { ...l.transform, ...transform };
        // If it's a tone layer, re-rasterize the internal pattern inside the locked mask!
        if (l.toneConfig) {
          renderToneToCanvas(l.canvas, l.toneConfig, newTransform, l.maskCanvas, 1, l.bounds);
        }
        return { ...l, transform: newTransform };
      })
    );
  };

  const handleUpdateToneConfig = (layerId: string, updates: Partial<ToneConfig>) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== layerId || !l.toneConfig) return l;
        const updatedConfig = { ...l.toneConfig, ...updates };
        // Re-rasterize tone canvas with new frequency/density inside the locked mask!
        renderToneToCanvas(l.canvas, updatedConfig, l.transform, l.maskCanvas, 1, l.bounds);
        return { ...l, toneConfig: updatedConfig };
      })
    );
  };

  const handleUpdateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, opacity } : l)));
  };

  const handleUpdateLayerBlendMode = (layerId: string, blendMode: BlendMode) => {
    setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, blendMode } : l)));
  };

  const handleToggleVisibility = (layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleDeleteLayer = (layerId: string) => {
    if (layers.length <= 1) return;
    saveHistorySnapshot();
    const filtered = layers.filter((l) => l.id !== layerId);
    setLayers(filtered);
    if (activeLayerId === layerId) {
      setActiveLayerId(filtered[filtered.length - 1].id);
    }
  };

  const handleMoveLayerUp = (layerId: string) => {
    const idx = layers.findIndex((l) => l.id === layerId);
    if (idx <= 0) return;
    saveHistorySnapshot();
    const next = [...layers];
    const temp = next[idx - 1];
    next[idx - 1] = next[idx];
    next[idx] = temp;
    setLayers(next);
  };

  const handleMoveLayerDown = (layerId: string) => {
    const idx = layers.findIndex((l) => l.id === layerId);
    if (idx === -1 || idx >= layers.length - 1) return;
    saveHistorySnapshot();
    const next = [...layers];
    const temp = next[idx + 1];
    next[idx + 1] = next[idx];
    next[idx] = temp;
    setLayers(next);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.code === 'KeyZ') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (isCtrlOrCmd && e.code === 'KeyY') {
        e.preventDefault();
        handleRedo();
      } else if (isCtrlOrCmd && e.shiftKey && e.code === 'KeyI') {
        e.preventDefault();
        handleInvertSelection();
      } else if (isCtrlOrCmd && e.code === 'KeyD') {
        e.preventDefault();
        handleDeselect();
      } else if (e.code === 'KeyW') {
        setActiveTool('wand');
      } else if (e.code === 'KeyG') {
        setActiveTool('fill');
      } else if (e.code === 'KeyP') {
        setActiveTool('pen');
      } else if (e.code === 'KeyK') {
        setActiveTool('scraper');
      } else if (e.code === 'KeyB') {
        setActiveTool('toneBrush');
      } else if (e.code === 'KeyE') {
        setActiveTool('eraser');
      } else if (e.code === 'KeyH') {
        setActiveTool('hand');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0c0e12] select-none text-slate-100">
      {/* 1. Header (Top Navigation Bar) */}
      <Header
        exportWidth={exportWidth}
        exportHeight={exportHeight}
        zoom={zoom}
        onZoomChange={setZoom}
        onZoomFit={() => setZoom(0.65)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        hasSelection={selection.hasSelection}
        onInvertSelection={handleInvertSelection}
        onDeselect={handleDeselect}
        isLayerPanelOpen={isLayerPanelOpen}
        onToggleLayerPanel={() => setIsLayerPanelOpen(!isLayerPanelOpen)}
        layerCount={layers.length}
        onOpenSavedTones={() => setIsSavedTonesOpen(true)}
        onOpenDesignTone={() => setIsDesignToneOpen(true)}
        onOpenManuscriptSelector={() => setIsManuscriptSelectorOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* 2. Main Workspace Body (Toolbar + Canvas + TonePanel) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Professional Toolbar */}
        <Toolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          wandSettings={wandSettings}
          onUpdateWandSettings={setWandSettings}
          scraperSettings={scraperSettings}
          onUpdateScraperSettings={setScraperSettings}
          penSettings={penSettings}
          onUpdatePenSettings={setPenSettings}
          eraserSettings={eraserSettings}
          onUpdateEraserSettings={setEraserSettings}
          toneBrushSettings={toneBrushSettings}
          onUpdateToneBrushSettings={setToneBrushSettings}
          textSettings={textSettings}
          onUpdateTextSettings={setTextSettings}
        />

        {/* Central Viewport Canvas */}
        <ViewportCanvas
          workingWidth={workingWidth}
          workingHeight={workingHeight}
          layers={layers}
          activeLayerId={activeLayerId}
          activeTool={activeTool}
          selectedTone={selectedTone}
          selection={selection}
          onUpdateSelection={setSelection}
          onCommitToneFill={handleCommitToneFill}
          wandSettings={wandSettings}
          scraperSettings={scraperSettings}
          penSettings={penSettings}
          eraserSettings={eraserSettings}
          toneBrushSettings={toneBrushSettings}
          textSettings={textSettings}
          onUpdateTextSettings={setTextSettings}
          onAddTextLayer={handleAddTextLayer}
          zoom={zoom}
          onZoomChange={setZoom}
          showOverlayHighlight={showOverlayHighlight}
          onUpdateLayerTransform={handleUpdateLayerTransform}
          onSaveHistorySnapshot={saveHistorySnapshot}
          onInteractingChange={setIsCanvasInteracting}
        />

        {/* Unified Studio Panel (Tone Library & Layer / Transform) */}
        <UnifiedStudioPanel
          isOpen={isLayerPanelOpen}
          onClose={() => setIsLayerPanelOpen(false)}
          isCanvasInteracting={isCanvasInteracting}
          selectedTone={selectedTone}
          onSelectTone={setSelectedTone}
          hasSelection={selection.hasSelection}
          onFillSelection={handleCommitToneFill}
          onCreateToneLayer={handleCreateToneLayer}
          onCreateBlankLayer={handleCreateBlankLayer}
          onOpenDesignToneModal={() => setIsDesignToneOpen(true)}
          savedTones={savedTones}
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={setActiveLayerId}
          onToggleVisibility={handleToggleVisibility}
          onDeleteLayer={handleDeleteLayer}
          onMoveLayerUp={handleMoveLayerUp}
          onMoveLayerDown={handleMoveLayerDown}
          onExtractLineart={handleExtractLineart}
          showOverlayHighlight={showOverlayHighlight}
          onToggleOverlayHighlight={setShowOverlayHighlight}
          onUpdateTransform={handleUpdateLayerTransform}
          onUpdateToneConfig={handleUpdateToneConfig}
          onUpdateLayerOpacity={handleUpdateLayerOpacity}
          onUpdateLayerBlendMode={handleUpdateLayerBlendMode}
          onReplaceBaseImage={handleReplaceBaseImage}
          onBinarizeManuscript={handleBinarizeBaseManuscript}
        />
      </div>

      {/* 3. Modals */}
      <SavedTonesModal
        isOpen={isSavedTonesOpen}
        onClose={() => setIsSavedTonesOpen(false)}
        savedTones={savedTones}
        selectedTone={selectedTone}
        onSelectTone={setSelectedTone}
        onDeleteCustomTone={(id) => setSavedTones((prev) => prev.filter((t) => t.id !== id))}
        onOpenDesignTone={() => setIsDesignToneOpen(true)}
      />

      <DesignToneModal
        isOpen={isDesignToneOpen}
        onClose={() => setIsDesignToneOpen(false)}
        onSaveTone={(newTone) => {
          setSavedTones((prev) => [...prev, newTone]);
          setSelectedTone(newTone);
        }}
        onApplyDirectly={(newTone) => {
          setSelectedTone(newTone);
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        layers={layers}
        activeLayerId={activeLayerId}
        exportWidth={exportWidth}
        exportHeight={exportHeight}
        workingWidth={workingWidth}
        workingHeight={workingHeight}
      />

      <ManuscriptSelectorModal
        isOpen={isManuscriptSelectorOpen}
        onClose={() => setIsManuscriptSelectorOpen(false)}
        activeManuscriptId={activeManuscriptId}
        onSelectSampleManuscript={loadManuscript}
        onUploadCustomFile={handleReplaceBaseImage}
      />
    </div>
  );
}
