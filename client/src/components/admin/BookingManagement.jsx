import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const BookingManagement = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-md font-bold text-charcoal dark:text-dark-text-primary">
            Booking Management
          </h2>
          <p className="text-body-md text-charcoal-light dark:text-dark-text-secondary">
            Manage all platform bookings and reservations
          </p>
        </div>
        <Button variant="primary">
          Export Report
        </Button>
      </div>

      {/* Coming Soon Card */}
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-ludus-orange/10 dark:bg-dark-ludus-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📅</span>
          </div>
          <h3 className="text-display-sm font-bold text-charcoal dark:text-dark-text-primary mb-4">
            Booking Management Coming Soon
          </h3>
          <p className="text-body-md text-charcoal-light dark:text-dark-text-secondary mb-6">
            We're building an advanced booking management system with real-time updates, 
            automated notifications, and comprehensive reporting tools.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left mb-6">
            <div>
              <h4 className="text-body-sm font-semibold text-charcoal dark:text-dark-text-primary mb-2">
                📊 Features Include:
              </h4>
              <ul className="text-body-xs text-charcoal-light dark:text-dark-text-secondary space-y-1">
                <li>• Real-time booking status</li>
                <li>• Automated confirmations</li>
                <li>• Calendar integration</li>
                <li>• Payment tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="text-body-sm font-semibold text-charcoal dark:text-dark-text-primary mb-2">
                🔧 Management Tools:
              </h4>
              <ul className="text-body-xs text-charcoal-light dark:text-dark-text-secondary space-y-1">
                <li>• Bulk operations</li>
                <li>• Custom filters</li>
                <li>• Export reports</li>
                <li>• Analytics dashboard</li>
              </ul>
            </div>
          </div>
          <Button variant="outline">
            Request Early Access
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BookingManagement;