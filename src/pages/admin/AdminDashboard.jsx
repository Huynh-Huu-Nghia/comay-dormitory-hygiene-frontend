// src/pages/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, LogOut, CalendarDays, LayoutDashboard, X, Check, Clock } from 'lucide-react';
import useAdminData from '../../hooks/admin/useAdminData';
import ReportCard from '../../components/admin/ReportCard';
import HistoryModal from '../../components/admin/HistoryModal';
import RoomDetailModal from '../../components/admin/RoomDetailModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  // Gọi Logic từ Hook
  const { reports, selectedDate, setSelectedDate, filter, setFilter, handleAction } = useAdminData();
  
  // State cục bộ chỉ dùng để đóng mở Modal
  const [historyModal, setHistoryModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null); 

  // Tìm data "tươi" nhất từ kho reports dựa trên mã phòng đang được chọn
  const activeModalData = detailModal ? reports.find(r => r.room === detailModal.room) : null;

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* 1. SIDEBAR VÀ HEADER ĐÃ ĐƯỢC TÁCH KHỐI RÕ RÀNG */}
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
          {/* 2. CỤM BỘ LỌC */}
          <div className="flex gap-3 mb-8">
            {['ALL', 'PENDING', 'REVIEWING', 'REJECTED', 'APPROVED'].map(f => (
              <button 
                key={f} onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  filter === f ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {f === 'ALL' ? 'Tất cả' : f === 'PENDING' ? 'Chưa làm' : f === 'REVIEWING' ? 'Chờ duyệt' : f === 'REJECTED' ? 'Làm lại' : 'Hoàn tất'}
              </button>
            ))}
          </div>

          {/* 3. LƯỚI DATA GỌI SẠCH SẼ QUA COMPONENT TÁCH RỜI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reports.map(item => (
              <ReportCard 
                key={item.id} 
                data={item} 
                onAction={handleAction} 
                onViewHistory={setHistoryModal} 
                onViewDetails={setDetailModal} // Gắn vào đây
              />
            ))}
          </div>
        </div>
        
        {/* ================= KHU VỰC MODAL ĐÃ ĐƯỢC DỌN DẸP ================= */}
        
        <HistoryModal 
          data={historyModal} 
          onClose={() => setHistoryModal(null)} 
        />

        {/* Dùng activeModalData thay cho detailModal */}
        {activeModalData && (
          <RoomDetailModal 
            data={activeModalData} 
            onClose={() => setDetailModal(null)}
            onAction={handleAction} 
          />
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;