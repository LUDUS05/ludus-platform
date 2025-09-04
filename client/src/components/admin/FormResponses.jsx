import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const FormResponses = () => {
  const { formId } = useParams();
  const { t } = useTranslation();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedResponses, setSelectedResponses] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (formId) {
      fetchFormData();
      fetchResponses();
      fetchStats();
    }
  }, [formId, currentPage, statusFilter, dateFrom, dateTo]);

  const fetchFormData = async () => {
    try {
      const response = await api.get(`/api/admin/forms/${formId}`);
      setForm(response.data.data.form);
    } catch (err) {
      setError('Failed to fetch form data');
    }
  };

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      const response = await api.get(`/api/admin/forms/${formId}/responses?${params.toString()}`);
      setResponses(response.data.data.responses);
      setTotalPages(response.data.data.pagination.pages);
    } catch (err) {
      setError('Failed to fetch responses');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/api/admin/forms/${formId}/stats`);
      setStats(response.data.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleStatusUpdate = async (responseId, newStatus, reviewNotes = '') => {
    try {
      await api.put(`/api/admin/forms/responses/${responseId}`, {
        status: newStatus,
        reviewNotes
      });
      setSuccess('Response status updated successfully');
      fetchResponses();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update response status');
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const params = new URLSearchParams({ format });
      if (statusFilter) params.append('status', statusFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      const response = await api.get(`/api/admin/forms/${formId}/export?${params.toString()}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${form.slug}-responses-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const a = document.createElement('a');
        a.href = dataUri;
        a.download = `${form.slug}-responses-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      setSuccess('Export completed successfully');
    } catch (err) {
      setError('Failed to export responses');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      reviewed: { color: 'bg-green-100 text-green-800', label: 'Reviewed' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Archived' }
    };
    
    const config = statusConfig[status] || statusConfig.submitted;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderFieldValue = (response) => {
    if (response.files && response.files.length > 0) {
      return (
        <div>
          <div className="text-sm">{response.value || 'No text value'}</div>
          <div className="text-xs text-gray-500 mt-1">
            Files: {response.files.map(file => file.originalName).join(', ')}
          </div>
        </div>
      );
    }
    
    if (Array.isArray(response.value)) {
      return response.value.join(', ');
    }
    
    return response.value || 'No response';
  };

  if (!form) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading form data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{form.title} - Responses</h1>
          <p className="text-gray-600">Review and manage form submissions</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowExportModal(true)}
          >
            Export Data
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(`/forms/${form.slug}`, '_blank')}
          >
            View Form
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalResponses}</div>
            <div className="text-sm text-gray-600">Total Responses</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.reviewedResponses}</div>
            <div className="text-sm text-gray-600">Reviewed</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingResponses}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(stats.averageSubmissionTime || 0)}s
            </div>
            <div className="text-sm text-gray-600">Avg. Time</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('');
                setDateFrom('');
                setDateTo('');
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Responses List */}
      <Card className="p-0">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading responses...</p>
          </div>
        ) : responses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No responses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {responses.map((response) => (
                  <tr key={response._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        #{response._id.slice(-8)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {response.responses.length} fields
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(response.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {response.submitterInfo?.name || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {response.submitterInfo?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(response.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <ResponseModal response={response} form={form} onStatusUpdate={handleStatusUpdate} />
                        <select
                          value={response.status}
                          onChange={(e) => handleStatusUpdate(response._id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          form={form}
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

// Response Detail Modal
const ResponseModal = ({ response, form, onStatusUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState(response.reviewNotes || '');

  const handleStatusUpdate = (newStatus) => {
    onStatusUpdate(response._id, newStatus, reviewNotes);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        View
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Response #{response._id.slice(-8)}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Response Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Submitted:</span> {new Date(response.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {response.status}
                </div>
                <div>
                  <span className="font-medium">Submitter:</span> {response.submitterInfo?.name || 'Anonymous'}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {response.submitterInfo?.email || 'No email'}
                </div>
              </div>

              {/* Form Responses */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Form Responses</h4>
                <div className="space-y-3">
                  {response.responses.map((fieldResponse, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="font-medium text-gray-900 mb-1">
                        {fieldResponse.fieldLabel}
                      </div>
                      <div className="text-gray-700">
                        {fieldResponse.files && fieldResponse.files.length > 0 ? (
                          <div>
                            <div>{fieldResponse.value || 'No text value'}</div>
                            <div className="mt-2">
                              <span className="text-sm font-medium">Files:</span>
                              <ul className="text-sm text-gray-600 mt-1">
                                {fieldResponse.files.map((file, fileIndex) => (
                                  <li key={fileIndex}>
                                    {file.originalName} ({Math.round(file.size / 1024)}KB)
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          Array.isArray(fieldResponse.value) 
                            ? fieldResponse.value.join(', ')
                            : fieldResponse.value || 'No response'
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Add notes about this response..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('reviewed')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Mark as Reviewed
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('archived')}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Archive
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Export Modal
const ExportModal = ({ form, onExport, onClose }) => {
  const [format, setFormat] = useState('csv');
  const [includeFilters, setIncludeFilters] = useState(false);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Export Responses</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="csv">CSV (Excel compatible)</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeFilters"
              checked={includeFilters}
              onChange={(e) => setIncludeFilters(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includeFilters" className="text-sm text-gray-700">
              Include current filters
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={() => onExport(format)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormResponses;
