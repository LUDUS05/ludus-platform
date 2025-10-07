import React from 'react';
import { MapPin, Clock, Users, Star } from 'lucide-react';

export default function ActivityCard({ activity, onTap }) {
  return (
    <div 
      className="neo-activity-card"
      onClick={() => onTap(activity)}
    >
      <div className="relative mb-4">
        <img 
          src={activity.image_url} 
          alt={activity.title}
          className="neo-activity-image"
        />
        <div className="neo-price-badge">
          <span className="text-sm font-semibold text-gray-800">
            ر.س {activity.price}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {activity.title}
          </h3>
          <div className="flex items-center gap-2">
            <div className="neo-category-badge">
              <span className="text-xs font-medium text-gray-700">
                {activity.category?.toUpperCase?.()}
              </span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium text-gray-800">
                {activity.vendor_rating || 4.5}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">
          {activity.description?.length > 100 
            ? `${activity.description.substring(0, 100)}...` 
            : activity.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-700">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{activity.location}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{activity.duration || '2س'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700">
            <Users className="w-4 h-4 mr-1" />
            <span>{activity.current_participants || 0}/{activity.max_participants || 10}</span>
          </div>
          <span className="text-xs text-gray-600">
            بواسطة {activity.vendor_name}
          </span>
        </div>
      </div>
    </div>
  );
}

