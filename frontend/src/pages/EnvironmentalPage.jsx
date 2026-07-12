import { useState } from 'react';
import EmissionFactorsTab from '../components/environmental/EmissionFactorsTab.jsx';
import CarbonTransactionsTab from '../components/environmental/CarbonTransactionsTab.jsx';
import EnvironmentalGoalsTab from '../components/environmental/EnvironmentalGoalsTab.jsx';

const tabs = [
  { id: 'transactions', label: 'Carbon Transactions' },
  { id: 'factors', label: 'Emission Factors' },
  { id: 'goals', label: 'Environmental Goals' },
];

export default function EnvironmentalPage() {
  const [activeTab, setActiveTab] = useState('transactions');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Environmental</h1>
        <p className="text-sm text-[#737373] mt-1">Carbon tracking, emission factors, and environmental goals</p>
      </div>

      <div className="flex gap-1 border-b border-[#2A2A2A]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-[#737373] hover:text-[#A3A3A3]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'transactions' && <CarbonTransactionsTab />}
      {activeTab === 'factors' && <EmissionFactorsTab />}
      {activeTab === 'goals' && <EnvironmentalGoalsTab />}
    </div>
  );
}
