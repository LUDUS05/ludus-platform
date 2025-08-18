'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Container } from '@opgrapes/ui/Container';
import { Card } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { Badge } from '@opgrapes/ui/Badge';
import { useRouter } from 'next/navigation';

function FavoritesContent() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <Container size="lg" className="py-8">
      <Stack spacing="lg">
        {/* Page Header */}
        <Card>
          <div className="p-6">
            <Stack spacing="md">
              <Text as="div" size="xl" weight="bold">
                My Favorites
              </Text>
              <Text size="lg" color="gray">
                Your saved activities and experiences
              </Text>
            </Stack>
          </div>
        </Card>

        {/* Favorites List */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <Text as="div" size="xl" weight="bold">
              Saved Activities
            </Text>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <Text size="lg" color="gray">
                No favorite activities yet
              </Text>
              <Text size="sm" color="gray" className="mt-2">
                Start exploring activities and save the ones you love
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

        {/* Quick Actions */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <Text as="div" size="xl" weight="bold">
              Quick Actions
            </Text>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/activities')}
              >
                <span className="text-xl">🔍</span>
                <Text weight="bold">Discover New Activities</Text>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/profile')}
              >
                <span className="text-xl">👤</span>
                <Text weight="bold">Update Preferences</Text>
              </Button>
            </div>
          </div>
        </Card>
      </Stack>
    </Container>
  );
}

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <FavoritesContent />
    </ProtectedRoute>
  );
}
