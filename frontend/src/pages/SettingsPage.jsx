import { useState } from 'react';
import ESGConfigTab from '../components/settings/ESGConfigTab.jsx';
import CategoryManagementTab from '../components/settings/CategoryManagementTab.jsx';
import NotificationSettingsTab from '../components/settings/NotificationSettingsTab.jsx';
import BusinessRulesTab from '../components/settings/BusinessRulesTab.jsx';

const tabs = [
  { id: 'esg', label: 'ESG Configuration' },
  { id: 'categories', label: 'Categories' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'rules', label: 'Business Rules' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('esg');
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Settings</h1><p className="text-sm text-[#737373] mt-1">System configuration and administration</p></div>
      <div className="flex gap-1 border-b border-[#2A2A2A] overflow-x-auto">
        {tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-[#737373] hover:text-[#A3A3A3]'}`}>{tab.label}</button>))}
      </div>
      {activeTab === 'esg' && <ESGConfigTab />}
      {activeTab === 'categories' && <CategoryManagementTab />}
      {activeTab === 'notifications' && <NotificationSettingsTab />}
      {activeTab === 'rules' && <BusinessRulesTab />}
    </div>
  );
}
