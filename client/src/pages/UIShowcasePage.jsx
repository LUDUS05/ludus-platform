import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  MagnifyingGlassIcon as SearchIcon,
  BellIcon,
  Bars3Icon as MenuIcon,
  GlobeAltIcon as CompassIcon,
  DocumentTextIcon as TicketIcon,
  CalendarIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  PhotoIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Import enhanced components
import ActivityCard from '../components/ui/ActivityCard';
import ProgressiveImage from '../components/ui/ProgressiveImage';
import ThemeToggle from '../components/ui/ThemeToggle';
import FloatingActionButton from '../components/ui/FloatingActionButton';

const UIShowcasePage = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedCategory, setSelectedCategory] = useState('sports');
  const [showAnimations, setShowAnimations] = useState(true);
  const [notifications, setNotifications] = useState(3);

  // Sample data
  const categories = ['sports', 'music', 'art', 'food', 'adventure', 'cultural'];
  
  const sampleActivities = [
    {
      id: 1,
      title: 'Desert Safari Adventure',
      description: 'Experience the thrill of dune bashing and traditional Bedouin culture',
      price: 250,
      category: 'adventure',
      location: 'Riyadh Desert',
      rating: 4.8,
      duration: '6 hours',
      participants: 12,
      isSaved: false
    },
    {
      id: 2,
      title: 'Traditional Music Concert',
      description: 'Enjoy an evening of traditional Saudi music and poetry',
      price: 150,
      category: 'music',
      location: 'King Fahd Cultural Centre',
      rating: 4.9,
      duration: '3 hours',
      participants: 50,
      isSaved: true
    },
    {
      id: 3,
      title: 'Rock Climbing Experience',
      description: 'Challenge yourself with guided rock climbing in scenic locations',
      price: 180,
      category: 'sports',
      location: 'Edge of the World',
      rating: 4.7,
      duration: '4 hours',
      participants: 8,
      isSaved: false
    }
  ];

  return (
    <div className="min-h-screen bg-soft-white dark:bg-dark-bg-primary transition-colors duration-300">
      {/* Enhanced Header Section with Animation */}
      <motion.div 
        className="bg-white dark:bg-dark-bg-secondary shadow-sm border-b border-warm dark:border-dark-border-secondary"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-display-xl text-charcoal dark:text-dark-text-primary mb-4">
                LUDUS Design System
                <motion.span
                  className="inline-block ml-2"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨
                </motion.span>
              </h1>
              <p className="text-body-lg text-gray-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
                A comprehensive showcase featuring advanced animations, glass morphism effects, 
                Unsplash integration, and dark theme support - all following LUDUS brand guidelines
              </p>
            </motion.div>

            {/* Theme Toggle and Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <ThemeToggle />
              <button
                onClick={() => setShowAnimations(!showAnimations)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  showAnimations
                    ? 'bg-ludus-orange text-white shadow-lg'
                    : 'bg-white dark:bg-dark-bg-tertiary text-charcoal dark:text-dark-text-primary border border-warm dark:border-dark-border-secondary'
                }`}
              >
                {showAnimations ? 'Animations ON' : 'Animations OFF'}
              </button>
            </motion.div>

            {/* Feature badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {[
                { icon: SparklesIcon, label: 'Framer Motion', color: 'bg-purple-100 text-purple-700' },
                { icon: PhotoIcon, label: 'Unsplash API', color: 'bg-blue-100 text-blue-700' },
                { icon: '🌙', label: 'Dark Theme', color: 'bg-gray-100 text-gray-700' },
                { icon: '🪞', label: 'Glass Morphism', color: 'bg-cyan-100 text-cyan-700' }
              ].map(({ icon: Icon, label, color }, index) => (
                <motion.div
                  key={label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${color} flex items-center gap-1`}
                >
                  {typeof Icon === 'string' ? (
                    <span>{Icon}</span>
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                  {label}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

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

        {/* Enhanced Activity Cards with Unsplash */}
        <section>
          <motion.h2 
            className="text-display-lg text-charcoal dark:text-dark-text-primary mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Enhanced Activity Cards
          </motion.h2>
          
          <div className="space-y-8">
            {/* Card Variants */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-lg">
              <h3 className="text-label-md text-gray-500 dark:text-dark-text-tertiary mb-4">Different Variants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sampleActivities.map((activity, index) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    index={showAnimations ? index : 0}
                    animate={showAnimations}
                    onBook={(activity) => console.log('Book:', activity.title)}
                    onSave={(activity, saved) => console.log('Save:', activity.title, saved)}
                    variant={index === 0 ? 'default' : index === 1 ? 'compact' : 'featured'}
                  />
                ))}
              </div>
            </div>

            {/* Progressive Image Showcase */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-lg">
              <h3 className="text-label-md text-gray-500 dark:text-dark-text-tertiary mb-4">Progressive Image Loading</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['sports', 'music', 'art', 'food'].map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="group"
                  >
                    <ProgressiveImage
                      category={category}
                      width={200}
                      height={150}
                      className="w-full h-32 rounded-xl"
                      alt={`${category} activity`}
                    />
                    <p className="text-center text-sm text-gray-600 dark:text-dark-text-tertiary mt-2 capitalize">
                      {category}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Glass Morphism Examples */}
            <div className="bg-gradient-to-br from-ludus-orange via-ludus-orange-light to-ludus-orange-dark rounded-2xl p-8 relative overflow-hidden">
              <h3 className="text-white font-semibold mb-6">Glass Morphism Effects</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Glass Card 1 */}
                <motion.div
                  className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-white">
                    <div className="text-2xl font-bold mb-1">1,245</div>
                    <div className="text-sm opacity-90">Active Users</div>
                  </div>
                </motion.div>

                {/* Glass Card 2 */}
                <motion.div
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-white">
                    <div className="text-2xl font-bold mb-1">89%</div>
                    <div className="text-sm opacity-90">Satisfaction</div>
                  </div>
                </motion.div>

                {/* Glass Card 3 */}
                <motion.div
                  className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-white">
                    <div className="text-2xl font-bold mb-1">2.5k</div>
                    <div className="text-sm opacity-90">Activities</div>
                  </div>
                </motion.div>
              </div>

              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
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

        {/* Advanced Animations Showcase */}
        <section>
          <motion.h2 
            className="text-display-lg text-charcoal dark:text-dark-text-primary mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Advanced Animations & Interactions
          </motion.h2>

          <div className="space-y-6">
            {/* Stagger Animation Demo */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-lg">
              <h3 className="text-label-md text-gray-500 dark:text-dark-text-tertiary mb-4">Stagger Animations</h3>
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <motion.div
                    key={item}
                    className="h-20 bg-ludus-orange/20 dark:bg-dark-ludus-orange/20 rounded-xl flex items-center justify-center font-bold text-ludus-orange dark:text-dark-ludus-orange"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 102, 0, 0.3)' }}
                  >
                    {item}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Loading States */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-lg">
              <h3 className="text-label-md text-gray-500 dark:text-dark-text-tertiary mb-4">Loading Animations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LUDUS Spinner */}
                <div className="text-center p-6">
                  <div className="relative w-12 h-12 mx-auto mb-3">
                    <div className="absolute inset-0 rounded-full border-2 border-ludus-orange/20 dark:border-dark-ludus-orange/20"></div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-transparent border-t-ludus-orange dark:border-t-dark-ludus-orange"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-dark-text-tertiary">LUDUS Spinner</p>
                </div>

                {/* Pulse Loading */}
                <div className="text-center p-6">
                  <motion.div
                    className="w-12 h-12 bg-ludus-orange dark:bg-dark-ludus-orange rounded-full mx-auto mb-3"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <p className="text-sm text-gray-600 dark:text-dark-text-tertiary">Pulse Effect</p>
                </div>

                {/* Bouncing Dots */}
                <div className="text-center p-6">
                  <div className="flex justify-center space-x-2 mb-3">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-ludus-orange dark:bg-dark-ludus-orange rounded-full"
                        animate={{
                          y: [0, -20, 0]
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-dark-text-tertiary">Bouncing Dots</p>
                </div>
              </div>
            </div>

            {/* Interactive Elements */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-lg">
              <h3 className="text-label-md text-gray-500 dark:text-dark-text-tertiary mb-4">Interactive Elements</h3>
              <div className="flex flex-wrap gap-4">
                {/* Magnetic Button */}
                <motion.button
                  className="px-6 py-3 bg-ludus-orange text-white rounded-xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => console.log('Hover start')}
                  onHoverEnd={() => console.log('Hover end')}
                >
                  Magnetic Button
                </motion.button>

                {/* Ripple Effect Button */}
                <motion.button
                  className="relative px-6 py-3 bg-accent-blue text-white rounded-xl font-semibold overflow-hidden"
                  whileTap="tap"
                  variants={{
                    tap: {
                      scale: 0.95
                    }
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    whileTap={{ scale: 4, opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">Ripple Effect</span>
                </motion.button>

                {/* Floating Button */}
                <motion.button
                  className="px-6 py-3 bg-success-green text-white rounded-xl font-semibold"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  whileHover={{ y: -10 }}
                >
                  Floating Button
                </motion.button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <motion.div 
          className="text-center text-gray-500 dark:text-dark-text-tertiary text-sm py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="mb-2">
            <span className="font-semibold text-ludus-orange dark:text-dark-ludus-orange">LUDUS Design System</span> 
            {' '} • Built with React, Tailwind CSS, Framer Motion & Unsplash API
          </p>
          <p className="text-xs opacity-75">
            Featuring advanced animations, glass morphism, dark theme, and professional image integration
          </p>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={PlusIcon}
        onClick={() => setNotifications(notifications + 1)}
        notifications={notifications}
        tooltip="Add New Activity"
        position="bottom-right"
      />
    </div>
  );
};

export default UIShowcasePage;