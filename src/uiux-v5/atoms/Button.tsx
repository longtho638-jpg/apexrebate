import React from 'react';
import colors from '../tokens/colors';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline';
  children: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  // define styles using inline style because tailwind doesn't understand dynamic values
  const style: React.CSSProperties =
    variant === 'primary'
      ? {
          backgroundColor: colors.primary.intelligentTeal,
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          fontSize: '1.125rem',
          border: 'none',
        }
      : {
          backgroundColor: 'transparent',
          color: colors.primary.intelligentTeal,
          padding: '0.75rem 1.5rem',
          fontSize: '1.125rem',
          border: `1px solid ${colors.primary.intelligentTeal}`,
        };

  return (
    <button className={base} style={style} {...props}>
      {children}
    </button>
  );
};

export default Button;
