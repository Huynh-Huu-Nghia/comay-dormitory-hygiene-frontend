// src/hooks/useAdminData.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { MOCK_SCHEDULES, TASK_CATEGORIES, TODAY } from "../../utils/mockData";

// ============================================================================
// UTILITY FUNCTIONS (HÀM HỖ TRỢ DÙNG CHUNG)
// ============================================================================

/**
 * @function safeJSONParse
 * @description Phân tích chuỗi JSON an toàn. Ngăn chặn ứng dụng bị crash (White Screen of Death) 
 * khi dữ liệu trong LocalStorage bị hỏng hoặc bị can thiệp sai định dạng.
 * @param {string} key - Khóa (key) lưu trong LocalStorage.
 * @param {any} fallback - Giá trị mặc định trả về nếu parse thất bại.
 * @returns {any} Dữ liệu đã parse hoặc giá trị fallback.
 */
const safeJSONParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`[Storage Warning]: Failed to parse JSON for key "${key}". Using fallback.`, error);
    return fallback;
  }
};

/**
 * @function isShiftOver
 * @description Kiểm tra thời gian hiện tại đã vượt quá thời gian kết thúc ca trực hay chưa.
 * Dùng để mở khóa tính năng "Duyệt/Từ chối hàng loạt" cho Ban tự quản (Admin).
 * @param {string} timeFrame - Chuỗi thời gian trực, định dạng kỳ vọng: "HH:mm - HH:mm".
 * @returns {boolean} True nếu đã hết giờ trực hoặc parse lỗi (fail-safe), False nếu vẫn trong giờ.
 */
const isShiftOver = (timeFrame) => {
  if (!timeFrame) return true;
  
  try {
    const endTimeStr = timeFrame.split('-')[1]?.trim();
    if (!endTimeStr) return true;
    
    const [endHour, endMinute] = endTimeStr.split(':').map(Number);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour > endHour) return true;
    if (currentHour === endHour && currentMinute >= endMinute) return true;
    
    return false;
  } catch (error) {
    console.error("[Time Parsing Error]: Invalid timeFrame format:", error);
    return true; // Trả về true để không block flow của Admin nếu có lỗi data
  }
};

/**
 * @function calculateRoomStatus
 * @description Business logic cốt lõi để quyết định trạng thái tổng thể (Overall Status) của một phòng.
 * @param {number} total - Tổng số sinh viên được phân công.
 * @param {number} approved - Số lượng đã duyệt đạt.
 * @param {number} reviewing - Số lượng đang chờ duyệt.
 * @param {number} rejected - Số lượng bị từ chối/yêu cầu làm lại.
 * @param {number} pending - Số lượng chưa nộp bài.
 * @param {boolean} shiftIsOver - Cờ xác định đã hết thời gian trực hay chưa.
 * @returns {{ overallStatus: string, progressText: string }} Trạng thái hệ thống và Text hiển thị cho UI.
 */
const calculateRoomStatus = (total, approved, reviewing, rejected, pending, shiftIsOver) => {
  // Case 1: Phòng trống
  if (total === 0) {
    return { overallStatus: 'PENDING', progressText: 'Chưa phân công' };
  }

  // Case 2: Đã hoàn tất (Có người đạt, không ai kẹt ở khâu chờ duyệt/làm lại, và (hết giờ hoặc mọi người đều đã nộp))
  if (approved > 0 && reviewing === 0 && rejected === 0 && (shiftIsOver || pending === 0)) {
    return { overallStatus: 'APPROVED', progressText: `Hoàn tất (${approved}/${total} bạn đạt)` };
  } 
  
  // Case 3: Có ít nhất 1 người bị từ chối -> Yêu cầu làm lại
  if (rejected > 0) {
    return { overallStatus: 'NEEDS_FIX', progressText: 'Có lỗi - Làm lại' };
  } 
  
  // Case 4: Có bài đang chờ Admin duyệt
  if (reviewing > 0) {
    return { overallStatus: 'READY_TO_REVIEW', progressText: `Chờ duyệt (${reviewing} bạn)` };
  } 
  
  // Case 5: Đang trong tiến trình (Đã có người đạt HOẶC có người đã nộp bài)
  if (approved > 0 || pending < total) {
    return { overallStatus: 'IN_PROGRESS', progressText: `Đang làm (${reviewing + approved}/${total})` };
  }

  // Default: Chưa ai làm gì cả
  return { overallStatus: 'PENDING', progressText: `0/${total} Chưa làm` };
};


// ============================================================================
// MAIN CUSTOM HOOK: useAdminData
// ============================================================================

const useAdminData = () => {
  // --- STATE MANAGEMENT ---
  const [allReports, setAllReports] = useState([]); // Master data: Toàn bộ báo cáo trong ngày
  const [selectedDate, setSelectedDate] = useState(TODAY); // Ngày đang chọn
  const [filter, setFilter] = useState('ALL'); // Trạng thái bộ lọc UI
  const [forceRender, setForceRender] = useState(0); // Trigger re-render sau khi mutation (update DB/Storage)

  // --- DATA FETCHING & ENRICHMENT LAYER ---
  useEffect(() => {
    // Lọc danh sách lịch trực theo ngày được chọn
    const schedulesForDate = MOCK_SCHEDULES.filter(schedule => schedule.date === selectedDate);

    // Xử lý và làm giàu dữ liệu (Enrichment) từ LocalStorage
    const enrichedReports = schedulesForDate.map(sch => {
      const savedStatuses = safeJSONParse(`task_${sch.roomId}_statuses`, {});
      const savedLogs = safeJSONParse(`logs_${sch.roomId}`, []);
      
      // Admin không xem các log hệ thống nội bộ (isInternal)
      const adminVisibleLogs = savedLogs.filter(log => log.isInternal !== true);
      const logsToUse = adminVisibleLogs.length > 0 ? adminVisibleLogs : (sch.mockLogs || []);

      let roomHasNote = false; 
      const shiftIsOver = isShiftOver(sch.timeFrame);

      // Map trạng thái và ghi chú cho từng sinh viên
      const updatedAssignees = sch.assignees.map(student => {
        const studentNote = localStorage.getItem(`note_${sch.roomId}_${student.id}`);
        if (studentNote) roomHasNote = true; 

        return {
          ...student,
          status: savedStatuses[student.id] || 'PENDING',
          note: studentNote || '' 
        };
      });

      // Tính toán các chỉ số thống kê (Metrics)
      const total = updatedAssignees.length;
      const reviewing = updatedAssignees.filter(a => a.status === 'REVIEWING').length;
      const approved = updatedAssignees.filter(a => a.status === 'APPROVED').length;
      const rejected = updatedAssignees.filter(a => a.status === 'REJECTED').length;
      const pending = updatedAssignees.filter(a => a.status === 'PENDING').length;

      // Lấy trạng thái tổng quan dựa trên business logic
      const { overallStatus, progressText } = calculateRoomStatus(
        total, approved, reviewing, rejected, pending, shiftIsOver
      );

      // Cờ cho phép Admin dùng chức năng Bulk Action (Duyệt/Từ chối tất cả)
      const canBulkAction = shiftIsOver || (pending === 0);

      return {
        ...sch,
        room: sch.roomId,
        taskName: TASK_CATEGORIES[sch.taskCode]?.title || 'Nhiệm vụ',
        assignees: updatedAssignees,
        overallStatus,
        progressText,
        total,
        completedCount: reviewing + approved,
        rejectCount: rejected,
        logs: logsToUse,
        hasNote: roomHasNote,
        canBulkAction
      };
    });

    setAllReports(enrichedReports);
  }, [forceRender, selectedDate]); 
  // Note: Không đưa 'filter' vào dependencies để tránh việc chui vào LocalStorage lấy data mỗi khi user click chuyển tab.

  // --- DERIVED STATE (LỌC DỮ LIỆU) ---
  // Dùng useMemo để cache kết quả lọc, chỉ tính toán lại khi allReports hoặc filter thay đổi. Tối ưu hiệu năng UI.
  const filteredReports = useMemo(() => {
    switch (filter) {
      case 'PENDING':
        return allReports.filter(r => r.overallStatus === 'PENDING');
      case 'REVIEWING':
        return allReports.filter(r => ['READY_TO_REVIEW', 'IN_PROGRESS'].includes(r.overallStatus));
      case 'REJECTED':
        return allReports.filter(r => r.overallStatus === 'NEEDS_FIX');
      case 'APPROVED':
        return allReports.filter(r => r.overallStatus === 'APPROVED');
      case 'ALL':
      default:
        return allReports;
    }
  }, [allReports, filter]);

  // --- MUTATION LAYER (XỬ LÝ HÀNH ĐỘNG) ---
  // Dùng useCallback để UI components không bị re-render do function reference bị thay đổi liên tục.
  const handleAction = useCallback((roomId, actionType, studentId = null, adminNote = '') => {
    const statusKey = `task_${roomId}_statuses`;
    const currentStatuses = safeJSONParse(statusKey, {});
    
    let actionNote = '';
    const logAction = actionType.includes('APPROVED') ? 'APPROVED' : 'REJECTED';

    // Lấy data phòng từ Master Data (allReports) để tránh bug mất data khi đang ở các tab filter cụ thể
    const roomData = allReports.find(r => r.room === roomId);
    if (!roomData) {
      console.error(`[Data Error]: Cannot find room ${roomId} to execute action.`);
      return;
    }

    // 1. Xử lý Bulk Action (Thao tác hàng loạt)
    if (actionType === 'APPROVED_ALL' || actionType === 'REJECTED_ALL') {
      const newStatus = actionType === 'APPROVED_ALL' ? 'APPROVED' : 'REJECTED';
      
      const reviewingStudents = roomData.assignees.filter(
        s => currentStatuses[s.id] === 'REVIEWING' || s.status === 'REVIEWING'
      );

      if (reviewingStudents.length === 0) return;

      // Cập nhật trạng thái cho toàn bộ sinh viên đang chờ duyệt
      reviewingStudents.forEach(s => {
        currentStatuses[s.id] = newStatus;
      });

      // Tạo câu log tương ứng
      const isWholeRoom = reviewingStudents.length === roomData.total;
      if (isWholeRoom) {
        actionNote = `Ban tự quản đã ${newStatus === 'APPROVED' ? 'duyệt hoàn tất' : 'từ chối'} báo cáo của toàn bộ phòng`;
      } else {
        const names = reviewingStudents.map(s => s.name).join(', ');
        actionNote = `Ban tự quản đã ${newStatus === 'APPROVED' ? 'duyệt' : 'yêu cầu làm lại'} báo cáo của: ${names}`;
      }
    } 
    // 2. Xử lý Individual Action (Thao tác cá nhân)
    else if (studentId) {
      currentStatuses[studentId] = actionType;
      const studentName = roomData.assignees?.find(a => a.id === studentId)?.name || 'sinh viên';
      actionNote = `Ban tự quản đã ${actionType === 'APPROVED' ? 'duyệt' : 'yêu cầu làm lại'} báo cáo của ${studentName}`;
    }

    // --- LƯU VÀO DATABASE (MÔ PHỎNG QUA LOCALSTORAGE) ---
    localStorage.setItem(statusKey, JSON.stringify(currentStatuses));

    const logsKey = `logs_${roomId}`;
    const currentLogs = safeJSONParse(logsKey, []);
    
    // Gắn thêm ghi chú của Admin nếu có
    const finalNote = adminNote && adminNote.trim() !== '' 
      ? `${actionNote}\nLời nhắn từ BTQ: ${adminNote}`
      : actionNote;

    currentLogs.push({
      action: logAction,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      note: finalNote
    });
    
    localStorage.setItem(logsKey, JSON.stringify(currentLogs));

    // Bắn tín hiệu để React lifecycle fetch lại dữ liệu mới nhất
    setForceRender(prev => prev + 1);
  }, [allReports]);

  // Trả về reports dưới dạng filtered data để UI component sử dụng trực tiếp
  return { 
    reports: filteredReports, 
    selectedDate, 
    setSelectedDate, 
    filter, 
    setFilter, 
    handleAction 
  };
};

export default useAdminData;