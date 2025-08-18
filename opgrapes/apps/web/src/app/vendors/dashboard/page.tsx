'use client';

import { useState, useEffect } from 'react';
import { Card } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { Badge } from '@opgrapes/ui/Badge';
import { Tabs, TabList, Tab, TabPanel } from '@opgrapes/ui/Tabs';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Star, 
  Eye, 
  Calendar,
  MapPin,
  Activity,
  Award,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Plus
} from 'lucide-react';
import { Select } from '@opgrapes/ui/Select';

// Mock dashboard data - replace with API calls
const mockDashboardData = {
  overview: {
    totalActivities: 15,
    activeActivities: 12,
    totalBookings: 342,
    totalRevenue: 28450,
    averageRating: 4.8,
    totalReviews: 156,
    monthlyGrowth: 12.5,
    customerSatisfaction: 94.2
  },
  recentActivity: [
    {
      id: '1',
      type: 'booking',
      title: 'New booking for Rock Climbing Adventure',
      description: 'Sarah M. booked for tomorrow at 2:00 PM',
      timestamp: '2 hours ago',
      status: 'confirmed'
    },
    {
      id: '2',
      type: 'review',
      title: 'New 5-star review received',
      description: 'Mike R. left a review for Whitewater Rafting',
      timestamp: '4 hours ago',
      status: 'positive'
    },
    {
      id: '3',
      type: 'activity',
      title: 'Activity status updated',
      description: 'Mountain Biking Trail is now active',
      timestamp: '1 day ago',
      status: 'info'
    }
  ],
  topActivities: [
    {
      id: '1',
      title: 'Rock Climbing Adventure',
      bookings: 89,
      revenue: 7921,
      rating: 4.9,
      growth: 15.2
    },
    {
      id: '2',
      title: 'Whitewater Rafting',
      bookings: 67,
      revenue: 8643,
      rating: 4.8,
      growth: 8.7
    },
    {
      id: '3',
      title: 'Mountain Biking Trail',
      bookings: 45,
      revenue: 3105,
      rating: 4.7,
      growth: 22.1
    }
  ],
  monthlyStats: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    bookings: [45, 52, 48, 67, 89, 78],
    revenue: [3200, 3800, 3500, 4800, 6400, 5800],
    reviews: [12, 15, 18, 22, 28, 25]
  }
};

const statusColors = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'danger',
  positive: 'success',
  negative: 'danger',
  info: 'secondary'
};

export default function VendorDashboardPage() {
  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    // In production, fetch dashboard data from API
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Vendor Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Monitor your business performance and insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-32"
                options={[
                  { value: '7d', label: 'Last 7 days' },
                  { value: '30d', label: 'Last 30 days' },
                  { value: '90d', label: 'Last 90 days' },
                  { value: '1y', label: 'Last year' }
                ]}
              />
              <Button variant="outline" size="sm">
                <BarChart3 size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultTab={activeTab}>
          <TabList className="mb-6">
            <Tab id="overview">Overview</Tab>
            <Tab id="analytics">Analytics</Tab>
            <Tab id="activities">Activities</Tab>
            <Tab id="customers">Customers</Tab>
          </TabList>

          {/* Overview Tab */}
          <TabPanel id="overview">
            <Stack spacing="lg">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text size="sm" color="gray" className="mb-1">
                          Total Revenue
                        </Text>
                        <Text size="xl" weight="bold" className="text-green-600 text-3xl">
                          {formatCurrency(dashboardData.overview.totalRevenue)}
                        </Text>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign size={24} className="text-green-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <TrendingUp size={16} className="text-green-600" />
                      <Text size="sm" className="text-green-600">
                        +{dashboardData.overview.monthlyGrowth}%
                      </Text>
                      <Text size="sm" color="gray">from last month</Text>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text size="sm" color="gray" className="mb-1">
                          Total Bookings
                        </Text>
                        <Text size="xl" weight="bold" className="text-blue-600 text-3xl">
                          {formatNumber(dashboardData.overview.totalBookings)}
                        </Text>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users size={24} className="text-blue-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <TrendingUp size={16} className="text-blue-600" />
                      <Text size="sm" className="text-blue-600">
                        +8.2%
                      </Text>
                      <Text size="sm" color="gray">from last month</Text>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text size="sm" color="gray" className="mb-1">
                          Average Rating
                        </Text>
                        <Text size="xl" weight="bold" className="text-yellow-600 text-3xl">
                          {dashboardData.overview.averageRating}
                        </Text>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star size={24} className="text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Text size="sm" color="gray">
                        {formatNumber(dashboardData.overview.totalReviews)} reviews
                      </Text>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text size="sm" color="gray" className="mb-1">
                          Active Activities
                        </Text>
                        <Text size="xl" weight="bold" className="text-purple-600 text-3xl">
                          {dashboardData.overview.activeActivities}
                        </Text>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Activity size={24} className="text-purple-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Text size="sm" color="gray">
                        of {dashboardData.overview.totalActivities} total
                      </Text>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Activity and Top Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <Text as="div" size="lg" weight="semibold" className="text-lg font-semibold">
                      Recent Activity
                    </Text>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {dashboardData.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 bg-${statusColors[activity.status as keyof typeof statusColors]}`} />
                          <div className="flex-1">
                            <Text weight="medium" className="mb-1">
                              {activity.title}
                            </Text>
                            <Text size="sm" color="gray" className="mb-1">
                              {activity.description}
                            </Text>
                            <Text size="xs" color="gray">
                              {activity.timestamp}
                            </Text>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Activity
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Top Activities */}
                <Card>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <Text as="div" size="lg" weight="semibold" className="text-lg font-semibold">
                      Top Performing Activities
                    </Text>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {dashboardData.topActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <Text weight="medium" className="mb-1">
                              {activity.title}
                            </Text>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{activity.bookings} bookings</span>
                              <span>{formatCurrency(activity.revenue)}</span>
                              <div className="flex items-center gap-1">
                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                <span>{activity.rating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-green-600">
                              <TrendingUp size={14} />
                              <Text size="sm" className="text-green-600">
                                +{activity.growth}%
                              </Text>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                                      <Text as="div" size="lg" weight="semibold" className="text-lg font-semibold">
                      Quick Actions
                    </Text>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Plus size={24} />
                      <Text size="sm">Create Activity</Text>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Calendar size={24} />
                      <Text size="sm">View Bookings</Text>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <MessageCircle size={24} />
                      <Text size="sm">Customer Messages</Text>
                    </Button>
                  </div>
                </div>
              </Card>
            </Stack>
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel id="analytics">
            <Stack spacing="lg">
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <Text as="div" size="lg" weight="semibold" className="text-lg font-semibold">
                    Performance Metrics
                  </Text>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <BarChart3 size={32} className="text-blue-600" />
                      </div>
                      <Text size="lg" weight="semibold" className="mb-2">
                        Booking Trends
                      </Text>
                      <Text size="sm" color="gray">
                        Track your booking patterns over time
                      </Text>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <PieChart size={32} className="text-green-600" />
                      </div>
                      <Text size="lg" weight="semibold" className="mb-2">
                        Revenue Analysis
                      </Text>
                      <Text size="sm" color="gray">
                        Understand your revenue streams
                      </Text>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <LineChart size={32} className="text-purple-600" />
                      </div>
                      <Text size="lg" weight="semibold" className="mb-2">
                        Growth Metrics
                      </Text>
                      <Text size="sm" color="gray">
                        Monitor business growth trends
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Placeholder for charts */}
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <Text as="div" size="lg" weight="semibold" className="text-lg font-semibold">
                    Monthly Trends
                  </Text>
                </div>
                <div className="p-6">
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 size={48} className="text-gray-400 mx-auto mb-2" />
                      <Text color="gray">Charts and graphs will be displayed here</Text>
                      <Text size="sm" color="gray">
                        Integration with charting libraries coming soon
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Stack>
          </TabPanel>

          {/* Activities Tab */}
          <TabPanel id="activities">
            <Stack spacing="lg">
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <Text as="div" size="lg" weight="semibold" className="text-lg font-semibold">
                      Activity Performance
                    </Text>
                    <Button variant="outline" size="sm">
                      View All Activities
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Activity</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Bookings</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Rating</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.topActivities.map((activity) => (
                          <tr key={activity.id} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <Text weight="medium">{activity.title}</Text>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="success" size="sm">Active</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Text>{activity.bookings}</Text>
                            </td>
                            <td className="py-3 px-4">
                              <Text weight="medium">{formatCurrency(activity.revenue)}</Text>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                <Text>{activity.rating}</Text>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </Stack>
          </TabPanel>

          {/* Customers Tab */}
          <TabPanel id="customers">
            <Stack spacing="lg">
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <Text as="div" size="lg" weight="semibold" className="text-lg font-semibold">
                    Customer Insights
                  </Text>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Text weight="medium" className="mb-4">Customer Satisfaction</Text>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <Text size="xl" weight="bold" className="text-green-600 text-3xl">
                            {dashboardData.overview.customerSatisfaction}%
                          </Text>
                          <Text size="sm" color="gray">Satisfaction Rate</Text>
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-green-600 h-3 rounded-full" 
                              style={{ width: `${dashboardData.overview.customerSatisfaction}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>0%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Text weight="medium" className="mb-4">Customer Metrics</Text>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Text size="sm">Total Customers</Text>
                          <Text size="sm" weight="medium">284</Text>
                        </div>
                        <div className="flex justify-between">
                          <Text size="sm">Repeat Customers</Text>
                          <Text size="sm" weight="medium">67%</Text>
                        </div>
                        <div className="flex justify-between">
                          <Text size="sm">Average Order Value</Text>
                          <Text size="sm" weight="medium">$83.18</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Stack>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}
