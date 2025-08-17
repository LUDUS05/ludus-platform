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
      <Stack gap="8">
        {/* Welcome Header */}
        <Card>
          <Card.Body>
            <Stack gap="6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Avatar
                    size="xl"
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                  <div>
                    <Text as="h1" size="3xl" weight="bold">
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
          </Card.Body>
        </Card>

        {/* Quick Actions */}
        <Card>
          <Card.Header>
            <Text as="h2" size="xl" weight="bold">
              Quick Actions
            </Text>
          </Card.Header>
          <Card.Body>
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
          </Card.Body>
        </Card>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <Card.Body>
              <Stack gap="3" className="text-center">
                <Text size="4xl" weight="bold" color="primary">
                  0
                </Text>
                <Text size="lg" weight="medium">
                  Activities Booked
                </Text>
                <Text size="sm" color="gray">
                  Start exploring to book your first activity!
                </Text>
              </Stack>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Stack gap="3" className="text-center">
                <Text size="4xl" weight="bold" color="primary">
                  {user.preferences.length}
                </Text>
                <Text size="lg" weight="medium">
                  Activity Preferences
                </Text>
                <Text size="sm" color="gray">
                  We&apos;ll use these to recommend activities
                </Text>
              </Stack>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Stack gap="3" className="text-center">
                <Text size="4xl" weight="bold" color="primary">
                  {user.location}
                </Text>
                <Text size="lg" weight="medium">
                  Your Location
                </Text>
                <Text size="sm" color="gray">
                  We&apos;ll show activities near you
                </Text>
              </Stack>
            </Card.Body>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <Card.Header>
            <Text as="h2" size="xl" weight="bold">
              Recent Activity
            </Text>
          </Card.Header>
          <Card.Body>
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
          </Card.Body>
        </Card>

        {/* Preferences Summary */}
        <Card>
          <Card.Header>
            <Text as="h2" size="xl" weight="bold">
              Your Activity Preferences
            </Text>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
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
          </Card.Body>
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
