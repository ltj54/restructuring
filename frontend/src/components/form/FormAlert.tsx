import React from 'react';
import { Link } from 'react-router-dom';
import { FormAlertAction, FormAlertVariant } from './types';

const VARIANT_STYLES: Record<FormAlertVariant, string> = {
  success: 'border-green-200 bg-green-50 text-green-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

export interface FormAlertProps {
  variant?: FormAlertVariant;
  message: React.ReactNode;
  action?: FormAlertAction;
}

export function FormAlert({ variant = 'info', message, action }: FormAlertProps) {
  return (
    <div
      className={`mb-4 rounded-lg border px-3 py-2 text-sm ${VARIANT_STYLES[variant]}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <div className="flex flex-col gap-2 text-left">
        <span>{message}</span>
        {action && action.type === 'link' && (
          <Link to={action.to} className="font-medium underline">
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}

export default FormAlert;
