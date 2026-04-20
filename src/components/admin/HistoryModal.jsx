// src/components/admin/HistoryModal.jsx
import React from 'react';
import { X, Check, Clock } from 'lucide-react';

const HistoryModal = ({ data, onClose }) => {
  if (!data) return null;

  const hasLogs = data.logs && data.logs.length > 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl animate-in zoom-in-95 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 duration-200">
        
        {/* Phần Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Lịch sử hoạt động</h3>
            <p className="text-sm font-semibold text-blue-600">Phòng {data.room}</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
            aria-label="Đóng lịch sử"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Phần Nội dung (Timeline Căn Giữa) */}
        <div className="max-h-[60vh] overflow-y-auto bg-slate-50/50 p-6 custom-scrollbar">
          {!hasLogs ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Clock className="mb-4 h-12 w-12 text-slate-300" />
              <p className="font-medium text-slate-500">Chưa có dữ liệu lịch sử nào cho phòng này.</p>
            </div>
          ) : (
            <div className="relative space-y-6">
              
              {/* Thanh dọc trục giữa */}
              <div className="absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2 bg-slate-200"></div>

              {data.logs.map((log, index) => {
                const isReject = log.action === 'REJECTED';
                const isApprove = log.action === 'APPROVED';
                const isFailed = log.action === 'FAILED';
                const isLeader = log.note.includes('Trưởng phòng');
                
                // Admin Action chỉ khi nào KHÔNG phải của trưởng phòng
                const isAdminAction = (isReject || isApprove || isFailed) && !isLeader; 
                
                let title = 'Nộp báo cáo';
                let colors = { text: 'text-blue-600', iconBg: 'bg-blue-100 text-blue-600' };
                let Icon = Clock;

                if (isAdminAction) {
                  if (isReject) {
                    title = 'Yêu cầu làm lại';
                    Icon = X; 
                    colors = { text: 'text-rose-600', iconBg: 'bg-rose-100 text-rose-600' };
                  } else if (isApprove) {
                    title = 'Duyệt hoàn tất';
                    Icon = Check; 
                    colors = { text: 'text-emerald-600', iconBg: 'bg-emerald-100 text-emerald-600' };
                  } else {
                    title = 'Không hoàn thành';
                    Icon = X;
                    colors = { text: 'text-orange-600', iconBg: 'bg-orange-100 text-orange-600' };
                  }

                } else if (isLeader) {
                  title = 'Trưởng phòng đã duyệt';
                  Icon = Check; 
                  colors = { text: 'text-teal-600', iconBg: 'bg-teal-100 text-teal-600' };
                }

                return (
                  <div 
                    key={index} 
                    // Admin ở bên Phải (end), Người nộp/Trưởng phòng ở bên Trái (start)
                    className={`relative flex w-full items-center ${isAdminAction ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Icon ghim ở giữa trục */}
                    <div className={`absolute left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#f9fafb] shadow-sm ${colors.iconBg}`}>
                      <Icon className="h-4 w-4 font-bold" />
                    </div>

                    {/* Khung nội dung */}
                    <div className="w-[calc(50%-1.5rem)]">
                      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md">
                        <div className="mb-2 flex flex-col items-start gap-1.5 xl:flex-row xl:items-center xl:justify-between">
                          <span className={`text-[13px] font-bold ${colors.text}`}>
                            {title}
                          </span>
                          <span className="w-fit rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                            {log.time}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-[13px] font-medium leading-relaxed text-slate-600">
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
        
        {/* Phần Footer */}
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

export default HistoryModal;