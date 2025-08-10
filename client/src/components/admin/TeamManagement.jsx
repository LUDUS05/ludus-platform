import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import RoleAssignmentModal from './RoleAssignmentModal';
import { 
  Shield, 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter
} from 'lucide-react';

const TeamManagement = () => {
  const [adminTeam, setAdminTeam] = useState([]);
  const [adminRoles, setAdminRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadAdminRoles();
    loadAdminTeam();
  }, [filters]);

  const loadAdminRoles = async () => {
    try {
      const response = await adminService.getAdminRoles();
      setAdminRoles(response.data.roles);
    } catch (error) {
      console.error('Failed to load admin roles:', error);
    }
  };

  const loadAdminTeam = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdminTeam(filters);
      setAdminTeam(response.data.adminUsers);
      setPagination(response.data.pagination);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load admin team');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to remove admin access for this user?')) {
      return;
    }

    try {
      await adminService.removeAdminRole(userId);
      loadAdminTeam(); // Reload the list
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove admin role');
    }
  };

  const getRoleDisplayName = (roleName) => {
    const role = adminRoles.find(r => r.name === roleName);
    return role?.displayName || roleName;
  };

  const getRoleColor = (roleName) => {
    const colors = {
      'SA': 'bg-red-100 text-red-800',
      'PLATFORM_MANAGER': 'bg-blue-100 text-blue-800',
      'MODERATOR': 'bg-yellow-100 text-yellow-800',
      'ADMIN_PARTNERSHIPS': 'bg-green-100 text-green-800',
      'PSM': 'bg-purple-100 text-purple-800',
      'PSA': 'bg-indigo-100 text-indigo-800'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800';
  };

  if (loading && adminTeam.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Team Management
          </h1>
          <p className="text-gray-600">
            Manage admin roles and permissions for the LUDUS platform team.
          </p>
        </div>
        <Button
          onClick={() => setShowAssignModal(true)}
          className="bg-ludus-orange hover:bg-ludus-orange-dark text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Assign Admin Role
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by name or email
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search team members..."
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by role
            </label>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <select
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
              >
                <option value="">All roles</option>
                {adminRoles.map(role => (
                  <option key={role.name} value={role.name}>
                    {role.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ role: '', search: '', page: 1, limit: 20 })}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Alert type="error" title="Error">
          {error}
        </Alert>
      )}

      {/* Admin Team List */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Admin Team ({pagination?.total || 0})
              </h2>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Partners
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adminTeam.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {admin.firstName?.charAt(0)}{admin.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {admin.firstName} {admin.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {admin.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(admin.adminRole)}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {getRoleDisplayName(admin.adminRole)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {admin.assignedPartners?.length > 0 ? (
                        <div>
                          <span className="font-medium">{admin.assignedPartners.length} partners</span>
                          <div className="text-xs text-gray-500 mt-1">
                            {admin.assignedPartners.slice(0, 2).map(partner => 
                              partner.businessInfo?.businessName || partner.name
                            ).join(', ')}
                            {admin.assignedPartners.length > 2 && ` +${admin.assignedPartners.length - 2} more`}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No assigned partners</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {admin.adminMetadata?.assignedBy ? (
                        <>
                          {admin.adminMetadata.assignedBy.firstName} {admin.adminMetadata.assignedBy.lastName}
                          <div className="text-xs text-gray-500">
                            {new Date(admin.adminMetadata.assignedAt).toLocaleDateString()}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">System</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      onClick={() => {
                        setSelectedUser(admin);
                        setShowAssignModal(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {admin.adminRole !== 'SA' && (
                      <Button
                        onClick={() => handleRemoveAdmin(admin._id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.pages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Role Assignment Modal */}
      <RoleAssignmentModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedUser(null);
        }}
        selectedUser={selectedUser}
        adminRoles={adminRoles}
        onSuccess={() => {
          loadAdminTeam();
          setError('');
        }}
      />
    </div>
  );
};

export default TeamManagement;