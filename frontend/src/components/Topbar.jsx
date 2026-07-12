import { useAuth } from '../hooks/useAuth.js';
import GlobalSearch from './GlobalSearch.jsx';
import NotificationBell from './NotificationBell.jsx';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#111111] border-b border-[#2A2A2A] flex items-center justify-between px-6">
      <button onClick={onMenuClick} className="lg:hidden text-[#A3A3A3] hover:text-white" aria-label="Open menu">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
      </button>

      <GlobalSearch />

      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="text-right hidden sm:block">
          <p className="text-sm text-white font-medium">{user?.full_name}</p>
          <p className="text-xs text-[#737373] capitalize">{user?.role}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center">
          <span className="text-xs text-white font-bold">{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
        </div>
        <button onClick={logout} className="text-[#A3A3A3] hover:text-white transition-colors" aria-label="Logout">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
        </button>
      </div>
    </header>
  );
}
