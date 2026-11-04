import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Layer,
  ToolType,
  SelectionState,
  WandSettings,
  ScraperSettings,
  PenSettings,
  EraserSettings,
  ToneBrushSettings,
  TextSettings,
  MangaTextItem,
  ToneConfig,
} from '../types/manga';
import { performMagicWand, isPointInSelection } from '../utils/magicWand';
import { applyScraperStroke } from '../utils/toneScraper';
import { renderToneToCanvas } from '../utils/mangaScreentone';
import { renderMangaTextToCanvas } from '../utils/mangaText';
import { Sparkles, Move, X, Check, Minus, Plus, Type } from 'lucide-react';

interface ViewportCanvasProps {
  workingWidth: number;
  workingHeight: number;
  layers: Layer[];
  activeLayerId: string;
  activeTool: ToolType;
  selectedTone: ToneConfig;
  selection: SelectionState;
  onUpdateSelection: (selection: SelectionState) => void;
  onCommitToneFill: () => void;
  wandSettings: WandSettings;
  scraperSettings: ScraperSettings;
  penSettings: PenSettings;
  eraserSettings: EraserSettings;
  toneBrushSettings: ToneBrushSettings;
  textSettings: TextSettings;
  onUpdateTextSettings?: (settings: TextSettings) => void;
  onAddTextLayer?: (textItem: MangaTextItem) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showOverlayHighlight: boolean;
  onUpdateLayerTransform: (
    layerId: string,
    transform: { scaleX?: number; scaleY?: number; rotation?: number; x?: number; y?: number }
  ) => void;
  onSaveHistorySnapshot: () => void;
  onInteractingChange?: (isInteracting: boolean) => void;
}

type HandleType = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | 'rotate' | null;

export const ViewportCanvas: React.FC<ViewportCanvasProps> = ({
  workingWidth,
  workingHeight,
  layers,
  activeLayerId,
  activeTool,
  selectedTone,
  selection,
  onUpdateSelection,
  onCommitToneFill,
  wandSettings,
  scraperSettings,
  penSettings,
  eraserSettings,
  toneBrushSettings,
  textSettings,
  onUpdateTextSettings,
  onAddTextLayer,
  zoom,
  onZoomChange,
  showOverlayHighlight,
  onUpdateLayerTransform,
  onSaveHistorySnapshot,
  onInteractingChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Comic Dialogue Text Placement State
  const [editingText, setEditingText] = useState<MangaTextItem | null>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const textDragStartRef = useRef({ mouseX: 0, mouseY: 0, textX: 0, textY: 0 });

  // Pan Offset
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isSpacePressedRef = useRef(false);

  // Active Drawing / Interaction State
  const isInteractingRef = useRef(false);
  const activeHandleRef = useRef<HandleType>(null);
  const interactionStartRef = useRef({
    screenX: 0,
    screenY: 0,
    canvasX: 0,
    canvasY: 0,
    startPanX: 0,
    startPanY: 0,
    layerScaleX: 1,
    layerScaleY: 1,
    layerRot: 0,
    layerX: 0,
    layerY: 0,
  });

  const lastStrokePointRef = useRef<{ x: number; y: number } | null>(null);

  // Pinch-to-zoom touch state
  const touchStateRef = useRef<{
    initialDist: number;
    initialZoom: number;
    initialCenter: { x: number; y: number };
    initialPan: { x: number; y: number };
  } | null>(null);

  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];

  // Transient on-canvas notification toast
  const [canvasToast, setCanvasToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showCanvasToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setCanvasToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setCanvasToast(null);
    }, 4500);
  };

  // Marching Ants Animation Phase
  const [antsOffset, setAntsOffset] = useState(0);
  useEffect(() => {
    if (!selection.hasSelection) return;
    const interval = setInterval(() => {
      setAntsOffset((prev) => (prev + 1) % 16);
    }, 60);
    return () => clearInterval(interval);
  }, [selection.hasSelection]);

  // Keyboard Spacebar Listener for Hand Pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && (e.target as HTMLElement).tagName !== 'INPUT') {
        isSpacePressedRef.current = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Center canvas on initial mount or resize
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPan({
      x: (rect.width - workingWidth * zoom) / 2,
      y: (rect.height - workingHeight * zoom) / 2,
    });
  }, [workingWidth, workingHeight]);

  // Convert Screen Coordinates to Working Canvas Coordinates
  const getCanvasCoords = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const relX = screenX - rect.left - pan.x;
      const relY = screenY - rect.top - pan.y;
      return {
        x: relX / zoom,
        y: relY / zoom,
      };
    },
    [pan.x, pan.y, zoom]
  );

  // Compute Handles for Active Layer (Solution 4: Anchor around local bounding box if present)
  const getActiveLayerBounds = useCallback(() => {
    if (!activeLayer) return null;
    const isLocal = !!activeLayer.bounds;
    const baseW = isLocal ? Math.max(30, activeLayer.bounds!.maxX - activeLayer.bounds!.minX) : workingWidth;
    const baseH = isLocal ? Math.max(30, activeLayer.bounds!.maxY - activeLayer.bounds!.minY) : workingHeight;
    const localCenterX = isLocal ? (activeLayer.bounds!.minX + activeLayer.bounds!.maxX) / 2 : workingWidth / 2;
    const localCenterY = isLocal ? (activeLayer.bounds!.minY + activeLayer.bounds!.maxY) / 2 : workingHeight / 2;

    const cx = localCenterX + activeLayer.transform.x;
    const cy = localCenterY + activeLayer.transform.y;
    const isTone = activeLayer.type === 'tone';
    const w = (isTone ? baseW : baseW * activeLayer.transform.scaleX) / 2;
    const h = (isTone ? baseH : baseH * activeLayer.transform.scaleY) / 2;
    const rot = (activeLayer.transform.rotation * Math.PI) / 180;

    const corners = [
      { id: 'nw' as HandleType, x: -w, y: -h },
      { id: 'ne' as HandleType, x: w, y: -h },
      { id: 'se' as HandleType, x: w, y: h },
      { id: 'sw' as HandleType, x: -w, y: h },
      { id: 'n' as HandleType, x: 0, y: -h },
      { id: 's' as HandleType, x: 0, y: h },
      { id: 'w' as HandleType, x: -w, y: 0 },
      { id: 'e' as HandleType, x: w, y: 0 },
    ].map((p) => {
      // For tones, the bounding frame stays locked in the manga panel orientation
      if (isTone) {
        return { id: p.id, x: p.x + cx, y: p.y + cy };
      }
      const rx = p.x * Math.cos(rot) - p.y * Math.sin(rot) + cx;
      const ry = p.x * Math.sin(rot) + p.y * Math.cos(rot) + cy;
      return { id: p.id, x: rx, y: ry };
    });

    // Rotation handle at top shows and controls the internal pattern angle
    const rotOffset = -h - 28 / zoom;
    const rotX = 0 * Math.cos(rot) - rotOffset * Math.sin(rot) + cx;
    const rotY = 0 * Math.sin(rot) + rotOffset * Math.cos(rot) + cy;
    corners.push({ id: 'rotate' as HandleType, x: rotX, y: rotY });

    return { cx, cy, corners, rot, w, h };
  }, [activeLayer, workingWidth, workingHeight, zoom]);

  // Main Canvas Compositing Loop
  const renderDisplay = useCallback(() => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, workingWidth, workingHeight);

    // 1. Stack all visible layers
    for (const layer of layers) {
      if (!layer.visible) continue;
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode;

      // Transform matrix if non-base
      if (layer.type !== 'base') {
        const cx = workingWidth / 2 + layer.transform.x;
        const cy = workingHeight / 2 + layer.transform.y;
        ctx.translate(cx, cy);
        // For tone layers, pattern rotation and scaling is already rendered in-place inside the locked mask!
        // Outer layer canvas stays strictly stationary so the silhouette never leaves the frame.
        if (layer.type !== 'tone') {
          ctx.rotate((layer.transform.rotation * Math.PI) / 180);
          ctx.scale(layer.transform.scaleX, layer.transform.scaleY);
        }
        ctx.translate(-workingWidth / 2, -workingHeight / 2);
      }

      ctx.drawImage(layer.canvas, 0, 0);
      ctx.restore();
    }

    // 2. Light Blue Translucent Overlay for Active Layer (Solution 5: 淺藍透視 strictly clips to mask!)
    if (showOverlayHighlight && activeLayer && activeLayer.type !== 'base') {
      ctx.save();
      const cx = workingWidth / 2 + activeLayer.transform.x;
      const cy = workingHeight / 2 + activeLayer.transform.y;
      ctx.translate(cx, cy);
      if (activeLayer.type !== 'tone') {
        ctx.rotate((activeLayer.transform.rotation * Math.PI) / 180);
        ctx.scale(activeLayer.transform.scaleX, activeLayer.transform.scaleY);
      }
      ctx.translate(-workingWidth / 2, -workingHeight / 2);

      if (activeLayer.maskCanvas) {
        // Precise clipping: Draw blue fill ONLY over the masked region!
        const tempHL = document.createElement('canvas');
        tempHL.width = workingWidth;
        tempHL.height = workingHeight;
        const hlCtx = tempHL.getContext('2d');
        if (hlCtx) {
          hlCtx.fillStyle = 'rgba(59, 130, 246, 0.25)';
          hlCtx.fillRect(0, 0, workingWidth, workingHeight);
          hlCtx.globalCompositeOperation = 'destination-in';
          hlCtx.drawImage(activeLayer.maskCanvas, 0, 0);
          ctx.drawImage(tempHL, 0, 0);
        }

        // Bounding box border around localized region
        if (activeLayer.bounds) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(
            activeLayer.bounds.minX,
            activeLayer.bounds.minY,
            activeLayer.bounds.maxX - activeLayer.bounds.minX,
            activeLayer.bounds.maxY - activeLayer.bounds.minY
          );
        }
      } else {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, 0, workingWidth, workingHeight);
      }
      ctx.restore();
    }

    // 3. Selection Marching Ants & Light Blue Preview
    if (selection.hasSelection && selection.maskCanvas) {
      ctx.save();
      // Draw light blue transparent fill over selection
      ctx.fillStyle = 'rgba(59, 130, 246, 0.22)';
      const tempMaskCanvas = document.createElement('canvas');
      tempMaskCanvas.width = workingWidth;
      tempMaskCanvas.height = workingHeight;
      const mCtx = tempMaskCanvas.getContext('2d');
      if (mCtx) {
        mCtx.fillStyle = 'rgba(59, 130, 246, 0.22)';
        mCtx.fillRect(0, 0, workingWidth, workingHeight);
        mCtx.globalCompositeOperation = 'destination-in';
        mCtx.drawImage(selection.maskCanvas, 0, 0);
        ctx.drawImage(tempMaskCanvas, 0, 0);
      }

      // Marching ants border around bounds
      if (selection.bounds) {
        const { minX, minY, maxX, maxY } = selection.bounds;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.lineDashOffset = -antsOffset;
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

        ctx.strokeStyle = '#ffffff';
        ctx.lineDashOffset = -antsOffset + 6;
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      }
      ctx.restore();
    }

    // 4. 8-Point On-Canvas Handles on Active Layer (when not base layer)
    if (activeLayer && activeLayer.type !== 'base') {
      const b = getActiveLayerBounds();
      if (b) {
        ctx.save();
        // Line from top to rotation handle
        const topMid = b.corners.find((c) => c.id === 'n');
        const rotHandle = b.corners.find((c) => c.id === 'rotate');
        if (topMid && rotHandle) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(topMid.x, topMid.y);
          ctx.lineTo(rotHandle.x, rotHandle.y);
          ctx.stroke();
        }

        // Draw handles
        const handleSize = 10 / zoom;
        for (const pt of b.corners) {
          if (pt.id === 'rotate') {
            // Circular handle
            ctx.fillStyle = '#3b82f6';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 / zoom;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, handleSize / 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            // White square handles with dark blue border
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#1e40af';
            ctx.lineWidth = 2 / zoom;
            ctx.beginPath();
            ctx.rect(
              pt.x - handleSize / 2,
              pt.y - handleSize / 2,
              handleSize,
              handleSize
            );
            ctx.fill();
            ctx.stroke();
          }
        }
        ctx.restore();
      }
    }
  }, [
    workingWidth,
    workingHeight,
    layers,
    activeLayer,
    showOverlayHighlight,
    selection,
    antsOffset,
    zoom,
    getActiveLayerBounds,
  ]);

  useEffect(() => {
    renderDisplay();
  }, [renderDisplay]);

  // Test if click hits an on-canvas handle
  const hitTestHandle = (canvasX: number, canvasY: number): HandleType => {
    if (!activeLayer || activeLayer.type === 'base') return null;
    const b = getActiveLayerBounds();
    if (!b) return null;

    const hitRadius = 14 / zoom;
    for (const pt of b.corners) {
      if (Math.hypot(canvasX - pt.x, canvasY - pt.y) <= hitRadius) {
        return pt.id;
      }
    }
    return null;
  };

  // Pointer Down (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const isHandMode = activeTool === 'hand' || isSpacePressedRef.current || e.button === 1;

    // Check hit test on 8-point handles first
    const hitHandle = hitTestHandle(coords.x, coords.y);

    if (hitHandle && !isHandMode) {
      // Begin transform manipulation
      isInteractingRef.current = true;
      onInteractingChange?.(true);
      activeHandleRef.current = hitHandle;
      interactionStartRef.current = {
        screenX: e.clientX,
        screenY: e.clientY,
        canvasX: coords.x,
        canvasY: coords.y,
        startPanX: pan.x,
        startPanY: pan.y,
        layerScaleX: activeLayer.transform.scaleX,
        layerScaleY: activeLayer.transform.scaleY,
        layerRot: activeLayer.transform.rotation,
        layerX: activeLayer.transform.x,
        layerY: activeLayer.transform.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    if (isHandMode) {
      // Hand Pan
      isInteractingRef.current = true;
      onInteractingChange?.(true);
      activeHandleRef.current = null;
      interactionStartRef.current = {
        screenX: e.clientX,
        screenY: e.clientY,
        canvasX: coords.x,
        canvasY: coords.y,
        startPanX: pan.x,
        startPanY: pan.y,
        layerScaleX: 1,
        layerScaleY: 1,
        layerRot: 0,
        layerX: 0,
        layerY: 0,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // Tool Actions:
    if (activeTool === 'wand') {
      // 2-Click Magic Wand Detection:
      if (selection.hasSelection && selection.maskCanvas && selection.bounds) {
        // If clicking within active selection or 50px tolerance -> COMMIT FILL!
        const inBounds = isPointInSelection(
          coords.x,
          coords.y,
          selection.maskCanvas,
          selection.bounds,
          50
        );

        if (inBounds) {
          onCommitToneFill();
          return;
        }
      }

      // First click: Scan enclosed lineart region
      // Merge base canvas and lineart layers for scanning
      const compositeCanvas = document.createElement('canvas');
      compositeCanvas.width = workingWidth;
      compositeCanvas.height = workingHeight;
      const cCtx = compositeCanvas.getContext('2d');
      if (cCtx) {
        for (const l of layers) {
          if (l.visible && (l.type === 'base' || l.type === 'lineart')) {
            cCtx.drawImage(l.canvas, 0, 0);
          }
        }
      }

      const wandRes = performMagicWand(
        compositeCanvas,
        Math.round(coords.x),
        Math.round(coords.y),
        wandSettings
      );

      if (wandRes) {
        onUpdateSelection({
          hasSelection: true,
          maskCanvas: wandRes.maskCanvas,
          bounds: wandRes.bounds,
          clickPoint: wandRes.clickPoint,
          timestamp: Date.now(),
        });
        showCanvasToast('✨ 區域圈選成功！再次點擊該區域直接貼網，或使用下方「立即填入」');
      } else {
        showCanvasToast('⚠️ 未檢測到封閉輪廓。可點兩下或再點魔術棒，調高「斷線自動閉合」或「線條識別靈敏度」！');
      }
      return;
    }

    if (activeTool === 'fill') {
      // If selection exists, fill selection; otherwise wand + fill
      if (selection.hasSelection) {
        onCommitToneFill();
        showCanvasToast('✅ 已將網點填入選取區域！');
      } else {
        const wandRes = performMagicWand(
          displayCanvasRef.current || layers[0].canvas,
          Math.round(coords.x),
          Math.round(coords.y),
          wandSettings
        );
        if (wandRes) {
          onUpdateSelection({
            hasSelection: true,
            maskCanvas: wandRes.maskCanvas,
            bounds: wandRes.bounds,
            clickPoint: wandRes.clickPoint,
            timestamp: Date.now(),
          });
          onCommitToneFill();
          showCanvasToast('✅ 檢測到封閉區域，已自動填入網點！');
        } else {
          showCanvasToast('⚠️ 未檢測到封閉輪廓，無法填入網點。請先點選封閉輪廓內側');
        }
      }
      return;
    }

    if (activeTool === 'text') {
      const clickX = Math.round(coords.x);
      const clickY = Math.round(coords.y);
      setEditingText({
        id: `text-${Date.now()}`,
        text: editingText?.text || '請輸入對話…',
        x: clickX,
        y: clickY,
        fontSize: textSettings.fontSize,
        direction: textSettings.direction,
        fontFamily: textSettings.fontFamily,
        color: textSettings.color,
        bold: textSettings.bold,
        hasOutline: textSettings.hasOutline,
        outlineColor: textSettings.outlineColor,
        outlineWidth: textSettings.outlineWidth,
        lineHeight: textSettings.lineHeight,
      });
      showCanvasToast('💬 已在對話框建立文字框，輸入文字後點擊「✓ 蓋印至圖層」即可！');
      return;
    }

    if (activeTool === 'pen' || activeTool === 'scraper' || activeTool === 'eraser' || activeTool === 'toneBrush') {
      onSaveHistorySnapshot();
      isInteractingRef.current = true;
      onInteractingChange?.(true);
      activeHandleRef.current = null;
      lastStrokePointRef.current = { x: coords.x, y: coords.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      // Perform initial dot
      handleDrawingStroke(coords.x, coords.y, coords.x, coords.y);
    }
  };

  // Drawing Stroke Dispatcher
  const handleDrawingStroke = (x1: number, y1: number, x2: number, y2: number) => {
    if (!activeLayer) return;
    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'pen') {
      ctx.save();
      ctx.strokeStyle = `rgba(0, 0, 0, ${penSettings.opacity})`;
      ctx.lineWidth = penSettings.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (x1 === x2 && y1 === y2) {
        ctx.beginPath();
        ctx.arc(x1, y1, penSettings.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (activeTool === 'scraper') {
      applyScraperStroke(ctx, x1, y1, x2, y2, scraperSettings);
    } else if (activeTool === 'eraser') {
      const eSize = eraserSettings?.size || 18;
      // 1. Erase from active layer canvas
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = eSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (x1 === x2 && y1 === y2) {
        ctx.beginPath();
        ctx.arc(x1, y1, eSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Synchronize Eraser with maskCanvas (Dynamic Light Blue Highlight Shrink)
      if (activeLayer.maskCanvas) {
        const mCtx = activeLayer.maskCanvas.getContext('2d');
        if (mCtx) {
          mCtx.save();
          mCtx.globalCompositeOperation = 'destination-out';
          mCtx.lineWidth = eSize;
          mCtx.lineCap = 'round';
          mCtx.lineJoin = 'round';
          mCtx.beginPath();
          mCtx.moveTo(x1, y1);
          mCtx.lineTo(x2, y2);
          mCtx.stroke();
          if (x1 === x2 && y1 === y2) {
            mCtx.beginPath();
            mCtx.arc(x1, y1, eSize / 2, 0, Math.PI * 2);
            mCtx.fill();
          }
          mCtx.restore();
        }
      }
    } else if (activeTool === 'toneBrush') {
      const bSize = toneBrushSettings?.size || 24;

      // 1. Ensure target layer has tone configuration matching current layer or selected tone
      if (!activeLayer.toneConfig) {
        activeLayer.toneConfig = { ...selectedTone };
        activeLayer.type = 'tone';
      }

      // 2. Ensure maskCanvas exists on the layer
      if (!activeLayer.maskCanvas) {
        activeLayer.maskCanvas = document.createElement('canvas');
        activeLayer.maskCanvas.width = workingWidth;
        activeLayer.maskCanvas.height = workingHeight;
        const mCtx = activeLayer.maskCanvas.getContext('2d');
        if (mCtx) {
          mCtx.drawImage(activeLayer.canvas, 0, 0);
          mCtx.globalCompositeOperation = 'source-in';
          mCtx.fillStyle = '#ffffff';
          mCtx.fillRect(0, 0, workingWidth, workingHeight);
          mCtx.globalCompositeOperation = 'source-over';
        }
      }

      // 3. Draw white stroke on maskCanvas (Expanding the light blue highlight area in real time!)
      const mCtx = activeLayer.maskCanvas.getContext('2d');
      if (mCtx) {
        mCtx.save();
        mCtx.fillStyle = '#ffffff';
        mCtx.strokeStyle = '#ffffff';
        mCtx.lineWidth = bSize;
        mCtx.lineCap = 'round';
        mCtx.lineJoin = 'round';
        mCtx.beginPath();
        mCtx.moveTo(x1, y1);
        mCtx.lineTo(x2, y2);
        mCtx.stroke();
        if (x1 === x2 && y1 === y2) {
          mCtx.beginPath();
          mCtx.arc(x1, y1, bSize / 2, 0, Math.PI * 2);
          mCtx.fill();
        }
        mCtx.restore();
      }

      // 4. Render the layer's identical screentone pattern onto a stroke buffer
      const strokeBuffer = document.createElement('canvas');
      strokeBuffer.width = workingWidth;
      strokeBuffer.height = workingHeight;
      const sCtx = strokeBuffer.getContext('2d');
      if (sCtx) {
        sCtx.fillStyle = '#ffffff';
        sCtx.strokeStyle = '#ffffff';
        sCtx.lineWidth = bSize;
        sCtx.lineCap = 'round';
        sCtx.lineJoin = 'round';
        sCtx.beginPath();
        sCtx.moveTo(x1, y1);
        sCtx.lineTo(x2, y2);
        sCtx.stroke();
        if (x1 === x2 && y1 === y2) {
          sCtx.beginPath();
          sCtx.arc(x1, y1, bSize / 2, 0, Math.PI * 2);
          sCtx.fill();
        }

        // Render the exact same tone pattern configured for this layer
        renderToneToCanvas(
          strokeBuffer,
          activeLayer.toneConfig,
          activeLayer.transform,
          strokeBuffer, // clipped to stroke silhouette
          1,
          activeLayer.bounds
        );

        // Stamp tone dots seamlessly onto active layer canvas
        ctx.drawImage(strokeBuffer, 0, 0);
      }

      // 5. Expand layer bounds
      const r = bSize / 2;
      const strokeMinX = Math.min(x1, x2) - r;
      const strokeMinY = Math.min(y1, y2) - r;
      const strokeMaxX = Math.max(x1, x2) + r;
      const strokeMaxY = Math.max(y1, y2) + r;
      if (!activeLayer.bounds) {
        activeLayer.bounds = { minX: strokeMinX, minY: strokeMinY, maxX: strokeMaxX, maxY: strokeMaxY };
      } else {
        activeLayer.bounds = {
          minX: Math.min(activeLayer.bounds.minX, strokeMinX),
          minY: Math.min(activeLayer.bounds.minY, strokeMinY),
          maxX: Math.max(activeLayer.bounds.maxX, strokeMaxX),
          maxY: Math.max(activeLayer.bounds.maxY, strokeMaxY),
        };
      }
    }

    renderDisplay();
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);

    // If transforming via handles
    if (isInteractingRef.current && activeHandleRef.current && activeLayer) {
      const handle = activeHandleRef.current;
      const start = interactionStartRef.current;
      const dx = (e.clientX - start.screenX) / zoom;
      const dy = (e.clientY - start.screenY) / zoom;

      const isLocal = !!activeLayer.bounds;
      const baseW = isLocal ? Math.max(30, activeLayer.bounds!.maxX - activeLayer.bounds!.minX) : workingWidth;
      const baseH = isLocal ? Math.max(30, activeLayer.bounds!.maxY - activeLayer.bounds!.minY) : workingHeight;
      const localCenterX = isLocal ? (activeLayer.bounds!.minX + activeLayer.bounds!.maxX) / 2 : workingWidth / 2;
      const localCenterY = isLocal ? (activeLayer.bounds!.minY + activeLayer.bounds!.maxY) / 2 : workingHeight / 2;

      const cx = localCenterX + start.layerX;
      const cy = localCenterY + start.layerY;

      if (handle === 'rotate') {
        // Calculate angle from layer local center to current mouse
        const currentAngle = Math.atan2(coords.y - cy, coords.x - cx) * (180 / Math.PI);
        const startAngle = Math.atan2(start.canvasY - cy, start.canvasX - cx) * (180 / Math.PI);
        const newRot = (start.layerRot + (currentAngle - startAngle) + 360) % 360;
        onUpdateLayerTransform(activeLayer.id, { rotation: newRot });
      } else if (handle === 'e' || handle === 'w') {
        const factor = handle === 'e' ? 1 : -1;
        const scaleChange = (dx * factor) / (baseW / 2);
        const newScaleX = Math.max(0.1, Math.min(4, start.layerScaleX + scaleChange));
        onUpdateLayerTransform(activeLayer.id, { scaleX: newScaleX });
      } else if (handle === 's' || handle === 'n') {
        const factor = handle === 's' ? 1 : -1;
        const scaleChange = (dy * factor) / (baseH / 2);
        const newScaleY = Math.max(0.1, Math.min(4, start.layerScaleY + scaleChange));
        onUpdateLayerTransform(activeLayer.id, { scaleY: newScaleY });
      } else {
        // Corner handles (equal scaling)
        const sign = handle === 'se' ? 1 : handle === 'nw' ? -1 : 1;
        const scaleChange = ((dx + dy) * sign * 0.5) / (baseW / 2);
        const newScale = Math.max(0.1, Math.min(4, start.layerScaleX + scaleChange));
        onUpdateLayerTransform(activeLayer.id, { scaleX: newScale, scaleY: newScale });
      }
      return;
    }

    // If Hand panning
    if (isInteractingRef.current && (activeTool === 'hand' || isSpacePressedRef.current)) {
      const dx = e.clientX - interactionStartRef.current.screenX;
      const dy = e.clientY - interactionStartRef.current.screenY;
      setPan({
        x: interactionStartRef.current.startPanX + dx,
        y: interactionStartRef.current.startPanY + dy,
      });
      return;
    }

    // If drawing
    if (isInteractingRef.current && lastStrokePointRef.current) {
      handleDrawingStroke(
        lastStrokePointRef.current.x,
        lastStrokePointRef.current.y,
        coords.x,
        coords.y
      );
      lastStrokePointRef.current = { x: coords.x, y: coords.y };
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (isInteractingRef.current) {
      if (
        activeTool === 'pen' ||
        activeTool === 'scraper' ||
        activeTool === 'eraser' ||
        activeTool === 'toneBrush' ||
        activeHandleRef.current !== null
      ) {
        onSaveHistorySnapshot();
      }
    }
    isInteractingRef.current = false;
    onInteractingChange?.(false);
    activeHandleRef.current = null;
    lastStrokePointRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.max(0.15, Math.min(5, zoom * zoomFactor));

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom centered around mouse pointer
    setPan({
      x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (newZoom / zoom),
    });
    onZoomChange(newZoom);
  };

  // Mobile Pinch-to-zoom & 2-finger pan touch listeners
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Cancel active single-finger drawing stroke
      isInteractingRef.current = false;
      lastStrokePointRef.current = null;
      onInteractingChange?.(true);

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStateRef.current = {
        initialDist: dist,
        initialZoom: zoom,
        initialCenter: {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        },
        initialPan: { ...pan },
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStateRef.current) {
      onInteractingChange?.(true);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const scale = dist / touchStateRef.current.initialDist;
      const newZoom = Math.max(0.2, Math.min(4, touchStateRef.current.initialZoom * scale));

      const curCenter = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      const dx = curCenter.x - touchStateRef.current.initialCenter.x;
      const dy = curCenter.y - touchStateRef.current.initialCenter.y;

      setPan({
        x: touchStateRef.current.initialPan.x + dx,
        y: touchStateRef.current.initialPan.y + dy,
      });
      onZoomChange(newZoom);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchStateRef.current = null;
    if (e.touches.length === 0) {
      onInteractingChange?.(false);
    }
  };

  // Cursor style determination
  let cursorClass = 'cursor-crosshair';
  if (activeTool === 'hand' || isSpacePressedRef.current) {
    cursorClass = isInteractingRef.current ? 'cursor-grabbing' : 'cursor-grab';
  } else if (activeTool === 'wand') {
    cursorClass = 'cursor-crosshair';
  } else if (activeTool === 'scraper') {
    cursorClass = 'cursor-crosshair';
  } else if (activeTool === 'text') {
    cursorClass = 'cursor-text';
  }

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`flex-1 relative overflow-hidden bg-[#0c0e12] select-none touch-none overscroll-none ${cursorClass}`}
    >
      {/* Background Studio Grid & Darkroom Field */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#475569 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Main Scaled & Panned Manuscript Stage - Zero CSS lag */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: `${workingWidth}px`,
          height: `${workingHeight}px`,
        }}
        className="absolute shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] bg-white ring-1 ring-slate-800"
      >
        <canvas
          ref={displayCanvasRef}
          width={workingWidth}
          height={workingHeight}
          className="w-full h-full block"
        />
      </div>

      {/* Floating Canvas Notification Toast */}
      {canvasToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#161c28]/95 backdrop-blur-md text-slate-100 text-xs px-4 py-2 rounded-full border border-blue-500/40 shadow-2xl flex items-center gap-2 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-150">
          <span>{canvasToast}</span>
        </div>
      )}

      {/* On-Canvas Speech Balloon Dialogue Text Editor */}
      {editingText && (
        <div
          style={{
            left: `${pan.x + editingText.x * zoom}px`,
            top: `${pan.y + editingText.y * zoom}px`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute z-50 bg-[#141824]/95 backdrop-blur-md border border-blue-500 rounded-xl shadow-2xl p-3 min-w-[270px] max-w-[340px] animate-in fade-in zoom-in-95 duration-150 select-text"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar with Drag Handle and Quick Controls */}
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              setIsDraggingText(true);
              textDragStartRef.current = {
                mouseX: e.clientX,
                mouseY: e.clientY,
                textX: editingText.x,
                textY: editingText.y,
              };
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!isDraggingText) return;
              const dx = (e.clientX - textDragStartRef.current.mouseX) / zoom;
              const dy = (e.clientY - textDragStartRef.current.mouseY) / zoom;
              setEditingText((prev) =>
                prev
                  ? {
                      ...prev,
                      x: Math.round(textDragStartRef.current.textX + dx),
                      y: Math.round(textDragStartRef.current.textY + dy),
                    }
                  : null
              );
            }}
            onPointerUp={(e) => {
              setIsDraggingText(false);
              try {
                (e.target as HTMLElement).releasePointerCapture(e.pointerId);
              } catch {}
            }}
            className="flex items-center justify-between pb-2 mb-2 border-b border-[#293245] cursor-move select-none"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
              <Move className="w-3.5 h-3.5 text-blue-400" />
              <span>拖曳對齊對話框</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setEditingText((prev) =>
                    prev
                      ? {
                          ...prev,
                          direction: prev.direction === 'vertical' ? 'horizontal' : 'vertical',
                        }
                      : null
                  )
                }
                className="px-2 py-0.5 bg-[#222a3a] hover:bg-[#2c364a] text-blue-200 border border-blue-500/40 rounded text-[11px] font-semibold"
                title="切換直排 (豎書) / 橫排 (橫書)"
              >
                {editingText.direction === 'vertical' ? '🀄 直排' : '➡️ 橫排'}
              </button>
              <button
                onClick={() => setEditingText(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="取消"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Textarea Input */}
          <textarea
            value={editingText.text}
            onChange={(e) =>
              setEditingText((prev) => (prev ? { ...prev, text: e.target.value } : null))
            }
            placeholder="請在此輸入對話內容…"
            rows={3}
            autoFocus
            className="w-full bg-[#10131a] text-slate-100 p-2 text-sm rounded border border-[#2b3345] focus:border-blue-500 focus:outline-none resize-none leading-relaxed font-sans"
          />

          {/* Quick Controls & Stamp Button */}
          <div className="flex items-center justify-between pt-2 mt-1">
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setEditingText((prev) =>
                    prev ? { ...prev, fontSize: Math.max(12, prev.fontSize - 3) } : null
                  )
                }
                className="p-1 text-slate-400 hover:text-white bg-[#202534] rounded border border-[#2b3245]"
                title="縮小字體"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[11px] font-mono text-blue-300 px-1">
                {editingText.fontSize}px
              </span>
              <button
                onClick={() =>
                  setEditingText((prev) =>
                    prev ? { ...prev, fontSize: Math.min(80, prev.fontSize + 3) } : null
                  )
                }
                className="p-1 text-slate-400 hover:text-white bg-[#202534] rounded border border-[#2b3245]"
                title="放大字體"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => {
                if (editingText && editingText.text.trim()) {
                  onAddTextLayer?.(editingText);
                  showCanvasToast('✅ 對話文字已蓋印並建立獨立文字圖層！');
                  setEditingText(null);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-900/40"
            >
              <Check className="w-3.5 h-3.5" />
              <span>✓ 蓋印至圖層</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Commitment Button (when Wand selects an area) */}
      {selection.hasSelection && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <button
            onClick={onCommitToneFill}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full font-bold text-sm shadow-xl shadow-blue-900/50 hover:shadow-blue-600/40 border border-blue-400/50 active:scale-95 transition-all group"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
            <span>✨ 立即填入網點 (新增圖層)</span>
            <span className="text-xs bg-blue-900/60 px-2 py-0.5 rounded-full text-blue-200 font-mono">
              {selectedTone.name}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
