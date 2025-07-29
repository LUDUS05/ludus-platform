import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const PaymentManagement = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-md font-bold text-charcoal dark:text-dark-text-primary">
            Payment Management
          </h2>
          <p className="text-body-md text-charcoal-light dark:text-dark-text-secondary">
            Monitor transactions and payment gateway integration
          </p>
        </div>
        <Button variant="primary">
          Financial Report
        </Button>
      </div>

      {/* Coming Soon Card */}
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-ludus-orange/10 dark:bg-dark-ludus-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">💰</span>
          </div>
          <h3 className="text-display-sm font-bold text-charcoal dark:text-dark-text-primary mb-4">
            Payment Analytics Dashboard
          </h3>
          <p className="text-body-md text-charcoal-light dark:text-dark-text-secondary mb-6">
            Comprehensive payment management system with Moyasar integration, 
            transaction monitoring, and detailed financial reporting.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left mb-6">
            <div>
              <h4 className="text-body-sm font-semibold text-charcoal dark:text-dark-text-primary mb-2">
                💳 Payment Features:
              </h4>
              <ul className="text-body-xs text-charcoal-light dark:text-dark-text-secondary space-y-1">
                <li>• Moyasar integration</li>
                <li>• Real-time monitoring</li>
                <li>• Refund management</li>
                <li>• Fraud detection</li>
              </ul>
            </div>
            <div>
              <h4 className="text-body-sm font-semibold text-charcoal dark:text-dark-text-primary mb-2">
                📈 Analytics Tools:
              </h4>
              <ul className="text-body-xs text-charcoal-light dark:text-dark-text-secondary space-y-1">
                <li>• Revenue tracking</li>
                <li>• Transaction reports</li>
                <li>• Payment method stats</li>
                <li>• Financial forecasting</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="flex items-center space-x-2 px-3 py-2 bg-success/10 dark:bg-dark-success/10 rounded-lg">
              <div className="w-2 h-2 bg-success dark:bg-dark-success rounded-full"></div>
              <span className="text-body-xs font-medium text-success dark:text-dark-success">
                Moyasar Connected
              </span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-warning/10 dark:bg-dark-warning/10 rounded-lg">
              <div className="w-2 h-2 bg-warning dark:bg-dark-warning rounded-full"></div>
              <span className="text-body-xs font-medium text-warning dark:text-dark-warning">
                SAR Currency
              </span>
            </div>
          </div>
          <Button variant="outline">
            View Payment Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentManagement;