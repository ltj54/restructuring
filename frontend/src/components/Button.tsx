import React from 'react';
import { Link } from 'react-router-dom';

type ButtonProps = {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost';
};

export default function Button({
  children,
  to,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  variant = 'primary',
}: ButtonProps) {
  const variantClasses: Record<typeof variant, string> = {
    primary:
      'bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 text-slate-900 ' +
      'border border-transparent shadow-md hover:brightness-[1.02]',
    secondary:
      'bg-white text-slate-800 border border-slate-300 hover:border-emerald-300 hover:bg-emerald-50',
    ghost:
      'bg-transparent text-slate-800 border border-transparent hover:border-emerald-200 hover:bg-emerald-50',
  };

  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ' +
    'transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed ' +
    variantClasses[variant];

  if (to) {
    return (
      <Link
        to={to}
        className={`${base} ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${className}`}>
      {children}
    </button>
  );
}
