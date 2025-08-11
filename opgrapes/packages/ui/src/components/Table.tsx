import React from 'react';
import { cn } from '../lib/utils';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'bordered' | 'striped';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
  children: React.ReactNode;
}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
  children: React.ReactNode;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  className?: string;
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  onSort?: () => void;
  sortDirection?: 'asc' | 'desc' | 'none';
}

const tableVariants = {
  default: '',
  bordered: 'border border-gray-200',
  striped: ''
};

const tableSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

const cellSizes = {
  sm: 'px-2 py-1',
  md: 'px-4 py-2',
  lg: 'px-6 py-3'
};

const cellAlign = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right'
};

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={cn(
            'w-full border-collapse',
            tableVariants[variant],
            tableSizes[size],
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn('bg-gray-50', className)}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn('bg-white divide-y divide-gray-200', className)}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, hover = true, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          hover && 'hover:bg-gray-50 transition-colors',
          className
        )}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, align = 'left', ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          'border-t border-gray-200',
          cellSizes.md,
          cellAlign[align],
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

export const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ className, children, align = 'left', sortable, onSort, sortDirection = 'none', ...props }, ref) => {
    const handleClick = () => {
      if (sortable && onSort) {
        onSort();
      }
    };

    return (
      <th
        ref={ref}
        className={cn(
          'border-b border-gray-200 bg-gray-50',
          cellSizes.md,
          cellAlign[align],
          sortable && 'cursor-pointer select-none',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortable && (
            <div className="flex flex-col">
              <svg 
                className={cn(
                  'w-3 h-3',
                  sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <svg 
                className={cn(
                  'w-3 h-3 -mt-1',
                  sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </th>
    );
  }
);

TableHeaderCell.displayName = 'TableHeaderCell';
