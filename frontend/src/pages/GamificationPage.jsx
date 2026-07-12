import { useState } from 'react';
import ChallengesTab from '../components/gamification/ChallengesTab.jsx';
import BadgesTab from '../components/gamification/BadgesTab.jsx';
import RewardsTab from '../components/gamification/RewardsTab.jsx';
import LeaderboardTab from '../components/gamification/LeaderboardTab.jsx';

const tabs = [
  { id: 'challenges', label: 'Challenges' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'badges', label: 'Badges' },
  { id: 'rewards', label: 'Rewards' },
];

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState('challenges');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gamification</h1>
        <p className="text-sm text-[#737373] mt-1">Challenges, leaderboards, badges, and rewards</p>
      </div>
      <div className="flex gap-1 border-b border-[#2A2A2A] overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-[#737373] hover:text-[#A3A3A3]'}`}>{tab.label}</button>
        ))}
      </div>
      {activeTab === 'challenges' && <ChallengesTab />}
      {activeTab === 'leaderboard' && <LeaderboardTab />}
      {activeTab === 'badges' && <BadgesTab />}
      {activeTab === 'rewards' && <RewardsTab />}
    </div>
  );
}
