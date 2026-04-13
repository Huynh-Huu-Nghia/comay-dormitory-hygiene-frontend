// src/pages/student/StudentHome.jsx
import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp, History } from 'lucide-react';

import { MOCK_TODAY_SCHEDULE, ROOM_MEMBERS, TASK_CATEGORIES } from '../../utils/mockData';
import { useTaskStatus } from '../../hooks/student/useTaskStatus';

import Header from '../../components/student/Header';
import StudentTaskItem from '../../components/student/StudentTaskItem';
import ReportModal from '../../components/student/ReportModal';
import StudentHistoryModal from '../../components/student/StudentHistoryModal';

const StudentHome = () => {
  // --- 1. Xác thực tài khoản (Tối ưu hóa) ---
  // Lazy initialization: Chỉ đọc localStorage 1 lần khi load trang
  const [currentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const roomId = currentUser?.roomId;

  // Khai báo TẤT CẢ các hooks trước khi có bất kỳ dòng 'return' nào
  const [activeTab, setActiveTab] = useState('schedule');
  const [showHelper, setShowHelper] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // --- 2. Xử lý Dữ liệu ---
  const mySchedule = MOCK_TODAY_SCHEDULE.find((sch) => sch.roomId === roomId);
  const myTask = mySchedule ? TASK_CATEGORIES[mySchedule.taskCode] : null;

  const assignees = mySchedule?.assignees || [];
  const allMembers = ROOM_MEMBERS[roomId] || [];
  const unassignedMembers = allMembers.filter(
    (member) => !assignees.some((a) => a.id === member.id)
  );

  const { assigneeStatuses, handleReportSuccess, handleLeaderAction } = useTaskStatus(
    roomId,
    allMembers,
    assignees
  );

  const activeHelpers = unassignedMembers.filter((m) => assigneeStatuses[m.id] !== 'PENDING');
  const idleHelpers = unassignedMembers.filter((m) => assigneeStatuses[m.id] === 'PENDING');

  // --- 3. Bắt lỗi không có quyền truy cập (Đặt sau khi đã gọi hết Hooks) ---
  if (!roomId) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <AlertCircle className="mb-4 h-16 w-16 text-red-500 animate-bounce" />
        <p className="text-lg font-semibold text-gray-800">Không tìm thấy phiên đăng nhập</p>
        <p className="text-sm text-gray-500">Vui lòng quay lại trang chủ và đăng nhập lại.</p>
      </div>
    );
  }

  // --- 4. Render Giao diện chính ---
  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-gray-50 shadow-2xl">
      <Header currentUser={currentUser} roomId={roomId} />

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Nhiệm vụ hôm nay</h2>

            {myTask ? (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    {myTask.code}
                  </span>
                  {mySchedule?.timeFrame && (
                    <span className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600 shadow-sm">
                      <Clock className="h-4 w-4" />
                      {mySchedule.timeFrame}
                    </span>
                  )}
                </div>

                <h3 className="mb-2 text-lg font-bold text-gray-800">{myTask.title}</h3>
                <p className="mb-4 text-sm text-gray-600">{myTask.description}</p>

                <div className="mb-2">
                  <p className="mb-3 text-sm font-semibold text-gray-700">Phân công thực hiện:</p>
                  <div className="flex flex-col gap-3">
                    
                    {/* Thợ chính */}
                    {!assignees || assignees.length === 0 ? (
                      <div className="flex items-center gap-3 py-1">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-gray-400 bg-gray-50 text-sm font-bold text-gray-400">
                          ?
                        </div>
                        <span className="text-sm italic text-gray-500">Chưa phân công</span>
                      </div>
                    ) : (
                      assignees.map((student) => (
                        <StudentTaskItem
                          key={student.id}
                          student={student}
                          status={assigneeStatuses[student.id]}
                          onActionClick={setSelectedStudent}
                          isLeaderMode={currentUser?.isLeaderMode}
                          onLeaderAction={handleLeaderAction}
                        />
                      ))
                    )}

                    {/* Thợ phụ (Active) */}
                    {activeHelpers.map((student) => (
                      <div key={student.id} className="mt-2 border-t border-dashed border-gray-200 pt-3">
                        <StudentTaskItem
                          student={student}
                          status={assigneeStatuses[student.id]}
                          onActionClick={setSelectedStudent}
                          isHelper={true}
                          isLeaderMode={currentUser?.isLeaderMode}
                          onLeaderAction={handleLeaderAction}
                        />
                      </div>
                    ))}

                    {/* Thợ phụ (Idle) - Ẩn/Hiện */}
                    {idleHelpers.length > 0 && (
                      <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
                        <button
                          onClick={() => setShowHelper(!showHelper)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                        >
                          {showHelper ? 'Ẩn danh sách' : 'Danh sách các thành viên còn lại'}
                          {showHelper ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        {showHelper && (
                          <div className="mt-3 flex flex-col gap-3 transition-all duration-300">
                            {idleHelpers.map((member) => (
                              <StudentTaskItem
                                key={member.id}
                                student={member}
                                status={assigneeStatuses[member.id]}
                                onActionClick={setSelectedStudent}
                                isHelper={true}
                                isLeaderMode={currentUser?.isLeaderMode}
                                onLeaderAction={handleLeaderAction}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => setShowHistory(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    <History className="h-4 w-4" />
                    Xem lịch sử duyệt
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-400" />
                <h3 className="text-lg font-bold text-gray-800">Tuyệt vời!</h3>
                <p className="mt-2 text-sm text-gray-500">Phòng của bạn không có lịch trực hôm nay.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedStudent && (
        <ReportModal
          roomId={roomId}
          taskTitle={myTask.title}
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          onClose={() => setSelectedStudent(null)}
          onSuccess={handleReportSuccess}
          isMainAssignee={assignees.some((a) => a.id === selectedStudent.id)}
        />
      )}

      {showHistory && (
        <StudentHistoryModal roomId={roomId} onClose={() => setShowHistory(false)} />
      )}

      {/* Footer Navigation Giả */}
      <div className="absolute bottom-0 z-20 w-full max-w-md border-t border-gray-200 bg-white px-6 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-center">
          <span className="text-sm font-bold text-green-600">Lịch trực</span>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;