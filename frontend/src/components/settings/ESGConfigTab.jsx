import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Toast from '../Toast.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function ESGConfigTab() {
  const [config, setConfig] = useState({ organizationName: '', environmentalWeight: 40, socialWeight: 30, governanceWeight: 30 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => { api.get('/settings/esg-config').then(r => setConfig(r.data.config)).catch(console.error).finally(() => setLoading(false)); }, []);

  const totalWeight = parseFloat(config.environmentalWeight) + parseFloat(config.socialWeight) + parseFloat(config.governanceWeight);
  const isValid = Math.round(totalWeight) === 100;

  const handleSave = async () => {
    if (!isValid) { showToast('Weights must sum to 100%', 'error'); return; }
    setSaving(true);
    try { const res = await api.put('/settings/esg-config', config); setConfig(res.data.config); showToast('Configuration saved'); } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); } finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{Array.from({length:4}).map((_,i)=><div key={i} className="h-12 bg-[#2A2A2A] rounded-lg"/>)}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-6">
        <h3 className="text-sm font-medium text-white mb-4">Organization</h3>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Organization Name</label><input value={config.organizationName} onChange={(e) => setConfig({...config, organizationName: e.target.value})} className="w-full max-w-md px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
      </div>

      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-6">
        <h3 className="text-sm font-medium text-white mb-1">ESG Weights</h3>
        <p className="text-xs text-[#525252] mb-4">Must total 100%. Currently: <span className={isValid ? 'text-green-400' : 'text-red-400'}>{totalWeight}%</span></p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
          <div>
            <label className="block text-xs text-[#A3A3A3] mb-1">Environmental (%)</label>
            <input type="number" min="0" max="100" value={config.environmentalWeight} onChange={(e) => setConfig({...config, environmentalWeight: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-[#A3A3A3] mb-1">Social (%)</label>
            <input type="number" min="0" max="100" value={config.socialWeight} onChange={(e) => setConfig({...config, socialWeight: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-[#A3A3A3] mb-1">Governance (%)</label>
            <input type="number" min="0" max="100" value={config.governanceWeight} onChange={(e) => setConfig({...config, governanceWeight: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" />
          </div>
        </div>
        <div className="mt-3 w-full max-w-lg h-3 rounded-full overflow-hidden flex">
          <div className="bg-white h-full" style={{width: `${config.environmentalWeight}%`}} />
          <div className="bg-[#A3A3A3] h-full" style={{width: `${config.socialWeight}%`}} />
          <div className="bg-[#525252] h-full" style={{width: `${config.governanceWeight}%`}} />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-[#737373]"><span>■ Environmental</span><span className="text-[#A3A3A3]">■ Social</span><span className="text-[#525252]">■ Governance</span></div>
      </div>

      <button onClick={handleSave} disabled={saving || !isValid} className="px-6 py-2.5 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{saving ? 'Saving...' : 'Save Configuration'}</button>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
