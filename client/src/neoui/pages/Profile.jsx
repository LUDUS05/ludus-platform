import React, { useState, useEffect } from 'react';
import { User } from '../entities/User';
import { Activity } from '../entities/Activity';
import { Booking } from '../entities/Booking';
import { Settings, MapPin, Heart, Users, Edit3, Share2, QrCode, Copy, Check, X } from 'lucide-react';
import referralService from '../../services/referralService';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [referralStats, setReferralStats] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

      // Load referral stats
      try {
        const stats = await referralService.getReferralStats(currentUser.id);
        setReferralStats(stats);
      } catch (error) {
        console.error('Error loading referral stats:', error);
      }

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

  const generateReferralLink = () => {
    if (!referralStats?.referralCode) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${referralStats.referralCode}`;
  };

  const copyReferralLink = async () => {
    const referralLink = generateReferralLink();
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateQRCode = () => {
    const referralLink = generateReferralLink();
    if (!referralLink) return '';
    
    // Simple QR code generation using Google Charts API
    return `https://chart.googleapis.com/chart?chs=200x200&chld=L|0&cht=qr&chl=${encodeURIComponent(referralLink)}`;
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

  const bookedActivities = getUserBookedActivities();

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Profile Header */}
      <div className="neo-activity-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="neo-category-badge w-16 h-16 flex items-center justify-center">
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
            className="neo-category-badge rounded-full p-2 hover:neo-filter-pill transition-all duration-200"
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
                className="w-full p-3 neo-category-badge bg-transparent text-gray-700 placeholder-gray-500 outline-none"
                placeholder="حدّثنا عن نفسك..."
              />
            </div>
            <div>
              <input
                type="text"
                value={editData.location}
                onChange={(e) => setEditData({...editData, location: e.target.value})}
                className="w-full p-3 neo-category-badge bg-transparent text-gray-700 placeholder-gray-500 outline-none"
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
      <div className="neo-activity-card p-6">
        <h2 className="text-lg font-bold text-neumorphic mb-4">حجوزاتك</h2>
        {bookedActivities.length === 0 ? (
          <p className="text-gray-600">لا توجد حجوزات.</p>
        ) : (
          <div className="space-y-3">
            {bookedActivities.map(item => (
              <div key={item.id} className="neo-category-badge p-4">
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

      {/* Referral Section */}
      {referralStats && (
        <div className="neo-activity-card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">برنامج الإحالة</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{referralStats.totalReferrals}</div>
              <div className="text-sm text-gray-600">إجمالي الإحالات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{referralStats.totalEarnings} ريال</div>
              <div className="text-sm text-gray-600">إجمالي الأرباح</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-800">رابط الإحالة</div>
                  <div className="text-sm text-gray-500 font-mono">{referralStats.referralCode}</div>
                </div>
              </div>
              <button
                onClick={copyReferralLink}
                className="neo-category-badge hover:neo-filter-pill active p-2 rounded-lg transition-all duration-200"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
              </button>
            </div>

            <button
              onClick={() => setShowQRModal(true)}
              className="w-full flex items-center justify-center gap-3 p-3 neo-category-badge hover:neo-filter-pill active rounded-lg transition-all duration-200"
            >
              <QrCode className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">عرض رمز QR</span>
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="neo-activity-card p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">رمز QR للإحالة</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="neo-filter-pill active rounded-full p-2"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            
            <div className="text-center">
              <img 
                src={generateQRCode()} 
                alt="Referral QR Code" 
                className="mx-auto mb-4 rounded-lg"
              />
              <p className="text-sm text-gray-600 mb-3">
                شارك هذا الرمز مع أصدقائك للحصول على مكافآت
              </p>
              <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                {generateReferralLink()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

