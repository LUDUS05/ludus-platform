import React, { useState, useEffect } from 'react';
import { User } from '../entities/User';
import { Activity } from '../entities/Activity';
import { Booking } from '../entities/Booking';
import { Settings, MapPin, Heart, Users, Edit3 } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setEditData({
        full_name: currentUser.full_name || '',
        bio: currentUser.bio || '',
        location: currentUser.location || '',
      });

      const allBookings = await Booking.list();
      const userBookings = allBookings.filter(b => b.user_email === currentUser.email);
      setUserBookings(userBookings);

      const allActivities = await Activity.list();
      setActivities(allActivities);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await User.updateMyUserData(editData);
      setUser(prev => ({ ...prev, ...editData }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getUserBookedActivities = () => {
    return userBookings.map(booking => {
      const activity = activities.find(a => a.id === booking.activity_id);
      return { ...booking, activity };
    }).filter(item => item.activity);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="neumorphic rounded-full w-16 h-16 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  const bookedActivities = getUserBookedActivities();

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Profile Header */}
      <div className="neumorphic rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="neumorphic-subtle rounded-full w-16 h-16 flex items-center justify-center">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-gray-700">
                  {user.full_name?.charAt(0) || user.email.charAt(0)}
                </span>
              )}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.full_name}
                  onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                  className="text-xl font-bold bg-transparent border-b-2 border-gray-300 focus:border-blue-600 outline-none text-neumorphic"
                  placeholder="اسمك"
                />
              ) : (
                <h1 className="text-xl font-bold text-neumorphic">{user.full_name || 'مستخدم'}</h1>
              )}
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="neumorphic-subtle rounded-full p-2 hover:neumorphic transition-all duration-200"
          >
            <Edit3 className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={editData.bio}
                onChange={(e) => setEditData({...editData, bio: e.target.value})}
                className="w-full p-3 neumorphic-subtle rounded-xl bg-transparent text-gray-700 placeholder-gray-500 outline-none"
                placeholder="حدّثنا عن نفسك..."
              />
            </div>
            <div>
              <input
                type="text"
                value={editData.location}
                onChange={(e) => setEditData({...editData, location: e.target.value})}
                className="w-full p-3 neumorphic-subtle rounded-xl bg-transparent text-gray-700 placeholder-gray-500 outline-none"
                placeholder="موقعك"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                حفظ
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-600">
              {user.bio || 'لا توجد نبذة حتى الآن. اضغط تحرير لإضافة نبذة!'}
            </p>
            {user.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-around mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xl font-bold text-neumorphic">
              {bookedActivities.length}
            </p>
            <p className="text-xs text-gray-600">أنشطة</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-neumorphic">
              {user.followers_count || 0}
            </p>
            <p className="text-xs text-gray-600">متابعون</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-neumorphic">
              {user.following_count || 0}
            </p>
            <p className="text-xs text-gray-600">يتابع</p>
          </div>
        </div>
      </div>

      {/* Bookings */}
      <div className="neumorphic rounded-2xl p-6">
        <h2 className="text-lg font-bold text-neumorphic mb-4">حجوزاتك</h2>
        {bookedActivities.length === 0 ? (
          <p className="text-gray-600">لا توجد حجوزات.</p>
        ) : (
          <div className="space-y-3">
            {bookedActivities.map(item => (
              <div key={item.id} className="neumorphic-subtle rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-neumorphic">{item.activity.title}</p>
                    <p className="text-sm text-gray-600">{item.activity.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">عدد الأشخاص: {item.participants}</p>
                    <p className="text-sm text-gray-600">ر.س {item.total_price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

