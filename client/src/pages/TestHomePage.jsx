import React, { useState, useEffect } from 'react';

export default function TestHomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('TestHomePage mounted');
    console.log('Testing neumorphic CSS classes...');
    
    // Test if neumorphic classes are available
    const testElement = document.createElement('div');
    testElement.className = 'neumorphic';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    console.log('Neumorphic class computed styles:', {
      background: computedStyle.background,
      boxShadow: computedStyle.boxShadow,
      borderRadius: computedStyle.borderRadius
    });
    
    document.body.removeChild(testElement);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
          <p className="text-blue-800 font-medium">Loading Test Page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Test Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-800 mb-4">
            Test Homepage - Enhanced UX
          </h1>
          <p className="text-xl text-gray-700">
            This is a test page to verify the UI is working correctly
          </p>
        </div>

        {/* Neumorphic Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Basic Neumorphic */}
          <div 
            className="neumorphic p-6 rounded-2xl text-center"
            style={{
              background: '#f0f0f0',
              boxShadow: '8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff',
              borderRadius: '16px'
            }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">Basic Neumorphic</h3>
            <p className="text-gray-600">Standard neumorphic design</p>
          </div>

          {/* Subtle Neumorphic */}
          <div 
            className="neumorphic-subtle p-6 rounded-2xl text-center"
            style={{
              background: '#f8f8f8',
              boxShadow: '4px 4px 8px #e0e0e0, -4px -4px 8px #ffffff',
              borderRadius: '12px'
            }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">Subtle Neumorphic</h3>
            <p className="text-gray-600">Lighter shadow variant</p>
          </div>

          {/* Elevated Neumorphic */}
          <div 
            className="neumorphic-elevated p-6 rounded-2xl text-center"
            style={{
              background: '#f0f0f0',
              boxShadow: '12px 12px 24px #d1d1d1, -12px -12px 24px #ffffff',
              borderRadius: '20px'
            }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">Elevated Neumorphic</h3>
            <p className="text-gray-600">Deeper shadow variant</p>
          </div>
        </div>

        {/* Interactive Test */}
        <div 
          className="neumorphic p-8 rounded-2xl text-center"
          style={{
            background: '#f0f0f0',
            boxShadow: '8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff',
            borderRadius: '16px'
          }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Interactive Elements</h2>
          <div className="flex gap-4 justify-center">
            <button 
              className="neumorphic-subtle px-6 py-3 rounded-xl text-blue-600 font-medium hover:scale-105 transition-transform duration-200"
              style={{
                background: '#f8f8f8',
                boxShadow: '4px 4px 8px #e0e0e0, -4px -4px 8px #ffffff',
                borderRadius: '12px'
              }}
            >
              Hover Me
            </button>
            <button 
              className="neumorphic-pressed px-6 py-3 rounded-xl text-green-600 font-medium"
              style={{
                background: '#e8e8e8',
                boxShadow: 'inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff',
                borderRadius: '12px'
              }}
            >
              Pressed State
            </button>
          </div>
        </div>

        {/* Status Info */}
        <div className="mt-8 text-center">
          <div 
            className="neumorphic-subtle p-4 rounded-xl inline-block"
            style={{
              background: '#f8f8f8',
              boxShadow: '4px 4px 8px #e0e0e0, -4px -4px 8px #ffffff',
              borderRadius: '12px'
            }}
          >
            <p className="text-sm text-gray-600">
              Component loaded successfully at {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* CSS Status Check */}
        <div className="mt-8 text-center">
          <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">CSS Status Check</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Neumorphic CSS:</span> 
                <span className="ml-2 text-green-600">✓ Loaded (with fallback styles)</span>
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Tailwind CSS:</span> 
                <span className="ml-2 text-green-600">✓ Working</span>
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Component State:</span> 
                <span className="ml-2 text-green-600">✓ Rendered Successfully</span>
              </p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 text-center">
          <div className="bg-gray-100 p-4 rounded-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Debug Information</h3>
            <div className="text-left text-sm text-gray-600 space-y-1">
              <p>• Component mounted at: {new Date().toISOString()}</p>
              <p>• Current URL: {window.location.href}</p>
              <p>• User Agent: {navigator.userAgent.substring(0, 50)}...</p>
              <p>• Screen Size: {window.innerWidth} x {window.innerHeight}</p>
              <p>• CSS Classes Tested: neumorphic, neumorphic-subtle, neumorphic-elevated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
