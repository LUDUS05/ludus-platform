import { useState, useEffect, useCallback } from 'react';
import pagesService from '../services/pagesService';

const useMenuPages = (placement) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenuPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPages = await pagesService.getPagesForMenu(placement);
      setPages(Array.isArray(fetchedPages) ? fetchedPages : []);
    } catch (err) {
      console.error('Error fetching menu pages:', err);
      setError(err.message || 'Failed to load menu pages');
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [placement]);

  useEffect(() => {
    if (placement) {
      fetchMenuPages();
    }
  }, [placement, fetchMenuPages]);

  return { pages, loading, error, refetch: fetchMenuPages };
};

export default useMenuPages;