import React from 'react';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Bookmark,
  Sparkles,
  Image as ImageIcon,
  Download,
} from 'lucide-react';

interface HeaderProps {
  exportWidth: number;
  exportHeight: number;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onZoomFit: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  hasSelection: boolean;
  onInvertSelection: () => void;
  onDeselect: () => void;
  isLayerPanelOpen: boolean;
  onToggleLayerPanel: () => void;
  layerCount: number;
  onOpenSavedTones: () => void;
  onOpenDesignTone: () => void;
  onOpenManuscriptSelector: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  exportWidth,
  exportHeight,
  zoom,
  onZoomChange,
  onZoomFit,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  hasSelection,
  onInvertSelection,
  onDeselect,
  isLayerPanelOpen,
  onToggleLayerPanel,
  layerCount,
  onOpenSavedTones,
  onOpenDesignTone,
  onOpenManuscriptSelector,
  onOpenExport,
}) => {
  return (
    <header className="h-14 bg-[#14171d] border-b border-[#232833] flex items-center justify-between px-3 md:px-5 shrink-0 z-40 select-none">
      {/* Left: Manuscript dimensions & Layer button */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Brand mark */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-xs text-white shadow">
            網
          </div>
          <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
            Manga Screentone Studio
          </span>
        </div>

        <div className="h-4 w-px bg-[#2b303c] mx-1 hidden sm:block" />

        {/* Manuscript Size Label */}
        <div className="text-xs font-mono text-slate-400 bg-[#1c202a] px-2.5 py-1 rounded border border-[#2e3442] flex items-center gap-1.5">
          <span className="text-slate-300 font-semibold">{exportWidth} × {exportHeight}</span>
          <span className="text-[10px] text-slate-400 font-sans hidden md:inline">原尺寸光柵</span>
        </div>
      </div>

      {/* Middle: Viewport Zoom Controls */}
      <div className="hidden lg:flex items-center gap-1 bg-[#1a1e27] p-0.5 rounded-lg border border-[#2b313e]">
        <button
          onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
          className="p-1 text-slate-400 hover:text-white hover:bg-[#282f3d] rounded transition-colors"
          title="縮小"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs font-mono font-medium text-slate-200 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => onZoomChange(Math.min(5, zoom + 0.1))}
          className="p-1 text-slate-400 hover:text-white hover:bg-[#282f3d] rounded transition-colors"
          title="放大"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-3 w-px bg-[#333a4a] mx-0.5" />

        <button
          onClick={() => onZoomChange(1)}
          className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-white hover:bg-[#282f3d] rounded transition-colors"
          title="100% 原始大小"
        >
          100%
        </button>

        <button
          onClick={onZoomFit}
          className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-slate-400 hover:text-white hover:bg-[#282f3d] rounded transition-colors"
          title="適應畫面"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Fit</span>
        </button>
      </div>

      {/* Right: History, Selections & Modals */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-[#1c202a] rounded border border-[#2e3442] p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo
                ? 'text-slate-300 hover:text-white hover:bg-[#293040]'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="復原 (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo
                ? 'text-slate-300 hover:text-white hover:bg-[#293040]'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Selection Tools (Ctrl+Shift+I / Ctrl+D) */}
        {hasSelection && (
          <div className="flex items-center gap-1 bg-blue-950/40 border border-blue-500/40 rounded px-1.5 py-0.5">
            <button
              onClick={onInvertSelection}
              className="text-[11px] text-blue-300 hover:text-blue-100 hover:underline px-1 py-0.5"
              title="反選選取區 (Ctrl+Shift+I)"
            >
              反選
            </button>
            <span className="text-blue-500/50">|</span>
            <button
              onClick={onDeselect}
              className="text-[11px] text-blue-300 hover:text-blue-100 px-1 py-0.5"
              title="取消選取 (Ctrl+D)"
            >
              取消
            </button>
          </div>
        )}

        {/* Modal Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSavedTones}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#1c202a] hover:bg-[#252b38] text-slate-300 hover:text-white rounded border border-[#2e3442] transition-colors"
            title="開啟個人網點庫存目錄"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">儲存的網點</span>
          </button>

          <button
            onClick={onOpenDesignTone}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#1c202a] hover:bg-[#252b38] text-slate-300 hover:text-white rounded border border-[#2e3442] transition-colors"
            title="開啟自訂手繪或調配網點參數視窗"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">設計網點</span>
          </button>

          <button
            onClick={onOpenManuscriptSelector}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#1c202a] hover:bg-[#252b38] text-slate-300 hover:text-white rounded border border-[#2e3442] transition-colors"
            title="更換手稿或從本機上傳圖片"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">更換手稿</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-[#1c202a] hover:bg-[#252b38] text-slate-200 hover:text-white rounded border border-[#2e3442] shadow-sm transition-all"
            title="開啟高畫質匯出對話框"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">匯出</span>
          </button>

          <div className="h-4 w-px bg-[#2b303c] mx-0.5" />

          {/* Studio Panel (Tone & Layer) Toggle Button on the Right */}
          <button
            onClick={onToggleLayerPanel}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all border shadow-sm ${
              isLayerPanelOpen
                ? 'bg-blue-600 text-white border-blue-500 shadow-blue-900/30 ring-1 ring-blue-400/40'
                : 'bg-[#1c202a] text-slate-300 hover:text-white border-[#2e3442] hover:bg-[#252b38]'
            }`}
            title="開啟/關閉 網點與圖層工作面板 (快捷鍵或右側按鈕)"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>網點與圖層</span>
            <span className={`text-[10px] px-1 rounded-sm ${isLayerPanelOpen ? 'bg-blue-700 text-white' : 'bg-[#293040] text-slate-300'}`}>
              {layerCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
