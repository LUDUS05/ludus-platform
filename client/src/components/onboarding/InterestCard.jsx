import React from "react";
import { Check } from "lucide-react";

export default function InterestCard({ interest, isSelected, onClick, language, t }) {
  const title = t(interest.titleKey);
  
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 brutalist-border brutalist-shadow brutalist-shadow-hover transition-all duration-200 transform hover:scale-105 relative ${
        isSelected 
          ? `${interest.color} text-black brutalist-shadow-hover` 
          : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      <div className="text-center space-y-2">
        <div className="text-2xl mb-2">
          {interest.icon}
        </div>
        <div className="brutalist-text text-xs leading-tight">
          {title}
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2">
            <Check className="w-5 h-5 text-black" />
          </div>
        )}
      </div>
    </button>
  );
}
