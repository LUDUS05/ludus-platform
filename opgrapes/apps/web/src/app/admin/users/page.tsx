'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Container } from '@opgrapes/ui/Container';
import { Card } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { Badge } from '@opgrapes/ui/Badge';
import { Avatar } from '@opgrapes/ui/Avatar';
import { Divider } from '@opgrapes/ui/Divider';
import { Input } from '@opgrapes/ui/Input';
import { Select } from '@opgrapes/ui/Select';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { adminService, User, UsersResponse } from '@/services/adminService';
import { useRouter } from 'next/navigation';

function UserManagementContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response: UsersResponse = await adminService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        role: filters.role || undefined,
        search: filters.search || undefined,
        status: filters.status || undefined
      });
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      await adminService.updateUser(userId, updates);
      // Refresh the user list
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleUserDeactivate = async (userId: string) => {
    if (confirm('Are you sure you want to deactivate this user?')) {
      try {
        await adminService.deactivateUser(userId);
        fetchUsers();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to deactivate user');
      }
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'vendor': return 'warning';
      case 'user': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'success' : 'danger';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <Container size="lg" className="py-8">
        <Card className="p-6">
          <div className="text-center py-8">
            <Text size="xl" weight="bold" className="text-red-600">
              Access Denied
            </Text>
            <Text size="lg" className="text-gray-600 mt-2">
              You don&apos;t have permission to access user management.
            </Text>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8">
      <Stack spacing="lg">
        {/* Header */}
        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <Text as="h1" size="3xl" weight="bold">
                  User Management 👥
                </Text>
                <Text size="lg" color="gray">
                  Manage platform users, roles, and permissions
                </Text>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
              >
                Back to Dashboard
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Filters */}
        <Card>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Text size="sm" weight="medium" className="mb-2 block">
                  Search Users
                </Text>
                <Input
                  placeholder="Name or email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div>
                <Text size="sm" weight="medium" className="mb-2 block">
                  Role
                </Text>
                <Select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>
              <div>
                <Text size="sm" weight="medium" className="mb-2 block">
                  Status
                </Text>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="primary"
                  onClick={() => fetchUsers()}
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Users List */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Text as="h2" size="xl" weight="bold">
                Users ({pagination.total})
              </Text>
              <Text size="sm" color="gray">
                Page {pagination.page} of {pagination.pages}
              </Text>
            </div>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <Stack gap="4">
                {[...Array(5)].map((_, i) => (
                  <LoadingSkeleton key={i} className="h-20" />
                ))}
              </Stack>
            ) : error ? (
              <div className="text-center py-8">
                <Text size="lg" color="red">
                  {error}
                </Text>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => fetchUsers()}
                >
                  Retry
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Text size="lg" color="gray">
                  No users found matching your criteria
                </Text>
              </div>
            ) : (
              <Stack gap="4">
                {users.map((userItem) => (
                  <div key={userItem._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar
                          size="lg"
                          alt={`${userItem.firstName} ${userItem.lastName}`}
                        />
                        <div>
                          <Text size="lg" weight="bold">
                            {userItem.firstName} {userItem.lastName}
                          </Text>
                          <Text size="sm" color="gray">
                            {userItem.email}
                          </Text>
                          {userItem.phone && (
                            <Text size="sm" color="gray">
                              {userItem.phone}
                            </Text>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant={getRoleBadgeVariant(userItem.role)}>
                              {userItem.role}
                            </Badge>
                            <Badge variant={getStatusBadgeVariant(userItem.isActive)}>
                              {userItem.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {userItem.isVerified && (
                              <Badge variant="success">Verified</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Text size="sm" color="gray">
                          Joined {formatDate(userItem.createdAt)}
                        </Text>
                        {userItem.lastLoginAt && (
                          <Text size="sm" color="gray">
                            Last login: {formatDate(userItem.lastLoginAt)}
                          </Text>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newRole = userItem.role === 'admin' ? 'user' : 'admin';
                              handleUserUpdate(userItem._id, { role: newRole });
                            }}
                            disabled={userItem._id === user._id} // Can&apos;t change own role
                          >
                            {userItem.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleUserUpdate(userItem._id, { isVerified: !userItem.isVerified });
                            }}
                          >
                            {userItem.isVerified ? 'Unverify' : 'Verify'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleUserUpdate(userItem._id, { isActive: !userItem.isActive });
                            }}
                          >
                            {userItem.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          {userItem.isActive && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleUserDeactivate(userItem._id)}
                              disabled={userItem._id === user._id} // Can&apos;t deactivate self
                            >
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Stack>
            )}
          </Card.Body>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Card>
            <Card.Body>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(
                    pagination.pages - 4,
                    pagination.page - 2
                  )) + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? 'primary' : 'outline'}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </Stack>
    </Container>
  );
}

export default function UserManagementPage() {
  return (
    <ProtectedRoute>
      <UserManagementContent />
    </ProtectedRoute>
  );
}
