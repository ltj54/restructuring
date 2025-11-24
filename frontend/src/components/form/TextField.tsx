import React from 'react';
import InlineError from './InlineError';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, id, error, description, className = '', ...props }, ref) => {
    const normalizedLabel = label.toLowerCase().replace(/[^a-z0-9]+/gi, '-');
    const inputId = id ?? props.name ?? `input-${normalizedLabel}`;

    return (
      <label className="flex flex-col gap-1 text-left" htmlFor={inputId}>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {description && <span className="text-xs text-gray-500">{description}</span>}
        <input
          ref={ref}
          id={inputId}
          className={`rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          {...props}
        />
        <InlineError message={error} />
      </label>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;
