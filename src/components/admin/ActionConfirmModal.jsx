// src/components/admin/ActionConfirmModal.jsx
import React, { useState } from 'react';
import { AlertCircle, X, Check } from 'lucide-react';

const ActionConfirmModal = ({ isOpen, onClose, onConfirm, config }) => {
  const [note, setNote] = useState(config?.defaultNote || '');
  const [error, setError] = useState('');

  if (!isOpen || !config) return null;

  const isReject = config.actionType.includes('REJECTED');

  const handleConfirm = () => {
    // Ràng buộc: Nếu là Bắt làm lại thì BẮT BUỘC phải nhập lý do
    if (isReject && note.trim().length < 5) {
      setError('Vui lòng nhập lý do cụ thể (ít nhất 5 ký tự) để sinh viên sửa sai.');
      return;
    }
    
    onConfirm(config.room, config.actionType, config.studentId, note.trim());
    setNote('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 zoom-in-95 animate-in duration-200">
        
        {/* Header */}
        <div className={`flex items-center gap-3 border-b border-slate-100 px-6 py-5 ${isReject ? 'bg-rose-50' : 'bg-blue-50'}`}>
          {isReject ? <AlertCircle className="h-6 w-6 text-rose-500" /> : <Check className="h-6 w-6 text-blue-500" />}
          <div>
            <h3 className={`font-bold ${isReject ? 'text-rose-700' : 'text-blue-700'}`}>
              {config.title}
            </h3>
            <p className="text-xs font-semibold opacity-80">Phòng {config.room}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            {isReject ? 'Lý do bắt làm lại / Ghi chú (Bắt buộc):' : 'Ghi chú cho sinh viên (Không bắt buộc):'}
          </label>
          <textarea
            autoFocus
            className={`w-full rounded-xl border p-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              error ? 'border-rose-300 bg-rose-50 focus:ring-rose-200' : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-200'
            }`}
            rows="4"
            placeholder={isReject ? "Ví dụ: Sàn nhà còn rác, bồn rửa mặt chưa chùi..." : "Lời khen hoặc nhắc nhở thêm..."}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (error) setError('');
            }}
          />
          {error && <p className="mt-2 text-[11px] font-bold text-rose-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button 
            onClick={onClose}
            className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleConfirm}
            className={`rounded-xl px-5 py-2 text-sm font-bold text-white shadow-md transition-all ${
              isReject ? 'bg-rose-500 shadow-rose-200 hover:bg-rose-600' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
            }`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmModal;