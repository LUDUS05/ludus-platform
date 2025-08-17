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
        <Card padding="lg">
          <div className="text-center py-8">
            <Text size="xl" weight="bold" color="red">Access Denied</Text>
            <Text size="lg" color="gray" className="mt-2">You don't have permission to access activity moderation.</Text>
          </div>
        </Card>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container size="lg" className="py-8">
        <Stack spacing="lg">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" className="py-8">
        <Card className="p-6">
          <div className="text-center py-8">
            <Text size="xl" weight="bold" className="text-red-600">Error</Text>
            <Text size="lg" className="text-gray-600 mt-2">{error}</Text>
            <Button 
              variant="primary" 
              className="mt-4"
              onClick={() => fetchActivities()}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8">
      <Stack spacing="lg">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Text as="div" size="xl" weight="bold">Activity Moderation 🎯</Text>
              <Text size="lg" className="text-gray-600">Review and approve or reject activities</Text>
            </div>
          </div>
        </Card>

        <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Text size="sm" weight="medium" className="mb-2 block">Search</Text>
                <Input 
                  placeholder="Search activities..." 
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
                             <div>
                 <Text size="sm" weight="medium" className="mb-2 block">Status</Text>
                 <Select 
                   value={filters.status} 
                   onChange={(e) => handleFilterChange('status', e.target.value)}
                   options={[
                     { value: '', label: 'All Statuses' },
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

            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Text size="lg" color="gray">No activities found</Text>
                </div>
              ) : (
                <Stack spacing="md">
                  {activities.map((activity) => (
                    <div key={activity._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Text size="lg" weight="bold">{activity.title}</Text>
                            <Badge variant={getStatusBadgeVariant(activity.status)}>
                              {activity.status}
                            </Badge>
                            <Badge variant={activity.isActive ? 'success' : 'secondary'}>
                              {activity.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                                                     <Text size="sm" color="gray" className="mb-2">
                             {activity.title}
                           </Text>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                         <div>
                               <Text size="xs" weight="medium" color="gray">Vendor</Text>
                               <Text size="sm">{activity.vendorId?.businessName || 'N/A'}</Text>
                             </div>
                                                         <div>
                               <Text size="xs" weight="medium" color="gray">Status</Text>
                               <Text size="sm">{activity.status}</Text>
                             </div>
                             <div>
                               <Text size="xs" weight="medium" color="gray">Active</Text>
                               <Text size="sm">{activity.isActive ? 'Yes' : 'No'}</Text>
                             </div>
                            <div>
                              <Text size="xs" weight="medium" color="gray">Created</Text>
                              <Text size="sm">{formatDate(activity.createdAt)}</Text>
                            </div>
                          </div>

                          
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
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

export default function AdminActivitiesPage() {
  return (
    <ProtectedRoute>
      <ActivityModerationContent />
    </ProtectedRoute>
  );
}
