// src/utils/mockData.js

/**
 * Hàm lấy chuỗi ngày hiện tại theo giờ địa phương (YYYY-MM-DD)
 * @param {number} offsetDays - Số ngày cộng/trừ so với hiện tại (VD: -1 là hôm qua)
 * @returns {string} Chuỗi định dạng ngày
 */
const getLocalDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  // Trừ đi timezone offset để đảm bảo không bị lệch ngày theo giờ GMT
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
};

// CÁC HẰNG SỐ VỀ THỜI GIAN
export const TODAY = getLocalDateString(0);
export const YESTERDAY = getLocalDateString(-1);

// DANH MỤC CÔNG VIỆC TRỰC NHẬT
export const TASK_CATEGORIES = {
  SWEEP_CORRIDOR: { title: 'Quét và lau hành lang chung', code: 'SWEEP_CORRIDOR' },
  CLEAN_BATHROOM: { title: 'Dọn nhà vệ sinh, cọ bồn rửa mặt', code: 'CLEAN_BATHROOM' },
  TAKE_OUT_TRASH: { title: 'Đổ rác khu vực chung', code: 'TAKE_OUT_TRASH' },
};

// DỮ LIỆU TÀI KHOẢN ĐĂNG NHẬP (Thêm nhiều phòng để test)
export const ROOM_ACCOUNTS = [
  { username: 'admin', password: '123', role: 'ADMIN', name: 'Ban Tự Quản' },
  { username: '114', password: '123', role: 'STUDENT', name: 'Phòng 114', roomId: '114', leaderPIN: '114' },
  { username: '101', password: '123', role: 'STUDENT', name: 'Phòng 101', roomId: '101', leaderPIN: '101' },
  { username: '102', password: '123', role: 'STUDENT', name: 'Phòng 102', roomId: '102', leaderPIN: '102' }, 
  { username: '103', password: '123', role: 'STUDENT', name: 'Phòng 103', roomId: '103', leaderPIN: '103' }, 
  { username: '104', password: '123', role: 'STUDENT', name: 'Phòng 104', roomId: '104', leaderPIN: '104' }, 
];

// DANH SÁCH THÀNH VIÊN TRONG PHÒNG
export const ROOM_MEMBERS = {
  '114': [
    { id: '23521011', name: 'Nghĩa', isLeader: true },
    { id: '23521012', name: 'Nhật', isLeader: false },
    { id: '23521013', name: 'Minh', isLeader: false },
    { id: '23521014', name: 'Hoàn', isLeader: false },
    { id: '23521015', name: 'Thái', isLeader: false },
    { id: '23521016', name: 'Sang', isLeader: false },
  ],
  '101': [
    { id: '24521011', name: 'Đào', isLeader: true },
    { id: '24521012', name: 'Thơi', isLeader: false },
    { id: '24521013', name: 'Thi', isLeader: false },
    { id: '24521014', name: 'Học', isLeader: false },
  ],
  '102': [
    { id: '25521011', name: 'Hùng', isLeader: true },
    { id: '25521012', name: 'Dũng', isLeader: false },
    { id: '25521013', name: 'Mạnh', isLeader: false },
    { id: '25521014', name: 'Trí', isLeader: false },
  ],
  '103': [
    { id: '26521011', name: 'Xuân', isLeader: true },
    { id: '26521012', name: 'Hạ', isLeader: false },
    { id: '26521013', name: 'Thu', isLeader: false },
    { id: '26521014', name: 'Đông', isLeader: false },
  ],
  '104': [
    { id: '27521011', name: 'Tý', isLeader: true },
    { id: '27521012', name: 'Sửu', isLeader: false },
    { id: '27521013', name: 'Dần', isLeader: false },
    { id: '27521014', name: 'Mão', isLeader: false },
  ]
};

// DỮ LIỆU LỊCH PHÂN CÔNG GIẢ LẬP
export const MOCK_SCHEDULES = [
  // ==================== LỊCH HÔM NAY (TODAY) ====================
  
  // 1. Phòng 114: Ca trực bình thường (Để bạn login vào nộp bài test Duyệt)
  {
    id: '114_today',
    date: TODAY,
    roomId: '114',
    taskCode: 'CLEAN_BATHROOM',
    timeFrame: '00:00 - 23:59',
    assignees: [
      { id: '23521011', name: 'Nghĩa' },
      { id: '23521012', name: 'Nhật' },
      { id: '23521013', name: 'Minh' },
    ],
    status: 'PENDING',
    isLate: false,
  },

  // 2. Phòng 101: Ca trực bình thường, ít người (Để test nộp bài luồng nhanh)
  {
    id: '101_today',
    date: TODAY,
    roomId: '101',
    taskCode: 'SWEEP_CORRIDOR',
    timeFrame: '00:00 - 9:28',
    assignees: [
      { id: '24521011', name: 'Đào' },
      { id: '24521012', name: 'Thơi' },
    ],
    status: 'PENDING',
    isLate: false,
  },

  // 3. Phòng 102: Ca trực ĐÃ HẾT GIỜ (Giả lập để test Admin có quyền ép duyệt/từ chối ngay không cần đợi)
  {
    id: '102_today',
    date: TODAY,
    roomId: '102',
    taskCode: 'TAKE_OUT_TRASH',
    timeFrame: '00:00 - 00:13', // Đã lố giờ
    assignees: [
      { id: '25521011', name: 'Hùng' },
      { id: '25521012', name: 'Dũng' },
    ],
    status: 'PENDING',
    isLate: true,
  },

  // 4. Phòng 103: TRƯỞNG PHÒNG QUÊN PHÂN CÔNG (Danh sách assignees trống)
  {
    id: '103_today',
    date: TODAY,
    roomId: '103',
    taskCode: 'SWEEP_CORRIDOR',
    timeFrame: '00:00 - 00:13',
    assignees: [], // Trống để test luồng tự nộp -> chờ trưởng phòng duyệt
    status: 'PENDING',
    isLate: false,
  },

  // ==================== LỊCH HÔM QUA (YESTERDAY) ====================
  // (Dùng để chuẩn bị test tính năng "Chốt sổ" sắp tới)

  // 5. Phòng 101 hôm qua: ĐÃ DUYỆT HOÀN TẤT
  {
    id: '101_yesterday',
    date: YESTERDAY,
    roomId: '101',
    taskCode: 'CLEAN_BATHROOM',
    timeFrame: '18:00 - 19:00',
    assignees: [{ id: '24521011', name: 'Đào' }],
    status: 'APPROVED',
    isLate: false,
    mockLogs: [
      { action: 'SUBMITTED', time: '18:30', note: 'Sinh viên Đào nộp bài' },
      { action: 'APPROVED', time: '19:00', note: 'Đã duyệt hoàn tất.' },
    ],
  },

  // 6. Phòng 104 hôm qua: BỎ TRỰC (Chưa ai làm gì, pending qua ngày)
  {
    id: '104_yesterday',
    date: YESTERDAY,
    roomId: '104',
    taskCode: 'SWEEP_CORRIDOR',
    timeFrame: '06:00 - 07:00',
    assignees: [
      { id: '27521011', name: 'Tý' },
      { id: '27521012', name: 'Sửu' },
    ],
    status: 'PENDING',
    isLate: true,
  },
];

// Lọc sẵn lịch của ngày hôm nay để dùng nhanh
export const MOCK_TODAY_SCHEDULE = MOCK_SCHEDULES.filter(
  (schedule) => schedule.date === TODAY
);