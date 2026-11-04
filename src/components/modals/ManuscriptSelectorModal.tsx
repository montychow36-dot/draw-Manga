import React, { useRef } from 'react';
import { X, Image as ImageIcon, Upload, Check } from 'lucide-react';
import { SAMPLE_MANUSCRIPTS, SampleManuscript } from '../../utils/sampleManuscripts';

interface ManuscriptSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeManuscriptId: string;
  onSelectSampleManuscript: (sample: SampleManuscript) => void;
  onUploadCustomFile: (file: File) => void;
}

export const ManuscriptSelectorModal: React.FC<ManuscriptSelectorModalProps> = ({
  isOpen,
  onClose,
  activeManuscriptId,
  onSelectSampleManuscript,
  onUploadCustomFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-xl bg-[#171a22] border border-[#2b3140] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[#1c202a] border-b border-[#2b3140] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">更換漫畫手稿底圖</h3>
              <p className="text-xs text-slate-400">切換經典預設手稿或從本機選取個人原稿</p>
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
        <div className="p-5 space-y-4">
          {/* Upload Custom File Banner */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUploadCustomFile(e.target.files[0]);
                onClose();
              }
            }}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-xl border-2 border-dashed border-[#2f374a] hover:border-emerald-500/60 bg-[#14171f] hover:bg-[#191e28] cursor-pointer transition-all flex items-center justify-center gap-3 text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                從本機電腦或手機上傳手稿圖片
              </h4>
              <p className="text-[11px] text-slate-400">
                支援 PNG、JPEG、WebP，系統將自動按原圖解析度建立乾淨墨線與網點圖層
              </p>
            </div>
          </div>

          {/* Preloaded Manuscripts */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">
              手稿範本庫 (含您拍照上傳的手繪多格草稿)
            </span>
            <div className="space-y-2.5">
              {SAMPLE_MANUSCRIPTS.map((m) => {
                const isSelected = activeManuscriptId === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      onSelectSampleManuscript(m);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow-sm'
                        : 'bg-[#14171f] border-[#252b38] hover:border-[#384157] hover:bg-[#191d26]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{m.name}</span>
                        {isSelected && (
                          <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.2 rounded border border-blue-700/50 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            使用中
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-md">{m.description}</p>
                    </div>

                    <button
                      className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#222836] text-slate-300 hover:text-white'
                      }`}
                    >
                      {isSelected ? '重新載入' : '切換使用'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#14171f] border-t border-[#252b38] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#222836] hover:bg-[#2c3447] text-slate-300 text-xs font-semibold rounded-lg transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
