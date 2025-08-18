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


import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { adminService, DashboardData } from '@/services/adminService';
import { Link } from '@opgrapes/ui/Link';
import { useRouter } from 'next/navigation';

function AdminDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardOverview();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
                You don&apos;t have permission to access the admin dashboard.
              </Text>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
          <LoadingSkeleton />
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" className="py-8">
        <Card>
          <div className="p-6">
            <div className="text-center py-8">
              <Text size="xl" weight="bold" color="red">
                Error Loading Dashboard
              </Text>
              <Text size="lg" color="gray" className="mt-2">
                {error}
              </Text>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
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
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                  <Text as="div" size="xl" weight="bold">
                  Admin Dashboard 🎯
                </Text>
                <Text size="lg" color="gray">
                  Welcome back! Here&apos;s what&apos;s happening with your platform.
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/users')}
                >
                  Manage Users
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/activities')}
                >
                  Moderate Activities
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="text-center">
                <Text size="xl" weight="bold" className="text-blue-600">
                  {dashboardData?.overview.totalUsers || 0}
                </Text>
                <Text size="sm" color="gray">Total Users</Text>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="text-center">
                <Text size="xl" weight="bold" className="text-green-600">
                  {dashboardData?.overview.totalActivities || 0}
                </Text>
                <Text size="sm" color="gray">Total Activities</Text>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="text-center">
                <Text size="xl" weight="bold" className="text-purple-600">
                  {dashboardData?.overview.totalBookings || 0}
                </Text>
                <Text size="sm" color="gray">Total Bookings</Text>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="text-center">
                <Text size="xl" weight="bold" className="text-orange-600">
                  {dashboardData?.overview.totalVendors || 0}
                </Text>
                <Text size="sm" color="gray">Total Vendors</Text>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue & Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <div className="text-center">
                <Text size="xl" weight="bold" className="text-green-600">
                  ${dashboardData?.overview.totalRevenue?.toFixed(2) || '0.00'}
                </Text>
                <Text size="sm" color="gray">Total Revenue</Text>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="text-center">
                <Text size="xl" weight="bold" className="text-blue-600">
                  ${dashboardData?.overview.avgBookingValue?.toFixed(2) || '0.00'}
                </Text>
                <Text size="sm" color="gray">Average Booking Value</Text>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <div className="text-center">
                <Text size="xl" weight="bold" className="text-yellow-600">
                  {dashboardData?.overview.pendingVendors || 0}
                </Text>
                <Text size="sm" color="gray">Pending Vendor Approvals</Text>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="text-center">
                <Text size="xl" weight="bold" className="text-yellow-600">
                  {dashboardData?.overview.pendingActivities || 0}
                </Text>
                <Text size="sm" color="gray">Pending Activity Reviews</Text>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Users */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Text as="div" size="xl" weight="bold">
                Recent Users
              </Text>
              <Link href="/admin/users" variant="primary" size="sm">
                View All Users
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData?.recentUsers?.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Text weight="semibold" className="text-blue-600">
                        {(u.firstName?.[0] || 'U')}
                      </Text>
                    </div>
                    <div>
                      <Text weight="medium">{u.firstName} {u.lastName}</Text>
                      <Text size="sm" color="gray">{u.email}</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={'secondary'}>
                      user
                    </Badge>
                    <Text size="sm" color="gray">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Text as="div" size="xl" weight="bold">
                Recent Bookings
              </Text>
              <Link href="/admin/bookings" variant="primary" size="sm">
                View All Bookings
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData?.recentBookings?.map((b) => (
                <div key={b._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Text weight="semibold" className="text-blue-600">
                        {b.activityId.title.charAt(0)}
                      </Text>
                    </div>
                    <div>
                      <Text weight="medium">{b.activityId.title}</Text>
                      <Text size="sm" color="gray">by {b.userId.firstName} {b.userId.lastName}</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'secondary'}>
                      {b.status}
                    </Badge>
                    <Text size="sm" color="gray">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* System Health */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <Text as="div" size="xl" weight="bold">
              System Health
            </Text>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Text weight="medium" className="mb-2">Database Status</Text>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <Text size="sm" color="gray">Connected</Text>
                </div>
              </div>
              <div>
                <Text weight="medium" className="mb-2">API Status</Text>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <Text size="sm" color="gray">Operational</Text>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <Text as="div" size="xl" weight="bold">
              Quick Actions
            </Text>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/users')}
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <Text size="lg">👥</Text>
                <Text weight="medium">Manage Users</Text>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/activities')}
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <Text size="lg">🎯</Text>
                <Text weight="medium">Moderate Activities</Text>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/analytics')}
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <Text size="lg">📊</Text>
                <Text weight="medium">View Analytics</Text>
              </Button>
            </div>
          </div>
        </Card>
      </Stack>
    </Container>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
