// src/components/student/StudentTaskItem.jsx
import React from 'react';
import { User, Upload, AlertCircle, XCircle, CheckCircle } from 'lucide-react';

/**
 * Hiển thị một dòng sinh viên trong danh sách phân công
 */
const StudentTaskItem = ({ 
  student, 
  status, 
  onActionClick, 
  isHelper = false, 
  isLeaderMode, 
  onLeaderAction 
}) => {
  const btnStyle = isHelper 
    ? "bg-blue-50 text-blue-600 hover:bg-blue-100" 
    : "bg-green-100 text-green-700 hover:bg-green-200";

  // Tách logic hiển thị Nút/Trạng thái ra một hàm riêng để dễ bảo trì
  const renderActionArea = () => {
    switch (status) {
      case 'PENDING':
        return (
          <button 
            onClick={() => onActionClick(student)}
            className={`flex items-center gap-1 rounded px-3 py-1.5 text-xs font-semibold transition ${btnStyle}`}
          >
            <Upload className="h-3 w-3" /> Báo cáo
          </button>
        );

      case 'REVIEWING':
        return (
          <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            Đang chờ duyệt
          </span>
        );

      case 'WAITING_LEADER':
        if (isLeaderMode) {
          return (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onLeaderAction(student.id, student.name, 'REJECT')}
                className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-100"
              >
                <XCircle className="h-3 w-3" /> Từ chối
              </button>
              
              <button 
                onClick={() => onLeaderAction(student.id, student.name, 'APPROVE')}
                className="flex items-center gap-1 rounded border border-teal-200 bg-teal-50 px-2 py-1.5 text-xs font-bold text-teal-600 shadow-sm transition hover:bg-teal-100"
              >
                <CheckCircle className="h-3 w-3" /> Duyệt
              </button>
            </div>
          );
        }
        return (
          <span className="rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
            Chờ TP duyệt
          </span>
        );

      case 'APPROVED':
        return (
          <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            Đã duyệt
          </span>
        );

      case 'REJECTED':
        if (isHelper) {
          return (
            <span className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
              Đã từ chối
            </span>
          );
        }
        return (
          <button 
            onClick={() => onActionClick(student)}
            className="flex items-center gap-1 rounded bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200"
          >
            <AlertCircle className="h-3 w-3" /> Làm lại
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 shadow-sm transition-colors hover:bg-gray-100/50">
      
      {/* Cột trái: Thông tin */}
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <User className="h-4 w-4 text-gray-400" />
          <span>{student.name}</span>
        </div>
        
        <div className="mt-1 text-[11px] font-medium text-gray-400">
          {isHelper ? 'Thành viên hỗ trợ' : 'Thành viên phân công'}
        </div>
      </div>
      
      {/* Cột phải: Gọi hàm render đã tách ở trên */}
      <div>
        {renderActionArea()}
      </div>
      
    </div>
  );
};

export default StudentTaskItem;