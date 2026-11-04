import React, { useState } from 'react';
import { X, Download, FileImage, Layers, CheckCircle2 } from 'lucide-react';
import { Layer } from '../../types/manga';
import { renderToneToCanvas } from '../../utils/mangaScreentone';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  layers: Layer[];
  activeLayerId: string;
  exportWidth: number;
  exportHeight: number;
  workingWidth: number;
  workingHeight: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  layers,
  activeLayerId,
  exportWidth,
  exportHeight,
  workingWidth,
  workingHeight,
}) => {
  const [exportTarget, setExportTarget] = useState<'full' | 'active_tone' | 'lineart'>('full');
  const [scaleFactor, setScaleFactor] = useState<number>(1); // 1 = 100% (2400x3200), 0.5 = 50% (1200x1600)
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetW = Math.round(exportWidth * scaleFactor);
  const targetH = Math.round(exportHeight * scaleFactor);
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const handleExecuteExport = async () => {
    setIsExporting(true);

    try {
      // 1. Create master export canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = targetW;
      exportCanvas.height = targetH;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas context');

      // If full page or JPEG, fill clean white paper background
      if (exportTarget === 'full' || format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      const scaleMultiplier = targetW / workingWidth;

      if (exportTarget === 'full') {
        // Stack all visible layers
        for (const layer of layers) {
          if (!layer.visible) continue;
          ctx.save();
          ctx.globalAlpha = layer.opacity;
          ctx.globalCompositeOperation = layer.blendMode;

          if (layer.type === 'base') {
            // Draw base canvas scaled to master resolution
            ctx.drawImage(layer.canvas, 0, 0, targetW, targetH);
          } else if (layer.type === 'tone' && layer.toneConfig) {
            // Render high-definition rasterized screentone
            const toneCanvas = document.createElement('canvas');
            toneCanvas.width = targetW;
            toneCanvas.height = targetH;
            const scaledBounds = layer.bounds
              ? {
                  minX: layer.bounds.minX * scaleMultiplier,
                  minY: layer.bounds.minY * scaleMultiplier,
                  maxX: layer.bounds.maxX * scaleMultiplier,
                  maxY: layer.bounds.maxY * scaleMultiplier,
                }
              : undefined;

            renderToneToCanvas(
              toneCanvas,
              layer.toneConfig,
              {
                ...layer.transform,
                x: layer.transform.x * scaleMultiplier,
                y: layer.transform.y * scaleMultiplier,
              },
              undefined,
              scaleMultiplier,
              scaledBounds
            );

            // Use the layer proxy canvas as an alpha mask
            const alphaMask = document.createElement('canvas');
            alphaMask.width = targetW;
            alphaMask.height = targetH;
            const aCtx = alphaMask.getContext('2d');
            if (aCtx) {
              aCtx.drawImage(layer.maskCanvas || layer.canvas, 0, 0, targetW, targetH);
              const tCtx = toneCanvas.getContext('2d');
              if (tCtx) {
                tCtx.globalCompositeOperation = 'destination-in';
                tCtx.drawImage(alphaMask, 0, 0);
              }
            }

            ctx.drawImage(toneCanvas, 0, 0);
          } else {
            // Ink or extracted lineart layer
            ctx.drawImage(layer.canvas, 0, 0, targetW, targetH);
          }

          ctx.restore();
        }
      } else if (exportTarget === 'active_tone' && activeLayer) {
        // Render only active tone layer with transparent backing
        if (activeLayer.toneConfig) {
          const toneCanvas = document.createElement('canvas');
          toneCanvas.width = targetW;
          toneCanvas.height = targetH;

          const scaledBounds = activeLayer.bounds
            ? {
                minX: activeLayer.bounds.minX * scaleMultiplier,
                minY: activeLayer.bounds.minY * scaleMultiplier,
                maxX: activeLayer.bounds.maxX * scaleMultiplier,
                maxY: activeLayer.bounds.maxY * scaleMultiplier,
              }
            : undefined;

          renderToneToCanvas(
            toneCanvas,
            activeLayer.toneConfig,
            {
              ...activeLayer.transform,
              x: activeLayer.transform.x * scaleMultiplier,
              y: activeLayer.transform.y * scaleMultiplier,
            },
            undefined,
            scaleMultiplier,
            scaledBounds
          );

          // Alpha mask from proxy
          const aCtx = toneCanvas.getContext('2d');
          if (aCtx) {
            const alphaMask = document.createElement('canvas');
            alphaMask.width = targetW;
            alphaMask.height = targetH;
            const amCtx = alphaMask.getContext('2d');
            if (amCtx) {
              amCtx.drawImage(activeLayer.maskCanvas || activeLayer.canvas, 0, 0, targetW, targetH);
              aCtx.globalCompositeOperation = 'destination-in';
              aCtx.drawImage(alphaMask, 0, 0);
            }
          }
          ctx.drawImage(toneCanvas, 0, 0);
        } else {
          ctx.drawImage(activeLayer.canvas, 0, 0, targetW, targetH);
        }
      } else if (exportTarget === 'lineart') {
        const lineartLayer = layers.find((l) => l.type === 'lineart') || layers[0];
        ctx.drawImage(lineartLayer.canvas, 0, 0, targetW, targetH);
      }

      // Convert to blob and trigger download
      const mime = format;
      const extension = format === 'image/jpeg' ? 'jpg' : 'png';
      const fileName = `manga_${exportTarget}_${targetW}x${targetH}_${Date.now()}.${extension}`;

      const dataUrl = exportCanvas.toDataURL(mime, 0.95);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-lg bg-[#171a22] border border-[#2b3140] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[#1c202a] border-b border-[#2b3140] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">高解析度漫畫作品匯出</h3>
              <p className="text-xs text-slate-400">輸出印刷級清晰點陣或單獨透明網點圖層</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#282f3d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Target Mode */}
          <div>
            <label className="text-slate-300 block mb-1.5 font-semibold">匯出目標內容</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: 'full',
                  label: '整張完整手稿 (含墨線、底圖與全部網點)',
                  desc: '印刷出版、社群分享標準規格',
                },
                {
                  id: 'active_tone',
                  label: `單獨匯出作用中圖層「${activeLayer?.name || '網點層'}」`,
                  desc: '透明背景 PNG，便於導入其他軟體二次編輯',
                },
                {
                  id: 'lineart',
                  label: '分離純墨線稿 (透明底)',
                  desc: '僅匯出純黑色墨線線稿層',
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setExportTarget(opt.id as any)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                    exportTarget === opt.id
                      ? 'bg-blue-600/15 border-blue-500 text-blue-200'
                      : 'bg-[#14171f] border-[#252b38] text-slate-300 hover:bg-[#1b1f2b]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      exportTarget === opt.id ? 'border-blue-500 bg-blue-600' : 'border-slate-500'
                    }`}
                  >
                    {exportTarget === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <span className="font-semibold block">{opt.label}</span>
                    <span className="text-[11px] text-slate-400">{opt.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Options */}
          <div>
            <label className="text-slate-300 block mb-1.5 font-semibold">輸出解析度尺寸</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setScaleFactor(1)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  scaleFactor === 1
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-[#14171f] border-[#252b38] text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-white">100% 原始印刷尺寸</div>
                <div className="font-mono text-[11px] text-blue-400 mt-0.5">
                  {exportWidth} × {exportHeight} px
                </div>
                <div className="text-[10px] text-slate-400 mt-1">印刷級極致清晰度 (600 DPI)</div>
              </button>

              <button
                onClick={() => setScaleFactor(0.5)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  scaleFactor === 0.5
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-[#14171f] border-[#252b38] text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-white">50% 輕量預覽尺寸</div>
                <div className="font-mono text-[11px] text-blue-400 mt-0.5">
                  {Math.round(exportWidth * 0.5)} × {Math.round(exportHeight * 0.5)} px
                </div>
                <div className="text-[10px] text-slate-400 mt-1">適合社群分享與網路預覽</div>
              </button>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="text-slate-300 block mb-1.5 font-semibold">圖片檔案格式</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat('image/png')}
                className={`py-2 px-3 rounded-lg border text-center transition-all ${
                  format === 'image/png'
                    ? 'bg-[#1e2738] border-blue-500 text-blue-300 font-bold'
                    : 'bg-[#14171f] border-[#252b38] text-slate-400 hover:text-white'
                }`}
              >
                PNG 無損 (支援透明背景)
              </button>

              <button
                onClick={() => setFormat('image/jpeg')}
                className={`py-2 px-3 rounded-lg border text-center transition-all ${
                  format === 'image/jpeg'
                    ? 'bg-[#1e2738] border-blue-500 text-blue-300 font-bold'
                    : 'bg-[#14171f] border-[#252b38] text-slate-400 hover:text-white'
                }`}
              >
                JPEG (白紙底色 / 壓縮檔案)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#14171f] border-t border-[#252b38] flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            預計規格: {targetW} × {targetH} px · {format === 'image/png' ? 'PNG' : 'JPEG'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#222836] hover:bg-[#2c3447] text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleExecuteExport}
              disabled={isExporting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? '光柵化渲染中...' : '確認並下載'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
