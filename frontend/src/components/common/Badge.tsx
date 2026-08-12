import React from 'react';

export type BadgeVariant =
  | 'LOW STOCK'
  | 'IN STOCK'
  | 'OUT OF STOCK'
  | 'DRAFT'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'ACTIVE'
  | 'LEAD'
  | 'INACTIVE'
  | 'ADMIN'
  | 'SALES'
  | 'WAREHOUSE' | 'ACCOUNTS'
  | 'IN'
  | 'OUT';

interface BadgeProps {
  variant: BadgeVariant | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant, label, size = 'md' }) => {
  const text = label || variant;
  const textUpper = text.toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (textUpper === 'LOW STOCK' || textUpper === 'LEAD') {
    styles = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  } else if (textUpper === 'IN STOCK' || textUpper === 'CONFIRMED' || textUpper === 'ACTIVE' || textUpper === 'IN') {
    styles = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  } else if (textUpper === 'OUT OF STOCK' || textUpper === 'CANCELLED' || textUpper === 'INACTIVE' || textUpper === 'OUT') {
    styles = 'bg-rose-500/10 text-rose-600 border-rose-500/20';
  } else if (textUpper === 'DRAFT') {
    styles = 'bg-sky-500/10 text-sky-600 border-sky-500/20';
  } else if (textUpper === 'ADMIN') {
    styles = 'bg-purple-500/10 text-purple-600 border-purple-500/20';
  } else if (textUpper === 'SALES') {
    styles = 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  } else if (textUpper === 'WAREHOUSE') {
    styles = 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
  } else if (textUpper === 'ACCOUNTS') {
    styles = 'bg-teal-500/10 text-teal-600 border-teal-500/20';
  }

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full border ${sizeStyles} ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {textUpper}
    </span>
  );
};
