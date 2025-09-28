/**
 * @fileoverview Selena-Discover Search Component
 * 
 * Advanced search interface for the Selena-Discover AI agent with natural language
 * processing, voice input support, and cultural context awareness.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover Implementation
 * @since 2025-09-28
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, MicOff, Filter, MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import { useAuth } from '../../context/AuthContext';
import { discoverService } from '../../services/discoverService';

const SelenaDiscoverSearch = ({ onResults, onLoading, className = '' }) => {
  const { t } = useTranslationWithFallback();
  const { user } = useAuth();
  
  // Search state
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    location: '',
    priceRange: { min: 0, max: 500 },
    category: '',
    participants: '',
    difficulty: '',
    culturalContext: 'saudi_modern'
  });
  
  // Voice recognition
  const recognitionRef = useRef(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = t('lang') === 'ar' ? 'ar-SA' : 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript, true); // Voice input flag
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, [t]);

  const handleSearch = async (searchQuery = query, voiceInput = false) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    onLoading?.(true);

    try {
      const searchRequest = {
        query: searchQuery.trim(),
        user_id: user?.id,
        location: filters.location ? {
          city: filters.location,
          radius: 25
        } : null,
        filters: {
          price_range: filters.priceRange.min !== 0 || filters.priceRange.max !== 500 ? 
            [filters.priceRange.min, filters.priceRange.max] : null,
          category: filters.category || null,
          participants: filters.participants ? parseInt(filters.participants) : null,
          difficulty: filters.difficulty || null
        },
        language: t('lang'),
        search_type: 'natural',
        context: {
          timestamp: new Date().toISOString(),
          page: 'discover_search',
          user_agent: navigator.userAgent
        },
        voice_input: voiceInput,
        cultural_preferences: {
          context: filters.culturalContext
        }
      };

      const response = await discoverService.intelligentSearch(searchRequest);
      
      setSearchResults(response.data);
      onResults?.(response.data);

      // Track search interaction
      if (user?.id) {
        discoverService.trackInteraction({
          user_id: user.id,
          interaction_type: 'search',
          search_query: searchQuery,
          voice_input: voiceInput,
          results_count: response.data.results?.length || 0
        });
      }

    } catch (error) {
      console.error('Search error:', error);
      
      // Show user-friendly error message
      const errorMessage = {
        ar: 'حدث خطأ في البحث. الرجاء المحاولة مرة أخرى.',
        en: 'Search error occurred. Please try again.'
      };
      
      onResults?.({
        error: true,
        message: errorMessage[t('lang')] || errorMessage.en
      });
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      alert(t('voice_not_supported', 'Voice search not supported in this browser'));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = t('lang') === 'ar' ? 'ar-SA' : 'en-US';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      priceRange: { min: 0, max: 500 },
      category: '',
      participants: '',
      difficulty: '',
      culturalContext: 'saudi_modern'
    });
  };

  const hasActiveFilters = () => {
    return filters.location || 
           filters.category || 
           filters.participants || 
           filters.difficulty ||
           filters.priceRange.min !== 0 || 
           filters.priceRange.max !== 500;
  };

  return (
    <div className={`selena-discover-search ${className}`}>
      {/* Main Search Bar */}
      <div className="search-container relative mb-6">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('discover_search_placeholder', 'ابحث عن الأنشطة... مثل "أنشطة مغامرات في الرياض"')}
              className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
          
          {/* Voice Search Button */}
          <button
            onClick={handleVoiceSearch}
            disabled={isLoading}
            className={`px-4 py-4 transition-colors ${
              isListening 
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
            title={t('voice_search', 'البحث الصوتي')}
          >
            {isListening ? (
              <MicOff className="h-6 w-6 animate-pulse" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </button>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-4 transition-colors relative ${
              hasActiveFilters() 
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
            title={t('search_filters', 'فلاتر البحث')}
          >
            <Filter className="h-6 w-6" />
            {hasActiveFilters() && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>
          
          {/* Search Button */}
          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-r-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t('searching', 'البحث...')}
              </div>
            ) : (
              t('search', 'بحث')
            )}
          </button>
        </div>

        {/* Voice Listening Indicator */}
        {isListening && (
          <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center text-red-600 dark:text-red-400">
              <div className="animate-pulse mr-2">🎤</div>
              <span className="text-sm">
                {t('listening', 'الاستماع... تحدث الآن')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="filters-panel bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('advanced_filters', 'الفلاتر المتقدمة')}
            </h3>
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t('clear_filters', 'مسح الفلاتر')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Location Filter */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                {t('location', 'الموقع')}
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t('any_location', 'أي موقع')}</option>
                <option value="الرياض">الرياض / Riyadh</option>
                <option value="جدة">جدة / Jeddah</option>
                <option value="الدمام">الدمام / Dammam</option>
                <option value="مكة">مكة / Mecca</option>
                <option value="المدينة">المدينة / Medina</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('category', 'الفئة')}
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t('any_category', 'أي فئة')}</option>
                <option value="fitness">{t('fitness', 'لياقة بدنية')}</option>
                <option value="arts">{t('arts', 'فنون')}</option>
                <option value="food">{t('food', 'طعام')}</option>
                <option value="outdoor">{t('outdoor', 'خارجي')}</option>
                <option value="unique">{t('unique', 'فريد')}</option>
                <option value="wellness">{t('wellness', 'عافية')}</option>
              </select>
            </div>

            {/* Participants Filter */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                {t('participants', 'المشاركون')}
              </label>
              <input
                type="number"
                value={filters.participants}
                onChange={(e) => handleFilterChange('participants', e.target.value)}
                placeholder={t('number_of_people', 'عدد الأشخاص')}
                min="1"
                max="50"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Price Range Filter */}
            <div className="filter-group lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                {t('price_range', 'نطاق السعر')} ({filters.priceRange.min} - {filters.priceRange.max} {t('sar', 'ريال')})
              </label>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: parseInt(e.target.value)
                  })}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: parseInt(e.target.value)
                  })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('difficulty', 'المستوى')}
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t('any_difficulty', 'أي مستوى')}</option>
                <option value="beginner">{t('beginner', 'مبتدئ')}</option>
                <option value="intermediate">{t('intermediate', 'متوسط')}</option>
                <option value="advanced">{t('advanced', 'متقدم')}</option>
                <option value="all_levels">{t('all_levels', 'جميع المستويات')}</option>
              </select>
            </div>
          </div>

          {/* Cultural Context Filter */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('cultural_context', 'السياق الثقافي')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'saudi_traditional', label: t('traditional', 'تقليدي') },
                { value: 'saudi_modern', label: t('modern', 'عصري') },
                { value: 'expat_western', label: t('international', 'دولي') },
                { value: 'expat_arab', label: t('regional', 'عربي') }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('culturalContext', option.value)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    filters.culturalContext === option.value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Suggestions */}
      {!query && !searchResults && (
        <div className="search-suggestions">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('search_suggestions', 'اقتراحات البحث')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              t('adventure_riyadh', 'مغامرات في الرياض'),
              t('family_activities', 'أنشطة عائلية'),
              t('weekend_plans', 'خطط نهاية الأسبوع'),
              t('cultural_tours', 'جولات ثقافية'),
              t('cooking_classes', 'دروس طبخ'),
              t('outdoor_sports', 'رياضات خارجية')
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion);
                  handleSearch(suggestion);
                }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Processing Indicator */}
      {isLoading && (
        <div className="ai-processing mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
            <div>
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                🌟 {t('ai_processing', 'سيلينا تعالج طلبك...')}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {t('ai_analyzing', 'تحليل ذكي للغة والسياق الثقافي')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {searchResults && (
        <div className="search-stats mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {t('found_activities', 'وُجدت {{count}} نشاط', { count: searchResults.totalCount })}
            </span>
            <span>
              {t('processing_time', 'زمن المعالجة')}: {searchResults.performanceMetrics?.processingTimeMs || 0}ms
            </span>
          </div>
          
          {searchResults.culturalInsights?.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs text-blue-600 dark:text-blue-400">
                💡 {searchResults.culturalInsights[0]}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelenaDiscoverSearch;