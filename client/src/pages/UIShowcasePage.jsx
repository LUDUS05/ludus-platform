import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import Alert from '../components/ui/Alert';

const UIShowcasePage = () => {
  const { t, i18n } = useTranslation();
  const [showAlert, setShowAlert] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <LanguageSwitcher />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('common.welcome')} - UI Showcase
          </h1>
          <p className="text-xl text-gray-600">
            Current Language: {currentLanguage.toUpperCase()} | Direction: {isRTL ? 'RTL' : 'LTR'}
          </p>
        </div>

        {/* Translation Demo Section */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Translation System Demo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Common Translations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Actions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Save:</span>
                    <span className="text-gray-600">{t('common.save')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Cancel:</span>
                    <span className="text-gray-600">{t('common.cancel')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Delete:</span>
                    <span className="text-gray-600">{t('common.delete')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Loading:</span>
                    <span className="text-gray-600">{t('common.loading')}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Translations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Navigation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Home:</span>
                    <span className="text-gray-600">{t('navigation.home')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Activities:</span>
                    <span className="text-gray-600">{t('navigation.activities')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Profile:</span>
                    <span className="text-gray-600">{t('navigation.profile')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Wallet:</span>
                    <span className="text-gray-600">{t('navigation.wallet')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Language Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Language Information</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Current Language:</strong> {currentLanguage}</p>
                <p><strong>Text Direction:</strong> {isRTL ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}</p>
                <p><strong>Document Language:</strong> {document.documentElement.lang}</p>
                <p><strong>Document Direction:</strong> {document.documentElement.dir}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* UI Components Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Buttons */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Buttons</h3>
              <div className="space-y-3">
                <Button className="w-full">{t('common.save')}</Button>
                <Button variant="outline" className="w-full">{t('common.cancel')}</Button>
                <Button variant="destructive" className="w-full">{t('common.delete')}</Button>
              </div>
            </div>
          </Card>

          {/* Inputs */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Inputs</h3>
              <div className="space-y-3">
                <Input 
                  placeholder={t('auth.email')}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input 
                  type="password"
                  placeholder={t('auth.password')}
                />
              </div>
            </div>
          </Card>

          {/* Alerts */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Alerts</h3>
              <div className="space-y-3">
                <Alert variant="default">
                  {t('common.success')}
                </Alert>
                <Alert variant="destructive">
                  {t('common.error')}
                </Alert>
                <button 
                  onClick={() => setShowAlert(!showAlert)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Toggle Alert
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* RTL/LTR Demo */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">RTL/LTR Layout Demo</h2>
            
            <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="font-medium">First Item</p>
                <p className="text-sm text-gray-600">This shows how layout changes with language</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <p className="font-medium">Second Item</p>
                <p className="text-sm text-gray-600">Notice the order and spacing changes</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <p className="font-medium">Third Item</p>
                <p className="text-sm text-gray-600">RTL languages flow right-to-left</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Layout Behavior</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• <strong>LTR (English):</strong> Items flow left to right, margins/padding on left</p>
                <p>• <strong>RTL (Arabic):</strong> Items flow right to left, margins/padding on right</p>
                <p>• <strong>Spacing:</strong> Uses <code>rtl:space-x-reverse</code> for proper spacing</p>
                <p>• <strong>Flexbox:</strong> Uses <code>flex-row-reverse</code> for RTL layouts</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Dynamic Content Demo */}
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dynamic Content Demo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pluralization Demo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pluralization</h3>
                <div className="space-y-2">
                  <p>0 activities: {t('activities.activity_0')}</p>
                  <p>1 activity: {t('activities.activity_1')}</p>
                  <p>2 activities: {t('activities.activity_2')}</p>
                  <p>3 activities: {t('activities.activity_few', { count: 3 })}</p>
                  <p>10 activities: {t('activities.activity_many', { count: 10 })}</p>
                  <p>25 activities: {t('activities.activity_other', { count: 25 })}</p>
                </div>
              </div>

              {/* Interpolation Demo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Interpolation</h3>
                <div className="space-y-2">
                  <p>{t('auth.signInToAccount')}</p>
                  <p>{t('auth.createNewAccount')}</p>
                  <p>{t('user.registration.questions.firstName.question')}</p>
                  <p>{t('user.registration.questions.lastName.question', { name: 'Ahmed' })}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Show Alert */}
        {showAlert && (
          <Alert variant="default" className="fixed bottom-4 right-4 max-w-sm">
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
      </div>
    </div>
  );
};

export default UIShowcasePage;