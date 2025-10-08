import React from 'react';
import { clsx } from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value);
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <select
        className={clsx(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      >
        {children}
      </select>
    );
  }
);

export const SelectContent = ({ children, ...props }: { children: React.ReactNode }) => (
  <div {...props}>{children}</div>
);

export const SelectItem = ({ value, children, ...props }: { value: string; children: React.ReactNode }) => (
  <option value={value} {...props}>{children}</option>
);

export const SelectTrigger = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm', className)} {...props}>
    {children}
  </div>
);

export const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="text-muted-foreground">{placeholder}</span>
);

Select.displayName = 'Select';