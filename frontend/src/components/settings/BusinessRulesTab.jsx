import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Toast from '../Toast.jsx';
import { useToast } from '../../hooks/useToast.js';

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A] last:border-0">
      <div><p className="text-sm text-white">{label}</p>{description && <p className="text-xs text-[#525252] mt-0.5">{description}</p>}</div>
      <button onClick={() => onChange(!checked)} className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-white' : 'bg-[#2A2A2A]'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${checked ? 'bg-black left-[22px]' : 'left-0.5 bg-[#525252]'}`} />
      </button>
    </div>
  );
}

export default function BusinessRulesTab() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => { api.get('/settings').then(r => setSettings(r.data.settings)).catch(console.error).finally(() => setLoading(false)); }, []);

  const update = (key, value) => setSettings({ ...settings, [key]: String(value) });

  const handleSave = async () => {
    setSaving(true);
    try {
      const bizSettings = Object.fromEntries(Object.entries(settings).filter(([k]) => k.startsWith('business.')));
      await api.put('/settings', { settings: bizSettings });
      showToast('Business rules saved');
    } catch (err) { showToast('Failed to save', 'error'); } finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{Array.from({length:6}).map((_,i)=><div key={i} className="h-12 bg-[#2A2A2A] rounded-lg"/>)}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-6">
        <h3 className="text-sm font-medium text-white mb-1">Business Rules</h3>
        <p className="text-xs text-[#525252] mb-4">Configure automatic behaviors across the platform</p>
        <Toggle label="Auto Emission Calculation" description="Automatically calculate emissions when recording carbon transactions" checked={settings['business.autoEmissionCalc'] === 'true'} onChange={(v) => update('business.autoEmissionCalc', v)} />
        <Toggle label="Evidence Required for CSR Approval" description="Require proof upload before CSR participation can be approved" checked={settings['business.evidenceRequiredCSR'] === 'true'} onChange={(v) => update('business.evidenceRequiredCSR', v)} />
        <Toggle label="Automatic Badge Award" description="Automatically assign badges when unlock rules are met" checked={settings['business.autoBadgeAward'] === 'true'} onChange={(v) => update('business.autoBadgeAward', v)} />
        <Toggle label="Compliance Due Reminder" description="Send reminders before compliance issue due dates" checked={settings['business.complianceDueReminder'] === 'true'} onChange={(v) => update('business.complianceDueReminder', v)} />
        <Toggle label="Policy Reminder" description="Remind employees about pending policy acknowledgements" checked={settings['business.policyReminder'] === 'true'} onChange={(v) => update('business.policyReminder', v)} />
        <Toggle label="Challenge Reminder" description="Send reminders about active challenges near deadline" checked={settings['business.challengeReminder'] === 'true'} onChange={(v) => update('business.challengeReminder', v)} />
      </div>

      <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{saving ? 'Saving...' : 'Save Rules'}</button>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
