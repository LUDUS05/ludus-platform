import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import referralService from '../services/referralService';

const ReferralTestPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [referralCode, setReferralCode] = useState(null);

  const testGenerateReferralCode = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('🧪 Testing referral code generation...');
      console.log('User:', user);
      console.log('Auth token:', localStorage.getItem('accessToken'));
      
      const result = await referralService.generateReferralCode();
      console.log('✅ Referral code generated:', result);
      
      setReferralCode(result.data.referralCode);
      setSuccess('Referral code generated successfully!');
    } catch (error) {
      console.error('❌ Error generating referral code:', error);
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetReferralStats = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('🧪 Testing referral stats...');
      
      const result = await referralService.getReferralStats(user.id);
      console.log('✅ Referral stats:', result);
      
      setSuccess('Referral stats retrieved successfully!');
    } catch (error) {
      console.error('❌ Error getting referral stats:', error);
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600">You need to be logged in to test referral features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Referral System Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Has Token:</strong> {localStorage.getItem('accessToken') ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Referral Code Generation</h2>
          <button
            onClick={testGenerateReferralCode}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Generate Referral Code'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Referral Stats</h2>
          <button
            onClick={testGetReferralStats}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Get Referral Stats'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-green-800 font-semibold mb-2">Success</h3>
            <p className="text-green-700">{success}</p>
            {referralCode && (
              <p className="text-green-700 mt-2">
                <strong>Referral Code:</strong> {referralCode}
              </p>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">Instructions</h3>
          <ol className="text-blue-700 list-decimal list-inside space-y-1">
            <li>Open browser developer tools (F12)</li>
            <li>Go to the Console tab</li>
            <li>Click the test buttons above</li>
            <li>Check the console for detailed error information</li>
            <li>Look for the full error object and response details</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ReferralTestPage;
