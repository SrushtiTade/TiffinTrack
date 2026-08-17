import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const CustomerSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/customer', label: 'Dashboard', icon: 'dashboard' },
    { to: '/customer/explore', label: 'Explore Messes', icon: 'explore' },
    { to: '/customer/subscription', label: 'My Subscription', icon: 'card_membership' },
    { to: '/customer/payments', label: 'My Payments', icon: 'payments' },
    { to: '/customer/meals', label: 'Meals', icon: 'restaurant_menu' },
    { to: '/customer/voting', label: 'Meal Voting', icon: 'how_to_vote' },
    { to: '/customer/profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600 flex items-center gap-2"><span className="material-symbols-rounded text-primary-600" style={{ fontSize: '28px' }}>restaurant</span> MessHub</h1>
        <p className="text-sm text-gray-500 mt-1">Hello, {user?.fullName || 'Customer'}</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/customer'}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <span className="material-symbols-rounded mr-3" style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const CustomerLayout = ({ children, title }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <CustomerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
