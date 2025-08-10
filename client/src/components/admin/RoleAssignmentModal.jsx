import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import api from '../../services/api';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { Shield, Users, Search, X } from 'lucide-react';

const RoleAssignmentModal = ({ isOpen, onClose, selectedUser, adminRoles, onSuccess }) => {
  const [formData, setFormData] = useState({
    userId: '',
    adminRole: '',
    assignedPartners: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchingUsers, setSearchingUsers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (selectedUser) {
        // Edit mode
        setFormData({
          userId: selectedUser._id,
          adminRole: selectedUser.adminRole || '',
          assignedPartners: selectedUser.assignedPartners?.map(p => p._id) || []
        });
      } else {
        // Create mode
        setFormData({
          userId: '',
          adminRole: '',
          assignedPartners: []
        });
      }
      loadPartners();
    }
  }, [isOpen, selectedUser]);

  const loadPartners = async () => {
    try {
      const response = await api.get('/admin/vendors');
      setPartners(response.data.data.vendors || []);
    } catch (error) {
      console.error('Failed to load partners:', error);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchingUsers(true);
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&role=user`);
      setSearchResults(response.data.data.users || []);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (!selectedUser) { // Only search in create mode
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, selectedUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.adminRole) {
      setError('Please select a user and admin role');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (selectedUser) {
        // Update existing admin
        await adminService.updateAdminUser(formData.userId, {
          adminRole: formData.adminRole,
          assignedPartners: formData.assignedPartners
        });
      } else {
        // Assign new admin role
        await adminService.assignAdminRole(
          formData.userId,
          formData.adminRole,
          formData.assignedPartners
        );
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save admin role');
    } finally {
      setLoading(false);
    }
  };

  const shouldShowPartnerSelection = () => {
    return ['PSM', 'PSA'].includes(formData.adminRole);
  };

  const handlePartnerToggle = (partnerId) => {
    setFormData(prev => ({
      ...prev,
      assignedPartners: prev.assignedPartners.includes(partnerId)
        ? prev.assignedPartners.filter(id => id !== partnerId)
        : [...prev.assignedPartners, partnerId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedUser ? 'Update Admin Role' : 'Assign Admin Role'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <Alert type="error" title="Error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* User Selection (only for create mode) */}
          {!selectedUser && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Search Results */}
              {searchQuery && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                  {searchingUsers ? (
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {searchResults.map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          className={`w-full text-left p-3 hover:bg-gray-50 ${
                            formData.userId === user._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, userId: user._id }))}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-medium text-gray-600">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Selected User Display (for edit mode) */}
          {selectedUser && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-medium text-gray-600">
                    {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedUser.email}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Role
            </label>
            <select
              value={formData.adminRole}
              onChange={(e) => setFormData(prev => ({ ...prev, adminRole: e.target.value, assignedPartners: [] }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Select a role...</option>
              {adminRoles.map((role) => (
                <option key={role.name} value={role.name}>
                  {role.displayName}
                </option>
              ))}
            </select>
            {formData.adminRole && (
              <p className="mt-2 text-xs text-gray-600">
                {adminRoles.find(r => r.name === formData.adminRole)?.description}
              </p>
            )}
          </div>

          {/* Partner Assignment (for PSM/PSA roles) */}
          {shouldShowPartnerSelection() && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Partners ({formData.assignedPartners.length} selected)
              </label>
              <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                {partners.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {partners.map((partner) => (
                      <label
                        key={partner._id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedPartners.includes(partner._id)}
                          onChange={() => handlePartnerToggle(partner._id)}
                          className="mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {partner.businessInfo?.businessName || partner.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {partner.businessInfo?.city} • {partner.category}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No partners available
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-ludus-orange hover:bg-ludus-orange-dark text-white"
              disabled={loading || !formData.userId || !formData.adminRole}
            >
              {loading ? 'Saving...' : selectedUser ? 'Update Role' : 'Assign Role'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleAssignmentModal;