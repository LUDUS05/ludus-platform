'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@opgrapes/ui/Spinner';
import { Card } from '@opgrapes/ui/Card';
import { Text } from '@opgrapes/ui/Text';
import { Button } from '@opgrapes/ui/Button';
import { Stack } from '@opgrapes/ui/Stack';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'admin';
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'user',
  fallback,
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Stack gap="4" className="text-center">
          <Spinner size="lg" />
          <Text>Loading...</Text>
        </Stack>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Auto-redirect to login page
    router.push(redirectTo);
    return null;
  }

  // Check role-based access
  if (requiredRole === 'admin' && user?.role !== 'admin') {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-auto">
          <Card.Body>
            <Stack gap="4" className="text-center">
              <Text as="h2" size="xl" weight="bold" color="red">
                Access Denied
              </Text>
              <Text>
                You don&apos;t have permission to access this page. 
                Admin access is required.
              </Text>
              <Button
                variant="primary"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </Stack>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // User is authenticated and has required role
  return <>{children}</>;
}

// Convenience components for common use cases
export function UserRoute({ children, fallback, redirectTo }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="user" fallback={fallback} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminRoute({ children, fallback, redirectTo }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="admin" fallback={fallback} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}

// Component for showing different content based on authentication status
interface AuthAwareProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export function AuthAware({ children, fallback, requireAuth = false }: AuthAwareProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner size="sm" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  if (!requireAuth && isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
