'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Avatar } from '@opgrapes/ui/Avatar';
import { Badge } from '@opgrapes/ui/Badge';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🍇</span>
              <Text as="span" size="xl" weight="bold" color="primary">
                OPGrapes
              </Text>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/activities" className="text-gray-700 hover:text-primary transition-colors">
              <Text weight="medium">Activities</Text>
            </Link>
            <Link href="/vendors" className="text-gray-700 hover:text-primary transition-colors">
              <Text weight="medium">Vendors</Text>
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                <Text weight="medium">Dashboard</Text>
              </Link>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <span className="text-lg">🔔</span>
                  <Badge 
                    variant="danger" 
                    size="sm" 
                    className="absolute -top-1 -right-1 min-w-[20px] h-5"
                  >
                    0
                  </Badge>
                </Button>

                {/* User Profile Dropdown */}
                <div className="relative group">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar
                      size="sm"
                      src={user?.avatar}
                      alt={`${user?.firstName} ${user?.lastName}`}
                    />
                    <Text size="sm" weight="medium">
                      {user?.firstName}
                    </Text>
                    <span className="text-gray-400">▼</span>
                  </Button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile Settings
                      </Link>
                      <Link href="/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Bookings
                      </Link>
                      <Link href="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Favorites
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
