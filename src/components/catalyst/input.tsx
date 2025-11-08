import React from 'react';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`
      block w-full rounded-lg border border-slate-300 bg-white
      px-3 py-2 text-sm text-slate-900 placeholder-slate-400
      focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
      disabled:bg-slate-50 disabled:text-slate-500
      ${className}
    `}
    {...props}
  />
));

Input.displayName = 'Input';
