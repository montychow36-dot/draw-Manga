import React, { useMemo } from 'react';
import {
  STANDARD_TONES,
  generateTonePreviewUrl,
  createTonePatternCanvas,
} from '../utils/mangaScreentone';
import { ToneConfig } from '../types/manga';
import { Plus, Download, PaintBucket, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

interface TonePanelProps {
  selectedTone: ToneConfig;
  onSelectTone: (tone: ToneConfig) => void;
  hasSelection: boolean;
  onFillSelection: () => void;
  onCreateToneLayer: (tone: ToneConfig) => void;
  onOpenDesignToneModal: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const TonePanel: React.FC<TonePanelProps> = ({
  selectedTone,
  onSelectTone,
  hasSelection,
  onFillSelection,
  onCreateToneLayer,
  onOpenDesignToneModal,
  isOpen,
  onToggleOpen,
}) => {
  // Precompute preview data URLs for the 8 standard tones
  const previewUrls = useMemo(() => {
    const urls: Record<string, string> = {};
    for (const t of STANDARD_TONES) {
      urls[t.id] = generateTonePreviewUrl(t, 80);
    }
    return urls;
  }, []);

  const handleExportTransparentTone = (tone: ToneConfig) => {
    // Generates a 1200x1600 seamless transparent pattern PNG
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

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={onToggleOpen}
        className={`fixed right-0 top-16 z-30 md:hidden bg-[#1a1e27] border border-[#2e3442] text-slate-300 p-1.5 rounded-l-md shadow-lg ${
          isOpen ? 'mr-80' : ''
        }`}
        title="開啟/關閉網點庫"
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <aside
        className={`w-80 bg-[#14171d] border-l border-[#232833] flex flex-col shrink-0 z-30 select-none transition-all duration-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0 hidden md:flex'
        }`}
      >
        {/* Panel Header */}
        <div className="p-3 border-b border-[#232833] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-white">標準漫畫網點目錄</span>
            <span className="text-[10px] bg-blue-950/80 text-blue-400 border border-blue-800/40 px-1.5 py-0.5 rounded">
              8 款經典
            </span>
          </div>

          <button
            onClick={onOpenDesignToneModal}
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
            title="調配自訂網點"
          >
            <Sparkles className="w-3 h-3" />
            <span>自訂</span>
          </button>
        </div>

        {/* Action Bar for Currently Selected Tone */}
        <div className="p-3 bg-[#181c24] border-b border-[#232833] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-400 text-[10px] block">當前選用網點</span>
              <span className="font-semibold text-slate-100">{selectedTone.name}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-[#242b3a] px-1.5 py-0.5 rounded">
              {selectedTone.lineCount}L / {Math.round(selectedTone.density * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={onFillSelection}
              disabled={!hasSelection}
              className={`flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs rounded font-medium transition-all ${
                hasSelection
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                  : 'bg-[#222836] text-slate-500 cursor-not-allowed'
              }`}
              title={hasSelection ? '填入當前選區' : '請先使用魔術棒或選區工具圈選區域'}
            >
              <PaintBucket className="w-3.5 h-3.5" />
              <span>填入所選區域</span>
            </button>

            <button
              onClick={() => onCreateToneLayer(selectedTone)}
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs rounded font-medium bg-[#222836] hover:bg-[#2c3447] text-slate-200 border border-[#2f374a] transition-colors"
              title="新增一個以此網點鋪底的新圖層"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增網點圖層</span>
            </button>
          </div>
        </div>

        {/* 8 Preset Grid */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {STANDARD_TONES.map((tone) => {
            const isSelected = selectedTone.id === tone.id;
            const previewUrl = previewUrls[tone.id];

            return (
              <div
                key={tone.id}
                onClick={() => onSelectTone(tone)}
                className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-600/10 border-blue-500 shadow-sm'
                    : 'bg-[#181c25] border-[#262c3b] hover:border-[#384157] hover:bg-[#1d222e]'
                }`}
              >
                {/* Pure White Background Tone Card Preview */}
                <div className="w-14 h-14 rounded-md overflow-hidden bg-white border border-slate-300 shadow-inner shrink-0 relative flex items-center justify-center">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt={tone.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset rounded-md pointer-events-none" />
                  )}
                </div>

                {/* Tone Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs font-semibold truncate ${
                        isSelected ? 'text-blue-400' : 'text-slate-200'
                      }`}
                    >
                      {tone.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                    <span className="font-mono">{tone.lineCount} 線 (L)</span>
                    <span>·</span>
                    <span className="font-mono">{Math.round(tone.density * 100)}% 濃度</span>
                    <span>·</span>
                    <span>{tone.angle}°</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateToneLayer(tone);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 hover:underline"
                      title="直接新增此網點圖層"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>建層</span>
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportTransparentTone(tone);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 hover:underline"
                      title="匯出此網點透明背景 PNG"
                    >
                      <Download className="w-2.5 h-2.5" />
                      <span>透明PNG</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
