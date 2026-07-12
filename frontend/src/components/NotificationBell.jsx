import { useState, useEffect, useRef } from 'react';
import api from '../services/api.js';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchNotifications(); const interval = setInterval(fetchNotifications, 30000); return () => clearInterval(interval); }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    try { await api.put(`/notifications/${id}/read`); fetchNotifications(); } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try { await api.put('/notifications/read-all'); fetchNotifications(); } catch (err) { console.error(err); }
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative text-[#A3A3A3] hover:text-white transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#171717] border border-[#2A2A2A] rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
            <h3 className="text-sm text-white font-medium">Notifications</h3>
            {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-[#A3A3A3] hover:text-white">Mark all read</button>}
          </div>
          <div className="overflow-y-auto max-h-72">
            {notifications.length === 0 ? (
              <p className="text-xs text-[#525252] text-center py-8">No notifications</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <button
                  key={n.id}
                  onClick={() => { if (!n.isRead) markRead(n.id); }}
                  className={`w-full text-left px-4 py-3 border-b border-[#2A2A2A] last:border-0 hover:bg-[#1F1F1F] ${!n.isRead ? 'bg-[#1A1A1A]' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-white mt-1.5 shrink-0" />}
                    <div className={!n.isRead ? '' : 'ml-4'}>
                      <p className="text-xs text-white leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-[#525252] mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
