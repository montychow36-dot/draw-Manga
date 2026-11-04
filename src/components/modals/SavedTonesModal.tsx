import React, { useState } from 'react';
import { X, Bookmark, Download, Check, Trash2, Plus } from 'lucide-react';
import { ToneConfig } from '../../types/manga';
import { STANDARD_TONES, generateTonePreviewUrl, createTonePatternCanvas } from '../../utils/mangaScreentone';

interface SavedTonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTones: ToneConfig[];
  selectedTone: ToneConfig;
  onSelectTone: (tone: ToneConfig) => void;
  onDeleteCustomTone: (toneId: string) => void;
  onOpenDesignTone: () => void;
}

export const SavedTonesModal: React.FC<SavedTonesModalProps> = ({
  isOpen,
  onClose,
  savedTones,
  selectedTone,
  onSelectTone,
  onDeleteCustomTone,
  onOpenDesignTone,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const allTones = [...STANDARD_TONES, ...savedTones.filter((st) => !STANDARD_TONES.some((t) => t.id === st.id))];

  const filteredTones = activeCategory === 'all'
    ? allTones
    : allTones.filter((t) => (t.category || 'custom') === activeCategory);

  const handleDownloadTransparent = (tone: ToneConfig) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
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

    const a = document.createElement('a');
    a.download = `screentone_${tone.name.replace(/\s+/g, '_')}_transparent.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#171a22] border border-[#2b3140] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#1c202a] border-b border-[#2b3140] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">儲存的網點庫存目錄</h3>
              <p className="text-xs text-slate-400">依分類管理常用漫畫黑白網點、沙目與特效網</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#282f3d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-5 py-2.5 bg-[#14171f] border-b border-[#252b38] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs">
            {[
              { id: 'all', label: '全部網點' },
              { id: 'character', label: '人物陰影' },
              { id: 'clothing', label: '服裝布料' },
              { id: 'background', label: '背景效果' },
              { id: 'custom', label: '自訂上傳' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#202533]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenDesignTone();
            }}
            className="flex items-center gap-1 px-3 py-1 bg-[#222836] hover:bg-[#2c3447] text-cyan-300 rounded text-xs border border-[#2f374a] transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>自訂調配新網點</span>
          </button>
        </div>

        {/* Tones Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTones.map((tone) => {
            const isSelected = selectedTone.id === tone.id;
            const previewUrl = generateTonePreviewUrl(tone, 90);
            const isBuiltin = STANDARD_TONES.some((t) => t.id === tone.id);

            return (
              <div
                key={tone.id}
                onClick={() => {
                  onSelectTone(tone);
                  onClose();
                }}
                className={`flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-[#14171f] border-[#252b38] hover:border-[#384157] hover:bg-[#1a1e27]'
                }`}
              >
                {/* White card preview */}
                <div className="w-16 h-16 rounded-lg bg-white border border-slate-300 overflow-hidden shadow-inner shrink-0 relative flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt={tone.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{tone.name}</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                    <span className="font-mono">{tone.lineCount}L</span>
                    <span>·</span>
                    <span className="font-mono">{Math.round(tone.density * 100)}%</span>
                    <span>·</span>
                    <span>{tone.angle}°</span>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadTransparent(tone);
                      }}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 hover:underline"
                      title="下載透明背景 PNG 貼圖"
                    >
                      <Download className="w-3 h-3" />
                      <span>下載透明PNG</span>
                    </button>

                    {!isBuiltin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCustomTone(tone.id);
                        }}
                        className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-0.5 hover:underline"
                        title="刪除此自訂網點"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>刪除</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#14171f] border-t border-[#252b38] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#222836] hover:bg-[#2c3447] text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            完成關閉
          </button>
        </div>
      </div>
    </div>
  );
};
