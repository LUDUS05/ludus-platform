import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Container } from '@opgrapes/ui/Container';
import { Stack } from '@opgrapes/ui/Stack';
import { Text } from '@opgrapes/ui/Text';

export const metadata: Metadata = {
  title: 'Create Account - LUDUS',
  description: 'Join LUDUS to discover amazing activities and experiences in your area.',
};

export default function RegisterPage() {
  return (
    <Container size="sm" className="py-12">
      <Stack spacing="lg" className="text-center">
        <Stack spacing="md">
          <Text as="div" size="xl" weight="bold" className="text-center">
            Join LUDUS Today
          </Text>
          <Text size="lg" color="gray" className="max-w-md mx-auto">
            Create your account to start discovering amazing activities, 
            connect with local vendors, and book unforgettable experiences
          </Text>
        </Stack>

        <RegisterForm />
      </Stack>
    </Container>
  );
}
