import { cn } from '../../lib/utils';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = ({
  className,
  variant = 'primary',
  size = 'md',
  inline = false,
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'font-medium rounded-lg transition-colors duration-200';
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };
  const displayStyles = inline ? 'inline-flex' : 'flex';

  return (
    <button
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        displayStyles,
        'items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Spinner inline size={16} />
          <span>Loading...</span>
        </div>
      ) : children}
    </button>
  );
};

export { Button, type ButtonProps }; 