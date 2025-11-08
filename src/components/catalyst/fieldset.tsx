import React from 'react';

export function Fieldset({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLFieldSetElement>) {
  return (
    <fieldset className={`space-y-6 ${className}`} {...props} />
  );
}

export function Legend({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLLegendElement>) {
  return (
    <legend
      className={`text-base font-semibold text-slate-900 ${className}`}
      {...props}
    />
  );
}

export function Label({
  className = '',
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`block text-sm font-medium text-slate-700 ${className}`}
      {...props}
    />
  );
}

export function Description({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-slate-600 ${className}`} {...props} />
  );
}
