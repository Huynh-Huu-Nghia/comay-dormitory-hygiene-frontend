// src/components/admin/RoomDetailModal.jsx
import React, { useState } from 'react';
import { X, Check, CheckSquare, XCircle, Clock, User, Paperclip, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const RoomDetailModal = ({ data, onClose, onAction }) => {
  const [adminNote, setAdminNote] = useState('');
  
  if (!data) return null;

  // Tiêu chí mẫu (Hardcode dùng tạm để test luồng)
  const sampleCriteria = [
    { id: 1, text: 'Sàn nhà khô ráo, không rác' },
    { id: 2, text: 'Bồn rửa mặt sạch sẽ' },
    { id: 3, text: 'Đã đổ rác' }
  ];

  // Hàm xử lý logic Duyệt/Từ chối tách biệt cho gọn JSX
  const handleStudentAction = (student, actionType) => {
    onAction(data.room, actionType, student.id, adminNote);
    
    if (actionType === 'APPROVED') {
      toast.success(`Đã duyệt báo cáo của ${student.name}!`);
    } else {
      toast.error(`Đã yêu cầu ${student.name} làm lại!`);
    }
    
    // Xóa trắng ghi chú sau khi thực hiện hành động
    setAdminNote('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <div>
            <h3 id="modal-title" className="text-xl font-black text-slate-900">Chi tiết phòng {data.room}</h3>
            
            {/* THÊM HIỂN THỊ GIỜ TRỰC CHO ADMIN */}
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-sm font-bold text-blue-600">{data.taskName}</span>
              {data.timeFrame && (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1 rounded border border-orange-100 bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600">
                    <Clock className="h-3.5 w-3.5" /> {data.timeFrame}
                  </span>
                </>
              )}
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="rounded-full bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng cửa sổ"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Cột 1: Tiêu chí chấm điểm mẫu & Ghi chú */}
            <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-800">
                <CheckSquare className="h-4 w-4 text-blue-500" /> TIÊU CHÍ KIỂM TRA (MẪU)
              </h4>
              <div className="space-y-3">
                {sampleCriteria.map(item => (
                  <label key={item.id} className="group flex cursor-pointer items-start gap-3">
                    <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-slate-600 transition-colors group-hover:text-slate-900">{item.text}</span>
                  </label>
                ))}
              </div>
              
              <textarea 
                className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" 
                placeholder="Ghi chú thêm của BTQ (nếu có)..."
                rows="3"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>

            {/* Cột 2: Tiến độ từng cá nhân */}
            <div className="space-y-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
                <User className="h-4 w-4 text-emerald-500" /> TIẾN ĐỘ THÀNH VIÊN
              </h4>
              
              {data.assignees?.map(student => {
                const isReviewing = student.status === 'REVIEWING';
                const isApproved = student.status === 'APPROVED';
                const isRejected = student.status === 'REJECTED';

                return (
                  <div key={student.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{student.name}</span>
                      <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">
                        <Clock className="h-3 w-3"/> {student.timeFrame}
                      </span>
                    </div>

                    {/* KHU VỰC HIỂN THỊ GHI CHÚ CỦA SINH VIÊN */}
                    {student.note && (
                      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 shadow-inner">
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-yellow-600">
                          <MessageSquare className="h-3 w-3" /> Lời nhắn từ sinh viên:
                        </div>
                        <p className="whitespace-pre-wrap italic leading-relaxed">"{student.note}"</p>
                      </div>
                    )}

                    {/* Nút xem minh chứng */}
                    {student.status !== 'PENDING' ? (
                      <button className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50 text-xs font-bold text-blue-600 transition hover:bg-blue-100">
                        <Paperclip className="mr-1.5 h-4 w-4" /> Xem ảnh minh chứng
                      </button>
                    ) : (
                      <div className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-400">
                        Chưa nộp bài
                      </div>
                    )}

                    {/* Nút hành động cá nhân */}
                    {isReviewing && (
                      <div className="mt-1 flex gap-2">
                        <button 
                          onClick={() => handleStudentAction(student, 'REJECTED')}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-black text-rose-500 transition-all hover:border-rose-200 hover:bg-rose-50"
                        >
                          <XCircle className="h-4 w-4" /> TỪ CHỐI
                        </button>
                        <button 
                          onClick={() => handleStudentAction(student, 'APPROVED')}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-100 transition-all hover:bg-emerald-600"
                        >
                          <Check className="h-4 w-4" /> DUYỆT
                        </button>
                      </div>
                    )}
                    
                    {/* Trạng thái đã chốt */}
                    {isApproved && (
                      <div className="flex items-center justify-center gap-1 rounded-xl border border-emerald-100 bg-emerald-50 py-2.5 text-[10px] font-black text-emerald-500">
                        <Check className="h-4 w-4" /> ĐÃ ĐẠT YÊU CẦU
                      </div>
                    )}
                    {isRejected && (
                      <div className="flex items-center justify-center gap-1 rounded-xl border border-rose-100 bg-rose-50 py-2.5 text-[10px] font-black text-rose-500">
                        <XCircle className="h-4 w-4" /> YÊU CẦU LÀM LẠI
                      </div>
                    )}
                  </div>
                );
              })}
              
              {(!data.assignees || data.assignees.length === 0) && (
                <div className="text-center py-6 text-slate-400 text-sm font-medium bg-white rounded-2xl border border-slate-200 border-dashed">
                  Chưa có sinh viên nào được phân công.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="flex justify-end border-t border-slate-100 bg-white px-6 py-5">
          <button 
            onClick={onClose} 
            className="rounded-xl border border-slate-200 bg-slate-100 px-8 py-2.5 text-sm font-black text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
          >
            Hoàn tất
          </button>
        </div>

      </div>
    </div>
  );
};

export default RoomDetailModal;