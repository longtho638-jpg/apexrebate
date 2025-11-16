import React from 'react';

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
}

export function Heading({
  level = 1,
  className = '',
  ...props
}: HeadingProps) {
  const baseClasses = {
    1: 'text-3xl font-bold tracking-tight text-slate-900',
    2: 'text-2xl font-bold tracking-tight text-slate-900',
    3: 'text-xl font-semibold tracking-tight text-slate-900',
    4: 'text-lg font-semibold text-slate-900',
  };

  const Component = `h${level}` as keyof React.JSX.IntrinsicElements;

  return React.createElement(Component, {
    className: `${baseClasses[level]} ${className}`,
    ...props,
  });
}

export function Subheading({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-base text-slate-600 mt-2 ${className}`}
      {...props}
    />
  );
}
