import { useState } from 'react';
import EnvironmentalReport from '../components/reports/EnvironmentalReport.jsx';
import SocialReport from '../components/reports/SocialReport.jsx';
import GovernanceReport from '../components/reports/GovernanceReport.jsx';
import OverallESGReport from '../components/reports/OverallESGReport.jsx';
import CustomReportBuilder from '../components/reports/CustomReportBuilder.jsx';
import ReportsDashboard from '../components/reports/ReportsDashboard.jsx';

const tabs = [
  { id: 'dashboard', label: 'Analytics' },
  { id: 'overall', label: 'ESG Summary' },
  { id: 'environmental', label: 'Environmental' },
  { id: 'social', label: 'Social' },
  { id: 'governance', label: 'Governance' },
  { id: 'custom', label: 'Custom Report' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Reports & Analytics</h1><p className="text-sm text-[#737373] mt-1">Comprehensive ESG performance reporting</p></div>
      <div className="flex gap-1 border-b border-[#2A2A2A] overflow-x-auto">
        {tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-[#737373] hover:text-[#A3A3A3]'}`}>{tab.label}</button>))}
      </div>
      {activeTab === 'dashboard' && <ReportsDashboard />}
      {activeTab === 'overall' && <OverallESGReport />}
      {activeTab === 'environmental' && <EnvironmentalReport />}
      {activeTab === 'social' && <SocialReport />}
      {activeTab === 'governance' && <GovernanceReport />}
      {activeTab === 'custom' && <CustomReportBuilder />}
    </div>
  );
}
