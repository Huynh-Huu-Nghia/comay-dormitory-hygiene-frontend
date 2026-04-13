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

// DỮ LIỆU TÀI KHOẢN ĐĂNG NHẬP
export const ROOM_ACCOUNTS = [
  { username: 'admin', password: '123', role: 'ADMIN', name: 'Ban Tự Quản' },
  { username: '114', password: '123', role: 'STUDENT', name: 'Phòng 114', roomId: '114', leaderPIN: '114' },
  { username: '101', password: '123', role: 'STUDENT', name: 'Phòng 101', roomId: '101', leaderPIN: '101' },
  { username: '102', password: '123', role: 'STUDENT', name: 'Phòng 102', roomId: '102', leaderPIN: '102' }, // Đã fix lỗi chính tả 'learderPIN'
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
    { id: '24521015', name: 'Ty', isLeader: false },
    { id: '24521016', name: 'Song', isLeader: false },
  ],
};

// DỮ LIỆU LỊCH PHÂN CÔNG GIẢ LẬP
export const MOCK_SCHEDULES = [
  {
    id: '114',
    date: TODAY,
    roomId: '114',
    taskCode: 'CLEAN_BATHROOM',
    timeFrame: '00:00 - 19:58',
    assignees: [
      { id: '23521011', name: 'Nghĩa' },
      { id: '23521012', name: 'Nhật' },
      { id: '23521013', name: 'Minh' },
    ],
    status: 'PENDING',
    isLate: false,
  },
  {
    id: '101',
    date: TODAY,
    roomId: '101',
    taskCode: 'SWEEP_CORRIDOR',
    timeFrame: '00:00 - 15:00',
    assignees: [],
    status: 'PENDING',
    isLate: true,
  },
  // Lịch hôm qua - ĐÃ HOÀN THÀNH (Dùng để test lọc ngày bên trang Admin)
  {
    id: '101_old',
    date: YESTERDAY,
    roomId: '101',
    taskCode: 'CLEAN_BATHROOM',
    timeFrame: '18:00 - 19:00',
    assignees: [{ id: '24521011', name: 'Đào' }],
    status: 'APPROVED',
    isLate: false,
    mockLogs: [
      { action: 'SUBMITTED', time: '18:30', note: 'Sinh viên Đào nộp bài' }, // Cập nhật lại note cho logic với assignees
      { action: 'APPROVED', time: '19:00', note: 'Đã duyệt' },
    ],
    mockReport: {
      timeSubmitted: '18:30',
      imageUrl: 'https://via.placeholder.com/150',
    },
  },
];

// Lọc sẵn lịch của ngày hôm nay để dùng nhanh
export const MOCK_TODAY_SCHEDULE = MOCK_SCHEDULES.filter(
  (schedule) => schedule.date === TODAY
);