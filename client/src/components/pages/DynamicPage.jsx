import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DynamicPage = () => {
  const { url } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPage();
  }, [url]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get page by slug directly
      const response = await axios.get(`/api/pages/slug/${url}`);
      setPage(response.data);
    } catch (error) {
      console.error('Error fetching page:', error);
      if (error.response?.status === 404) {
        setError('Page not found');
      } else {
        setError('Failed to load page');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading page...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Page Header */}
          <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {page.title?.en || page.title?.ar || page.title || 'Untitled'}
            </h1>
            
            {/* Meta Information */}
            {page.metaDescription && (
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {page.metaDescription}
              </p>
            )}
            
            {/* Page Info */}
            <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
              {page.createdBy && (
                <span>
                  By {page.createdBy.firstName} {page.createdBy.lastName}
                </span>
              )}
              {page.updatedAt && (
                <span>
                  Updated {new Date(page.updatedAt).toLocaleDateString()}
                </span>
              )}
              {page.isSystem && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  System Page
                </span>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div className="px-6 py-8">
            <div 
              className="prose prose-lg max-w-none dark:prose-invert
                         prose-headings:text-gray-900 dark:prose-headings:text-white
                         prose-p:text-gray-700 dark:prose-p:text-gray-300
                         prose-a:text-blue-600 dark:prose-a:text-blue-400
                         prose-strong:text-gray-900 dark:prose-strong:text-white
                         prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                         prose-ol:text-gray-700 dark:prose-ol:text-gray-300"
              dangerouslySetInnerHTML={{ __html: Array.isArray(page.content) && page.content.length > 0 ? page.content[0]?.content?.en || page.content[0]?.content || '' : page.content || '' }}
            />
          </div>
        </article>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;