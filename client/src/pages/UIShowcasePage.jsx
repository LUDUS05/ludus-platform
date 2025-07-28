import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HeartIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  MagnifyingGlassIcon as SearchIcon,
  BellIcon,
  Bars3Icon as MenuIcon,
  GlobeAltIcon as CompassIcon,
  DocumentTextIcon as TicketIcon,
  PlayIcon,
  ChevronRightIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';

const UIShowcasePage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedCategory, setSelectedCategory] = useState('sports');
  const [isLiked, setIsLiked] = useState(false);
  const [rating, setRating] = useState(4);

  // Sample data
  const categories = ['sports', 'music', 'art', 'food', 'adventure', 'cultural'];
  
  const sampleActivity = {
    id: 1,
    title: 'Desert Safari Adventure',
    description: 'Experience the thrill of dune bashing and traditional Bedouin culture',
    price: 250,
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73273?w=400',
    category: 'Adventure',
    location: 'Riyadh Desert',
    rating: 4.8,
    duration: '6 hours',
    participants: 12
  };

  return (
    <div className="min-h-screen bg-soft-white">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-warm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-display-xl text-charcoal mb-4">
              LUDUS Design System
            </h1>
            <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive showcase of all UI components and design elements following the LUDUS brand guidelines
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        
        {/* Color Palette Section */}
        <section>
          <h2 className="text-display-lg text-charcoal mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Primary Colors */}
            <div className="space-y-3">
              <h3 className="text-label-md text-charcoal">Primary</h3>
              <div className="space-y-2">
                <div className="h-16 bg-ludus-orange rounded-xl flex items-center justify-center">
                  <span className="text-white font-medium">#FF6600</span>
                </div>
                <div className="h-12 bg-ludus-orange-light rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">#FF8533</span>
                </div>
                <div className="h-12 bg-ludus-orange-dark rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">#CC5200</span>
                </div>
              </div>
            </div>

            {/* Neutrals */}
            <div className="space-y-3">
              <h3 className="text-label-md text-charcoal">Neutrals</h3>
              <div className="space-y-2">
                <div className="h-16 bg-charcoal rounded-xl flex items-center justify-center">
                  <span className="text-white font-medium">#2B2B2B</span>
                </div>
                <div className="h-12 bg-warm rounded-lg flex items-center justify-center">
                  <span className="text-charcoal text-sm">#EEEEEE</span>
                </div>
                <div className="h-12 bg-soft-white border rounded-lg flex items-center justify-center">
                  <span className="text-charcoal text-sm">#FAFAFA</span>
                </div>
              </div>
            </div>

            {/* Secondary */}
            <div className="space-y-3">
              <h3 className="text-label-md text-charcoal">Secondary</h3>
              <div className="space-y-2">
                <div className="h-16 bg-accent-blue rounded-xl flex items-center justify-center">
                  <span className="text-white font-medium">#00ADEF</span>
                </div>
                <div className="h-12 bg-success-green rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">#10B981</span>
                </div>
                <div className="h-12 bg-warning-orange rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">#F59E0B</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <h3 className="text-label-md text-charcoal">Status</h3>
              <div className="space-y-2">
                <div className="h-16 bg-error-red rounded-xl flex items-center justify-center">
                  <span className="text-white font-medium">#EF4444</span>
                </div>
                <div className="h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">Success</span>
                </div>
                <div className="h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">Info</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <h2 className="text-display-lg text-charcoal mb-6">Typography</h2>
          <div className="bg-white rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-label-md text-gray-500 mb-3">Display Text</h3>
              <div className="space-y-2">
                <h1 className="text-display-xl text-charcoal">Display XL - The future of activity discovery</h1>
                <h2 className="text-display-lg text-charcoal">Display Large - Join amazing experiences</h2>
                <h3 className="text-display-md text-charcoal">Display Medium - Connect with your community</h3>
                <h4 className="text-display-sm text-charcoal">Display Small - Discover local adventures</h4>
                <h5 className="text-display-xs text-charcoal">Display XSmall - Book your next activity</h5>
              </div>
            </div>

            <div>
              <h3 className="text-label-md text-gray-500 mb-3">Body Text</h3>
              <div className="space-y-2">
                <p className="text-body-lg text-charcoal">Large body text - Perfect for important descriptions and feature explanations that need emphasis.</p>
                <p className="text-body-md text-charcoal">Medium body text - The standard text size for most content, readable and comfortable for extended reading.</p>
                <p className="text-body-sm text-charcoal">Small body text - Used for secondary information, captions, and supporting details.</p>
                <p className="text-body-xs text-charcoal">Extra small body text - For fine print, legal text, and minimal space requirements.</p>
              </div>
            </div>

            <div>
              <h3 className="text-label-md text-gray-500 mb-3">Labels & Tags</h3>
              <div className="space-y-2">
                <span className="text-label-lg text-charcoal block">Large Label - Form labels and section headers</span>
                <span className="text-label-md text-charcoal block">Medium Label - Standard form labels</span>
                <span className="text-label-sm text-ludus-orange block">SMALL LABEL - CATEGORY TAGS</span>
              </div>
            </div>
          </div>
        </section>

        {/* Button Components */}
        <section>
          <h2 className="text-display-lg text-charcoal mb-6">Buttons</h2>
          <div className="bg-white rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Primary Buttons */}
              <div>
                <h3 className="text-label-md text-gray-500 mb-4">Primary Buttons</h3>
                <div className="space-y-3">
                  <button className="w-full bg-ludus-orange hover:bg-ludus-orange-dark text-white font-semibold px-6 py-4 text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95">
                    Large Primary
                  </button>
                  <button className="w-full bg-ludus-orange hover:bg-ludus-orange-dark text-white font-semibold px-4 py-3 text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95">
                    Medium Primary
                  </button>
                  <button className="w-full bg-ludus-orange hover:bg-ludus-orange-dark text-white font-semibold px-3 py-2 text-sm rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95">
                    Small Primary
                  </button>
                </div>
              </div>

              {/* Secondary Buttons */}
              <div>
                <h3 className="text-label-md text-gray-500 mb-4">Secondary Buttons</h3>
                <div className="space-y-3">
                  <button className="w-full bg-white border-2 border-ludus-orange text-ludus-orange hover:bg-ludus-orange hover:text-white font-semibold px-6 py-4 text-lg rounded-xl transition-all duration-200">
                    Large Secondary
                  </button>
                  <button className="w-full bg-white border-2 border-ludus-orange text-ludus-orange hover:bg-ludus-orange hover:text-white font-semibold px-4 py-3 text-base rounded-xl transition-all duration-200">
                    Medium Secondary
                  </button>
                  <button className="w-full bg-white border-2 border-ludus-orange text-ludus-orange hover:bg-ludus-orange hover:text-white font-semibold px-3 py-2 text-sm rounded-xl transition-all duration-200">
                    Small Secondary
                  </button>
                </div>
              </div>

              {/* Ghost Buttons */}
              <div>
                <h3 className="text-label-md text-gray-500 mb-4">Ghost Buttons</h3>
                <div className="space-y-3">
                  <button className="w-full bg-transparent text-charcoal hover:bg-warm-light font-medium px-6 py-4 text-lg rounded-xl transition-all duration-200">
                    Large Ghost
                  </button>
                  <button className="w-full bg-transparent text-charcoal hover:bg-warm-light font-medium px-4 py-3 text-base rounded-xl transition-all duration-200">
                    Medium Ghost
                  </button>
                  <button className="w-full bg-transparent text-charcoal hover:bg-warm-light font-medium px-3 py-2 text-sm rounded-xl transition-all duration-200">
                    Small Ghost
                  </button>
                </div>
              </div>
            </div>

            {/* Button States */}
            <div className="mt-8 pt-8 border-t border-warm">
              <h3 className="text-label-md text-gray-500 mb-4">Button States</h3>
              <div className="flex flex-wrap gap-4">
                <button className="bg-ludus-orange text-white font-semibold px-4 py-3 rounded-xl transition-all duration-200 shadow-lg">
                  Normal
                </button>
                <button className="bg-ludus-orange-dark text-white font-semibold px-4 py-3 rounded-xl transition-all duration-200 shadow-xl">
                  Hover
                </button>
                <button className="bg-ludus-orange text-white font-semibold px-4 py-3 rounded-xl transition-all duration-200 scale-95">
                  Active
                </button>
                <button className="bg-gray-300 text-gray-500 font-semibold px-4 py-3 rounded-xl cursor-not-allowed" disabled>
                  Disabled
                </button>
                <button className="bg-ludus-orange text-white font-semibold px-4 py-3 rounded-xl transition-all duration-200 shadow-lg flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Form Components */}
        <section>
          <h2 className="text-display-lg text-charcoal mb-6">Form Components</h2>
          <div className="bg-white rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Input Fields */}
              <div className="space-y-6">
                <h3 className="text-label-md text-gray-500">Input Fields</h3>
                
                {/* Text Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-warm bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-ludus-orange transition-colors duration-200"
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal">Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-warm bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-ludus-orange transition-colors duration-200"
                  />
                </div>

                {/* Search Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal">Search Activities</label>
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for adventures..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-warm focus:border-ludus-orange focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 bg-white text-charcoal"
                    />
                  </div>
                </div>

                {/* Error State */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+966 XX XXX XXXX"
                    className="w-full px-4 py-3 rounded-xl border-2 border-error-red focus:border-error-red focus:outline-none focus:ring-2 focus:ring-error-red/20 bg-white text-charcoal"
                  />
                  <p className="text-sm text-error-red">Please enter a valid phone number</p>
                </div>
              </div>

              {/* Select & Other Controls */}
              <div className="space-y-6">
                <h3 className="text-label-md text-gray-500">Other Controls</h3>
                
                {/* Select Dropdown */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal">Category</label>
                  <select className="w-full px-4 py-3 rounded-xl border-2 border-warm bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-ludus-orange transition-colors duration-200">
                    <option>Select a category</option>
                    <option>Sports & Fitness</option>
                    <option>Arts & Culture</option>
                    <option>Food & Dining</option>
                    <option>Adventure</option>
                  </select>
                </div>

                {/* Textarea */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-charcoal">Description</label>
                  <textarea
                    rows="4"
                    placeholder="Tell us about your activity..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-warm bg-white text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ludus-orange/20 focus:border-ludus-orange transition-colors duration-200 resize-none"
                  ></textarea>
                </div>

                {/* Checkbox */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 text-ludus-orange focus:ring-ludus-orange border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-charcoal">
                    I agree to the Terms and Conditions
                  </label>
                </div>

                {/* Radio Buttons */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-charcoal">Difficulty Level</label>
                  <div className="space-y-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                      <div key={level} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="difficulty"
                          id={level.toLowerCase()}
                          className="w-4 h-4 text-ludus-orange focus:ring-ludus-orange border-gray-300"
                        />
                        <label htmlFor={level.toLowerCase()} className="text-sm text-charcoal">
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Card Components */}
        <section>
          <h2 className="text-display-lg text-charcoal mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Activity Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
              <div className="relative h-48 bg-warm overflow-hidden">
                <img 
                  src={sampleActivity.image} 
                  alt={sampleActivity.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  {isLiked ? (
                    <HeartSolidIcon className="w-5 h-5 text-error-red" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-ludus-orange text-white text-xs font-medium rounded-full">
                    {sampleActivity.category}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                  <MapPinIcon className="w-3 h-3" />
                  {sampleActivity.location}
                  <span className="mx-1">•</span>
                  <CalendarIcon className="w-3 h-3" />
                  {sampleActivity.duration}
                </div>

                <h3 className="text-lg font-semibold text-charcoal mb-2 line-clamp-2">
                  {sampleActivity.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {sampleActivity.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarSolidIcon 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(sampleActivity.rating) ? 'text-warning-orange' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      {sampleActivity.rating}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-ludus-orange">
                      {sampleActivity.price} SAR
                    </div>
                    <div className="text-xs text-gray-500">
                      {sampleActivity.participants} joining
                    </div>
                  </div>
                </div>

                <button className="w-full mt-4 bg-ludus-orange hover:bg-ludus-orange-dark text-white font-semibold py-3 rounded-xl transition-all duration-200 active:scale-95">
                  Join Activity
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-ludus-orange to-ludus-orange-dark rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <UserIcon className="w-6 h-6" />
                </div>
                <ChevronRightIcon className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">1,245</div>
                <div className="text-sm opacity-90">Active Members</div>
                <div className="text-xs opacity-75">+12% from last month</div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-accent-blue">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-accent-blue/10 rounded-lg">
                  <InformationCircleIcon className="w-6 h-6 text-accent-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-2">Platform Update</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    New features have been added to improve your activity discovery experience.
                  </p>
                  <button className="text-accent-blue text-sm font-medium hover:underline">
                    Learn more →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Components */}
        <section>
          <h2 className="text-display-lg text-charcoal mb-6">Navigation</h2>
          
          {/* Bottom Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <h3 className="text-label-md text-gray-500 mb-4">Bottom Navigation</h3>
            <div className="flex items-center justify-around py-2 bg-gray-50 rounded-xl">
              {[
                { id: 'discover', icon: CompassIcon, label: 'Discover' },
                { id: 'activities', icon: CalendarIcon, label: 'Activities' },
                { id: 'bookings', icon: TicketIcon, label: 'Bookings' },
                { id: 'profile', icon: UserIcon, label: 'Profile' }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                    activeTab === id 
                      ? 'text-ludus-orange bg-ludus-orange/10' 
                      : 'text-gray-500 hover:text-charcoal'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter Chips */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-label-md text-gray-500 mb-4">Filter Chips</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-ludus-orange text-white shadow-lg' 
                      : 'bg-white text-charcoal border border-warm hover:border-ludus-orange'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    selectedCategory === category ? 'bg-white' : 'bg-ludus-orange'
                  }`}></div>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Status & Feedback */}
        <section>
          <h2 className="text-display-lg text-charcoal mb-6">Status & Feedback</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Alert Messages */}
            <div className="space-y-4">
              <h3 className="text-label-md text-gray-500">Alert Messages</h3>
              
              {/* Success Alert */}
              <div className="bg-success-green/10 border border-success-green/20 rounded-xl p-4 flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-success-green mt-0.5" />
                <div>
                  <h4 className="font-medium text-success-dark">Booking Confirmed!</h4>
                  <p className="text-sm text-success-dark/80">Your activity has been successfully booked.</p>
                </div>
              </div>

              {/* Warning Alert */}
              <div className="bg-warning-orange/10 border border-warning-orange/20 rounded-xl p-4 flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-warning-orange mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning-dark">Limited Spots Available</h4>
                  <p className="text-sm text-warning-dark/80">Only 3 spots left for this activity.</p>
                </div>
              </div>

              {/* Error Alert */}
              <div className="bg-error-red/10 border border-error-red/20 rounded-xl p-4 flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-error-red mt-0.5" />
                <div>
                  <h4 className="font-medium text-error-dark">Payment Failed</h4>
                  <p className="text-sm text-error-dark/80">Please check your payment method and try again.</p>
                </div>
              </div>

              {/* Info Alert */}
              <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-xl p-4 flex items-start gap-3">
                <InformationCircleIcon className="w-5 h-5 text-accent-blue mt-0.5" />
                <div>
                  <h4 className="font-medium text-accent-blue-dark">New Feature Available</h4>
                  <p className="text-sm text-accent-blue-dark/80">Check out our new activity recommendations!</p>
                </div>
              </div>
            </div>

            {/* Loading States */}
            <div className="space-y-4">
              <h3 className="text-label-md text-gray-500">Loading States</h3>
              
              {/* Spinner */}
              <div className="bg-white rounded-xl p-6 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-ludus-orange/20 border-t-ludus-orange rounded-full animate-spin"></div>
              </div>

              {/* Skeleton Card */}
              <div className="bg-white rounded-xl p-4 space-y-3 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white rounded-xl p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal">Profile Completion</span>
                  <span className="text-ludus-orange font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-ludus-orange h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Layout Preview */}
        <section>
          <h2 className="text-display-lg text-charcoal mb-6">Mobile Layout</h2>
          <div className="bg-gray-100 rounded-2xl p-6 flex justify-center">
            <div className="w-80 bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Mobile Header */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-warm">
                <MenuIcon className="w-6 h-6 text-charcoal" />
                <div className="text-lg font-bold text-ludus-orange">LUDUS</div>
                <BellIcon className="w-6 h-6 text-charcoal" />
              </div>

              {/* Mobile Content */}
              <div className="p-4 space-y-4 h-96 overflow-y-auto">
                {/* Search */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm focus:border-ludus-orange focus:outline-none bg-white text-sm"
                  />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {['All', 'Sports', 'Music', 'Art'].map((cat) => (
                    <button
                      key={cat}
                      className="px-4 py-2 bg-ludus-orange/10 text-ludus-orange rounded-full text-sm font-medium whitespace-nowrap"
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Mini Activity Cards */}
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-3 flex gap-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-charcoal">Activity {i}</h4>
                        <p className="text-xs text-gray-500">Location • Duration</p>
                        <div className="text-ludus-orange font-bold text-sm mt-1">250 SAR</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Bottom Nav */}
              <div className="bg-white border-t border-warm px-2 py-1">
                <div className="flex justify-around">
                  {[CompassIcon, CalendarIcon, TicketIcon, UserIcon].map((Icon, i) => (
                    <button key={i} className="p-2 text-gray-400">
                      <Icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-8">
          <p>LUDUS Design System • Built with React & Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
};

export default UIShowcasePage;