
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  variant = 'primary'
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${variant === 'danger' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-100 mb-2">{title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-800 text-slate-400 font-semibold hover:bg-slate-800 transition-colors"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 py-3 px-4 rounded-xl text-white font-bold transition-all shadow-lg active:scale-[0.98] ${
                variant === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/40' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/40'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
