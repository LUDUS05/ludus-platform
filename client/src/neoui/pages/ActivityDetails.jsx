import React, { useState, useEffect } from 'react';
import { Activity } from '../entities/Activity';
import { Booking } from '../entities/Booking';
import { User } from '../entities/User';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Star, Calendar, Heart, Share, X, Link, MessageCircle, Facebook } from 'lucide-react';
import referralService from '../../services/referralService';

export default function ActivityDetailsPage() {
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const activityId = urlParams.get('id');
    
    if (activityId) {
      const activities = await Activity.list();
      const foundActivity = activities.find(a => a.id === activityId);
      setActivity(foundActivity);
    }

    try {
      const currentUser = await User.me();
      setUser(currentUser);
      // Generate referral code for the user
      if (currentUser) {
        const stats = await referralService.getReferralStats(currentUser.id);
        setReferralCode(stats.referralCode);
      }
    } catch (error) {
      // ignore for demo
    }
  };

  const generateReferralLink = () => {
    if (!referralCode) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${referralCode}`;
  };

  const handleShare = async (platform) => {
    const referralLink = generateReferralLink();
    const activityTitle = activity?.title || 'Amazing Activity';
    const shareText = `Check out this amazing activity: ${activityTitle}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'link':
        // Copy to clipboard
        try {
          await navigator.clipboard.writeText(referralLink);
          alert('Referral link copied to clipboard!');
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = referralLink;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Referral link copied to clipboard!');
        }
        break;
        
      case 'sms':
        shareUrl = `sms:?body=${encodeURIComponent(shareText + ' ' + referralLink)}`;
        window.open(shareUrl);
        break;
        
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + referralLink)}`;
        window.open(shareUrl);
        break;
        
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`;
        window.open(shareUrl);
        break;
        
      default:
        break;
    }
    
    // Award referral points for sharing (mock)
    if (user && platform !== 'link') {
      try {
        // TODO: Replace with actual API call to award sharing points
        console.log('Awarding sharing points for:', platform);
        // Mock API call would go here
      } catch (error) {
        console.error('Failed to award sharing points:', error);
      }
    }
    
    setShowShareModal(false);
  };

  const handleBooking = async () => {
    if (!user || !activity) return;
    
    setIsBooking(true);
    try {
      const totalPrice = activity.price * participants;
      await Booking.create({
        activity_id: activity.id,
        user_email: user.email,
        participants: participants,
        total_price: totalPrice,
        booking_date: new Date().toISOString().split('T')[0]
      });
      
      await Activity.update(activity.id, {
        current_participants: (activity.current_participants || 0) + participants
      });
      
      alert('تم تأكيد الحجز! تحقق من لوحة التحكم.');
      navigate(-1);
    } catch (error) {
      alert('فشل الحجز. حاول مرة أخرى.');
    }
    setIsBooking(false);
  };

  if (!activity) {
    return (
      <div className="neo-loading">
        <div className="neo-spinner">
          <div className="neo-spinner-inner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="neo-category-badge rounded-full p-3 hover:neo-filter-pill active transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`neo-category-badge rounded-full p-3 transition-all duration-200 ${
              isLiked ? 'neo-filter-pill active' : 'hover:neo-filter-pill active'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
          </button>
          <button 
            onClick={() => setShowShareModal(true)}
            className="neo-category-badge rounded-full p-3 hover:neo-filter-pill active transition-all duration-200"
          >
            <Share className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Activity Image */}
      <div className="neo-activity-card p-2 mb-6">
        <img 
          src={activity.image_url} 
          alt={activity.title}
          className="w-full h-64 object-cover rounded-xl"
        />
      </div>

      {/* Activity Info */}
      <div className="space-y-6">
        {/* Title and Category */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="neo-category-badge px-3 py-1">
              <span className="text-xs font-semibold text-gray-600 uppercase">
                {activity.category}
              </span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium text-gray-700">
                {activity.vendor_rating || 4.5}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-neumorphic mb-2">
            {activity.title}
          </h1>
          <p className="text-gray-600">
            {activity.description}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="neo-activity-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">الموقع</span>
            </div>
            <p className="text-sm text-gray-600">{activity.location}</p>
          </div>

          <div className="neo-activity-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">المدة</span>
            </div>
            <p className="text-sm text-gray-600">{activity.duration || '2h'}</p>
          </div>

          <div className="neo-activity-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">التاريخ</span>
            </div>
            <p className="text-sm text-gray-600">
              {activity.date ? new Date(activity.date).toLocaleDateString() : 'TBD'}
            </p>
          </div>

          <div className="neo-activity-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">السعة</span>
            </div>
            <p className="text-sm text-gray-600">
              {(activity.current_participants || 0)}/{activity.max_participants || 10}
            </p>
          </div>
        </div>

        {/* Booking Controls */}
        <div className="neo-activity-card p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-neumorphic font-bold text-lg">ر.س {activity.price} للشخص</span>
            <div className="flex items-center">
              <button
                className="neo-category-badge rounded-full w-8 h-8 flex items-center justify-center"
                onClick={() => setParticipants(Math.max(1, participants - 1))}
              >
                -
              </button>
              <span className="mx-4 font-semibold">{participants}</span>
              <button
                className="neo-category-badge rounded-full w-8 h-8 flex items-center justify-center"
                onClick={() => setParticipants((participants + 1))}
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={handleBooking}
            disabled={isBooking}
            className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {isBooking ? 'جاري الحجز...' : 'احجز الآن'}
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="neo-activity-card p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">مشاركة النشاط</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="neo-filter-pill active rounded-full p-2"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              <button
                onClick={() => handleShare('link')}
                className="w-full flex items-center gap-3 p-3 neo-category-badge hover:neo-filter-pill active rounded-lg transition-all duration-200"
              >
                <Link className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">نسخ رابط الإحالة</span>
              </button>
              
              <button
                onClick={() => handleShare('sms')}
                className="w-full flex items-center gap-3 p-3 neo-category-badge hover:neo-filter-pill active rounded-lg transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">مشاركة عبر الرسائل</span>
              </button>
              
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center gap-3 p-3 neo-category-badge hover:neo-filter-pill active rounded-lg transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">مشاركة عبر واتساب</span>
              </button>
              
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-3 p-3 neo-category-badge hover:neo-filter-pill active rounded-lg transition-all duration-200"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">مشاركة عبر فيسبوك</span>
              </button>
            </div>
            
            {referralCode && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">كود الإحالة الخاص بك:</p>
                <p className="font-mono font-bold text-blue-600">{referralCode}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

