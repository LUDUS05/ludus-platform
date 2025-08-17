'use client';

import { useState, useEffect } from 'react';
import { Card } from '@opgrapes/ui/Card';
import { Button } from '@opgrapes/ui/Button';
import { Input } from '@opgrapes/ui/Input';
import { Textarea } from '@opgrapes/ui/Textarea';
import { Select } from '@opgrapes/ui/Select';
import { Checkbox } from '@opgrapes/ui/Checkbox';
import { Text } from '@opgrapes/ui/Text';
import { Stack } from '@opgrapes/ui/Stack';
import { Badge } from '@opgrapes/ui/Badge';
import { Modal } from '@opgrapes/ui/Modal';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users,
  Clock,
  Star,
  Search,
  Filter,
  MoreVertical,
  X
} from 'lucide-react';

// Mock activities data - replace with API calls
const mockActivities = [
  {
    id: '1',
    title: 'Rock Climbing Adventure',
    description: 'Experience the thrill of rock climbing with our certified guides.',
    price: 89,
    duration: '4 hours',
    location: 'Mountain View, CA',
    rating: 4.9,
    reviewCount: 156,
    image: '/images/rock-climbing.jpg',
    category: 'adventure',
    difficulty: 'intermediate',
    maxParticipants: 6,
    included: ['Equipment', 'Guide', 'Safety Briefing', 'Photos'],
    requirements: ['Age 12+', 'Basic fitness level', 'Comfortable with heights'],
    status: 'active',
    featured: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Whitewater Rafting',
    description: 'Navigate exciting rapids on the scenic river with expert instruction.',
    price: 129,
    duration: '6 hours',
    location: 'Mountain View, CA',
    rating: 4.8,
    reviewCount: 98,
    image: '/images/whitewater-rafting.jpg',
    category: 'water-sports',
    difficulty: 'beginner',
    maxParticipants: 8,
    included: ['Raft', 'Life Jacket', 'Guide', 'Lunch', 'Transportation'],
    requirements: ['Age 8+', 'Swimming ability', 'Comfortable in water'],
    status: 'active',
    featured: false,
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    title: 'Mountain Biking Trail',
    description: 'Explore scenic mountain trails with our experienced mountain biking guides.',
    price: 69,
    duration: '3 hours',
    location: 'Mountain View, CA',
    rating: 4.7,
    reviewCount: 87,
    image: '/images/mountain-biking.jpg',
    category: 'outdoor',
    difficulty: 'intermediate',
    maxParticipants: 8,
    included: ['Mountain Bike', 'Helmet', 'Guide', 'Trail Map', 'Water'],
    requirements: ['Age 14+', 'Basic cycling skills', 'Good physical condition'],
    status: 'draft',
    featured: false,
    createdAt: '2024-01-05'
  }
];

const categoryOptions = [
  { value: 'outdoor', label: 'Outdoor & Adventure' },
  { value: 'water-sports', label: 'Water Sports' },
  { value: 'food-drink', label: 'Food & Drink' },
  { value: 'cultural', label: 'Cultural & Arts' },
  { value: 'wellness', label: 'Wellness & Spa' },
  { value: 'education', label: 'Education & Learning' },
  { value: 'art-craft', label: 'Art & Craft' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'technology', label: 'Technology' },
  { value: 'fitness', label: 'Fitness & Sports' },
];

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
];

export default function VendorActivitiesPage() {
  const [activities, setActivities] = useState(mockActivities);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    // In production, fetch activities from API
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateActivity = () => {
    setEditingActivity(null);
    setShowCreateModal(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowCreateModal(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      setActivities(prev => prev.filter(a => a.id !== activityId));
    }
  };

  const handleSaveActivity = (activityData: Partial<Activity>) => {
    if (editingActivity) {
      // Update existing activity
      setActivities(prev => prev.map(a => 
        a.id === editingActivity.id ? { ...a, ...activityData } : a
      ));
    } else {
      // Create new activity
      const newActivity = {
        ...activityData,
        id: Date.now().toString(),
        status: 'draft',
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setActivities(prev => [newActivity, ...prev]);
    }
    setShowCreateModal(false);
    setEditingActivity(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'paused': return 'secondary';
      case 'archived': return 'gray';
      default: return 'gray';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'orange';
      case 'expert': return 'danger';
      default: return 'gray';
    }
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
                Manage Activities
              </h1>
              <p className="text-lg text-gray-600">
                Create, edit, and manage your business activities
              </p>
            </div>
            <Button
              size="lg"
              variant="primary"
              onClick={handleCreateActivity}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Create Activity
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-32"
                  options={[
                    { value: 'all', label: 'All Status' },
                    ...statusOptions.map(status => ({
                      value: status.value,
                      label: status.label
                    }))
                  ]}
                />
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-40"
                  options={[
                    { value: 'all', label: 'All Categories' },
                    ...categoryOptions.map(category => ({
                      value: category.value,
                      label: category.label
                    }))
                  ]}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Activities List */}
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Activity Image */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {activity.image ? (
                      <img 
                        src={activity.image} 
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <Text size="lg" color="gray">📸</Text>
                      </div>
                    )}
                  </div>

                  {/* Activity Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Text as="h3" size="lg" weight="semibold" className="truncate">
                            {activity.title}
                          </Text>
                          {activity.featured && (
                            <Badge variant="primary" size="xs">Featured</Badge>
                          )}
                          <Badge variant={getStatusColor(activity.status) as any} size="xs">
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </Badge>
                        </div>
                        <Text size="sm" color="gray" className="line-clamp-2 mb-3">
                          {activity.description}
                        </Text>
                      </div>
                    </div>

                    {/* Activity Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-green-600" />
                        <Text size="sm" weight="medium">${activity.price}</Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-blue-600" />
                        <Text size="sm" weight="medium">{activity.duration}</Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-purple-600" />
                        <Text size="sm" weight="medium">{activity.location}</Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-orange-600" />
                        <Text size="sm" weight="medium">Max {activity.maxParticipants}</Text>
                      </div>
                    </div>

                    {/* Categories and Difficulty */}
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" size="xs">
                        {categoryOptions.find(c => c.value === activity.category)?.label}
                      </Badge>
                      <Badge variant={getDifficultyColor(activity.difficulty) as any} size="xs">
                        {activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1)}
                      </Badge>
                      {activity.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <Text size="xs">{activity.rating}</Text>
                          <Text size="xs" color="gray">({activity.reviewCount})</Text>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditActivity(activity)}
                        className="flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/activities/${activity.id}`, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <Eye size={14} />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredActivities.length === 0 && (
            <Card>
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Try adjusting your search criteria'
                    : 'Get started by creating your first activity'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
                  <Button variant="primary" onClick={handleCreateActivity}>
                    Create Your First Activity
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Create/Edit Activity Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingActivity(null);
          }}
          title={editingActivity ? 'Edit Activity' : 'Create New Activity'}
          size="2xl"
        >
          <ActivityForm
            activity={editingActivity}
            onSave={handleSaveActivity}
            onCancel={() => {
              setShowCreateModal(false);
              setEditingActivity(null);
            }}
          />
        </Modal>
      </div>
    </div>
  );
}

// Activity Form Component
interface ActivityFormProps {
          activity?: Activity;
        onSave: (data: Partial<Activity>) => void;
  onCancel: () => void;
}

function ActivityForm({ activity, onSave, onCancel }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    title: activity?.title || '',
    description: activity?.description || '',
    price: activity?.price || '',
    duration: activity?.duration || '',
    location: activity?.location || '',
    category: activity?.category || '',
    difficulty: activity?.difficulty || 'beginner',
    maxParticipants: activity?.maxParticipants || '',
    included: activity?.included || [''],
    requirements: activity?.requirements || [''],
    featured: activity?.featured || false,
    ...activity
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Text size="sm" weight="medium" className="mb-2">
            Activity Title *
          </Text>
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter activity title"
            required
          />
        </div>
        <div>
          <Text size="sm" weight="medium" className="mb-2">
            Category *
          </Text>
          <Select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            required
            options={categoryOptions.map(cat => ({
              value: cat.value,
              label: cat.label
            }))}
          />
        </div>
      </div>

      <div>
        <Text size="sm" weight="medium" className="mb-2">
          Description *
        </Text>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your activity in detail"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Text size="sm" weight="medium" className="mb-2">
            Price ($) *
          </Text>
          <Input
            value={formData.price}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || '')}
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <Text size="sm" weight="medium" className="mb-2">
            Duration *
          </Text>
          <Input
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', e.target.value)}
            placeholder="e.g., 2 hours"
            required
          />
        </div>
        <div>
          <Text size="sm" weight="medium" className="mb-2">
            Max Participants
          </Text>
          <Input
            value={formData.maxParticipants}
            onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || '')}
            placeholder="10"
            type="number"
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Text size="sm" weight="medium" className="mb-2">
            Location *
          </Text>
          <Input
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="City, State"
            required
          />
        </div>
        <div>
          <Text size="sm" weight="medium" className="mb-2">
            Difficulty Level
          </Text>
          <Select
            value={formData.difficulty}
            onChange={(e) => handleInputChange('difficulty', e.target.value)}
            options={difficultyOptions.map(diff => ({
              value: diff.value,
              label: diff.label
            }))}
          />
        </div>
      </div>

      <div>
        <Text size="sm" weight="medium" className="mb-2">
          What&apos;s Included
        </Text>
        <div className="space-y-2">
          {formData.included.map((item: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleArrayChange('included', index, e.target.value)}
                placeholder="e.g., Equipment, Guide, Photos"
              />
              {formData.included.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => removeArrayItem('included', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={14} />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addArrayItem('included')}
          >
            Add Item
          </Button>
        </div>
      </div>

      <div>
        <Text size="sm" weight="medium" className="mb-2">
          Requirements
        </Text>
        <div className="space-y-2">
          {formData.requirements.map((item: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                placeholder="e.g., Age 12+, Basic fitness level"
              />
              {formData.requirements.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => removeArrayItem('requirements', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={14} />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addArrayItem('requirements')}
          >
            Add Requirement
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={formData.featured}
          onChange={(e) => handleInputChange('featured', e.target.checked)}
        />
        <Text size="sm">Feature this activity on the homepage</Text>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {activity ? 'Update Activity' : 'Create Activity'}
        </Button>
      </div>
    </form>
  );
}
