import React from 'react';

export function Text({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-slate-700 ${className}`} {...props} />
  );
}

export function Strong({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <strong
      className={`font-semibold text-slate-900 ${className}`}
      {...props}
    />
  );
}

export function Code({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={`bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-900 ${className}`}
      {...props}
    />
  );
}
