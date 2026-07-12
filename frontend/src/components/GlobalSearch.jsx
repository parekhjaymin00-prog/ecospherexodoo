import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try { const res = await api.get('/reports/search', { params: { q: query } }); setResults(res.data.results); setOpen(true); } catch (err) { console.error(err); } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result) => { setOpen(false); setQuery(''); navigate(result.link); };

  const typeIcons = { department: '🏢', policy: '📋', activity: '🤝', challenge: '🏆', audit: '📊', issue: '⚠️' };

  return (
    <div ref={ref} className="relative hidden sm:block">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
        <input
          type="text" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search..." className="w-56 pl-9 pr-3 py-1.5 text-xs bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white placeholder-[#525252] focus:border-[#525252] focus:outline-none focus:w-72 transition-all"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-[#171717] border border-[#2A2A2A] rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
          {results.map((r) => (
            <button key={`${r.type}-${r.id}`} onClick={() => handleSelect(r)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1F1F1F] text-left border-b border-[#2A2A2A] last:border-0">
              <span className="text-sm">{typeIcons[r.type] || '📄'}</span>
              <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{r.title}</p><p className="text-xs text-[#525252] capitalize">{r.type} · {r.subtitle}</p></div>
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-[#171717] border border-[#2A2A2A] rounded-lg p-4 z-50">
          <p className="text-xs text-[#525252] text-center">No results found</p>
        </div>
      )}
    </div>
  );
}
