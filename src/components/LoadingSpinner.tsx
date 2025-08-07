import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'white' | 'blue' | 'green' | 'yellow' | 'red';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const colorClasses = {
  white: 'border-white',
  blue: 'border-blue-500',
  green: 'border-green-500',
  yellow: 'border-yellow-500',
  red: 'border-red-500',
};

export function LoadingSpinner({ 
  size = 'md', 
  color = 'white', 
  className = '', 
  text 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          animate-spin 
          rounded-full 
          border-2 
          border-t-transparent
        `}
      />
      {text && (
        <p className={`mt-2 text-${color} text-sm font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
}

// Inline loading component for buttons
export function ButtonSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        border-white 
        animate-spin 
        rounded-full 
        border-2 
        border-t-transparent
        mr-2
      `}
    />
  );
}

// Full screen loading overlay
export function LoadingOverlay({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  );
}

export default LoadingSpinner;