import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  X,
  Eye,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Maximize,
  RotateCw,
  Sliders,
  Upload,
  Lock,
  Unlock,
  Move,
  Sun,
} from 'lucide-react';
import { Layer, BlendMode, ToneConfig } from '../types/manga';

interface LayerPanelProps {
  isOpen: boolean;
  onClose: () => void;
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
}

type TabType = 'all' | 'transform' | 'layers';

export const LayerPanel: React.FC<LayerPanelProps> = ({
  isOpen,
  onClose,
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
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isProportional, setIsProportional] = useState<boolean>(true);

  // Panel Position & Size
  const [panelPos, setPanelPos] = useState({ x: 74, y: 64 });
  const [panelSize, setPanelSize] = useState({ width: 330, height: 540 });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  const isResizingRef = useRef(false);
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, startW: 0, startH: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];

  // Dragging event handlers
  const handleDragMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: panelPos.x,
      posY: panelPos.y,
    };
    e.preventDefault();
  };

  // Resizing event handlers
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    isResizingRef.current = true;
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: panelSize.width,
      startH: panelSize.height,
    };
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const dx = e.clientX - dragStartRef.current.mouseX;
        const dy = e.clientY - dragStartRef.current.mouseY;
        setPanelPos({
          x: Math.max(10, Math.min(window.innerWidth - panelSize.width - 10, dragStartRef.current.posX + dx)),
          y: Math.max(55, Math.min(window.innerHeight - 80, dragStartRef.current.posY + dy)),
        });
      }
      if (isResizingRef.current) {
        const dw = e.clientX - resizeStartRef.current.mouseX;
        const dh = e.clientY - resizeStartRef.current.mouseY;
        setPanelSize({
          width: Math.max(280, Math.min(500, resizeStartRef.current.startW + dw)),
          height: Math.max(340, Math.min(window.innerHeight - 80, resizeStartRef.current.startH + dh)),
        });
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      isResizingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [panelSize.width]);

  if (!isOpen) return null;

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
      style={{
        left: `${panelPos.x}px`,
        top: `${panelPos.y}px`,
        width: `${panelSize.width}px`,
        height: `${panelSize.height}px`,
      }}
      className="fixed z-40 bg-[#171a22]/95 backdrop-blur-md border border-[#2b3140] rounded-xl shadow-2xl flex flex-col select-none overflow-hidden"
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleDragMouseDown}
        className="h-10 bg-[#1c202a] border-b border-[#2b3140] flex items-center justify-between px-3 cursor-move shrink-0"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-100">圖層與變形控制面板</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#282f3d] transition-colors"
            title="關閉面板"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Sub-Tools (抽取墨線, 去灰淨化 & 淺藍透視) */}
      <div className="p-2 bg-[#14171f] border-b border-[#252b38] flex items-center justify-between gap-1.5 shrink-0">
        <button
          onClick={onExtractLineart}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded text-xs font-semibold shadow transition-all truncate"
          title="一鍵分離手稿白底，只保留透明純黑線稿層"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200 shrink-0" />
          <span className="truncate">抽取墨線</span>
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
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 py-1 rounded text-center transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#202533]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Transform Section (shown in 'all' and 'transform' tab) */}
        {(activeTab === 'all' || activeTab === 'transform') && activeLayer && (
          <div className="space-y-3.5 bg-[#14171f] p-3 rounded-lg border border-[#252b38]">
            <div className="flex items-center justify-between pb-1 border-b border-[#222836]">
              <span className="text-xs font-bold text-slate-200">
                作用中圖層：<span className="text-blue-400">{activeLayer.name}</span>
              </span>
              <button
                onClick={() => setIsProportional(!isProportional)}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition-colors ${
                  isProportional
                    ? 'bg-blue-950/60 text-blue-300 border-blue-700/50'
                    : 'bg-[#1f2533] text-slate-400 border-transparent hover:text-white'
                }`}
                title={isProportional ? '等比縮放已鎖定' : '自由拉伸模式'}
              >
                {isProportional ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span>{isProportional ? '等比鎖定' : '任意拉伸'}</span>
              </button>
            </div>

            {/* Transform Sliders */}
            <div className="space-y-2.5 text-xs">
              {/* Scale X / Proportional Scale */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>{isProportional ? '圖層縮放比例 (Scale)' : '水平拉伸 (Scale X)'}</span>
                  <span className="font-mono text-blue-400">
                    {Math.round(activeLayer.transform.scaleX * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.05"
                  value={activeLayer.transform.scaleX}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (isProportional) {
                      onUpdateTransform(activeLayer.id, { scaleX: val, scaleY: val });
                    } else {
                      onUpdateTransform(activeLayer.id, { scaleX: val });
                    }
                  }}
                  className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                />
              </div>

              {/* Scale Y (visible when free transform) */}
              {!isProportional && (
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>垂直拉伸 (Scale Y)</span>
                    <span className="font-mono text-blue-400">
                      {Math.round(activeLayer.transform.scaleY * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.05"
                    value={activeLayer.transform.scaleY}
                    onChange={(e) =>
                      onUpdateTransform(activeLayer.id, { scaleY: Number(e.target.value) })
                    }
                    className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                  />
                </div>
              )}

              {/* Quick Scale Presets */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 shrink-0">快捷:</span>
                <div className="grid grid-cols-6 gap-1 flex-1">
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleScalePreset(s)}
                      className={`text-[10px] py-0.5 rounded font-mono transition-colors ${
                        Math.abs(activeLayer.transform.scaleX - s) < 0.02
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-[#1f2430] text-slate-400 hover:text-white'
                      }`}
                    >
                      {Math.round(s * 100)}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation Slider */}
              <div className="pt-1">
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>旋轉角度 (Rotation)</span>
                  <span className="font-mono text-blue-400">
                    {Math.round(activeLayer.transform.rotation)}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={activeLayer.transform.rotation}
                  onChange={(e) =>
                    onUpdateTransform(activeLayer.id, { rotation: Number(e.target.value) })
                  }
                  className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                />
              </div>

              {/* Quick Rotation Angles */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 shrink-0">角度:</span>
                <div className="grid grid-cols-6 gap-1 flex-1">
                  {[0, 45, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => handleRotationPreset(deg)}
                      className={`text-[10px] py-0.5 rounded font-mono transition-colors ${
                        Math.round(activeLayer.transform.rotation) === deg
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-[#1f2430] text-slate-400 hover:text-white'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                  <button
                    onClick={() => handleRotationPreset(0)}
                    className="text-[10px] py-0.5 rounded font-sans bg-[#2b2520] text-amber-300 hover:bg-[#3d3329]"
                    title="重設角度為 0°"
                  >
                    還原
                  </button>
                </div>
              </div>
            </div>

            {/* If layer has screentone config: LineCount & Density adjustments */}
            {activeLayer.toneConfig && (
              <div className="pt-2 border-t border-[#222836] space-y-2 text-xs">
                <div>
                  <span className="text-slate-300 block mb-1">網點線數 (Screen Lines)</span>
                  <div className="grid grid-cols-6 gap-1">
                    {[20, 30, 40, 50, 60, 70].map((lines) => (
                      <button
                        key={lines}
                        onClick={() => handleLineCountPreset(lines)}
                        className={`text-[10px] py-1 rounded font-mono transition-colors ${
                          activeLayer.toneConfig?.lineCount === lines
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-[#1f2430] text-slate-400 hover:text-white'
                        }`}
                      >
                        {lines}L
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>網點濃度 (Density)</span>
                    <span className="font-mono text-blue-400">
                      {Math.round(activeLayer.toneConfig.density * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={activeLayer.toneConfig.density}
                    onChange={(e) =>
                      onUpdateToneConfig(activeLayer.id, {
                        density: Number(e.target.value),
                      })
                    }
                    className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Opacity & Blend Mode */}
            <div className="pt-2 border-t border-[#222836] space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>圖層不透明度 (Opacity)</span>
                  <span className="font-mono text-blue-400">
                    {Math.round(activeLayer.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={activeLayer.opacity}
                  onChange={(e) => onUpdateLayerOpacity(activeLayer.id, Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">混合模式</span>
                <select
                  value={activeLayer.blendMode}
                  onChange={(e) =>
                    onUpdateLayerBlendMode(activeLayer.id, e.target.value as BlendMode)
                  }
                  className="bg-[#202533] text-slate-200 border border-[#2e3648] rounded px-2 py-1 text-xs"
                >
                  <option value="source-over">Normal 正常</option>
                  <option value="multiply">Multiply 正片疊底 (漫畫首選)</option>
                  <option value="screen">Screen 濾色</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Layer Stack Section (shown in 'all' and 'layers' tab) */}
        {(activeTab === 'all' || activeTab === 'layers') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-slate-200">圖層堆疊清單</span>
              <span className="text-[10px] text-slate-400 font-mono">共 {layers.length} 層</span>
            </div>

            {/* Hidden file input for Replace Base Image */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onReplaceBaseImage(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="space-y-1.5">
              {layers.map((layer, index) => {
                const isSelected = layer.id === activeLayerId;
                const isBase = layer.type === 'base';

                return (
                  <div
                    key={layer.id}
                    onClick={() => onSelectLayer(layer.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow-sm'
                        : 'bg-[#151821] border-[#242938] hover:border-[#343b4f]'
                    }`}
                  >
                    {/* Left: Visibility & Name */}
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisibility(layer.id);
                        }}
                        className={`p-1 rounded hover:bg-[#252b38] transition-colors ${
                          layer.visible ? 'text-slate-300' : 'text-slate-600'
                        }`}
                        title={layer.visible ? '隱藏圖層' : '顯示圖層'}
                      >
                        {layer.visible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-semibold truncate ${
                              isSelected ? 'text-blue-400' : 'text-slate-200'
                            }`}
                          >
                            {layer.name}
                          </span>
                          {isBase && (
                            <span className="text-[9px] bg-amber-950/70 text-amber-300 border border-amber-800/40 px-1 rounded">
                              手稿底圖
                            </span>
                          )}
                          {layer.type === 'lineart' && (
                            <span className="text-[9px] bg-emerald-950/70 text-emerald-300 border border-emerald-800/40 px-1 rounded">
                              純墨線
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {Math.round(layer.opacity * 100)}% · {layer.blendMode}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1">
                      {isBase ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="flex items-center gap-1 text-[11px] bg-[#222836] hover:bg-[#2c3447] text-slate-200 px-2 py-1 rounded border border-[#2f374a] transition-colors"
                          title="直接從本機選取圖片替換底稿"
                        >
                          <Upload className="w-3 h-3 text-emerald-400" />
                          <span>更換底圖</span>
                        </button>
                      ) : (
                        <>
                          {/* Reorder Up/Down */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveLayerUp(layer.id);
                            }}
                            disabled={index === 0}
                            className={`p-1 rounded ${
                              index === 0
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-400 hover:text-white hover:bg-[#222836]'
                            }`}
                            title="向上移動一層"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveLayerDown(layer.id);
                            }}
                            disabled={index === layers.length - 1}
                            className={`p-1 rounded ${
                              index === layers.length - 1
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-400 hover:text-white hover:bg-[#222836]'
                            }`}
                            title="向下移動一層"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteLayer(layer.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-[#2b1f24] transition-colors"
                            title="刪除此圖層"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Resize Grip (bottom right) */}
      <div
        onMouseDown={handleResizeMouseDown}
        className="h-3 w-full bg-[#14171f] cursor-se-resize flex items-center justify-end px-1.5 shrink-0 hover:bg-blue-600/20"
        title="拖曳右下角縮放面板"
      >
        <div className="w-2 h-2 border-r-2 border-b-2 border-slate-500" />
      </div>
    </div>
  );
};
