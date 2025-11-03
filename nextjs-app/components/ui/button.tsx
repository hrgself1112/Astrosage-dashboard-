import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-m3-primary text-m3-on-primary hover:bg-m3-primary-container hover:text-m3-on-primary-container',
        destructive: 'bg-m3-error text-m3-on-error hover:bg-m3-error-container hover:text-m3-on-error-container',
        outline: 'border border-m3-outline bg-m3-surface hover:bg-m3-surface-variant hover:text-m3-on-surface',
        secondary: 'bg-m3-secondary-container text-m3-on-secondary-container hover:bg-m3-secondary hover:text-m3-on-secondary',
        ghost: 'hover:bg-m3-surface-variant hover:text-m3-on-surface',
        link: 'text-m3-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      )}
      {children}
    </Comp>
  );
}
Button.displayName = 'Button';

export { Button, buttonVariants };