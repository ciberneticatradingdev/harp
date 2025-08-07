import React from 'react';
import { toast, Toaster } from 'sonner';

// Toast notification functions
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: 'rgba(34, 197, 94, 0.9)',
        color: 'white',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        backdropFilter: 'blur(10px)',
      },
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: 'rgba(239, 68, 68, 0.9)',
        color: 'white',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        backdropFilter: 'blur(10px)',
      },
    });
  },
  
  info: (message: string) => {
    toast.info(message, {
      duration: 3000,
      style: {
        background: 'rgba(59, 130, 246, 0.9)',
        color: 'white',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        backdropFilter: 'blur(10px)',
      },
    });
  },
  
  warning: (message: string) => {
    toast.warning(message, {
      duration: 3500,
      style: {
        background: 'rgba(245, 158, 11, 0.9)',
        color: 'white',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        backdropFilter: 'blur(10px)',
      },
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: 'rgba(107, 114, 128, 0.9)',
        color: 'white',
        border: '1px solid rgba(107, 114, 128, 0.3)',
        backdropFilter: 'blur(10px)',
      },
    });
  },
  
  promise: <T,>(promise: Promise<T>, messages: {
    loading: string;
    success: string;
    error: string;
  }) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      style: {
        background: 'rgba(107, 114, 128, 0.9)',
        color: 'white',
        border: '1px solid rgba(107, 114, 128, 0.3)',
        backdropFilter: 'blur(10px)',
      },
    });
  },
  
  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },
  
  // Game-specific notifications
  scoreSubmitted: (score: number, rank?: number) => {
    const message = rank 
      ? `Score ${score} submitted! You're ranked #${rank}` 
      : `Score ${score} submitted successfully!`;
    
    toast.success(message, {
      duration: 4000,
      style: {
        background: 'rgba(98, 161, 77, 0.9)',
        color: 'white',
        border: '1px solid rgba(98, 161, 77, 0.3)',
        backdropFilter: 'blur(10px)',
      },
    });
  },
  
  walletConnected: (address: string) => {
    const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
    toast.success(`Wallet connected: ${shortAddress}`, {
      duration: 3000,
      style: {
        background: 'rgba(34, 197, 94, 0.9)',
        color: 'white',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        backdropFilter: 'blur(10px)',
      },
    });
  },
  
  walletDisconnected: () => {
    toast.info('Wallet disconnected', {
      duration: 2000,
      style: {
        background: 'rgba(107, 114, 128, 0.9)',
        color: 'white',
        border: '1px solid rgba(107, 114, 128, 0.3)',
        backdropFilter: 'blur(10px)',
      },
    });
  },
  
  newHighScore: (score: number) => {
    toast.success(`🎉 New High Score: ${score}!`, {
      duration: 5000,
      style: {
        background: 'rgba(255, 215, 0, 0.9)',
        color: '#000',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        fontWeight: 'bold',
      },
    });
  },
};

// Toast Provider Component
export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      expand={false}
      richColors={false}
      closeButton={true}
      toastOptions={{
        style: {
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
        className: 'toast-custom',
      }}
    />
  );
}

export default ToastProvider;