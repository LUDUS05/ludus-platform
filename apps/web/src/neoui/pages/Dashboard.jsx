import React, { useState, useEffect } from 'react';
import { User } from '../entities/User';
import { Booking } from '../entities/Booking';
import { Activity } from '../entities/Activity';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Calendar, Clock, MapPin, Users, Star, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const allBookings = await Booking.list('-created_date');
      const userBookings = allBookings.filter(b => b.user_email === currentUser.email);
      setBookings(userBookings);

      const allActivities = await Activity.list();
      setActivities(allActivities);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const getBookingWithActivity = (booking) => {
    const activity = activities.find(a => a.id === booking.activity_id);
    return { ...booking, activity };
  };

  const getFilteredBookings = () => {
    const now = new Date();
    return bookings
      .map(getBookingWithActivity)
      .filter(item => item.activity)
      .filter(item => {
        if (activeTab === 'upcoming') {
          return new Date(item.activity.date) >= now;
        } else {
          return new Date(item.activity.date) < now;
        }
      });
  };

  const handleActivityTap = (activity) => {
    navigate(createPageUrl(`ActivityDetails?id=${activity.id}`));
  };

  if (!user) {
    return (
      <div className="neo-loading">
        <div className="neo-spinner">
          <div className="neo-spinner-inner"></div>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="neo-activity-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="neo-category-badge w-12 h-12 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-700">
              {user.full_name?.charAt(0) || user.email.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-neumorphic">مرحبًا، {user.full_name?.split(' ')[0] || 'صديقنا'}!</h1>
            <p className="text-sm text-gray-600">إدارة حجوزات أنشطتك</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="neo-category-badge p-3 text-center">
            <p className="text-2xl font-bold text-neumorphic">
              {bookings.length}
            </p>
            <p className="text-xs text-gray-600">إجمالي الحجوزات</p>
          </div>
          <div className="neo-category-badge p-3 text-center">
            <p className="text-2xl font-bold text-neumorphic">
              ${bookings.reduce((sum, b) => sum + (b.total_price || 0), 0)}
            </p>
            <p className="text-xs text-gray-600">إجمالي الإنفاق</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="neo-activity-card p-2">
        <div className="flex">
          {[
            { id: 'upcoming', label: 'قادمة' },
            { id: 'past', label: 'أنشطة سابقة' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'neo-filter-pill active' 
                  : 'text-gray-600 hover:neo-filter-pill'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => handleActivityTap(booking.activity)}
              className="neo-activity-card cursor-pointer hover:neo-activity-card:hover transition-all duration-200"
            >
              <div className="flex gap-4">
                <img 
                  src={booking.activity.image_url} 
                  alt={booking.activity.title}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-neumorphic text-sm">{booking.activity.title}</h3>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{booking.activity.date ? new Date(booking.activity.date).toLocaleDateString('ar-SA') : 'لاحقًا'}</span>
                      <Clock className="w-3 h-3 ml-2" />
                      <span>{booking.activity.time || 'لاحقًا'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{booking.activity.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Users className="w-3 h-3" />
                      <span>{booking.participants} أشخاص</span>
                      <Star className="w-3 h-3 ml-2 text-yellow-500" />
                      <span>{booking.activity.vendor_rating || 4.5}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12"><p className="text-gray-600">لا توجد حجوزات في هذا القسم.</p></div>
        )}
      </div>
    </div>
  );
}

