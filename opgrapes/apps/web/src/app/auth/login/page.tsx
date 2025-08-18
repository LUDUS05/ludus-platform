import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { Container } from '@opgrapes/ui/Container';
import { Stack } from '@opgrapes/ui/Stack';
import { Text } from '@opgrapes/ui/Text';

export const metadata: Metadata = {
  title: 'Sign In - LUDUS',
  description: 'Sign in to your LUDUS account to discover amazing activities and experiences.',
};

export default function LoginPage() {
  return (
    <Container size="sm" className="py-12">
      <Stack spacing="lg" className="text-center">
        <Stack spacing="md">
          <Text as="div" size="xl" weight="bold" className="text-center">
            Welcome to LUDUS
          </Text>
          <Text size="lg" color="gray" className="max-w-md mx-auto">
            Discover amazing activities, connect with local vendors, and create unforgettable experiences
          </Text>
        </Stack>

        <LoginForm />
      </Stack>
    </Container>
  );
}
