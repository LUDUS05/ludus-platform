'use client';

interface CategoryNavProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  {
    id: 'all',
    name: 'All Activities',
    icon: '🎯',
    description: 'Browse all available activities'
  },
  {
    id: 'adventure',
    name: 'Adventure',
    icon: '🏔️',
    description: 'Thrilling outdoor experiences'
  },
  {
    id: 'food-drink',
    name: 'Food & Drink',
    icon: '🍷',
    description: 'Culinary experiences and tastings'
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    description: 'Learning and skill development'
  },
  {
    id: 'wellness',
    name: 'Wellness',
    icon: '🧘',
    description: 'Health and relaxation activities'
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    icon: '🌲',
    description: 'Nature and outdoor activities'
  },
  {
    id: 'cultural',
    name: 'Cultural',
    icon: '🏛️',
    description: 'Arts, history, and cultural experiences'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎭',
    description: 'Shows, games, and fun activities'
  }
];

export function CategoryNav({ selectedCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Browse by Category</h2>
        <button
          onClick={() => onCategoryChange('all')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`group relative p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedCategory === category.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="text-center">
              <div className={`text-2xl mb-2 transition-transform duration-200 ${
                selectedCategory === category.id ? 'scale-110' : 'group-hover:scale-105'
              }`}>
                {category.icon}
              </div>
              <div className={`text-sm font-medium transition-colors ${
                selectedCategory === category.id ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {category.name}
              </div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {category.description}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Mobile-friendly horizontal scroll for smaller screens */}
      <div className="md:hidden mt-4">
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
