import React, { useState } from 'react';
import {
  Wand2,
  PaintBucket,
  PenTool,
  Scissors,
  Brush,
  Eraser,
  Type,
  Hand,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import {
  ToolType,
  WandSettings,
  ScraperSettings,
  PenSettings,
  EraserSettings,
  ToneBrushSettings,
  TextSettings,
  ScraperStyle,
} from '../types/manga';

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  wandSettings: WandSettings;
  onUpdateWandSettings: (settings: WandSettings) => void;
  scraperSettings: ScraperSettings;
  onUpdateScraperSettings: (settings: ScraperSettings) => void;
  penSettings: PenSettings;
  onUpdatePenSettings: (settings: PenSettings) => void;
  eraserSettings: EraserSettings;
  onUpdateEraserSettings: (settings: EraserSettings) => void;
  toneBrushSettings: ToneBrushSettings;
  onUpdateToneBrushSettings: (settings: ToneBrushSettings) => void;
  textSettings: TextSettings;
  onUpdateTextSettings: (settings: TextSettings) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  wandSettings,
  onUpdateWandSettings,
  scraperSettings,
  onUpdateScraperSettings,
  penSettings,
  onUpdatePenSettings,
  eraserSettings,
  onUpdateEraserSettings,
  toneBrushSettings,
  onUpdateToneBrushSettings,
  textSettings,
  onUpdateTextSettings,
}) => {
  const [activeSettingsPopover, setActiveSettingsPopover] = useState<ToolType | null>(null);

  const tools: {
    id: ToolType;
    label: string;
    shortcut: string;
    icon: React.ReactNode;
    hasSettings: boolean;
  }[] = [
    {
      id: 'wand',
      label: '魔術棒 (Magic Wand)',
      shortcut: 'W',
      icon: <Wand2 className="w-5 h-5" />,
      hasSettings: true,
    },
    {
      id: 'fill',
      label: '填入網點 (Tone Fill)',
      shortcut: 'G',
      icon: <PaintBucket className="w-5 h-5" />,
      hasSettings: false,
    },
    {
      id: 'pen',
      label: '漫畫墨線筆 (Manga Pen)',
      shortcut: 'P',
      icon: <PenTool className="w-5 h-5" />,
      hasSettings: true,
    },
    {
      id: 'scraper',
      label: '漫畫鎅刀刮網 (Tone Scraper)',
      shortcut: 'K',
      icon: <Scissors className="w-5 h-5" />,
      hasSettings: true,
    },
    {
      id: 'toneBrush',
      label: '網點筆刷 (Tone Brush)',
      shortcut: 'B',
      icon: <Brush className="w-5 h-5" />,
      hasSettings: true,
    },
    {
      id: 'eraser',
      label: '橡皮擦 (Eraser)',
      shortcut: 'E',
      icon: <Eraser className="w-5 h-5" />,
      hasSettings: true,
    },
    {
      id: 'text',
      label: '對話文字 (Comic Text)',
      shortcut: 'T',
      icon: <Type className="w-5 h-5" />,
      hasSettings: true,
    },
    {
      id: 'hand',
      label: '抓手平移 (Hand Pan)',
      shortcut: 'H',
      icon: <Hand className="w-5 h-5" />,
      hasSettings: false,
    },
  ];

  const handleToolClick = (toolId: ToolType, hasSettings: boolean) => {
    if (activeTool === toolId) {
      if (hasSettings) {
        setActiveSettingsPopover((prev) => (prev === toolId ? null : toolId));
      }
    } else {
      onSelectTool(toolId);
      setActiveSettingsPopover(null);
    }
  };

  const handleToolDoubleClick = (toolId: ToolType, hasSettings: boolean) => {
    if (hasSettings) {
      setActiveSettingsPopover((prev) => (prev === toolId ? null : toolId));
    }
  };

  return (
    <aside className="w-13 md:w-14 bg-[#14171d] border-r border-[#232833] flex flex-col items-center py-3 gap-1.5 shrink-0 z-30 select-none relative">
      {tools.map((t) => {
        const isActive = activeTool === t.id;
        const isPopoverOpen = activeSettingsPopover === t.id;

        return (
          <div key={t.id} className="relative group">
            <button
              onClick={() => handleToolClick(t.id, t.hasSettings)}
              onDoubleClick={() => handleToolDoubleClick(t.id, t.hasSettings)}
              className={`w-10 h-10 md:w-11 md:h-11 rounded-lg flex flex-col items-center justify-center transition-all relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-400/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2430]'
              }`}
              title={`${t.label} [快捷鍵: ${t.shortcut}] · ${
                isActive
                  ? t.hasSettings
                    ? '再點擊一次展開微調設定'
                    : '已選用'
                  : '點擊使用'
              }`}
            >
              {t.icon}
              <span
                className={`text-[9px] font-mono leading-none mt-0.5 ${
                  isActive ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {t.shortcut}
              </span>

              {/* Indicator if tool has settings */}
              {t.hasSettings && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isActive) {
                      onSelectTool(t.id);
                    }
                    setActiveSettingsPopover(isPopoverOpen ? null : t.id);
                  }}
                  className={`absolute bottom-1 right-1 w-2 h-2 rounded-full cursor-pointer transition-transform hover:scale-125 ${
                    isActive ? 'bg-blue-200 shadow-sm' : 'bg-slate-600 hover:bg-slate-400'
                  }`}
                  title={isActive ? '點擊展開微調設定' : '選取並開啟設定'}
                />
              )}
            </button>

            {/* Hover Tooltip (when popover not open) */}
            {!isPopoverOpen && (
              <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2 py-1 bg-[#1e232e] text-slate-200 text-xs rounded border border-[#32394a] shadow-lg whitespace-nowrap z-50 pointer-events-none">
                <span>{t.label}</span>
                <span className="ml-1.5 px-1 py-0.2 bg-[#2a3142] text-slate-300 rounded font-mono text-[10px]">
                  {t.shortcut}
                </span>
                {t.hasSettings && (
                  <span className="ml-1 text-[10px] text-blue-400">
                    {isActive ? '再點一次展開微調設定' : '再點可調大小/濃度'}
                  </span>
                )}
              </div>
            )}

            {/* Settings Popover Drawer */}
            {isPopoverOpen && (
              <div className="absolute left-full ml-3 top-0 w-64 bg-[#181c25] border border-[#2e3545] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#2b3140]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    <span>{t.label} 微調設定</span>
                  </div>
                  <button
                    onClick={() => setActiveSettingsPopover(null)}
                    className="text-slate-400 hover:text-white text-xs px-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Magic Wand Settings */}
                {t.id === 'wand' && (
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="font-medium text-slate-200">線條識別靈敏度 (Line Sensitivity)</span>
                        <span className="font-mono text-blue-400 font-semibold">{wandSettings.tolerance}</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="120"
                        value={wandSettings.tolerance}
                        onChange={(e) =>
                          onUpdateWandSettings({
                            ...wandSettings,
                            tolerance: Number(e.target.value),
                          })
                        }
                        className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                        <span>淡鉛筆稿</span>
                        <span>標準墨線</span>
                        <span>粗黑分鏡框</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        依筆觸深淺識別封閉輪廓，灰階紙張或相片陰影不影響填網。
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="font-medium text-slate-200">斷線自動閉合 (Gap Bridging)</span>
                        <span className="font-mono text-blue-400 font-semibold">{wandSettings.gapBridging || 0} px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="4"
                        value={wandSettings.gapBridging || 0}
                        onChange={(e) =>
                          onUpdateWandSettings({
                            ...wandSettings,
                            gapBridging: Number(e.target.value),
                          })
                        }
                        className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        自動跨接手繪線條 1~3px 細微斷口，防止網點溢出分鏡外。
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="font-medium text-slate-200">封閉邊界膨脹 (Expand)</span>
                        <span className="font-mono text-blue-400 font-semibold">{wandSettings.expand} px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="4"
                        value={wandSettings.expand}
                        onChange={(e) =>
                          onUpdateWandSettings({
                            ...wandSettings,
                            expand: Number(e.target.value),
                          })
                        }
                        className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        網點向外延伸壓入黑線底下，印刷絕無白邊。
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-300 block mb-1">採樣模式</span>
                      <div className="grid grid-cols-3 gap-1">
                        {(['all', 'lineart', 'current'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() =>
                              onUpdateWandSettings({
                                ...wandSettings,
                                sampleMode: mode,
                              })
                            }
                            className={`py-1 text-[11px] rounded transition-colors ${
                              wandSettings.sampleMode === mode
                                ? 'bg-blue-600 text-white font-medium'
                                : 'bg-[#222836] text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {mode === 'all' ? '全部圖層' : mode === 'lineart' ? '僅墨線' : '當前圖層'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Manga Pen Settings */}
                {t.id === 'pen' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>筆觸粗細 (Size)</span>
                        <span className="font-mono text-blue-400">{penSettings.size} px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        value={penSettings.size}
                        onChange={(e) =>
                          onUpdatePenSettings({
                            ...penSettings,
                            size: Number(e.target.value),
                          })
                        }
                        className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>不透明度 (Opacity)</span>
                        <span className="font-mono text-blue-400">
                          {Math.round(penSettings.opacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={penSettings.opacity}
                        onChange={(e) =>
                          onUpdatePenSettings({
                            ...penSettings,
                            opacity: Number(e.target.value),
                          })
                        }
                        className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Tone Scraper Settings */}
                {t.id === 'scraper' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-300 block mb-1">刮網刀風格 (Blade Style)</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'feather', label: '羽化排線' },
                          { id: 'cross', label: '交叉排線' },
                          { id: 'fade', label: '漸變消退' },
                          { id: 'highlight', label: '高光刮網' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            onClick={() =>
                              onUpdateScraperSettings({
                                ...scraperSettings,
                                style: s.id as ScraperStyle,
                              })
                            }
                            className={`py-1.5 px-2 text-[11px] rounded border transition-colors ${
                              scraperSettings.style === s.id
                                ? 'bg-blue-600/30 text-blue-300 border-blue-500 font-medium'
                                : 'bg-[#222836] text-slate-400 border-transparent hover:text-slate-200'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>刀片寬度 (Width)</span>
                        <span className="font-mono text-blue-400">{scraperSettings.width} px</span>
                      </div>
                      <input
                        type="range"
                        min="6"
                        max="60"
                        value={scraperSettings.width}
                        onChange={(e) =>
                          onUpdateScraperSettings({
                            ...scraperSettings,
                            width: Number(e.target.value),
                          })
                        }
                        className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>刀片角度 (Angle)</span>
                        <span className="font-mono text-blue-400">{scraperSettings.angle}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="180"
                        value={scraperSettings.angle}
                        onChange={(e) =>
                          onUpdateScraperSettings({
                            ...scraperSettings,
                            angle: Number(e.target.value),
                          })
                        }
                        className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>刮除壓力</span>
                          <span className="font-mono text-blue-400">
                            {Math.round(scraperSettings.pressure * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={scraperSettings.pressure}
                          onChange={(e) =>
                            onUpdateScraperSettings({
                              ...scraperSettings,
                              pressure: Number(e.target.value),
                            })
                          }
                          className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>刀刃硬度</span>
                          <span className="font-mono text-blue-400">
                            {Math.round(scraperSettings.hardness * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={scraperSettings.hardness}
                          onChange={(e) =>
                            onUpdateScraperSettings({
                              ...scraperSettings,
                              hardness: Number(e.target.value),
                            })
                          }
                          className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tone Brush Settings */}
                {t.id === 'toneBrush' && (
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="font-medium text-slate-200">網點畫筆粗細 (Brush Size)</span>
                        <span className="font-mono text-blue-400 font-semibold">{toneBrushSettings.size} px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="120"
                        value={toneBrushSettings.size}
                        onChange={(e) =>
                          onUpdateToneBrushSettings({
                            ...toneBrushSettings,
                            size: Number(e.target.value),
                          })
                        }
                        className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                      />
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {[4, 12, 24, 48, 80].map((sz) => (
                          <button
                            key={sz}
                            onClick={() =>
                              onUpdateToneBrushSettings({
                                ...toneBrushSettings,
                                size: sz,
                              })
                            }
                            className={`flex-1 py-1 text-[10px] font-mono rounded border transition-colors ${
                              toneBrushSettings.size === sz
                                ? 'bg-blue-600/30 text-blue-300 border-blue-500 font-semibold'
                                : 'bg-[#222836] text-slate-400 border-transparent hover:text-slate-200'
                            }`}
                          >
                            {sz}px
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2 bg-blue-950/30 border border-blue-500/30 rounded text-[11px] text-blue-200 space-y-1">
                      <div className="font-semibold text-blue-300">🖌️ 專屬圖層擴展</div>
                      <p className="text-slate-300 leading-relaxed">
                        直接在當前選取的網點圖層繪製。筆觸自動對齊該圖層已設定的網點花紋與角度，<strong>淺藍色選區遮罩同步擴大</strong>。
                      </p>
                    </div>
                  </div>
                )}

                {/* Eraser Settings */}
                {t.id === 'eraser' && (
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="font-medium text-slate-200">橡皮擦大小 (Eraser Size)</span>
                        <span className="font-mono text-blue-400 font-semibold">{eraserSettings.size} px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="140"
                        value={eraserSettings.size}
                        onChange={(e) =>
                          onUpdateEraserSettings({
                            ...eraserSettings,
                            size: Number(e.target.value),
                          })
                        }
                        className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                      />
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {[4, 16, 32, 64, 96].map((sz) => (
                          <button
                            key={sz}
                            onClick={() =>
                              onUpdateEraserSettings({
                                ...eraserSettings,
                                size: sz,
                              })
                            }
                            className={`flex-1 py-1 text-[10px] font-mono rounded border transition-colors ${
                              eraserSettings.size === sz
                                ? 'bg-blue-600/30 text-blue-300 border-blue-500 font-semibold'
                                : 'bg-[#222836] text-slate-400 border-transparent hover:text-slate-200'
                            }`}
                          >
                            {sz}px
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2 bg-amber-950/30 border border-amber-600/30 rounded text-[11px] text-amber-200 space-y-1">
                      <div className="font-semibold text-amber-300">🧹 遮罩同步擦除</div>
                      <p className="text-slate-300 leading-relaxed">
                        精準擦除當前圖層的網點或墨線。擦除網點的同時，<strong>淺藍色工作區遮罩也會即時同步縮小</strong>。
                      </p>
                    </div>
                  </div>
                )}

                {/* Comic Dialogue Text Settings */}
                {t.id === 'text' && (
                  <div className="space-y-3.5 text-xs">
                    {/* Direction: Vertical vs Horizontal */}
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1.5">
                        <span className="font-medium text-slate-200">排版方向 (Typesetting)</span>
                        <span className="font-mono text-blue-400 font-semibold">
                          {textSettings.direction === 'vertical' ? '直排豎書' : '橫排橫書'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() =>
                            onUpdateTextSettings({
                              ...textSettings,
                              direction: 'vertical',
                            })
                          }
                          className={`py-1.5 px-2 rounded text-xs font-semibold border flex items-center justify-center gap-1 transition-all ${
                            textSettings.direction === 'vertical'
                              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                              : 'bg-[#222836] text-slate-400 border-[#2f374a] hover:text-slate-200'
                          }`}
                        >
                          <span>🀄 漫畫直排 (豎書)</span>
                        </button>
                        <button
                          onClick={() =>
                            onUpdateTextSettings({
                              ...textSettings,
                              direction: 'horizontal',
                            })
                          }
                          className={`py-1.5 px-2 rounded text-xs font-semibold border flex items-center justify-center gap-1 transition-all ${
                            textSettings.direction === 'horizontal'
                              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                              : 'bg-[#222836] text-slate-400 border-[#2f374a] hover:text-slate-200'
                          }`}
                        >
                          <span>➡️ 標準橫排 (橫書)</span>
                        </button>
                      </div>
                    </div>

                    {/* Font Size */}
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="font-medium text-slate-200">文字大小 (Font Size)</span>
                        <span className="font-mono text-blue-400 font-semibold">{textSettings.fontSize} px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={textSettings.fontSize}
                        onChange={(e) =>
                          onUpdateTextSettings({
                            ...textSettings,
                            fontSize: Number(e.target.value),
                          })
                        }
                        className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
                      />
                      <div className="flex items-center gap-1.5 mt-2">
                        {[16, 20, 26, 34, 48].map((sz) => (
                          <button
                            key={sz}
                            onClick={() =>
                              onUpdateTextSettings({
                                ...textSettings,
                                fontSize: sz,
                              })
                            }
                            className={`flex-1 py-1 text-[10px] font-mono rounded border transition-colors ${
                              textSettings.fontSize === sz
                                ? 'bg-blue-600/30 text-blue-300 border-blue-500 font-semibold'
                                : 'bg-[#222836] text-slate-400 border-transparent hover:text-slate-200'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Family */}
                    <div>
                      <span className="font-medium text-slate-200 block mb-1">字體風格 (Font Family)</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'sans-serif', label: '黑體 (Gothic)' },
                          { id: 'serif', label: '明體 (Mincho)' },
                          { id: 'system-ui', label: '現代無襯線' },
                          { id: 'monospace', label: '打字等寬體' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            onClick={() =>
                              onUpdateTextSettings({
                                ...textSettings,
                                fontFamily: f.id,
                              })
                            }
                            className={`py-1 px-2 text-[11px] rounded border transition-all text-left truncate ${
                              textSettings.fontFamily === f.id
                                ? 'bg-blue-600/25 text-blue-300 border-blue-500 font-medium'
                                : 'bg-[#202534] text-slate-400 border-[#2a3142] hover:text-slate-200'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Speech Balloon Outline (White Stroke for screentone contrast) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={textSettings.hasOutline}
                            onChange={(e) =>
                              onUpdateTextSettings({
                                ...textSettings,
                                hasOutline: e.target.checked,
                              })
                            }
                            className="accent-blue-500 rounded"
                          />
                          <span className="text-slate-200 font-medium">清晰白色描邊 (對話框必備)</span>
                        </label>
                        {textSettings.hasOutline && (
                          <span className="font-mono text-blue-400 text-[11px]">
                            {textSettings.outlineWidth}px
                          </span>
                        )}
                      </div>
                      {textSettings.hasOutline && (
                        <input
                          type="range"
                          min="1"
                          max="8"
                          value={textSettings.outlineWidth}
                          onChange={(e) =>
                            onUpdateTextSettings({
                              ...textSettings,
                              outlineWidth: Number(e.target.value),
                            })
                          }
                          className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg mt-1"
                        />
                      )}
                    </div>

                    {/* Color & Bold */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#2a3040]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">字色:</span>
                        <button
                          onClick={() =>
                            onUpdateTextSettings({
                              ...textSettings,
                              color: '#000000',
                            })
                          }
                          className={`w-5 h-5 rounded-full border ${
                            textSettings.color === '#000000'
                              ? 'bg-black border-blue-400 ring-2 ring-blue-500/50'
                              : 'bg-black border-slate-600'
                          }`}
                          title="純黑文字"
                        />
                        <button
                          onClick={() =>
                            onUpdateTextSettings({
                              ...textSettings,
                              color: '#ffffff',
                            })
                          }
                          className={`w-5 h-5 rounded-full border ${
                            textSettings.color === '#ffffff'
                              ? 'bg-white border-blue-400 ring-2 ring-blue-500/50'
                              : 'bg-white border-slate-300'
                          }`}
                          title="純白文字"
                        />
                      </div>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={textSettings.bold}
                          onChange={(e) =>
                            onUpdateTextSettings({
                              ...textSettings,
                              bold: e.target.checked,
                            })
                          }
                          className="accent-blue-500 rounded"
                        />
                        <span className="text-slate-300 font-medium">粗體 (Bold)</span>
                      </label>
                    </div>

                    <div className="p-2 bg-blue-950/30 border border-blue-500/30 rounded text-[11px] text-blue-200">
                      💬 在畫布上的對話框直接點擊即可放置文字，支援自由拖曳移動！
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
};
