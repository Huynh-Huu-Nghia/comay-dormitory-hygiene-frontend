// src/components/student/ReportModal.jsx
import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

/**
 * Modal Nộp báo cáo công việc của Sinh viên
 */
const ReportModal = ({ roomId, taskTitle, studentId, studentName, onClose, onSuccess, isMainAssignee }) => {
  const [note, setNote] = useState('');

  const handleSubmitReport = (e) => {
    e.preventDefault();
    
    // Tối ưu: Xử lý chuỗi 1 lần duy nhất
    const cleanNote = note.trim();
    const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // 1. Lưu phiếu báo cáo RIÊNG cho sinh viên này
    const reportData = {
      id: Date.now(),
      room: roomId,
      taskName: taskTitle,
      studentId: studentId,
      studentName: studentName,
      timeSubmitted: timeNow,
      status: 'REVIEWING'
    };
    localStorage.setItem(`report_${roomId}_${studentId}_data`, JSON.stringify(reportData));

    // LƯU GHI CHÚ
    if (cleanNote !== '') {
      localStorage.setItem(`note_${roomId}_${studentId}`, cleanNote);
    } else {
      localStorage.removeItem(`note_${roomId}_${studentId}`);
    }

    // 2. Ghi sổ lịch sử (Tối ưu cách khởi tạo mảng an toàn)
    let currentLogs = [];
    try {
      const savedLogs = localStorage.getItem(`logs_${roomId}`);
      currentLogs = savedLogs ? JSON.parse(savedLogs) : [];
      if (!Array.isArray(currentLogs)) currentLogs = [];
    } catch (e) {
      console.error('Lỗi khi đọc lịch sử logs:', e);
    }

    // CẬP NHẬT LOGIC GHI CHÚ VÀO LỊCH SỬ
    let logNoteMsg = `Sinh viên ${studentName} đã nộp báo cáo ca trực`;
    if (cleanNote !== '') {
      logNoteMsg += `\nLời nhắn từ sinh viên: ${cleanNote}`;
    }

    currentLogs.push({
      action: 'SUBMITTED',
      time: timeNow,
      note: logNoteMsg,
      isInternal: !isMainAssignee,
    });
    localStorage.setItem(`logs_${roomId}`, JSON.stringify(currentLogs));

    // 3. Báo cáo lại cho Parent (cập nhật UI) và đóng Modal
    onSuccess(studentId);
    onClose();

    // Dùng setTimeout nhỏ để modal đóng mượt mà trước khi alert chặn trình duyệt
    setTimeout(() => {
      alert(`Đã gửi báo cáo cho ${studentName}!`);
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center transition-opacity">
      <div className="w-full max-w-md animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 rounded-t-2xl bg-white p-6 sm:rounded-2xl shadow-xl duration-200">
        
        {/* Header Modal */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Gửi báo cáo</h3>
            <p className="text-sm text-gray-500">
              Người trực: <span className="font-semibold text-green-600">{studentName}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Đóng"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmitReport} className="space-y-5">
          
          {/* Khu vực Upload Ảnh (Mock UI) */}
          <div>
            <div 
              role="button"
              tabIndex={0}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-8 transition-colors hover:border-green-400 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
            >
              <Upload className="mb-2 h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">Bấm để tải ảnh minh chứng</span>
            </div>
          </div>

          {/* Khu vực Nhập Ghi chú */}
          <div>
            <label htmlFor="studentNote" className="mb-2 block text-sm font-bold text-gray-700">
              Ghi chú cho Ban tự quản (Nếu có)
            </label>
            <textarea
              id="studentNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Vòi xịt bị hỏng nên em không chà sạch được góc tường..."
              className="h-24 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>

          {/* Nút Submit */}
          <button 
            type="submit" 
            className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow active:scale-[0.98]"
          >
            Xác nhận Hoàn thành
          </button>
        </form>

      </div>
    </div>
  );
};

export default ReportModal;