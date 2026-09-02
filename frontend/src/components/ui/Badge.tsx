import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    warning: 'bg-amber-50 text-amber-800 border-amber-300',
    danger: 'bg-red-50 text-red-800 border-red-300',
    info: 'bg-sky-50 text-sky-800 border-sky-300',
    neutral: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  const dotColors = {
    primary: 'bg-indigo-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
    info: 'bg-sky-600',
    neutral: 'bg-slate-500',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[11px] leading-tight font-medium',
    md: 'px-2 py-0.5 text-xs font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])} />}
      <span>{children}</span>
    </span>
  );
};
