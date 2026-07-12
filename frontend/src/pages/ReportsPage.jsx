import { useState } from 'react';
import EnvironmentalReport from '../components/reports/EnvironmentalReport.jsx';
import SocialReport from '../components/reports/SocialReport.jsx';
import GovernanceReport from '../components/reports/GovernanceReport.jsx';
import OverallESGReport from '../components/reports/OverallESGReport.jsx';

const tabs = [
  { id: 'overall', label: 'Overall ESG' },
  { id: 'environmental', label: 'Environmental' },
  { id: 'social', label: 'Social' },
  { id: 'governance', label: 'Governance' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overall');
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Reports & Analytics</h1><p className="text-sm text-[#737373] mt-1">Comprehensive ESG performance reports</p></div>
      <div className="flex gap-1 border-b border-[#2A2A2A] overflow-x-auto">
        {tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-[#737373] hover:text-[#A3A3A3]'}`}>{tab.label}</button>))}
      </div>
      {activeTab === 'overall' && <OverallESGReport />}
      {activeTab === 'environmental' && <EnvironmentalReport />}
      {activeTab === 'social' && <SocialReport />}
      {activeTab === 'governance' && <GovernanceReport />}
    </div>
  );
}
