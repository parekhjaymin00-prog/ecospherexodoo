import { useState } from 'react';
import CSRActivitiesTab from '../components/social/CSRActivitiesTab.jsx';
import ParticipationsTab from '../components/social/ParticipationsTab.jsx';
import DiversityTab from '../components/social/DiversityTab.jsx';
import TrainingTab from '../components/social/TrainingTab.jsx';

const tabs = [
  { id: 'activities', label: 'CSR Activities' },
  { id: 'participations', label: 'Participations' },
  { id: 'diversity', label: 'Diversity Metrics' },
  { id: 'training', label: 'Training' },
];

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState('activities');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Social</h1>
        <p className="text-sm text-[#737373] mt-1">CSR activities, participation, diversity, and training</p>
      </div>

      <div className="flex gap-1 border-b border-[#2A2A2A] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-[#737373] hover:text-[#A3A3A3]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'activities' && <CSRActivitiesTab />}
      {activeTab === 'participations' && <ParticipationsTab />}
      {activeTab === 'diversity' && <DiversityTab />}
      {activeTab === 'training' && <TrainingTab />}
    </div>
  );
}
