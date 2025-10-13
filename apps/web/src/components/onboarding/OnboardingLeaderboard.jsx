import React from 'react';
import { useOnboarding } from './OnboardingProvider';

const OnboardingLeaderboard = ({ limit = 10 }) => {
  const { leaderboard, t, i18n } = useOnboarding();

  if (!leaderboard || leaderboard.length === 0) return null;

  const items = leaderboard.slice(0, limit);

  return (
    <div className="max-w-xl mx-auto bg-white/70 backdrop-blur rounded-xl shadow p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{t('onboarding.leaderboard.title')}</h3>
        <span className="text-xs text-gray-500">{t('onboarding.leaderboard.topN', { n: limit })}</span>
      </div>
      <ul className="divide-y divide-gray-200">
        {items.map((entry, idx) => (
          <li key={idx} className="py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 text-sm font-bold text-gray-600">{idx + 1}</span>
              <span className="text-sm text-gray-800">{entry.name}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">{t('onboarding.leaderboard.points', { points: entry.points })}</span>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">{t('onboarding.leaderboard.streak', { n: entry.currentStreak })}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnboardingLeaderboard;


