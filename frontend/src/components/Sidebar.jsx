import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' }, { to: '/customers', label: 'Customers', icon: 'group' }, { to: '/plans', label: 'Plans', icon: 'list_alt' }, { to: '/subscriptions', label: 'Subscriptions', icon: 'autorenew' }, { to: '/payments', label: 'Payments', icon: 'payments' }, { to: '/expenses', label: 'Expenses', icon: 'receipt_long' }, { to: '/meals-polls', label: 'Meals & Voting', icon: 'how_to_vote' }, { to: '/reports', label: 'Reports', icon: 'analytics' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col sticky top-0">
      <div className="p-4 lg:p-6 border-b border-slate-100">
        <h1 className="text-xl font-extrabold text-primary-600 flex items-center gap-2"><span className="material-symbols-rounded text-primary-600" style={{ fontSize: '28px' }}>restaurant</span><span className="hidden lg:inline">TiffinTrack</span></h1>
        <p className="hidden lg:block text-sm text-slate-500 mt-2 truncate">{user?.businessName}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{item.icon}</span><span className="hidden lg:inline">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 lg:p-4 border-t border-slate-100">
        <div className="hidden lg:block px-4 py-2 text-sm text-slate-500 truncate">{user?.ownerName}</div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span className="material-symbols-rounded align-middle lg:mr-2">logout</span><span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
