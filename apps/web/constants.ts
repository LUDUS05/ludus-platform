
import { Activity, NavItem, Badge, ExtendedUserProfile } from './types';
import { LayoutDashboard, Compass, CalendarDays, MessageSquareText, Map as MapIcon } from 'lucide-react';

export const TRANSLATIONS = {
  ar: {
    tagline: 'منصة اكتشاف الفعاليات الاجتماعية',
    discover: 'اكتشف',
    dashboard: 'لوحة البائع',
    bookings: 'حجوزاتي',
    community: 'المجتمع',
    map: 'الخريطة',
    connect_wallet: 'المحفظة',
    login: 'تسجيل الدخول',
    search_placeholder: 'ابحث عن فعالية، مكان، أو تجربة...',
    trending: 'رائج الآن',
    for_you: 'توصيات لك',
    book_now: 'احجز الآن',
    currency: 'ر.س',
    share_success: 'تم نسخ الرابط!',
    select_date: 'اختر الموعد',
    stats: {
      users: 'الحجوزات النشطة',
      revenue: 'إجمالي الإيرادات',
      engagement: 'تقييمات العملاء'
    },
    filters: {
      filter_btn: 'تصفية',
      all: 'الكل',
      sports: 'رياضة',
      entertainment: 'ترفيه',
      cultural: 'ثقافة',
      outdoor: 'خارجية'
    },
    vendor_dashboard: {
      title: 'لوحة تحكم البائع',
      subtitle: 'إدارة الفعاليات والحجوزات والتحليلات',
      manage_activities: 'إدارة الفعاليات',
      manage_bookings: 'إدارة الحجوزات',
      analytics: 'التحليلات'
    },
    agent_welcome: 'مرحباً بك في LUDUS! كيف يمكنني مساعدتك في اكتشاف فعاليات اليوم؟',
    ai_assistant: 'المساعد الذكي',
    agent_typing: 'جاري الكتابة...',
    profile: {
      bio: 'نبذة شخصية',
      rating: 'التقييم',
      badges: 'الأوسمة',
      socials: 'تواصل معي',
      add_friend: 'إضافة صديق',
      message: 'رسالة',
      activities: 'نشاط',
      friends: 'صديق',
      reviews: 'تقييم',
      verified: 'موثوق'
    },
    map_finder: {
      title: 'استكشف حولك',
      find_food: 'مطاعم',
      find_sports: 'رياضة',
      find_art: 'فنون',
      find_music: 'موسيقى'
    }
  },
  en: {
    tagline: 'Social Activity Discovery Platform',
    discover: 'Discover',
    dashboard: 'Vendor Hub',
    bookings: 'My Bookings',
    community: 'Community',
    map: 'Map View',
    connect_wallet: 'Wallet',
    login: 'Login',
    search_placeholder: 'Search for activities, places, or experiences...',
    trending: 'Trending Now',
    for_you: 'Recommended For You',
    book_now: 'Book Now',
    currency: 'SAR',
    share_success: 'Link Copied!',
    select_date: 'Select Date',
    stats: {
      users: 'Active Bookings',
      revenue: 'Total Revenue',
      engagement: 'Customer Ratings'
    },
    filters: {
      filter_btn: 'Filter',
      all: 'All',
      sports: 'Sports',
      entertainment: 'Entertainment',
      cultural: 'Cultural',
      outdoor: 'Outdoor'
    },
    vendor_dashboard: {
      title: 'Vendor Dashboard',
      subtitle: 'Manage activities, bookings, and analytics',
      manage_activities: 'Manage Activities',
      manage_bookings: 'Manage Bookings',
      analytics: 'Analytics'
    },
    agent_welcome: 'Welcome to LUDUS! How can I help you discover events today?',
    ai_assistant: 'AI Assistant',
    agent_typing: 'Typing...',
    profile: {
      bio: 'Bio',
      rating: 'Rating',
      badges: 'Badges',
      socials: 'Socials',
      add_friend: 'Add Friend',
      message: 'Message',
      activities: 'Activities',
      friends: 'Friends',
      reviews: 'Reviews',
      verified: 'Verified'
    },
    map_finder: {
      title: 'Explore Nearby',
      find_food: 'Food',
      find_sports: 'Sports',
      find_art: 'Art',
      find_music: 'Music'
    }
  }
};

export const MOCK_ACTIVITIES: Activity[] = [
  {
    _id: '1',
    title: { ar: 'رحلة تخييم في العلا', en: 'AlUla Desert Camping' },
    description: { ar: 'تجربة فاخرة تحت النجوم مع عشاء تقليدي ومراقبة الفلك.', en: 'Luxury experience under the stars with traditional dinner and astronomy.' },
    category: 'outdoor',
    tags: ['camping', 'desert', 'luxury'],
    images: ['https://picsum.photos/800/600?random=1'],
    price: { amount: 1200, currency: 'SAR' },
    rating: { average: 4.9, count: 128 },
    location: {
      type: 'Point',
      coordinates: [37.9533, 26.8206],
      address: { city: 'AlUla', country: 'KSA' }
    },
    vendor: {
      _id: 'v1',
      businessName: 'Sahara Adventures',
      contactInfo: { email: 'info@sahara.sa', phone: '+966500000000', website: 'sahara.sa' }
    },
    availability: { nextSlot: '2024-03-15', capacity: 20, booked: 12 }
  },
  {
    _id: '2',
    title: { ar: 'بطولة البادل للمحترفين', en: 'Pro Padel Tournament' },
    description: { ar: 'انضم لأقوى منافسة بادل في الرياض مع جوائز قيمة.', en: 'Join the toughest Padel competition in Riyadh with valuable prizes.' },
    category: 'sports',
    tags: ['padel', 'tournament', 'sports'],
    images: ['https://picsum.photos/800/600?random=2'],
    price: { amount: 350, currency: 'SAR' },
    rating: { average: 4.7, count: 85 },
    location: {
      type: 'Point',
      coordinates: [46.6753, 24.7136],
      address: { city: 'Riyadh', country: 'KSA' }
    },
    vendor: {
      _id: 'v2',
      businessName: 'Riyadh Padel Club',
      contactInfo: { email: 'padel@riyadh.sa', phone: '+966500000001', website: 'padel.sa' }
    },
    availability: { nextSlot: '2024-03-10', capacity: 32, booked: 28 }
  },
  {
    _id: '3',
    title: { ar: 'ورشة الخيل العربية', en: 'Arabian Horse Workshop' },
    description: { ar: 'تعلم أساسيات ركوب الخيل والعناية بها في مزرعة تاريخية.', en: 'Learn basics of horse riding and care at a historical farm.' },
    category: 'cultural',
    tags: ['horses', 'history', 'workshop'],
    images: ['https://picsum.photos/800/600?random=3'],
    price: { amount: 500, currency: 'SAR' },
    rating: { average: 4.8, count: 42 },
    location: {
      type: 'Point',
      coordinates: [46.5753, 24.7336],
      address: { city: 'Diriyah', country: 'KSA' }
    },
    vendor: {
      _id: 'v3',
      businessName: 'Heritage Stables',
      contactInfo: { email: 'info@heritage.sa', phone: '+966500000002', website: 'heritage.sa' }
    },
    availability: { nextSlot: '2024-03-20', capacity: 10, booked: 5 }
  },
  {
    _id: '4',
    title: { ar: 'هاكاثون الذكاء الاصطناعي', en: 'AI Innovation Hackathon' },
    description: { ar: 'حدث تقني يجمع المبتكرين لبناء حلول المستقبل.', en: 'Tech event gathering innovators to build future solutions.' },
    category: 'entertainment', // Using entertainment as general event category
    tags: ['tech', 'hackathon', 'innovation'],
    images: ['https://picsum.photos/800/600?random=4'],
    price: { amount: 0, currency: 'SAR' },
    rating: { average: 5.0, count: 200 },
    location: {
      type: 'Point',
      coordinates: [46.6353, 24.7636],
      address: { city: 'Riyadh', country: 'KSA' }
    },
    vendor: {
      _id: 'v4',
      businessName: 'Tech Future',
      contactInfo: { email: 'hack@tech.sa', phone: '+966500000003', website: 'tech.sa' }
    },
    availability: { nextSlot: '2024-04-01', capacity: 200, booked: 150 }
  }
];

export const NAV_ITEMS: NavItem[] = [
  { id: 'discover', label: { ar: 'اكتشف', en: 'Discover' }, icon: Compass, path: '/' },
  { id: 'map', label: { ar: 'الخريطة', en: 'Map View' }, icon: MapIcon, path: '/map' },
  { id: 'dashboard', label: { ar: 'لوحة البائع', en: 'Vendor Hub' }, icon: LayoutDashboard, path: '/dashboard' },
  { id: 'bookings', label: { ar: 'حجوزاتي', en: 'Bookings' }, icon: CalendarDays, path: '/bookings' },
  { id: 'community', label: { ar: 'المجتمع', en: 'Community' }, icon: MessageSquareText, path: '/community' },
];

export const BADGES_DATA: Badge[] = [
  {
    id: 'passionate',
    label: { ar: 'شغوف', en: 'Passionate' },
    description: { ar: 'شارك في أكثر من 20 فعالية', en: 'Participated in 20+ activities' },
    icon: '🔥',
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
  },
  {
    id: 'fun',
    label: { ar: 'اجتماعي', en: 'Social Butterfly' },
    description: { ar: 'لديه أكثر من 30 صديق', en: 'Has 30+ friends on the platform' },
    icon: '🦋',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'explorer',
    label: { ar: 'مستكشف', en: 'Explorer' },
    description: { ar: 'زار 5 مدن مختلفة', en: 'Visited 5 different cities' },
    icon: '🌍',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    id: 'leader',
    label: { ar: 'قائد', en: 'Leader' },
    description: { ar: 'نظم 3 فعاليات', en: 'Organized 3 activities' },
    icon: '👑',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  }
];

export const MOCK_USER_PROFILE: ExtendedUserProfile = {
  _id: 'u1',
  firstName: 'Faisal',
  lastName: 'Saud',
  email: 'faisal@example.com',
  role: 'user',
  profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop',
  bio: 'محب للمغامرات والقهوة. أبحث دائماً عن تجارب جديدة في المملكة من شمالها لجنوبها. 🏕️☕️\n\nAdventure seeker & coffee lover. Exploring hidden gems in KSA.',
  rating: {
    average: 4.9,
    count: 24
  },
  socials: [
    { platform: 'instagram', username: '@faisal_adv', url: '#' },
    { platform: 'tiktok', username: '@faisal_vlogs', url: '#' },
    { platform: 'snapchat', username: 'faisal.snap', url: '#' }
  ],
  badges: BADGES_DATA,
  stats: {
    activitiesParticipated: 42,
    friendsCount: 156
  }
};
