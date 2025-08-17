'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Container } from '@opgrapes/ui/Container';
import { Card } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { Badge } from '@opgrapes/ui/Badge';
import { Input } from '@opgrapes/ui/Input';
import { Select } from '@opgrapes/ui/Select';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { adminService, type ActivitiesResponse, type Activity } from '@/services/adminService';

function ActivityModerationContent() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', status: '' });

  useEffect(() => { fetchActivities(); }, [filters, pagination.page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res: ActivitiesResponse = await adminService.getActivities({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
      });
      setActivities(res.activities);
      setPagination(res.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleUpdate = async (id: string, updates: Parameters<typeof adminService.updateActivity>[1]) => {
    try {
      await adminService.updateActivity(id, updates);
      fetchActivities();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update activity');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Container size="lg" className="py-8">
        <Card>
          <Card.Body>
            <div className="text-center py-8">
              <Text size="xl" weight="bold" color="red">Access Denied</Text>
              <Text size="lg" color="gray" className="mt-2">You don't have permission to access activity moderation.</Text>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8">
      <Stack gap="8">
        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <Text as="div" size="xl" weight="bold">Activity Moderation 🎯</Text>
                <Text size="lg" color="gray">Review and approve or reject activities</Text>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text size="sm" weight="medium" className="mb-2 block">Search</Text>
                <Input placeholder="Title..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
              </div>
              <div>
                <Text size="sm" weight="medium" className="mb-2 block">Status</Text>
                <Select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="primary" onClick={() => fetchActivities()} className="w-full">Apply Filters</Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Text as="div" size="xl" weight="bold">Activities ({pagination.total})</Text>
              <Text size="sm" color="gray">Page {pagination.page} of {pagination.pages}</Text>
            </div>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <Stack gap="4">{[...Array(5)].map((_, i) => (<LoadingSkeleton key={i} className="h-20" />))}</Stack>
            ) : error ? (
              <div className="text-center py-8">
                <Text size="lg" color="red">{error}</Text>
                <Button variant="outline" className="mt-4" onClick={() => fetchActivities()}>Retry</Button>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8"><Text size="lg" color="gray">No activities found</Text></div>
            ) : (
              <Stack gap="4">
                {activities.map((a) => (
                  <div key={a._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text weight="bold">{a.title}</Text>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={a.isActive ? 'success' : 'secondary'}>{a.isActive ? 'Active' : 'Inactive'}</Badge>
                          <Badge variant={a.status === 'approved' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}>{a.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleUpdate(a._id, { status: 'approved' })}>Approve</Button>
                        <Button variant="outline" size="sm" onClick={() => handleUpdate(a._id, { status: 'rejected' })}>Reject</Button>
                        <Button variant="outline" size="sm" onClick={() => handleUpdate(a._id, { isActive: !a.isActive })}>{a.isActive ? 'Deactivate' : 'Activate'}</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </Stack>
            )}
          </Card.Body>
        </Card>
      </Stack>
    </Container>
  );
}

export default function ActivityModerationPage() {
  return (
    <ProtectedRoute>
      <ActivityModerationContent />
    </ProtectedRoute>
  );
}

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
import { Input } from '@opgrapes/ui/Input';
import { Select } from '@opgrapes/ui/Select';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { adminService, Activity, ActivitiesResponse } from '@/services/adminService';
import { useRouter } from 'next/navigation';

function ActivityModerationContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
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
    status: ''
  });

  useEffect(() => {
    fetchActivities();
  }, [filters, pagination.page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response: ActivitiesResponse = await adminService.getActivities({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        search: filters.search || undefined
      });
      setActivities(response.activities);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
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

  const handleActivityUpdate = async (activityId: string, updates: {
    status?: 'pending' | 'approved' | 'rejected';
    isActive?: boolean;
    moderationNotes?: string;
  }) => {
    try {
      await adminService.updateActivity(activityId, updates);
      // Refresh the activity list
      fetchActivities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update activity');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
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
        <Card>
          <div className="p-6">
            <div className="text-center py-8">
              <Text size="xl" weight="bold" color="red">
                Access Denied
              </Text>
              <Text size="lg" color="gray" className="mt-2">
                You don't have permission to access activity moderation.
              </Text>
            </div>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8">
      <Stack gap="8">
        {/* Header */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Text as="h1" size="3xl" weight="bold">
                  Activity Moderation 🎯
                </Text>
                <Text size="lg" color="gray">
                  Review and moderate activities submitted by vendors
                </Text>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <Card>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text size="sm" weight="medium" className="mb-2 block">
                  Search Activities
                </Text>
                <Input
                  placeholder="Activity title..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div>
                <Text size="sm" weight="medium" className="mb-2 block">
                  Status
                </Text>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' }
                  ]}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="primary"
                  onClick={() => fetchActivities()}
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Activities List */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Text as="h2" size="xl" weight="bold">
                Activities ({pagination.total})
              </Text>
              <Text size="sm" color="gray">
                Page {pagination.page} of {pagination.pages}
              </Text>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <Stack gap="4">
                {[...Array(5)].map((_, i) => (
                  <LoadingSkeleton key={i} className="h-32" />
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
                  onClick={() => fetchActivities()}
                >
                  Retry
                </Button>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <Text size="lg" color="gray">
                  No activities found matching your criteria
                </Text>
              </div>
            ) : (
              <Stack gap="4">
                {activities.map((activity) => (
                  <div key={activity._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Text size="xl" weight="bold">
                            {activity.title}
                          </Text>
                          <Badge variant={getStatusBadgeVariant(activity.status)}>
                            {activity.status}
                          </Badge>
                          <Badge variant={activity.isActive ? 'success' : 'danger'}>
                            {activity.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <Text size="sm" color="gray">
                            <strong>Vendor:</strong> {activity.vendorId.businessName}
                          </Text>
                          <Text size="sm" color="gray">
                            <strong>Contact:</strong> {activity.vendorId.email}
                          </Text>
                          <Text size="sm" color="gray">
                            <strong>Submitted:</strong> {formatDate(activity.createdAt)}
                          </Text>
                        </div>

                        {/* Moderation Actions */}
                        <div className="flex gap-2">
                          {activity.status === 'pending' && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleActivityUpdate(activity._id, {
                                  status: 'approved',
                                  isActive: true
                                })}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleActivityUpdate(activity._id, {
                                  status: 'rejected',
                                  isActive: false
                                })}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {activity.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivityUpdate(activity._id, {
                                isActive: !activity.isActive
                              })}
                            >
                              {activity.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}

                          {activity.status === 'rejected' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivityUpdate(activity._id, {
                                status: 'pending',
                                isActive: false
                              })}
                            >
                              Send for Review
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const notes = prompt('Enter moderation notes:');
                              if (notes !== null) {
                                handleActivityUpdate(activity._id, {
                                  moderationNotes: notes
                                });
                              }
                            }}
                          >
                            Add Notes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Stack>
            )}
          </div>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Card>
            <div className="p-6">
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
            </div>
          </Card>
        )}
      </Stack>
    </Container>
  );
}

export default function ActivityModerationPage() {
  return (
    <ProtectedRoute>
      <ActivityModerationContent />
    </ProtectedRoute>
  );
}
