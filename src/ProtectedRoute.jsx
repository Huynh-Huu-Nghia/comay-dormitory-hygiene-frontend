// src/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  // 1. Kiểm tra user đã đăng nhập chưa
  const currentUserString = localStorage.getItem('currentUser');
  
  // không tìm thấy thông tin user -> đuổi về trang đăng nhập
  if (!currentUserString) {
    return <Navigate to="/login" replace />;
  }

  // 2. Phân quyền
  const currentUser = JSON.parse(currentUserString);
  
  // Nếu route này chỉ dành cho ADMIN, nhưng user lại là STUDENT -> Thì đuổi luôn
  if (allowedRole && currentUser.role !== allowedRole) {
    // Có thể điều hướng về trang lỗi, nhưng tạm thời cứ đuổi về login cho an toàn
    return <Navigate to="/login" replace />;
  }

  // 3. Nếu qua được hết các chốt chặn trên -> Mở cửa cho vào
  return children;
};

export default ProtectedRoute;