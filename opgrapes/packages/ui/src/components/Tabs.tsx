import React, { useState, createContext, useContext } from 'react';
import { cn } from '../lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
};

export interface TabsProps {
  defaultTab?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export interface TabProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isActive?: boolean;
}

export interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const tabVariants = {
  default: {
    list: 'border-b border-gray-200',
    tab: 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    active: 'border-blue-500 text-blue-600'
  },
  pills: {
    list: 'space-x-1',
    tab: 'rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    active: 'bg-blue-100 text-blue-700'
  },
  underline: {
    list: 'border-b border-gray-200',
    tab: 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    active: 'border-blue-500 text-blue-600'
  }
};

const tabSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
};

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultTab, children, className, variant = 'default', size = 'md', fullWidth = false }, ref) => {
    const [activeTab, setActiveTab] = useState(defaultTab || '');

    const contextValue: TabsContextType = {
      activeTab,
      setActiveTab
    };

    return (
      <TabsContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn('w-full', className)}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';

export const TabList = React.forwardRef<HTMLDivElement, TabListProps>(
  ({ children, className, 'aria-label': ariaLabel }, ref) => {
    const { activeTab } = useTabsContext();

    return (
      <div
        ref={ref}
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          'flex border-b border-gray-200',
          className
        )}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Tab) {
            const tabChild = child as React.ReactElement<TabProps>;
            return React.cloneElement(tabChild, {
              isActive: tabChild.props.id === activeTab
            });
          }
          return child;
        })}
      </div>
    );
  }
);

TabList.displayName = 'TabList';

export const Tab = React.forwardRef<HTMLButtonElement, TabProps & { isActive?: boolean }>(
  ({ id, children, className, disabled = false, leftIcon, rightIcon, isActive = false }, ref) => {
    const { setActiveTab } = useTabsContext();

    const handleClick = () => {
      if (!disabled) {
        setActiveTab(id);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : isActive ? 0 : -1}
        id={`tab-${id}`}
        aria-controls={`panel-${id}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 font-medium transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          tabSizes.md,
          isActive
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          className
        )}
      >
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Tab.displayName = 'Tab';

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  ({ id, children, className }, ref) => {
    const { activeTab } = useTabsContext();
    const isActive = activeTab === id;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`panel-${id}`}
        aria-labelledby={`tab-${id}`}
        className={cn('py-4', className)}
      >
        {children}
      </div>
    );
  }
);

TabPanel.displayName = 'TabPanel';
