/**
 * @fileoverview Enhanced Search Component for LUDUS Platform - LDS-016 Implementation
 * @module components/search/EnhancedSearchPage
 * 
 * This component provides comprehensive search and discovery functionality including:
 * - Advanced search with multiple filters
 * - Real-time search suggestions
 * - Search history and saved searches
 * - RTL support for Arabic users
 * - Responsive design for all devices
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Search as SearchIcon,
  MapPin,
  DollarSign,
  Star,
  Calendar,
  Filter,
  X,
  Clock,
  Users,
  TrendingUp,
  History,
  Bookmark,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { searchService } from '../../services/searchService';
import { notificationService } from '../../services/notificationService';
import ActivityCard from '../activity/ActivityCard';
import './EnhancedSearchPage.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const EnhancedSearchPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchSummary, setSearchSummary] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    priceMin: '',
    priceMax: '',
    rating: '',
    dateFrom: '',
    dateTo: '',
    tags: [],
    features: [],
    difficulty: '',
    duration: '',
    groupSize: '',
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resultsPerPage] = useState(20);
  
  const isRTL = i18n.language === 'ar';
  const language = i18n.language;

  // Initialize component
  useEffect(() => {
    initializeSearch();
    loadFilterOptions();
    loadSearchHistory();
    loadSavedSearches();
    
    // Parse URL parameters
    const urlParams = searchService.parseSearchURL(window.location.search);
    if (Object.keys(urlParams).length > 0) {
      setSearchQuery(urlParams.query || '');
      setFilters(prev => ({ ...prev, ...urlParams }));
      performSearch({ ...urlParams, page: 1 });
    }
    
    // Setup GSAP animations
    setupAnimations();
    
    return () => {
      // Cleanup
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Load search suggestions when query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      loadSuggestions(searchQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Initialize search
  const initializeSearch = () => {
    setSearchHistory(searchService.getSearchHistory());
    setSavedSearches(searchService.getSavedSearches());
  };

  // Load filter options
  const loadFilterOptions = async () => {
    try {
      const response = await searchService.getSearchFilters(language);
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Error loading filter options:', error);
      notificationService.show('error', t('search.errors.loadFilters'));
    }
  };

  // Load search history
  const loadSearchHistory = () => {
    setSearchHistory(searchService.getSearchHistory());
  };

  // Load saved searches
  const loadSavedSearches = () => {
    setSavedSearches(searchService.getSavedSearches());
  };

  // Load search suggestions
  const loadSuggestions = async (query) => {
    try {
      const response = await searchService.getSearchSuggestions(query, language);
      setSuggestions(response.data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  // Perform search
  const performSearch = async (searchParams = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        query: searchQuery,
        ...filters,
        ...searchParams,
        page: searchParams.page || currentPage,
        limit: resultsPerPage,
        language
      };
      
      // Validate parameters
      const validation = searchService.validateSearchParams(params);
      if (!validation.isValid) {
        setError(validation.errors);
        return;
      }
      
      const response = await searchService.searchActivities(params);
      
      if (response.success) {
        setSearchResults(response.data.activities || []);
        setSearchSummary(searchService.getSearchSummary(response.data));
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.pages);
        
        // Update URL
        const searchURL = searchService.buildSearchURL(params);
        navigate(searchURL, { replace: true });
        
        // Save search query
        if (searchQuery) {
          await searchService.saveSearchQuery({
            query: searchQuery,
            filters: params,
            resultsCount: response.data.activities.length
          });
        }
        
        // Show success notification
        notificationService.show('success', t('search.messages.searchCompleted', { count: response.data.activities.length }));
        
      } else {
        throw new Error(response.message || 'Search failed');
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message);
      notificationService.show('error', t('search.errors.searchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length >= 2) {
      loadSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    performSearch({ page: 1 });
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'activity') {
      setSearchQuery(suggestion.text);
    } else if (suggestion.type === 'category') {
      setSearchQuery('');
      handleFilterChange('category', suggestion.value);
    } else if (suggestion.type === 'location') {
      setSearchQuery('');
      handleFilterChange('location', suggestion.text);
    }
    
    setShowSuggestions(false);
    performSearch({ page: 1 });
  };

  // Handle history click
  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    performSearch({ page: 1 });
  };

  // Handle saved search click
  const handleSavedSearchClick = (savedSearch) => {
    setSearchQuery(savedSearch.params.query || '');
    setFilters(prev => ({ ...prev, ...savedSearch.params }));
    performSearch({ page: 1 });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      priceMin: '',
      priceMax: '',
      rating: '',
      dateFrom: '',
      dateTo: '',
      tags: [],
      features: [],
      difficulty: '',
      duration: '',
      groupSize: '',
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
    setSearchQuery('');
    setSearchResults([]);
    setSearchSummary(null);
    navigate('/search');
  };

  // Save current search
  const saveCurrentSearch = () => {
    const name = prompt(t('search.prompts.saveSearchName'));
    if (name) {
      searchService.saveSearch(name, { query: searchQuery, ...filters });
      loadSavedSearches();
      notificationService.show('success', t('search.messages.searchSaved'));
    }
  };

  // Delete saved search
  const deleteSavedSearch = (id) => {
    searchService.deleteSavedSearch(id);
    loadSavedSearches();
    notificationService.show('success', t('search.messages.searchDeleted'));
  };

  // Setup GSAP animations
  const setupAnimations = () => {
    // Search bar animation
    gsap.fromTo('.search-bar', 
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );
    
    // Filter panel animation
    gsap.fromTo('.filter-panel', 
      { x: isRTL ? 50 : -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
    
    // Results animation
    gsap.fromTo('.search-results', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.2 }
    );
    
    // Setup scroll animations for activity cards
    ScrollTrigger.batch('.activity-card', {
      onEnter: (elements) => {
        gsap.fromTo(elements, 
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        );
      },
      once: true
    });
  };

  // Render filter options
  const renderFilterOptions = () => {
    if (!filterOptions) return null;
    
    return (
      <div className="filter-panel">
        {/* Categories */}
        <div className="filter-group">
          <label className="filter-label">
            <MapPin className="w-4 h-4" />
            {t('search.filters.category')}
          </label>
          <div className="filter-options">
            {filterOptions.categories.map(category => (
              <button
                key={category}
                className={`filter-option ${filters.category === category ? 'active' : ''}`}
                onClick={() => handleFilterChange('category', category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Price Range */}
        <div className="filter-group">
          <label className="filter-label">
            <DollarSign className="w-4 h-4" />
            {t('search.filters.priceRange')}
          </label>
          <div className="price-range">
            <input
              type="number"
              placeholder={t('search.filters.minPrice')}
              value={filters.priceMin}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              className="price-input"
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              placeholder={t('search.filters.maxPrice')}
              value={filters.priceMax}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              className="price-input"
            />
          </div>
        </div>
        
        {/* Rating */}
        <div className="filter-group">
          <label className="filter-label">
            <Star className="w-4 h-4" />
            {t('search.filters.minRating')}
          </label>
          <div className="rating-filter">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                className={`rating-option ${filters.rating === rating.toString() ? 'active' : ''}`}
                onClick={() => handleFilterChange('rating', rating.toString())}
              >
                {rating}+
              </button>
            ))}
          </div>
        </div>
        
        {/* Sort Options */}
        <div className="filter-group">
          <label className="filter-label">
            <TrendingUp className="w-4 h-4" />
            {t('search.filters.sortBy')}
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="sort-select"
          >
            <option value="relevance">{t('search.sort.relevance')}</option>
            <option value="price">{t('search.sort.price')}</option>
            <option value="rating">{t('search.sort.rating')}</option>
            <option value="date">{t('search.sort.date')}</option>
            <option value="popularity">{t('search.sort.popularity')}</option>
            <option value="distance">{t('search.sort.distance')}</option>
          </select>
        </div>
      </div>
    );
  };

  // Render search suggestions
  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;
    
    return (
      <div className="suggestions-panel">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="suggestion-item"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <SearchIcon className="w-4 h-4" />
            <span>{suggestion.text}</span>
            <span className="suggestion-type">{suggestion.type}</span>
          </button>
        ))}
      </div>
    );
  };

  // Render search history
  const renderSearchHistory = () => {
    if (searchHistory.length === 0) return null;
    
    return (
      <div className="history-panel">
        <div className="history-header">
          <History className="w-4 h-4" />
          <span>{t('search.history.title')}</span>
        </div>
        <div className="history-items">
          {searchHistory.slice(0, 5).map((query, index) => (
            <button
              key={index}
              className="history-item"
              onClick={() => handleHistoryClick(query)}
            >
              {query}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render saved searches
  const renderSavedSearches = () => {
    if (savedSearches.length === 0) return null;
    
    return (
      <div className="saved-searches-panel">
        <div className="saved-searches-header">
          <Bookmark className="w-4 h-4" />
          <span>{t('search.saved.title')}</span>
        </div>
        <div className="saved-searches-items">
          {savedSearches.map(search => (
            <div key={search.id} className="saved-search-item">
              <button
                className="saved-search-name"
                onClick={() => handleSavedSearchClick(search)}
              >
                {search.name}
              </button>
              <button
                className="saved-search-delete"
                onClick={() => deleteSavedSearch(search.id)}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render search results
  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>{t('search.loading')}</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-state">
          <AlertCircle className="w-8 h-8" />
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => performSearch({ page: 1 })}
          >
            {t('search.retry')}
          </button>
        </div>
      );
    }
    
    if (searchResults.length === 0 && searchQuery) {
      return (
        <div className="no-results-state">
          <SearchIcon className="w-8 h-8" />
          <p>{t('search.noResults')}</p>
          <button
            className="clear-filters-button"
            onClick={clearFilters}
          >
            {t('search.clearFilters')}
          </button>
        </div>
      );
    }
    
    return (
      <div className="search-results">
        {searchSummary && (
          <div className="search-summary">
            <p>
              {t('search.results.summary', {
                count: searchSummary.totalResults,
                query: searchQuery || t('search.allActivities')
              })}
            </p>
            {searchSummary.activeFilters > 0 && (
              <button
                className="clear-filters-button"
                onClick={clearFilters}
              >
                {t('search.clearFilters')}
              </button>
            )}
          </div>
        )}
        
        <div className="results-grid">
          {searchResults.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              className="activity-card"
              onTap={() => navigate(`/activity/${activity.id}`)}
            />
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              disabled={currentPage === 1}
              onClick={() => performSearch({ page: currentPage - 1 })}
            >
              {t('search.pagination.previous')}
            </button>
            
            <span className="pagination-info">
              {t('search.pagination.page', { current: currentPage, total: totalPages })}
            </span>
            
            <button
              className="pagination-button"
              disabled={currentPage === totalPages}
              onClick={() => performSearch({ page: currentPage + 1 })}
            >
              {t('search.pagination.next')}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`enhanced-search-page ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Search Header */}
      <div className="search-header">
        <div className="search-bar">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-container">
              <SearchIcon className="search-icon" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-button"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <button
              type="button"
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            
            <button type="submit" className="search-submit-button">
              <SearchIcon className="w-5 h-5" />
            </button>
          </form>
          
          {/* Search Suggestions */}
          {renderSuggestions()}
          
          {/* Search History */}
          {!searchQuery && renderSearchHistory()}
          
          {/* Saved Searches */}
          {!searchQuery && renderSavedSearches()}
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="filters-container">
            {renderFilterOptions()}
            
            <div className="filter-actions">
              <button
                className="apply-filters-button"
                onClick={() => performSearch({ page: 1 })}
              >
                {t('search.applyFilters')}
              </button>
              
              <button
                className="save-search-button"
                onClick={saveCurrentSearch}
              >
                <Bookmark className="w-4 h-4" />
                {t('search.saveSearch')}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Search Results */}
      <div className="search-content">
        {renderSearchResults()}
      </div>
    </div>
  );
};

export default EnhancedSearchPage;

