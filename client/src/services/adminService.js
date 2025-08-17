import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const createAuthAxios = () => {
  const token = localStorage.getItem('accessToken'); // Fixed: use correct token key
  return axios.create({
    baseURL: `${API_BASE_URL}/admin`,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    },
    withCredentials: true // Include cookies for HttpOnly refresh tokens
  });
};

export const adminService = {
  // Admin roles management
  async getAdminRoles() {
    const api = createAuthAxios();
    const response = await api.get('/roles');
    return response.data;
  },

  async initializeAdminRoles() {
    const api = createAuthAxios();
    const response = await api.post('/roles/initialize');
    return response.data;
  },

  // Admin team management
  async getAdminTeam(params = {}) {
    const api = createAuthAxios();
    const response = await api.get('/team', { params });
    return response.data;
  },

  async assignAdminRole(userId, adminRole, assignedPartners = []) {
    const api = createAuthAxios();
    const response = await api.post('/team/assign', {
      userId,
      adminRole,
      assignedPartners
    });
    return response.data;
  },

  async updateAdminUser(userId, updateData) {
    const api = createAuthAxios();
    const response = await api.put(`/team/${userId}`, updateData);
    return response.data;
  },

  async removeAdminRole(userId) {
    const api = createAuthAxios();
    const response = await api.delete(`/team/${userId}`);
    return response.data;
  },

  // Dashboard overview
  async getDashboardOverview() {
    const api = createAuthAxios();
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  // Permission helpers
  hasPermission(permissions, resource, action) {
    if (!permissions || !Array.isArray(permissions)) return false;
    
    const permission = permissions.find(p => p.resource === resource);
    if (!permission) return false;
    
    return permission.actions.includes(action) || permission.actions.includes('manage');
  },

  canAccessResource(userRole, resource) {
    const rolePermissions = {
      'SA': ['users', 'partners', 'activities', 'bookings', 'payments', 'ratings', 'content', 'analytics', 'system', 'roles'],
      'PLATFORM_MANAGER': ['content', 'analytics', 'users'],
      'MODERATOR': ['users', 'ratings', 'content', 'analytics'],
      'ADMIN_PARTNERSHIPS': ['partners', 'activities', 'analytics', 'users'],
      'PSM': ['partners', 'activities', 'bookings', 'analytics'],
      'PSA': ['partners', 'activities', 'analytics']
    };

    return rolePermissions[userRole]?.includes(resource) || false;
  }
};