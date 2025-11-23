import React from 'react';

interface InlineErrorProps {
  message?: string;
}

export function InlineError({ message }: InlineErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-sm text-red-600" role="alert">
      {message}
    </p>
  );
}

export default InlineError;
