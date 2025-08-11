'use client';

import { ActivityCard } from './ActivityCard';

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  price: {
    amount: number;
    currency: string;
    perPerson: boolean;
  };
  location: string;
  duration: number; // in minutes
  maxParticipants: number;
  images: string[];
  rating: number;
  reviewCount: number;
  vendor: {
    id: string;
    name: string;
    logo?: string;
    verified: boolean;
  };
  tags: string[];
  featured: boolean;
}

interface ActivityGridProps {
  activities: Activity[];
  viewMode: 'grid' | 'list';
  onSave?: (activityId: string) => void;
  savedActivities?: string[];
}

export function ActivityGrid({ activities, viewMode, onSave, savedActivities = [] }: ActivityGridProps) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="md:w-48 md:h-32 flex-shrink-0">
                <div className="w-full h-32 md:h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">Image</span>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                        {activity.title}
                      </h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">${activity.price.amount}</div>
                        <div className="text-sm text-gray-500">per person</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{activity.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {activity.duration} minutes
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {activity.location}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {activity.rating} ({activity.reviewCount})
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        By <span className="font-medium text-gray-900">{activity.vendor.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {onSave && (
                          <button
                            onClick={() => onSave(activity.id)}
                            className={`p-2 rounded-full transition-colors ${
                              savedActivities.includes(activity.id)
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                            }`}
                            title={savedActivities.includes(activity.id) ? 'Remove from saved' : 'Save activity'}
                          >
                            <svg className="w-5 h-5" fill={savedActivities.includes(activity.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        )}
                        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activities.map((activity) => (
        <ActivityCard 
          key={activity.id} 
          activity={activity}
          onSave={onSave}
          saved={savedActivities.includes(activity.id)}
        />
      ))}
    </div>
  );
}
