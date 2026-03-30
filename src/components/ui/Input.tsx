import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm
          placeholder:text-gray-400
          focus:border-primary-300 focus:ring-2 focus:ring-primary-100
          transition-colors duration-150
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
