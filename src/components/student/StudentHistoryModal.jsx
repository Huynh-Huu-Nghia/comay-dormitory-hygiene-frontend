// src/components/student/StudentHistoryModal.jsx
import React, { useState } from 'react';
import { X, Check, Clock, AlertCircle } from 'lucide-react';

/**
 * Modal hiển thị lịch sử nộp/duyệt báo cáo của phòng
 */
const StudentHistoryModal = ({ roomId, onClose }) => {
  // Tối ưu: Dùng Lazy Initialization để đọc LocalStorage ngay lần đầu mở Modal
  // Tránh hiện tượng UI bị giật (flicker) do render mảng rỗng trước rồi mới cập nhật
  const [logs] = useState(() => {
    try {
      const savedLogs = localStorage.getItem(`logs_${roomId}`);
      return savedLogs ? JSON.parse(savedLogs) : [];
    } catch (e) {
      console.error('Lỗi khi đọc lịch sử logs:', e);
      return [];
    }
  });

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-opacity"
      role="dialog" 
      aria-modal="true"
    >
      <div className="w-full max-w-2xl animate-in zoom-in-95 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Lịch sử đánh giá</h3>
            <p className="text-sm font-semibold text-green-600">Phòng {roomId}</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng lịch sử"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Nội dung Timeline */}
        <div className="max-h-[60vh] overflow-y-auto bg-slate-50/50 p-6 custom-scrollbar">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Clock className="mb-4 h-12 w-12 text-slate-300" />
              <p className="font-medium text-slate-500">Phòng chưa có hoạt động nào hôm nay</p>
            </div>
          ) : (
            <div className="relative space-y-6">
              {/* Thanh dọc trục giữa */}
              <div className="absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2 bg-slate-200"></div>

              {logs.map((log, index) => {
                const isReject = log.action === 'REJECTED';
                const isApprove = log.action === 'APPROVED';
                const isSubmit = log.action === 'SUBMITTED';
                // Lưu ý: Việc check includes('Trưởng phòng') khá nhạy cảm nếu sau này đổi nội dung note
                const isLeader = log.note.includes('Trưởng phòng');
                const isInternal = log.isInternal;

                // Trái (Người đánh giá: Admin/Leader) - Phải (Người nộp bài: Sinh viên)
                const isEvaluatorAction = isReject || isApprove; 
                
                // Khởi tạo giao diện mặc định
                let title = '';
                let colors = { text: '', iconBg: '', boxBg: '', timeBg: 'bg-white/60' };
                let Icon = Clock;

                // 1️⃣ LOGIC NỘP BÀI
                if (isSubmit) {
                  Icon = Clock;
                  if (isInternal) {
                    title = 'Sinh viên phụ nộp';
                    colors = { text: 'text-amber-600', iconBg: 'bg-amber-100 text-amber-600', boxBg: 'bg-amber-50 border-amber-200' };
                  } else {
                    title = 'Đại diện phòng nộp';
                    colors = { text: 'text-blue-700', iconBg: 'bg-blue-100 text-blue-600', boxBg: 'bg-blue-50 border-blue-200' };
                  }
                } 
                // 2️⃣ LOGIC TRƯỞNG PHÒNG
                else if (isLeader) {
                  colors.boxBg = 'bg-white border-slate-200'; colors.timeBg = 'bg-slate-100';
                  if (isReject) {
                    title = 'Trưởng phòng (Từ chối)';
                    Icon = AlertCircle;
                    colors.text = 'text-rose-600'; colors.iconBg = 'bg-rose-100 text-rose-600';
                  } else {
                    title = 'Trưởng phòng (Đã duyệt)';
                    Icon = Check;
                    colors.text = 'text-teal-600'; colors.iconBg = 'bg-teal-100 text-teal-600';
                  }
                } 
                // 3️⃣ LOGIC ADMIN
                else {
                  colors.boxBg = 'bg-white border-slate-200'; colors.timeBg = 'bg-slate-100';
                  if (isReject) {
                    title = 'Ban tự quản (Từ chối)';
                    Icon = AlertCircle;
                    colors.text = 'text-rose-600'; colors.iconBg = 'bg-rose-100 text-rose-600';
                  } else {
                    title = 'Ban tự quản (Đã duyệt)';
                    Icon = Check;
                    colors.text = 'text-emerald-600'; colors.iconBg = 'bg-emerald-100 text-emerald-600';
                  }
                }

                return (
                  <div 
                    key={index} 
                    // Người đánh giá (Admin/Leader) nằm bên Trái (start), Người nộp bài nằm bên Phải (end)
                    className={`relative flex w-full items-center ${isEvaluatorAction ? 'justify-start' : 'justify-end'}`}
                  >
                    {/* Icon ghim ở giữa trục */}
                    <div className={`absolute left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#f9fafb] shadow-sm ${colors.iconBg}`}>
                      <Icon className="h-4 w-4 font-bold" />
                    </div>

                    {/* Khung nội dung */}
                    <div className="w-[calc(50%-1.5rem)]">
                      <div className={`rounded-xl border p-3.5 shadow-sm transition-shadow hover:shadow-md ${colors.boxBg}`}>
                        <div className="mb-2 flex flex-col items-start gap-1.5 xl:flex-row xl:items-center xl:justify-between">
                          <span className={`text-[13px] font-bold ${colors.text}`}>
                            {title}
                          </span>
                          <span className={`w-fit rounded-md px-2 py-0.5 text-[10px] font-bold text-slate-500 ${colors.timeBg}`}>
                            {log.time}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-[13px] font-medium leading-relaxed text-slate-700">
                          {log.note}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 bg-white px-6 py-5">
          <button 
            onClick={onClose} 
            className="rounded-xl border border-slate-200 bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
};

export default StudentHistoryModal;