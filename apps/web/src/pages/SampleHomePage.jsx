import {
  Calendar,
  Clock,
  CreditCard,
  Heart,
  MapPin,
  Search,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const SampleHomePage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const isRTL = i18n.language === 'ar';

  // Sample categories
  const categories = [
    { id: 'adventure', name: 'المغامرة والهواء الطلق', icon: '🏔️', count: 45 },
    { id: 'education', name: 'التعليم وورش العمل', icon: '🎨', count: 32 },
    { id: 'entertainment', name: 'ترفيه الأطفال', icon: '🎪', count: 28 },
    { id: 'sports', name: 'الرياضة واللياقة', icon: '⚽', count: 38 },
    { id: 'culture', name: 'الثقافة والتراث', icon: '🏛️', count: 22 },
    { id: 'wellness', name: 'الصحة والاسترخاء', icon: '🧘', count: 15 },
    { id: 'food', name: 'تجارب الطعام', icon: '🍽️', count: 20 },
    { id: 'corporate', name: 'الشركات والمجموعات', icon: '👥', count: 12 },
  ];

  // Sample activities
  const activities = [
    {
      id: 1,
      title: 'Desert Safari Adventure',
      vendor: 'Arabian Adventures',
      price: 1688,
      location: 'Riyadh Desert',
      duration: 'Full day',
      rating: 4.9,
      reviews: 342,
      category: 'adventure',
      ageRange: '5+',
      trending: true,
      available: true,
      image:
        'https://images.unsplash.com/photo-1509316975852-ff36d1e1b3d3?w=800',
    },
    {
      id: 2,
      title: 'Kids Art Workshop',
      vendor: 'Creative Minds Studio',
      price: 450,
      location: 'Al Olaya, Riyadh',
      duration: '2 hours',
      rating: 4.8,
      reviews: 189,
      category: 'education',
      ageRange: '4-12',
      bestSeller: true,
      available: true,
      image:
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    },
    {
      id: 3,
      title: 'Family Swimming Lessons',
      vendor: 'AquaSports Academy',
      price: 1050,
      location: 'Jeddah Corniche',
      duration: '1 hour',
      rating: 4.7,
      reviews: 156,
      category: 'sports',
      ageRange: 'All ages',
      new: true,
      available: true,
      image:
        'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
    },
    {
      id: 4,
      title: 'Magic Show & Workshop',
      vendor: 'Wonder Entertainment',
      price: 750,
      location: 'Khobar & Dammam',
      duration: '1.5 hours',
      rating: 5.0,
      reviews: 98,
      category: 'entertainment',
      ageRange: '3+',
      trending: true,
      available: true,
      image:
        'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800',
    },
  ];

  // Stats
  const stats = [
    { label: 'عائلات سعيدة', value: '10,000+', icon: Users },
    { label: 'نشاط', value: '500+', icon: Calendar },
    { label: 'مقدمو خدمات مُعتمدون', value: '200+', icon: Shield },
    { label: 'متوسط التقييم', value: '4.9', icon: Star },
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'فاطمة وأطفالها',
      location: 'الرياض',
      text: 'حجزت ورشة فنون للأطفال عبر لتس لودوس وكانت رائعة! العملية كانت سلسة وأطفالي قضوا أفضل وقت.',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    },
    {
      name: 'عائلة أحمد',
      location: 'جدة',
      text: 'كوالد، السلامة هي أولويتي. لتس لودوس يعرض شارات التحقق، تقييمات من عائلات أخرى، وتوصيات عمرية واضحة.',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    {
      name: 'سارة وعمر',
      location: 'الدمام',
      text: 'لوحة التحكم العائلية رائعة! أستطيع تتبع جميع مغامراتنا القادمة، أطفالي يجمعون شارات الإنجاز.',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    },
  ];

  const formatCurrency = amount => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="text-2xl font-bold text-ludus-orange">
                LetsLudus
              </div>
              <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
                <a
                  href="#explore"
                  className="text-gray-700 hover:text-ludus-orange"
                >
                  استكشف
                </a>
                <a
                  href="#categories"
                  className="text-gray-700 hover:text-ludus-orange"
                >
                  الفئات
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-700 hover:text-ludus-orange"
                >
                  كيف يعمل
                </a>
                <a
                  href="#vendors"
                  className="text-gray-700 hover:text-ludus-orange"
                >
                  لمقدمي الخدمات
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-ludus-orange">
                EN
              </button>
              <button className="bg-ludus-orange text-white px-6 py-2 rounded-lg hover:bg-ludus-orange-dark transition-colors">
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ludus-orange via-ludus-orange-dark to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium">
                600+ تجربة عائلية هذا الشهر
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              اكتشف تجارب لا تُنسى للعائلة بأكملها
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              احجز مغامرات، ورش عمل، ترفيه، وأنشطة لجميع الأعمار—موثوقة من قبل
              العائلات في المنطقة.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl p-2 shadow-2xl flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder="ابحث عن نشاط، موقع، أو فئة..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-gray-900 text-lg py-3"
                  dir="rtl"
                />
                <button className="bg-ludus-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-ludus-orange-dark transition-colors">
                  بحث
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {[
                'اليوم',
                'نهاية الأسبوع',
                'مناسب للأطفال',
                'داخلي',
                'خارجي',
              ].map(filter => (
                <button
                  key={filter}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex justify-center items-center gap-8 mt-12 flex-wrap">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">100% آمن ومُعتمد</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">تأكيد فوري</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span className="text-sm">مُجرّب من العائلات</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              استكشف حسب الفئة
            </h2>
            <button className="text-ludus-orange hover:text-ludus-orange-dark font-semibold">
              عرض الكل →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                className="bg-gray-50 hover:bg-ludus-orange/10 rounded-xl p-6 text-center transition-all hover:scale-105 border-2 border-transparent hover:border-ludus-orange/20"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {category.name}
                </div>
                <div className="text-xs text-gray-500">
                  {category.count} نشاط
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Activities */}
      <section id="explore" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                الأكثر شعبية هذا الأسبوع
              </h2>
              <p className="text-gray-600">
                تجارب عائلية عالية التقييم بالقرب منك
              </p>
            </div>
            <button className="text-ludus-orange hover:text-ludus-orange-dark font-semibold">
              استكشف الكل →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map(activity => (
              <div
                key={activity.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer"
                onClick={() => navigate(`/activities/${activity.id}`)}
              >
                <div className="relative h-48">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {activity.trending && (
                      <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </span>
                    )}
                    {activity.bestSeller && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Best Seller
                      </span>
                    )}
                    {activity.new && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        New
                      </span>
                    )}
                  </div>
                  {activity.available && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Available Today
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">
                      {activity.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {activity.vendor}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {activity.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {activity.duration}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {activity.rating}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({activity.reviews})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-ludus-orange">
                        {formatCurrency(activity.price)}
                      </div>
                      <div className="text-xs text-gray-500">للشخص</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Ages {activity.ageRange}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              احجز في ثلاث خطوات بسيطة
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              من الاكتشاف إلى الذكريات التي لا تُنسى—آمن، سريع، وموجه للعائلات.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'اكتشف',
                description:
                  'ابحث حسب الموقع، التاريخ، والفئة. صنف حسب العمر، السعر، ودعم الاحتياجات الخاصة.',
                icon: Search,
              },
              {
                step: 2,
                title: 'احجز',
                description:
                  'اختر التاريخ والوقت، أضف المشاركين، واحصل على تأكيد فوري مع تذاكر رقمية.',
                icon: Calendar,
              },
              {
                step: 3,
                title: 'استمتع',
                description:
                  'احصل على تأكيد فوري، تذاكر رقمية، واستمتع بلحظات عائلية لا تُنسى.',
                icon: Heart,
              },
            ].map(({ step, title, description, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="w-20 h-20 bg-ludus-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-16 h-16 bg-ludus-orange rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {title}
                </h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>

          {/* Trust Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              {
                icon: Shield,
                title: '100% مُعتمد',
                desc: 'جميع مقدمي الخدمات مُفحوصون',
              },
              { icon: Shield, title: 'السلامة أولاً', desc: 'فحوصات خلفية' },
              { icon: Zap, title: 'حجز فوري', desc: 'تأكيد سريع' },
              { icon: CreditCard, title: 'دفع آمن', desc: 'دفع محمي' },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-ludus-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-ludus-orange" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-ludus-orange to-ludus-orange-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              موثوق به من قبل العائلات في المنطقة
            </h2>
            <p className="text-xl text-white/90">
              مئات الحجوزات الناجحة كل أسبوع مع مقدمي خدمات مُعتمدين وموجهين
              للعائلات.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ label, value, icon: Icon }, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-bold mb-2">{value}</div>
                <div className="text-white/90">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              قصص العائلات
            </h2>
            <p className="text-gray-600">
              تجارب حقيقية. ذكريات حقيقية. فرح حقيقي.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {testimonial.text}
                </p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-ludus-orange mb-4">
                LetsLudus
              </div>
              <p className="text-gray-400">
                اكتشف تجارب لا تُنسى للعائلة بأكملها.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">استكشف</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() => navigate('/activities')}
                    className="hover:text-white"
                  >
                    جميع الأنشطة
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/activities?category=kids')}
                    className="hover:text-white"
                  >
                    أنشطة الأطفال
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/activities?category=family')}
                    className="hover:text-white"
                  >
                    فعاليات عائلية
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/activities?category=events')}
                    className="hover:text-white"
                  >
                    العروض
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الموارد</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() => navigate('/help')}
                    className="hover:text-white"
                  >
                    مركز المساعدة
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/safety')}
                    className="hover:text-white"
                  >
                    دليل السلامة
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/blog')}
                    className="hover:text-white"
                  >
                    مدونة العائلة
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/community')}
                    className="hover:text-white"
                  >
                    المجتمع
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الشركة</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() => navigate('/about')}
                    className="hover:text-white"
                  >
                    من نحن
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/partner-registration')}
                    className="hover:text-white"
                  >
                    لمقدمي الخدمات
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/careers')}
                    className="hover:text-white"
                  >
                    الوظائف
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/contact')}
                    className="hover:text-white"
                  >
                    اتصل بنا
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 LetsLudus. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SampleHomePage;
