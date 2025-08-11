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
import { Link } from '@opgrapes/ui/Link';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { adminService, DashboardData, RecentUser, RecentBooking } from '@/services/adminService';
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
          <Card.Body>
            <div className="text-center py-8">
              <Text size="xl" weight="bold" color="red">
                Access Denied
              </Text>
              <Text size="lg" color="gray" className="mt-2">
                You don't have permission to access the admin dashboard.
              </Text>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container size="lg" className="py-8">
        <Stack gap="8">
          <LoadingSkeleton className="h-32" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-32" />
            ))}
          </div>
          <LoadingSkeleton className="h-64" />
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" className="py-8">
        <Card>
          <Card.Body>
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
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (!dashboardData) return null;

  const { overview, recentUsers, recentBookings } = dashboardData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Container size="lg" className="py-8">
      <Stack gap="8">
        {/* Admin Header */}
        <Card>
          <Card.Body>
            <Stack gap="6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Avatar
                    size="xl"
                    src={user.profilePicture}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                  <div>
                    <Text as="h1" size="3xl" weight="bold">
                      Admin Dashboard 👑
                    </Text>
                    <Text size="lg" color="gray">
                      Welcome back, {user.firstName}! Here's what's happening on the platform.
                    </Text>
                  </div>
                </div>
                <div className="flex gap-3">
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
            </Stack>
          </Card.Body>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <Card.Body>
              <Stack gap="3" className="text-center">
                <Text size="4xl" weight="bold" color="primary">
                  {overview.totalUsers.toLocaleString()}
                </Text>
                <Text size="lg" weight="medium">
                  Total Users
                </Text>
                <Text size="sm" color="gray">
                  Platform members
                </Text>
              </Stack>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Stack gap="3" className="text-center">
                <Text size="4xl" weight="bold" color="primary">
                  {overview.totalActivities.toLocaleString()}
                </Text>
                <Text size="lg" weight="medium">
                  Total Activities
                </Text>
                <Text size="sm" color="gray">
                  Available experiences
                </Text>
              </Stack>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Stack gap="3" className="text-center">
                <Text size="4xl" weight="bold" color="primary">
                  {overview.totalBookings.toLocaleString()}
                </Text>
                <Text size="lg" weight="medium">
                  Total Bookings
                </Text>
                <Text size="sm" color="gray">
                  Customer reservations
                </Text>
              </Stack>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Stack gap="3" className="text-center">
                <Text size="4xl" weight="bold" color="primary">
                  {formatCurrency(overview.totalRevenue)}
                </Text>
                <Text size="lg" weight="medium">
                  Total Revenue
                </Text>
                <Text size="sm" color="gray">
                  Platform earnings
                </Text>
              </Stack>
            </Card.Body>
          </Card>
        </div>

        {/* Pending Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Text as="h2" size="xl" weight="bold">
                  Pending Approvals
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/admin/vendors')}
                >
                  View All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Stack gap="4">
                <div className="flex items-center justify-between">
                  <Text size="lg">Pending Vendors</Text>
                  <Badge variant="warning" size="lg">
                    {overview.pendingVendors}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Text size="lg">Pending Activities</Text>
                  <Badge variant="warning" size="lg">
                    {overview.pendingActivities}
                  </Badge>
                </div>
                <Divider />
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/vendors?status=pending')}
                  className="w-full"
                >
                  Review Pending Items
                </Button>
              </Stack>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Text as="h2" size="xl" weight="bold">
                  Quick Stats
                </Text>
              </div>
            </Card.Header>
            <Card.Body>
              <Stack gap="4">
                <div className="flex items-center justify-between">
                  <Text size="lg">Total Vendors</Text>
                  <Text size="lg" weight="bold">
                    {overview.totalVendors}
                  </Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text size="lg">Avg Booking Value</Text>
                  <Text size="lg" weight="bold">
                    {formatCurrency(overview.avgBookingValue)}
                  </Text>
                </div>
                <Divider />
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/analytics')}
                  className="w-full"
                >
                  View Analytics
                </Button>
              </Stack>
            </Card.Body>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Text as="h2" size="xl" weight="bold">
                  Recent Users
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/admin/users')}
                >
                  View All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Stack gap="4">
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <div>
                          <Text weight="medium">
                            {user.firstName} {user.lastName}
                          </Text>
                          <Text size="sm" color="gray">
                            {user.email}
                          </Text>
                        </div>
                      </div>
                      <Text size="sm" color="gray">
                        {formatDate(user.createdAt)}
                      </Text>
                    </div>
                  ))
                ) : (
                  <Text color="gray" className="text-center py-4">
                    No recent users
                  </Text>
                )}
              </Stack>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Text as="h2" size="xl" weight="bold">
                  Recent Bookings
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/admin/bookings')}
                >
                  View All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Stack gap="4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <Text weight="medium" className="truncate">
                          {booking.activityId.title}
                        </Text>
                        <Text size="sm" color="gray">
                          {booking.userId.firstName} {booking.userId.lastName}
                        </Text>
                      </div>
                      <div className="text-right">
                        <Text weight="medium">
                          {formatCurrency(booking.totalAmount)}
                        </Text>
                        <Text size="sm" color="gray">
                          {formatDate(booking.createdAt)}
                        </Text>
                      </div>
                    </div>
                  ))
                ) : (
                  <Text color="gray" className="text-center py-4">
                    No recent bookings
                  </Text>
                )}
              </Stack>
            </Card.Body>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card>
          <Card.Header>
            <Text as="h2" size="xl" weight="bold">
              Admin Actions
            </Text>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="primary"
                size="lg"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/admin/users')}
              >
                <span className="text-2xl">👥</span>
                <Text weight="bold">User Management</Text>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/admin/activities')}
              >
                <span className="text-2xl">🎯</span>
                <Text weight="bold">Activity Moderation</Text>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/admin/vendors')}
              >
                <span className="text-2xl">🏢</span>
                <Text weight="bold">Vendor Management</Text>
              </Button>
            </div>
          </Card.Body>
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
