// src/pages/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, LogOut, CalendarDays, LayoutDashboard, X, Check, Clock } from 'lucide-react';
import useAdminData from '../../hooks/admin/useAdminData';
import ReportCard from '../../components/admin/ReportCard';
import HistoryModal from '../../components/admin/HistoryModal';
import RoomDetailModal from '../../components/admin/RoomDetailModal';
import ActionConfirmModal from '../../components/admin/ActionConfirmModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Tầng dữ liệu: Gọi Logic từ Hook
  const { reports, selectedDate, setSelectedDate, filter, setFilter, handleAction } = useAdminData();
  
  // Tầng giao diện: State quản lý hiển thị Modal
  const [historyModal, setHistoryModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null); 
  
  // Tầng điều phối: State quản lý luồng xác nhận hành động (Interceptor)
  const [confirmModalConfig, setConfirmModalConfig] = useState(null); 

  // Truy xuất dữ liệu realtime cho Modal Chi tiết
  const activeModalData = detailModal ? reports.find(r => r.room === detailModal.room) : null;
  
  // Tính toán bộ thống kê
  const statusCounts = {
    ALL: reports.length,
    PENDING: reports.filter(r => r.overallStatus === 'PENDING').length,
    REVIEWING: reports.filter(r => r.overallStatus === 'READY_TO_REVIEW').length,
    REJECTED: reports.filter(r => r.overallStatus === 'REJECTED' || r.logs?.some(l => l.status === 'REJECTED')).length,
    APPROVED: reports.filter(r => r.overallStatus === 'APPROVED' && r.total > 0).length,
  };

  // Hàm phân luồng (Interceptor): Quyết định hành động nào cần xác nhận lý do
  const handleActionRequest = (room, actionType, studentId = null) => {
    // Chặn luồng và yêu cầu nhập lý do đối với các quyết định TỪ CHỐI
    if (actionType.includes('REJECTED')) {
      setConfirmModalConfig({
        room, 
        actionType, 
        studentId, 
        title: studentId ? 'Yêu cầu cá nhân làm lại' : 'Yêu cầu TOÀN BỘ PHÒNG làm lại',
      });
    } else {
      // Bỏ qua bước xác nhận đối với các quyết định DUYỆT (Thực thi ngay)
      handleAction(room, actionType, studentId, '');
    }
  };

  // Hàm thực thi cuối cùng nhận dữ liệu trả về từ Popup
  const executeConfirmedAction = (room, actionType, studentId, note) => {
    handleAction(room, actionType, studentId, note);
    setConfirmModalConfig(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <LayoutDashboard className="text-white h-6 w-6" />
          </div>
          <h1 className="font-bold text-xl text-slate-800 tracking-tight">KTX Cỏ May</h1>
        </div>
        <nav className="flex-1">
          <button className="w-full flex items-center gap-3 bg-blue-50 text-blue-700 p-4 rounded-2xl font-bold border border-blue-100">
            <CheckSquare className="h-5 w-5" /> Duyệt báo cáo
          </button>
        </nav>
        <button onClick={() => navigate('/login')} className="flex items-center gap-3 p-4 text-slate-500 font-bold hover:text-red-500 transition-colors">
          <LogOut className="h-5 w-5" /> Đăng xuất
        </button>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* ================= HEADER ================= */}
        <header className="bg-white border-b border-slate-200 p-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Quản lý vệ sinh</h2>
            <p className="text-slate-500 font-medium">Chọn ngày để xem danh sách phòng trực</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
            <CalendarDays className="text-blue-600 h-5 w-5" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="bg-transparent font-bold outline-none cursor-pointer" 
            />
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          
          {/* ================= CỤM BỘ LỌC ================= */}
          <div className="flex gap-3 mb-8">
            {['ALL', 'PENDING', 'REVIEWING', 'REJECTED', 'APPROVED'].map(f => (
              <button 
                key={f} onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  filter === f ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {f === 'ALL' && `Tất cả (${statusCounts.ALL})`}
                {f === 'PENDING' && `Chưa làm (${statusCounts.PENDING})`}
                {f === 'REVIEWING' && `Chờ duyệt (${statusCounts.REVIEWING})`}
                {f === 'REJECTED' && `Làm lại (${statusCounts.REJECTED})`}
                {f === 'APPROVED' && `Hoàn tất (${statusCounts.APPROVED})`}              
              </button>
            ))}
          </div>

          {/* ================= LƯỚI DỮ LIỆU CHÍNH ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reports.map(item => (
              <ReportCard 
                key={item.id} 
                data={item} 
                onAction={handleActionRequest} 
                onViewHistory={setHistoryModal} 
                onViewDetails={setDetailModal} 
              />
            ))}
          </div>
        </div>
        
        {/* ================= KHU VỰC QUẢN LÝ MODAL ================= */}
        
        <HistoryModal 
          data={historyModal} 
          onClose={() => setHistoryModal(null)} 
        />

        {activeModalData && (
          <RoomDetailModal 
            data={activeModalData} 
            onClose={() => setDetailModal(null)}
            onAction={handleActionRequest} 
          />
        )}

        {/* Dynamic Rendering: Đảm bảo state nội bộ của Popup luôn được làm sạch mỗi khi mở mới */}
        {confirmModalConfig && (
          <ActionConfirmModal 
            isOpen={true}
            config={confirmModalConfig}
            onClose={() => setConfirmModalConfig(null)}
            onConfirm={executeConfirmedAction}
          />
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;