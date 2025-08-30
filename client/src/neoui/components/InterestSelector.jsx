import React from 'react';
import { Check } from 'lucide-react';

const INTERESTS = [
  { id: 'sports', name: 'الرياضة', emoji: '⚽' },
  { id: 'music', name: 'الموسيقى', emoji: '🎵' },
  { id: 'art', name: 'الفنون', emoji: '🎨' },
  { id: 'food', name: 'الطعام', emoji: '🍽️' },
  { id: 'outdoor', name: 'الهواء الطلق', emoji: '🌲' },
  { id: 'fitness', name: 'اللياقة', emoji: '💪' },
  { id: 'workshops', name: 'الورش', emoji: '🛠️' },
  { id: 'nightlife', name: 'السهرات', emoji: '🌙' },
  { id: 'culture', name: 'الثقافة', emoji: '🎭' }
];

export default function InterestSelector({ selectedInterests = [], onInterestsChange }) {
  const toggleInterest = (interestId) => {
    const newInterests = selectedInterests.includes(interestId)
      ? selectedInterests.filter(id => id !== interestId)
      : [...selectedInterests, interestId];
    onInterestsChange(newInterests);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {INTERESTS.map((interest) => {
        const isSelected = selectedInterests.includes(interest.id);
        return (
          <div
            key={interest.id}
            onClick={() => toggleInterest(interest.id)}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
              isSelected ? 'neumorphic-pressed' : 'neumorphic hover:neumorphic-subtle'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{interest.emoji}</span>
                <span className="font-medium text-neumorphic">
                  {interest.name}
                </span>
              </div>
              {isSelected && (
                <div className="neumorphic-subtle rounded-full p-1">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

