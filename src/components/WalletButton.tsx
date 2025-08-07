import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ButtonSpinner } from './LoadingSpinner';
import { showToast } from './Toast';

interface Props {
  className?: string;
}

export default function WalletButton({ className = '' }: Props) {
  const { wallet, connect, disconnect, connecting, connected, publicKey } = useWallet();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnect();
      showToast.info('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      showToast.error('Failed to disconnect wallet');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className={`wallet-button ${className}`}>
      {!connected ? (
        <WalletMultiButton className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {connecting && <ButtonSpinner />}
          {connecting ? 'Conectando...' : 'Conectar Wallet'}
        </WalletMultiButton>
      ) : (
        <div className="flex items-center gap-3">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            {publicKey ? formatAddress(publicKey.toString()) : 'Conectado'}
          </div>
          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isDisconnecting && <ButtonSpinner />}
            Desconectar
          </button>
        </div>
      )}
    </div>
  );
}

// Custom styles for wallet adapter
export const walletButtonStyles = `
  .wallet-adapter-button {
    background-color: #7c3aed !important;
    border: none !important;
    border-radius: 0.5rem !important;
    font-weight: 700 !important;
    padding: 0.5rem 1rem !important;
    transition: background-color 0.2s !important;
  }
  
  .wallet-adapter-button:hover {
    background-color: #6d28d9 !important;
  }
  
  .wallet-adapter-button:disabled {
    background-color: #9ca3af !important;
    cursor: not-allowed !important;
  }
  
  .wallet-adapter-modal {
    z-index: 9999 !important;
  }
  
  .wallet-adapter-modal-overlay {
    background-color: rgba(0, 0, 0, 0.5) !important;
  }
  
  .wallet-adapter-modal-container {
    background-color: white !important;
    border-radius: 1rem !important;
    padding: 2rem !important;
  }
`;