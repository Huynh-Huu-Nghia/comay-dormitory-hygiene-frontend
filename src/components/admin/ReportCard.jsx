// src/components/admin/ReportCard.jsx
import React from 'react';
import { User, X, Check, History, AlertCircle, ChevronRight, MessageSquare, Clock } from 'lucide-react';

const ReportCard = ({ data, onAction, onViewHistory, onViewDetails }) => {
  // 1. CÁC BIẾN TRẠNG THÁI (DERIVED STATE)
  const isUnassigned = !data.assignees || data.assignees.length === 0;
  const isEmptyRoom = isUnassigned && data.total === 0;
  const isActuallyApproved = data.overallStatus === 'APPROVED' && data.total > 0;
  const isReadyOrProgress = data.overallStatus === 'READY_TO_REVIEW' || data.overallStatus === 'IN_PROGRESS';

  const progressPercent = (data.total && data.total > 0) 
    ? (data.completedCount / data.total) * 100 
    : 0;

  const rejectionCount = data.logs 
    ? data.logs.filter(log => log.status === 'REJECTED' || log.action === 'REJECTED').length 
    : 0;

  const hasBeenRejected = 
    rejectionCount > 0 || 
    data.status === 'REJECTED' || 
    (!isUnassigned && data.assignees.some(student => student.status === 'REJECTED'));

  // 2. CÁC HÀM HELPER HIỂN THỊ DỮ LIỆU
  const getBadgeStyle = () => {
    if (isActuallyApproved) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (isReadyOrProgress) return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-slate-50 text-slate-500 border-slate-100';
  };

  const getProgressColor = () => {
    if (isEmptyRoom) return 'bg-slate-300';
    if (progressPercent === 100) return 'bg-emerald-500';
    return 'bg-blue-500';
  };

  const renderAssigneeText = () => {
    if (isEmptyRoom) return 'Chờ thành viên tự giác';
    if (isUnassigned) return 'Đang cập nhật...';
    
    const firstStudent = data.assignees[0]?.name || 'Ẩn danh';
    const othersCount = data.assignees.length - 1;
    return othersCount > 0 ? `${firstStudent} + ${othersCount} bạn khác` : firstStudent;
  };

  return (
    <div 
      onClick={() => onViewDetails(data)}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition-all hover:shadow-xl cursor-pointer
      ${data.hasNote ? 'border-yellow-300' : 'border-slate-200 hover:border-blue-200'}
      ${isEmptyRoom ? 'opacity-90' : ''}
    `}>
      
      {/* --- HEADER & STATUS --- */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Phòng</span>
          <span className="text-2xl font-black leading-none text-slate-900">{data.room}</span>
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
          {data.hasNote && (
            <span className="flex animate-pulse items-center gap-1 rounded-lg border border-yellow-200 bg-yellow-50 px-2 py-1 text-[9px] font-black text-yellow-700">
              <MessageSquare className="h-3 w-3" /> CÓ LỜI NHẮN
            </span>
          )}

          {data.isLate && (
            <span className="flex items-center gap-1 rounded-lg border border-orange-100 bg-orange-50 px-2 py-1 text-[9px] font-black text-orange-600">
              <AlertCircle className="h-3 w-3" /> TRỰC TRỄ
            </span>
          )}

            <span className={`rounded-lg border px-2 py-1 text-[9px] font-black uppercase ${
              data.overallStatus === 'NOT_COMPLETED'
                ? 'bg-rose-50 text-rose-600 border-rose-100'
                : isEmptyRoom
                  ? 'bg-slate-100 text-slate-500 border-slate-200'
                  : getBadgeStyle()
            }`}>
              {data.progressText}
            </span>
        </div>
      </div>

      {/* --- TASK & PROGRESS BAR --- */}
      <div className="mb-6">
        <p className="mb-3 line-clamp-1 leading-relaxed text-sm font-bold text-slate-700">
          {data.taskName}
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full border border-slate-200/50 bg-slate-100">
          <div 
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
            className={`h-full transition-all duration-500 ease-out ${getProgressColor()}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* --- INFO BOX --- */}
      <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span className={`text-[11px] font-bold ${isEmptyRoom ? 'italic text-slate-400' : 'text-slate-600'}`}>
              {renderAssigneeText()}
            </span>
          </div>
          {/* Nút Chi Tiết đã được gỡ bỏ theo yêu cầu, nhường sự kiện click cho toàn bộ Card */}
        </div>
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="mt-auto flex items-center justify-between gap-3">
        <div className="flex flex-1 gap-2">
          
          {isReadyOrProgress && (
            data.canBulkAction ? (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn sự kiện click nổi bọt lên Card
                    onAction(data.room, 'REJECTED_ALL');
                  }} 
                  className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white text-[10px] font-black text-red-500 transition-colors hover:border-red-200 hover:bg-red-50"
                >
                  <X className="h-4 w-4" /> LÀM LẠI
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn sự kiện click nổi bọt lên Card
                    onAction(data.room, 'APPROVED_ALL');
                  }} 
                  className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-500 text-[10px] font-black text-white shadow-md shadow-emerald-100 transition-all hover:bg-emerald-600"
                >
                  <Check className="h-4 w-4" /> DUYỆT
                </button>
              </>
            ) : (
              // NẾU CHƯA HẾT GIỜ VÀ CÒN NGƯỜI PENDING
              <div className="flex h-10 flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[10px] font-black text-slate-400">
                 <Clock className="mr-1 h-3.5 w-3.5" /> CHƯA HẾT GIỜ (CHỜ NỘP)
              </div>
            )
          )}
          
          {isActuallyApproved && (
            <div className="flex h-10 flex-1 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-[10px] font-black text-emerald-700">
              <Check className="mr-1 h-4 w-4" /> ĐÃ HOÀN TẤT
            </div>
          )}

        </div>

        {/* Nút Xem Lịch Sử */}
        <div className="flex items-center">
          <button 
            title="Xem lịch sử duyệt"
            aria-label={`Xem lịch sử duyệt phòng ${data.room}`}
            onClick={(e) => {
              e.stopPropagation(); // Ngăn chặn sự kiện nổi bọt (event bubbling)
              onViewHistory(data);
            }}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              hasBeenRejected 
                ? 'border-rose-300 bg-rose-50 text-rose-600 shadow-sm shadow-rose-100 hover:bg-rose-100'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <History size={18} />
            {rejectionCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm shadow-rose-200 ring-2 ring-white">
                {rejectionCount}
              </span>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

export default ReportCard;