import { useState } from 'react';
import PoliciesTab from '../components/governance/PoliciesTab.jsx';
import AuditsTab from '../components/governance/AuditsTab.jsx';
import ComplianceTab from '../components/governance/ComplianceTab.jsx';

const tabs = [
  { id: 'policies', label: 'Policies' },
  { id: 'audits', label: 'Audits' },
  { id: 'compliance', label: 'Compliance Issues' },
];

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState('policies');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Governance</h1>
        <p className="text-sm text-[#737373] mt-1">Policies, audits, and compliance management</p>
      </div>
      <div className="flex gap-1 border-b border-[#2A2A2A]">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-[#737373] hover:text-[#A3A3A3]'}`}>{tab.label}</button>
        ))}
      </div>
      {activeTab === 'policies' && <PoliciesTab />}
      {activeTab === 'audits' && <AuditsTab />}
      {activeTab === 'compliance' && <ComplianceTab />}
    </div>
  );
}
