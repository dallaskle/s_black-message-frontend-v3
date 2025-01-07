import { ButtonHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          'px-4 py-2 rounded-lg font-medium transition-colors',
          variant === 'primary' 
            ? 'bg-accent-primary text-white hover:bg-accent-primary/90'
            : 'bg-text-secondary text-white hover:bg-text-secondary/90',
          isLoading && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button'; 