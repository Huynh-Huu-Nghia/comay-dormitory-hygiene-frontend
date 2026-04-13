// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, User, LogIn } from 'lucide-react';
import { ROOM_ACCOUNTS } from '../../utils/mockData';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Tìm kiếm tài khoản trong cơ sở dữ liệu giả lập
    const account = ROOM_ACCOUNTS.find((acc) => acc.username === username);
    
    // Pattern: Early Return (Thoát sớm nếu có lỗi để code không bị lồng sâu)
    if (!account) {
      setError('Tài khoản không tồn tại!');
      return;
    }

    // Xác thực mật khẩu và phân quyền
    const isLeaderPass = password === account.leaderPIN;
    const isStandardPass = password === account.password;
    const isAdmin = account.role === 'ADMIN';

    if (isStandardPass || isLeaderPass) {
      const userSession = {
        ...account,
        isLeaderMode: isLeaderPass,
      };
      
      try {
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        
        // Điều hướng dựa trên vai trò (Role-based routing)
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      } catch (storageError) {
        console.error('Lỗi khi lưu phiên đăng nhập:', storageError);
        setError('Có lỗi xảy ra với bộ nhớ trình duyệt. Vui lòng thử lại!');
      }
    } else {
      setError('Mật khẩu không chính xác!');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <LogIn className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">KTX Cỏ May</h1>
          <p className="mt-2 text-sm text-gray-500">Hệ thống Quản lý Vệ sinh chung</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700">
              Tài khoản phòng (VD: 114)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-10 text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="Nhập số phòng..."
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-10 text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="Nhập mật khẩu..."
                required
              />
            </div>
          </div>

          {/* Dành 1 khoảng trống cố định cho error để form không bị giật/nhảy khi báo lỗi */}
          <div className="h-5">
            {error && <p className="text-sm font-medium text-red-500 text-center animate-pulse">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 p-3 text-center text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            Đăng nhập vào hệ thống
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;