'use client';

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
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return null;

  return (
    <Container size="lg" className="py-8">
      <Stack spacing="lg">
        {/* Welcome Header */}
        <Card>
          <div className="p-6">
            <Stack spacing="lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <div>
                    <Text as="div" size="xl" weight="bold">
                      Welcome back, {user.firstName}! 👋
                    </Text>
                    <Text size="lg" color="gray">
                      Ready to discover amazing activities?
                    </Text>
                  </div>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            </Stack>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <Text as="div" size="xl" weight="bold">
              Quick Actions
            </Text>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="primary"
                size="lg"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/activities')}
              >
                <span className="text-2xl">🔍</span>
                <Text weight="bold">Discover Activities</Text>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/profile')}
              >
                <span className="text-2xl">👤</span>
                <Text weight="bold">Edit Profile</Text>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/bookings')}
              >
                <span className="text-2xl">📅</span>
                <Text weight="bold">My Bookings</Text>
              </Button>
            </div>
          </div>
        </Card>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <Stack spacing="md" className="text-center">
                <Text size="xl" weight="bold" color="primary">
                  0
                </Text>
                <Text size="lg" weight="medium">
                  Activities Booked
                </Text>
                <Text size="sm" color="gray">
                  Start exploring to book your first activity!
                </Text>
              </Stack>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <Stack spacing="md" className="text-center">
                <Text size="xl" weight="bold" color="primary">
                  {user.preferences.length}
                </Text>
                <Text size="lg" weight="medium">
                  Activity Preferences
                </Text>
                <Text size="sm" color="gray">
                  We&apos;ll use these to recommend activities
                </Text>
              </Stack>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <Stack spacing="md" className="text-center">
                <Text size="xl" weight="bold" color="primary">
                  {user.location}
                </Text>
                <Text size="lg" weight="medium">
                  Your Location
                </Text>
                <Text size="sm" color="gray">
                  We&apos;ll show activities near you
                </Text>
              </Stack>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <Text as="div" size="xl" weight="bold">
              Recent Activity
            </Text>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <Text size="lg" color="gray">
                No recent activity yet
              </Text>
              <Text size="sm" color="gray" className="mt-2">
                Start exploring activities to see your history here
              </Text>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => router.push('/activities')}
              >
                Explore Activities
              </Button>
            </div>
          </div>
        </Card>

        {/* Preferences Summary */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <Text as="div" size="xl" weight="bold">
              Your Activity Preferences
            </Text>
          </div>
          <div className="p-6">
            <Stack spacing="md">
              <div className="flex flex-wrap gap-2">
                {user.preferences.length > 0 ? (
                  user.preferences.map((pref) => (
                    <Badge key={pref} variant="primary" size="lg">
                      {pref}
                    </Badge>
                  ))
                ) : (
                  <Text color="gray">No preferences set yet</Text>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/profile')}
              >
                Update Preferences
              </Button>
            </Stack>
          </div>
        </Card>
      </Stack>
    </Container>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
