import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Toast from '../Toast.jsx';
import { useToast } from '../../hooks/useToast.js';

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#2A2A2A] last:border-0">
      <div><p className="text-sm text-white">{label}</p>{description && <p className="text-xs text-[#525252] mt-0.5">{description}</p>}</div>
      <button onClick={() => onChange(!checked)} className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-white' : 'bg-[#2A2A2A]'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${checked ? 'left-5.5 bg-black left-[22px]' : 'left-0.5 bg-[#525252]'}`} />
      </button>
    </div>
  );
}

export default function NotificationSettingsTab() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => { api.get('/settings').then(r => setSettings(r.data.settings)).catch(console.error).finally(() => setLoading(false)); }, []);

  const update = (key, value) => setSettings({ ...settings, [key]: String(value) });

  const handleSave = async () => {
    setSaving(true);
    try {
      const notifSettings = Object.fromEntries(Object.entries(settings).filter(([k]) => k.startsWith('notification.')));
      await api.put('/settings', { settings: notifSettings });
      showToast('Notification settings saved');
    } catch (err) { showToast('Failed to save', 'error'); } finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{Array.from({length:6}).map((_,i)=><div key={i} className="h-12 bg-[#2A2A2A] rounded-lg"/>)}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-6">
        <h3 className="text-sm font-medium text-white mb-4">Notification Channels</h3>
        <Toggle label="Email Notifications" description="Send notifications via email" checked={settings['notification.email'] === 'true'} onChange={(v) => update('notification.email', v)} />
        <Toggle label="In-App Notifications" description="Show notifications within the application" checked={settings['notification.inApp'] === 'true'} onChange={(v) => update('notification.inApp', v)} />
      </div>

      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-6">
        <h3 className="text-sm font-medium text-white mb-4">Notification Types</h3>
        <Toggle label="Badge Notifications" description="Notify when badges are earned" checked={settings['notification.badge'] === 'true'} onChange={(v) => update('notification.badge', v)} />
        <Toggle label="Challenge Notifications" description="Notify about challenge updates" checked={settings['notification.challenge'] === 'true'} onChange={(v) => update('notification.challenge', v)} />
        <Toggle label="CSR Notifications" description="Notify about CSR activity updates" checked={settings['notification.csr'] === 'true'} onChange={(v) => update('notification.csr', v)} />
        <Toggle label="Audit Notifications" description="Notify about upcoming audits" checked={settings['notification.audit'] === 'true'} onChange={(v) => update('notification.audit', v)} />
        <Toggle label="Compliance Notifications" description="Notify about compliance due dates" checked={settings['notification.compliance'] === 'true'} onChange={(v) => update('notification.compliance', v)} />
        <Toggle label="Policy Reminder" description="Remind about unacknowledged policies" checked={settings['notification.policyReminder'] === 'true'} onChange={(v) => update('notification.policyReminder', v)} />
      </div>

      <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{saving ? 'Saving...' : 'Save Settings'}</button>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
