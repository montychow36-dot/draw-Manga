import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Sliders, Check, Upload } from 'lucide-react';
import { ToneConfig, DotType } from '../../types/manga';
import { createTonePatternCanvas } from '../../utils/mangaScreentone';

interface DesignToneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTone: (tone: ToneConfig) => void;
  onApplyDirectly: (tone: ToneConfig) => void;
}

export const DesignToneModal: React.FC<DesignToneModalProps> = ({
  isOpen,
  onClose,
  onSaveTone,
  onApplyDirectly,
}) => {
  const [name, setName] = useState('自訂網點 · 55L');
  const [dotType, setDotType] = useState<DotType>('circle');
  const [lineCount, setLineCount] = useState<number>(55);
  const [density, setDensity] = useState<number>(0.25);
  const [angle, setAngle] = useState<number>(45);
  const [category, setCategory] = useState<'character' | 'clothing' | 'background' | 'custom'>('custom');

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Update Preview Canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Fill white paper background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const tempConfig: ToneConfig = {
      id: 'temp-preview',
      name,
      lineCount,
      density,
      dotType,
      angle,
      category,
    };

    const patternCanvas = createTonePatternCanvas(tempConfig, 1);
    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    if (pattern) {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);
      ctx.fillStyle = pattern;
      ctx.fillRect(-w * 2, -h * 2, w * 5, h * 5);
      ctx.restore();
    }
  }, [isOpen, name, dotType, lineCount, density, angle, category]);

  if (!isOpen) return null;

  const handleSave = () => {
    const newTone: ToneConfig = {
      id: `custom-tone-${Date.now()}`,
      name: name || '自訂網點',
      dotType,
      lineCount,
      density,
      angle,
      category,
    };
    onSaveTone(newTone);
    onClose();
  };

  const handleApply = () => {
    const newTone: ToneConfig = {
      id: `custom-tone-${Date.now()}`,
      name: name || '自訂網點',
      dotType,
      lineCount,
      density,
      angle,
      category,
    };
    onApplyDirectly(newTone);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-xl bg-[#171a22] border border-[#2b3140] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#1c202a] border-b border-[#2b3140] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">設計與調配自訂網點</h3>
              <p className="text-xs text-slate-400">精準調配點陣線數、幾何形狀、濃度與排列角度</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#282f3d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Top: Live Preview Canvas */}
          <div className="flex flex-col items-center">
            <div className="w-full h-44 rounded-xl bg-white border border-slate-300 shadow-inner overflow-hidden relative">
              <canvas
                ref={previewCanvasRef}
                width={500}
                height={176}
                className="w-full h-full block"
              />
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white">
                {lineCount}L · {Math.round(density * 100)}% · {angle}°
              </div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="space-y-3.5 text-xs">
            {/* Tone Name */}
            <div>
              <label className="text-slate-300 block mb-1">網點名稱標籤</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#14171f] border border-[#272e3d] rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="例如：自訂 55L 服裝粗陰影"
              />
            </div>

            {/* Dot Type Selector */}
            <div>
              <label className="text-slate-300 block mb-1.5">網點顆粒幾何形狀</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'circle', label: '圓點網' },
                  { id: 'line', label: '排線網' },
                  { id: 'cross', label: '雙向十字' },
                  { id: 'sand', label: '手繪沙目' },
                  { id: 'star', label: '少女漫星芒' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setDotType(type.id as DotType)}
                    className={`py-2 px-1 rounded-lg border text-center transition-all ${
                      dotType === type.id
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500 font-bold'
                        : 'bg-[#14171f] text-slate-400 border-[#252b38] hover:text-slate-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Screen Line Count (20L - 100L) */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>線數粗細 (Screen Lines)</span>
                <span className="font-mono text-blue-400">{lineCount}L</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={lineCount}
                onChange={(e) => setLineCount(Number(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>20L (極粗目)</span>
                <span>60L (漫畫標準)</span>
                <span>100L (超微細)</span>
              </div>
            </div>

            {/* Density (5% - 90%) */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>網點黑度濃度 (Density)</span>
                <span className="font-mono text-blue-400">{Math.round(density * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.85"
                step="0.02"
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
              />
            </div>

            {/* Rotation Angle (0° - 360°) */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>排列角度 (Angle)</span>
                <span className="font-mono text-blue-400">{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-[#252b38] rounded-lg"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="text-slate-300 block mb-1">庫存分類</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'character', label: '人物陰影' },
                  { id: 'clothing', label: '服裝布料' },
                  { id: 'background', label: '背景效果' },
                  { id: 'custom', label: '自訂專用' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id as any)}
                    className={`py-1 text-center rounded border transition-colors ${
                      category === c.id
                        ? 'bg-[#1e2738] text-blue-300 border-blue-500'
                        : 'bg-[#14171f] text-slate-400 border-[#252b38] hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#14171f] border-t border-[#252b38] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#222836] hover:bg-[#2c3447] text-slate-300 text-xs font-medium rounded-lg transition-colors"
          >
            取消
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-[#1f2738] hover:bg-[#29344d] text-cyan-300 border border-cyan-800/50 text-xs font-semibold rounded-lg transition-colors"
            >
              直接套用
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              儲存至庫存並使用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
