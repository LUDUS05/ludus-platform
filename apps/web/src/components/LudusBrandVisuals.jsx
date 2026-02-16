import React from 'react';
import useTranslationWithFallback from '../hooks/useTranslationWithFallback';

const LudusBrandVisuals = ({ colors } = {}) => {
  const { t } = useTranslationWithFallback();

  const defaultColors = [
    { name: 'Ludus Purple', hex: '#7A5FFF', border: false },
    { name: 'Midnight Black', hex: '#0E0E10', border: false },
    { name: 'Pure White', hex: '#FFFFFF', border: true },
    { name: 'Electric Blue', hex: '#00D4FF', border: false },
    { name: 'Success Green', hex: '#10B981', border: false },
    { name: 'Warning Orange', hex: '#F59E0B', border: false },
    { name: 'Error Red', hex: '#EF4444', border: false },
  ];

  const rawColors =
    Array.isArray(colors) && colors.length > 0 ? colors : defaultColors;
  const safeColors = rawColors.filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('brand.visuals.title', 'LUDUS Brand Visual System')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t(
              'brand.visuals.subtitle',
              'A comprehensive guide to our brand identity, colors, typography, and UI components'
            )}
          </p>
        </div>

        {/* Logo Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('brand.visuals.logo.title', 'Logo')}
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <img
                alt="LUDUS Logo"
                src="/3.png"
                className="w-32 h-32 object-contain"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg items-center justify-center text-white font-bold text-2xl hidden">
                LUDUS
              </div>
            </div>
            <div className="flex-1">
              <p className="text-lg text-gray-700 leading-relaxed">
                {t(
                  'brand.visuals.logo.description',
                  'The LUDUS logo represents connection and discovery through playful geometry. It embodies our mission to bring people together through meaningful social activities.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('brand.visuals.colors.title', 'Color Palette')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {safeColors.map((color, index) => (
              <div key={color?.name ?? index} className="text-center">
                <div
                  role="img"
                  aria-label={color?.name ?? `color-${index}`}
                  className="w-24 h-24 mx-auto rounded-xl shadow-md mb-3"
                  style={{
                    backgroundColor: color?.hex ?? 'transparent',
                    border:
                      color?.border ?? false ? '2px solid #E5E7EB' : 'none',
                  }}
                />
                <h3 className="font-semibold text-gray-900 mb-1">
                  {color?.name ?? 'Unnamed'}
                </h3>
                <p className="text-sm text-gray-600 font-mono">
                  {color?.hex ?? '-'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('brand.visuals.typography.title', 'Typography')}
          </h2>
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                H1 - Main Heading
              </h1>
              <p className="text-sm text-gray-500">Font: Inter, 4xl, Bold</p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-2">
                H2 - Section Heading
              </h2>
              <p className="text-sm text-gray-500">
                Font: Inter, 3xl, Semibold
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-medium text-gray-900 mb-2">
                H3 - Subsection Heading
              </h3>
              <p className="text-sm text-gray-500">Font: Inter, 2xl, Medium</p>
            </div>
            <div>
              <p className="text-lg text-gray-700 mb-2">
                Body - Regular paragraph text for content and descriptions
              </p>
              <p className="text-sm text-gray-500">Font: Inter, lg, Regular</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Caption - Small text for labels and secondary information
              </p>
              <p className="text-sm text-gray-500">Font: Inter, sm, Regular</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('brand.visuals.buttons.title', 'Button Styles')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Primary Actions
              </h3>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                {t('brand.visuals.buttons.primary', 'Primary Action')}
              </button>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Secondary Actions
              </h3>
              <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                {t('brand.visuals.buttons.secondary', 'Secondary Action')}
              </button>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Outline Actions
              </h3>
              <button className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                {t('brand.visuals.buttons.outline', 'Outline Action')}
              </button>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Success Actions
              </h3>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                {t('brand.visuals.buttons.success', 'Success Action')}
              </button>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Warning Actions
              </h3>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                {t('brand.visuals.buttons.warning', 'Warning Action')}
              </button>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Danger Actions
              </h3>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                {t('brand.visuals.buttons.danger', 'Danger Action')}
              </button>
            </div>
          </div>
        </div>

        {/* Icons and Graphics */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('brand.visuals.icons.title', 'Icons & Graphics')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Activity', icon: '🎯' },
              { name: 'Community', icon: '👥' },
              { name: 'Discovery', icon: '🔍' },
              { name: 'Connection', icon: '🤝' },
              { name: 'Fun', icon: '🎉' },
              { name: 'Growth', icon: '📈' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{item.icon}</div>
                <p className="text-sm text-gray-600">{item.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Spacing and Layout */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('brand.visuals.spacing.title', 'Spacing & Layout')}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Spacing Scale
              </h3>
              <div className="space-y-2">
                {[
                  { name: 'xs', value: '4px', class: 'w-1 h-4' },
                  { name: 'sm', value: '8px', class: 'w-2 h-4' },
                  { name: 'md', value: '16px', class: 'w-4 h-4' },
                  { name: 'lg', value: '24px', class: 'w-6 h-4' },
                  { name: 'xl', value: '32px', class: 'w-8 h-4' },
                  { name: '2xl', value: '48px', class: 'w-12 h-4' },
                ].map(space => (
                  <div key={space.name} className="flex items-center gap-4">
                    <div className={`bg-purple-200 ${space.class}`}></div>
                    <span className="font-mono text-sm">
                      {space.name}: {space.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Border Radius
              </h3>
              <div className="flex gap-4">
                {[
                  { name: 'sm', class: 'rounded-sm' },
                  { name: 'md', class: 'rounded-md' },
                  { name: 'lg', class: 'rounded-lg' },
                  { name: 'xl', class: 'rounded-xl' },
                  { name: '2xl', class: 'rounded-2xl' },
                  { name: 'full', class: 'rounded-full' },
                ].map(radius => (
                  <div key={radius.name} className="text-center">
                    <div
                      className={`w-12 h-12 bg-purple-200 ${radius.class} mb-2`}
                    ></div>
                    <span className="text-xs text-gray-600">{radius.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LudusBrandVisuals;
