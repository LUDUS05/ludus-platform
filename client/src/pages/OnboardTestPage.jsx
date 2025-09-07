import React from 'react';
import { Link } from 'react-router-dom';

const OnboardTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Onboarding Test</h1>
          <p className="text-gray-600 mb-6">Minimal pre-launch onboarding entry using existing layout.</p>

          <div className="space-y-4">
            <Link to="/onboarding" className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:shadow-sm transition">
              Go to Onboarding Flow
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link to="/register" className="inline-flex items-center justify-center px-4 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition">
                Register (email)
              </Link>
              <Link to="/neo/home" className="inline-flex items-center justify-center px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition">
                Neo Home
              </Link>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>Tips:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Use Incognito to test a fresh user flow</li>
                <li>Profile/Interests can be skipped via “Complete Later”</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardTestPage;


