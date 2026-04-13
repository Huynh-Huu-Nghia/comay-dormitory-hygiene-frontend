// src/hooks/useTaskStatus.js
import { useState } from 'react';

/**
 * Custom Hook quản lý trạng thái công việc của sinh viên trong phòng
 * @param {string} roomId - Mã phòng (VD: '114')
 * @param {Array} allMembers - Danh sách toàn bộ thành viên trong phòng
 * @param {Array} assignees - Danh sách thợ chính (người được phân công trực tiếp)
 */
export const useTaskStatus = (roomId, allMembers, assignees) => {

  // 1. Khởi tạo State an toàn từ LocalStorage
  const [assigneeStatuses, setAssigneeStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem(`task_${roomId}_statuses`);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.error('Lỗi khi đọc trạng thái task:', error);
    }
    
    // Nếu không có dữ liệu hoặc lỗi, tạo mới mặc định
    const initial = {};
    allMembers.forEach(student => {
      initial[student.id] = 'PENDING';
    });
    return initial;
  });

  // 2. Xử lý khi sinh viên nộp báo cáo thành công
  const handleReportSuccess = (studentId) => {
    const isMainAssignee = assignees.some(a => a.id === studentId);
    
    let isLeaderMode = false;
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      isLeaderMode = currentUser.isLeaderMode === true;
    } catch (e) {
      console.error('Lỗi khi đọc thông tin user:', e);
    }

    // Nếu là Thợ chính hoặc đang ở chế độ Trưởng phòng -> Bỏ qua bước chờ TP duyệt
    const nextStatus = (isMainAssignee || isLeaderMode) ? 'REVIEWING' : 'WAITING_LEADER';
    
    const newStatuses = { ...assigneeStatuses, [studentId]: nextStatus };
    setAssigneeStatuses(newStatuses);
    localStorage.setItem(`task_${roomId}_statuses`, JSON.stringify(newStatuses));
  };

  // 3. Xử lý Trưởng phòng Duyệt / Từ chối
  const handleLeaderAction = (studentId, studentName, actionType) => {
    const isApprove = actionType === 'APPROVE';

    // Cập nhật Status
    // Duyệt -> REVIEWING (Đẩy lên Admin) | Từ chối -> REJECTED (Bắt làm lại)
    const nextStatus = isApprove ? 'REVIEWING' : 'REJECTED';
    const newStatuses = { ...assigneeStatuses, [studentId]: nextStatus };
    
    setAssigneeStatuses(newStatuses);
    localStorage.setItem(`task_${roomId}_statuses`, JSON.stringify(newStatuses));

    // Ghi sổ lịch sử (Log)
    const logsKey = `logs_${roomId}`;
    let currentLogs = [];
    try {
      const savedLogs = localStorage.getItem(logsKey);
      if (savedLogs) currentLogs = JSON.parse(savedLogs);
      if (!Array.isArray(currentLogs)) currentLogs = [];
    } catch (error) {
      console.error('Lỗi khi đọc logs:', error);
    }
    
    const leaderLog = {
      action: isApprove ? 'APPROVED' : 'REJECTED',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      note: isApprove 
        ? `Trưởng phòng đã duyệt báo cáo của ${studentName}` 
        : `Trưởng phòng từ chối báo cáo của ${studentName}.`,
      // CHÌA KHÓA: Từ chối là chuyện nội bộ (isInternal: true -> giấu Admin)
      isInternal: !isApprove
    };

    currentLogs.push(leaderLog);
    localStorage.setItem(logsKey, JSON.stringify(currentLogs));
  };

  return { 
    assigneeStatuses, 
    handleReportSuccess, 
    handleLeaderAction 
  };
};