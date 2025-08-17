'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Container } from '@opgrapes/ui/Container';
import { Card } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { Select } from '@opgrapes/ui/Select';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { adminService, type UserAnalytics, type BookingAnalytics } from '@/services/adminService';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  BarChart3,
  PieChart
} from 'lucide-react';

function AdminAnalyticsContent() {
  const { user } = useAuth();
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalytics | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [userData, bookingData] = await Promise.all([
          adminService.getUserAnalytics(period),
          adminService.getBookingAnalytics(period)
        ]);
        setUserAnalytics(userData);
        setBookingAnalytics(bookingData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

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
                You don't have permission to access the admin analytics.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
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
              <Text size="xl" weight="bold" color="danger">
                Error Loading Analytics
              </Text>
              <Text size="lg" color="gray" className="mt-2">
                {error}
              </Text>
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
                  Analytics Dashboard 📊
                </Text>
                <Text size="lg" color="gray">
                  Detailed insights into platform performance and user behavior.
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | '90d' | '1y')}
                  options={[
                    { value: '7d', label: 'Last 7 Days' },
                    { value: '30d', label: 'Last 30 Days' },
                    { value: '90d', label: 'Last 90 Days' },
                    { value: '1y', label: 'Last Year' }
                  ]}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <Text size="xl" weight="bold" className="text-blue-600">
                    {userAnalytics?.newUsers || 0}
                  </Text>
                  <Text size="sm" color="gray">New Users</Text>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <Text size="xl" weight="bold" className="text-green-600">
                    {bookingAnalytics?.totalBookings || 0}
                  </Text>
                  <Text size="sm" color="gray">Total Bookings</Text>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <Text size="xl" weight="bold" className="text-purple-600">
                    ${bookingAnalytics?.revenue?.toFixed(2) || '0.00'}
                  </Text>
                  <Text size="sm" color="gray">Revenue</Text>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <Text size="xl" weight="bold" className="text-orange-600">
                    {userAnalytics?.userGrowth?.length || 0}
                  </Text>
                  <Text size="sm" color="gray">Growth Days</Text>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <Text as="div" size="lg" weight="bold">
                  User Growth
                </Text>
              </div>
            </div>
            <div className="p-6">
              {userAnalytics?.userGrowth && userAnalytics.userGrowth.length > 0 ? (
                <div className="space-y-3">
                  {userAnalytics.userGrowth.slice(0, 7).map((day) => (
                    <div key={day._id} className="flex items-center justify-between">
                      <Text size="sm" color="gray">
                        {new Date(day._id).toLocaleDateString()}
                      </Text>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-4 bg-blue-500 rounded"
                          style={{ width: `${Math.max(20, (day.count / Math.max(...userAnalytics.userGrowth.map(d => d.count))) * 200)}px` }}
                        />
                        <Text size="sm" weight="medium">
                          {day.count}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Text color="gray">No user growth data available</Text>
                </div>
              )}
            </div>
          </Card>

          {/* Booking Status Distribution */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                <Text as="div" size="lg" weight="bold">
                  Booking Status Distribution
                </Text>
              </div>
            </div>
            <div className="p-6">
              {bookingAnalytics?.statusDistribution && bookingAnalytics.statusDistribution.length > 0 ? (
                <div className="space-y-3">
                  {bookingAnalytics.statusDistribution.map((status) => (
                    <div key={status._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-3 h-3 rounded-full ${
                            status._id === 'confirmed' ? 'bg-green-500' :
                            status._id === 'pending' ? 'bg-yellow-500' :
                            status._id === 'cancelled' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}
                        />
                        <Text size="sm" className="capitalize">
                          {status._id}
                        </Text>
                      </div>
                      <Text size="sm" weight="medium">
                        {status.count}
                      </Text>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Text color="gray">No booking status data available</Text>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Daily Bookings Chart */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <Text as="div" size="lg" weight="bold">
              Daily Bookings & Revenue
            </Text>
          </div>
          <div className="p-6">
            {bookingAnalytics?.dailyBookings && bookingAnalytics.dailyBookings.length > 0 ? (
              <div className="space-y-3">
                {bookingAnalytics.dailyBookings.slice(0, 14).map((day) => (
                  <div key={day._id} className="flex items-center justify-between">
                    <Text size="sm" color="gray">
                      {new Date(day._id).toLocaleDateString()}
                    </Text>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <Text size="sm" weight="medium">
                          {day.count} bookings
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <Text size="sm" weight="medium">
                          ${day.revenue?.toFixed(2) || '0.00'}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Text color="gray">No daily booking data available</Text>
              </div>
            )}
          </div>
        </Card>

        {/* Role Distribution */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <Text as="div" size="lg" weight="bold">
              User Role Distribution
            </Text>
          </div>
          <div className="p-6">
            {userAnalytics?.roleDistribution && userAnalytics.roleDistribution.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userAnalytics.roleDistribution.map((role) => (
                  <div key={role._id} className="text-center p-4 bg-gray-50 rounded-lg">
                    <Text size="xl" weight="bold" className="text-blue-600">
                      {role.count}
                    </Text>
                    <Text size="sm" color="gray" className="capitalize">
                      {role._id}
                    </Text>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Text color="gray">No role distribution data available</Text>
              </div>
            )}
          </div>
        </Card>
      </Stack>
    </Container>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute>
      <AdminAnalyticsContent />
    </ProtectedRoute>
  );
}
