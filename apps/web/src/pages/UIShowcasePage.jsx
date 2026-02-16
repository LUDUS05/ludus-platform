import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, 
  Heart, 
  Star, 
  Settings, 
  Bell, 
  Search, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import ThemeToggle from '../components/ui/ThemeToggle';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import ProgressiveImage from '../components/ui/ProgressiveImage';
import RichTextEditor from '../components/ui/RichTextEditor';
import ActivityCard from '../components/ui/ActivityCard';

const UIShowcasePage = () => {
  const { t, i18n } = useTranslation();
  const [showAlert, setShowAlert] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('components');
  const [notifications, setNotifications] = useState(3);
  const [favoriteCount, setFavoriteCount] = useState(42);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showNeomorphic, setShowNeomorphic] = useState(false);

  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'ar';

  // Sample activity data for showcase
  const sampleActivity = {
      id: 1,
    title: "Desert Safari Adventure",
    description: "Experience the thrill of dune bashing and camel riding in the beautiful Arabian desert. Perfect for adventure seekers and families alike.",
      price: 250,
    category: "Adventure",
    vendor_rating: 4.8,
    location: "Dubai Desert",
    duration: "6 hours",
    max_participants: 20,
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    vendor_name: "Desert Adventures Co."
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
      <motion.div 
          className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
          <div className="flex justify-center items-center gap-4 mb-6">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            LUDUS UI Showcase
              </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Comprehensive component library with {isRTL ? 'RTL' : 'LTR'} support
          </p>
          <div className="flex justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Language: {currentLanguage.toUpperCase()}</span>
            <span>•</span>
            <span>Direction: {isRTL ? 'RTL' : 'LTR'}</span>
            <span>•</span>
            <span>Theme: {document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'}</span>
          </div>
            </motion.div>

        {/* Navigation Tabs */}
            <motion.div
          className="flex justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
            {[
              { id: 'components', label: 'Components', icon: Settings },
              { id: 'forms', label: 'Forms', icon: Mail },
              { id: 'animations', label: 'Animations', icon: Star },
              { id: 'neomorphic', label: 'Neomorphic', icon: Heart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  selectedTab === tab.id
                    ? 'bg-ludus-orange text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
            </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'components' && (
            <motion.div
              key="components"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Basic Components */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Buttons Section */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Buttons</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button className="w-full">Primary</Button>
                      <Button variant="outline" className="w-full">Outline</Button>
                      <Button variant="destructive" className="w-full">Destructive</Button>
                      <Button variant="ghost" className="w-full">Ghost</Button>
          </div>
                    <div className="flex gap-2">
                      <Button size="sm">Small</Button>
                      <Button size="default">Default</Button>
                      <Button size="lg">Large</Button>
        </div>
                    <div className="flex gap-2">
                      <Button disabled>Disabled</Button>
                      <Button loading>Loading</Button>
                </div>
                  </CardContent>
                </Card>

                {/* Inputs Section */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Inputs</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input placeholder={t('common.enterYourName')} />
                    <Input type="email" placeholder={t('common.emailAddress')} />
                    <div className="relative">
                      <Input 
                        type={passwordVisible ? "text" : "password"}
                        placeholder={t('common.password')}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                    <Input disabled placeholder={t('common.disabledInput')} />
                  </CardContent>
                </Card>
              </div>

              {/* Alerts Section */}
              <Card className="mb-8">
                <CardHeader>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Alerts</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Alert variant="default">
                      <Info className="h-4 w-4" />
                      <span>This is a default alert message.</span>
                    </Alert>
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <span>This is a destructive alert message.</span>
                    </Alert>
                    <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span>This is a success alert message.</span>
                    </Alert>
                    <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>This is a warning alert message.</span>
                    </Alert>
                </div>
                </CardContent>
              </Card>

              {/* Activity Card Section */}
              <Card className="mb-8">
                <CardHeader>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Activity Card</h3>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md mx-auto">
                    <ActivityCard 
                      activity={sampleActivity}
                      onTap={(activity) => console.log('Activity tapped:', activity)}
                    />
                </div>
                </CardContent>
              </Card>

              {/* Progressive Image Section */}
              <Card className="mb-8">
                <CardHeader>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Progressive Image</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-48 rounded-lg overflow-hidden">
                      <ProgressiveImage
                        category="nature"
                        alt={t('common.natureLandscape')}
                        className="w-full h-full"
                      />
              </div>
                    <div className="h-48 rounded-lg overflow-hidden">
                      <ProgressiveImage
                        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
                        alt={t('common.desertLandscape')}
                        className="w-full h-full"
                      />
            </div>
          </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {selectedTab === 'forms' && (
            <motion.div
              key="forms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
        {/* Form Components */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Contact Form */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Contact Form</h3>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <Input
                    type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Enter your email"
                  />
                </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Message
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-ludus-orange dark:bg-gray-700 dark:text-white"
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          placeholder="Enter your message"
                    />
                  </div>
                      <Button 
                        className="w-full" 
                        loading={isLoading}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsLoading(true);
                          setTimeout(() => setIsLoading(false), 2000);
                        }}
                      >
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Rich Text Editor */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Rich Text Editor</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <RichTextEditor
                        initialContent=""
                        onChange={(content) => console.log('Editor content:', content)}
                        placeholder="Start writing your content..."
                      />
                </div>
                  </CardContent>
                </Card>
              </div>

              {/* Form Validation Examples */}
              <Card className="mb-8">
                <CardHeader>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Form Validation</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Valid Input
                      </label>
                      <div className="relative">
                        <Input placeholder={t('common.validInput')} className="border-green-500" />
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                </div>
                </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Invalid Input
                  </label>
                      <div className="relative">
                        <Input placeholder={t('common.invalidInput')} className="border-red-500" />
                        <X className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                </div>
                      </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {selectedTab === 'animations' && (
            <motion.div
              key="animations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Animation Examples */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Hover Animations */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Hover Animations</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-ludus-orange text-white rounded-lg text-center cursor-pointer"
                      >
                        Scale
                      </motion.div>
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        className="p-4 bg-blue-500 text-white rounded-lg text-center cursor-pointer"
                      >
                        Rotate
                      </motion.div>
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="p-4 bg-green-500 text-white rounded-lg text-center cursor-pointer"
                      >
                        Lift
                      </motion.div>
                      <motion.div
                        whileHover={{ 
                          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                          y: -2
                        }}
                        className="p-4 bg-purple-500 text-white rounded-lg text-center cursor-pointer"
                      >
                        Shadow
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>

                {/* Loading Animations */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Loading Animations</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 border-2 border-ludus-orange border-t-transparent rounded-full"
                        />
                        <span>Spinning loader</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.2
                              }}
                              className="w-3 h-3 bg-ludus-orange rounded-full"
                  />
                ))}
              </div>
                        <span>Bouncing dots</span>
            </div>
                      <div className="flex items-center gap-4">
                  <motion.div
                          animate={{ width: ["0%", "100%", "0%"] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-1 bg-ludus-orange rounded-full"
                        />
                        <span>Progress bar</span>
              </div>
                    </div>
                  </CardContent>
                </Card>
            </div>

              {/* Interactive Elements */}
              <Card className="mb-8">
                <CardHeader>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Interactive Elements</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer"
                    >
                      <h4 className="font-semibold mb-2">Gradient Card</h4>
                      <p className="text-sm opacity-90">Hover and tap to see animations</p>
                </motion.div>

                <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-6 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-lg"
                    >
                      <h4 className="font-semibold mb-2">Slide In</h4>
                      <p className="text-sm opacity-90">Animated on page load</p>
                </motion.div>

                <motion.div
                      whileHover={{ 
                        background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                        transition: { duration: 0.3 }
                      }}
                      className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-lg cursor-pointer"
                    >
                      <h4 className="font-semibold mb-2">Color Change</h4>
                      <p className="text-sm opacity-90">Hover to change gradient</p>
                </motion.div>
              </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {selectedTab === 'neomorphic' && (
            <motion.div
              key="neomorphic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Neomorphic Components */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                  Neomorphic Design System
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Neomorphic Buttons */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Buttons</h4>
                    <div className="space-y-3">
                      <button className="w-full p-4 neumorphic rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:neumorphic-pressed transition-all duration-200">
                        Neumorphic Button
                </button>
                      <button className="w-full p-4 neumorphic-subtle rounded-xl text-gray-600 dark:text-gray-400 font-medium hover:neumorphic-pressed transition-all duration-200">
                        Subtle Button
                      </button>
            </div>
          </div>

                  {/* Neomorphic Cards */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Cards</h4>
                    <div className="p-6 neumorphic rounded-xl">
                      <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Card Title</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        This is a neumorphic card with soft shadows and rounded corners.
                      </p>
            </div>
          </div>

                  {/* Neomorphic Inputs */}
            <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Inputs</h4>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder={t('common.neumorphicInput')}
                        className="w-full p-3 neumorphic-subtle rounded-xl border-0 focus:neumorphic-pressed focus:outline-none text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <input 
                        type="text" 
                        placeholder={t('common.pressedInput')}
                        className="w-full p-3 neumorphic-pressed rounded-xl border-0 focus:outline-none text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                </div>
              </div>
                </div>
              </div>

              {/* Neomorphic Activity Card */}
              <Card className="mb-8">
                <CardHeader>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Neomorphic Activity Card</h3>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md mx-auto">
                    <div className="neo-activity-card p-6 rounded-2xl">
                      <div className="relative mb-4">
                        <img 
                          src={sampleActivity.image_url}
                          alt={sampleActivity.title}
                          className="w-full h-48 object-cover rounded-xl"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-sm font-semibold text-gray-800">
                            ر.س {sampleActivity.price}
                          </span>
                </div>
              </div>

                      <div className="space-y-3">
                <div>
                          <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {sampleActivity.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
                              {sampleActivity.category}
                            </div>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="text-sm font-medium text-gray-800">
                                {sampleActivity.vendor_rating}
                              </span>
                </div>
              </div>
            </div>

                        <p className="text-sm text-gray-700">
                          {sampleActivity.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-700">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {sampleActivity.location}
              </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {sampleActivity.duration}
                </div>
                </div>
              </div>
                </div>
                </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RTL/LTR Demo Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">RTL/LTR Layout Demo</h2>
          </CardHeader>
          <CardContent>
            <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                <p className="font-medium text-blue-900 dark:text-blue-100">First Item</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">This shows how layout changes with language</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                <p className="font-medium text-green-900 dark:text-green-100">Second Item</p>
                <p className="text-sm text-green-700 dark:text-green-300">Notice the order and spacing changes</p>
            </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">Third Item</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">RTL languages flow right-to-left</p>
          </div>
              </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Layout Behavior</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>• <strong>LTR (English):</strong> Items flow left to right, margins/padding on left</p>
                <p>• <strong>RTL (Arabic):</strong> Items flow right to left, margins/padding on right</p>
                <p>• <strong>Spacing:</strong> Uses <code>rtl:space-x-reverse</code> for proper spacing</p>
                <p>• <strong>Flexbox:</strong> Uses <code>flex-row-reverse</code> for RTL layouts</p>
                </div>
                </div>
          </CardContent>
        </Card>

        {/* Translation Demo Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Translation System Demo</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Common Translations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Common Actions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Save:</span>
                    <span className="text-gray-600 dark:text-gray-400">{t('common.save')}</span>
                      </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Cancel:</span>
                    <span className="text-gray-600 dark:text-gray-400">{t('common.cancel')}</span>
                    </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Delete:</span>
                    <span className="text-gray-600 dark:text-gray-400">{t('common.delete')}</span>
                </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Loading:</span>
                    <span className="text-gray-600 dark:text-gray-400">{t('common.loading')}</span>
              </div>
                </div>
              </div>

              {/* Navigation Translations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Navigation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Home:</span>
                    <span className="text-gray-600 dark:text-gray-400">{t('navigation.home')}</span>
            </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Activities:</span>
                    <span className="text-gray-600 dark:text-gray-400">{t('navigation.activities')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Profile:</span>
                    <span className="text-gray-600 dark:text-gray-400">{t('navigation.profile')}</span>
                </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Wallet:</span>
                    <span className="text-gray-600 dark:text-gray-400">{t('navigation.wallet')}</span>
                </div>
                </div>
              </div>
            </div>

            {/* Language Info */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Language Information</h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p><strong>Current Language:</strong> {currentLanguage}</p>
                <p><strong>Text Direction:</strong> {isRTL ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}</p>
                <p><strong>Document Language:</strong> {document.documentElement.lang}</p>
                <p><strong>Document Direction:</strong> {document.documentElement.dir}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Show Alert */}
        {showAlert && (
          <Alert variant="default" className="fixed bottom-4 right-4 max-w-sm z-50">
            <div className="flex items-center justify-between">
              <span>{t('common.success')} - This is a demo alert!</span>
              <button 
                onClick={() => setShowAlert(false)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
      </div>
          </Alert>
        )}

      {/* Floating Action Button */}
      <FloatingActionButton
          icon={Plus}
        notifications={notifications}
          tooltip="Add new item"
          onClick={() => {
            setNotifications(notifications + 1);
            setShowAlert(true);
          }}
        />
      </div>
    </div>
  );
};

export default UIShowcasePage;