// src/components/student/Header.jsx
import React from 'react';

/**
 * Component Header cho giao diện Sinh viên
 * @param {Object} props
 * @param {Object} props.currentUser - Thông tin phiên đăng nhập hiện tại
 * @param {string} props.roomId - Số phòng của sinh viên (VD: '114')
 */
const Header = ({ currentUser, roomId }) => {
  return (
    <header className="z-10 bg-green-600 px-4 py-5 text-white shadow-md">
      {/* Container flex justify-between để sẵn sàng cho việc thêm nút Đăng xuất ở góc phải sau này */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">KTX Cỏ May</h1>
          
          <div className="mt-1 flex items-center gap-2 text-sm text-green-100">
            <span>Xin chào, {currentUser?.name || `Phòng ${roomId}`}</span>
            
            {/* Badge dành riêng cho Trưởng phòng đăng nhập bằng PIN */}
            {currentUser?.isLeaderMode && (
              <span className="flex items-center rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-black text-green-900 shadow-sm">
                👑 TRƯỞNG PHÒNG
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;