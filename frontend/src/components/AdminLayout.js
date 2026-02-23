import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, UtensilsCrossed, Settings, ClipboardCheck, LogOut } from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', testId: 'nav-dashboard' },
    { icon: Calendar, label: 'Reservas', path: '/admin/reservations', testId: 'nav-reservations' },
    { icon: UtensilsCrossed, label: 'Mesas', path: '/admin/tables', testId: 'nav-tables' },
    { icon: ClipboardCheck, label: 'HACCP', path: '/admin/haccp', testId: 'nav-haccp' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings', testId: 'nav-settings' }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] pb-20 md:pb-0">
      <div className="hidden md:flex flex-col w-64 h-screen bg-[#1e293b] border-r border-[#334155] fixed left-0 top-0 p-4">
        <div className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-white uppercase">Restaurant</h2>
          <p className="text-[#64748b] text-sm">Sistema de Gestão</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                data-testid={item.testId}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-[#3b82f6] text-white'
                    : 'text-[#94a3b8] hover:bg-[#334155] hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#334155] pt-4 mt-4">
          <div className="mb-3">
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-[#64748b] text-sm">{user?.email}</p>
          </div>
          <button
            data-testid="logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>

      <div className="md:ml-64 p-4 md:p-8">
        {children}
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1e293b]/90 backdrop-blur-lg border-t border-[#334155] flex justify-around items-center z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              data-testid={`mobile-${item.testId}`}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 ${
                isActive ? 'text-[#3b82f6]' : 'text-[#94a3b8]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};