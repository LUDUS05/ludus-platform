import React, { useState, useEffect } from 'react';
import { Activity } from '../entities/Activity';
import { Booking } from '../entities/Booking';
import { User } from '../entities/User';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Star, Calendar, Heart, Share } from 'lucide-react';

export default function ActivityDetailsPage() {
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

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
    } catch (error) {
      // ignore for demo
    }
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
      
      alert('Booking confirmed! Check your dashboard for details.');
      navigate(-1);
    } catch (error) {
      alert('Booking failed. Please try again.');
    }
    setIsBooking(false);
  };

  if (!activity) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="neumorphic rounded-full w-16 h-16 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
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
          className="neumorphic rounded-full p-3 hover:neumorphic-pressed transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`neumorphic rounded-full p-3 transition-all duration-200 ${
              isLiked ? 'neumorphic-pressed' : 'hover:neumorphic-pressed'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
          </button>
          <button className="neumorphic rounded-full p-3 hover:neumorphic-pressed transition-all duration-200">
            <Share className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Activity Image */}
      <div className="neumorphic rounded-2xl p-2 mb-6">
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
            <div className="neumorphic-subtle rounded-full px-3 py-1">
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
          <div className="neumorphic rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Location</span>
            </div>
            <p className="text-sm text-gray-600">{activity.location}</p>
          </div>

          <div className="neumorphic rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Duration</span>
            </div>
            <p className="text-sm text-gray-600">{activity.duration || '2h'}</p>
          </div>

          <div className="neumorphic rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Date</span>
            </div>
            <p className="text-sm text-gray-600">
              {activity.date ? new Date(activity.date).toLocaleDateString() : 'TBD'}
            </p>
          </div>

          <div className="neumorphic rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Capacity</span>
            </div>
            <p className="text-sm text-gray-600">
              {(activity.current_participants || 0)}/{activity.max_participants || 10}
            </p>
          </div>
        </div>

        {/* Booking Controls */}
        <div className="neumorphic rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-neumorphic font-bold text-lg">${activity.price} per person</span>
            <div className="flex items-center">
              <button
                className="neumorphic rounded-full w-8 h-8 flex items-center justify-center"
                onClick={() => setParticipants(Math.max(1, participants - 1))}
              >
                -
              </button>
              <span className="mx-4 font-semibold">{participants}</span>
              <button
                className="neumorphic rounded-full w-8 h-8 flex items-center justify-center"
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
            {isBooking ? 'Booking...' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

