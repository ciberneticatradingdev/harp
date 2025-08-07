import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { User } from '../utils/database.types';
import { showToast } from '../components/Toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const { publicKey, connected } = useWallet();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
  });

  // Función para autenticar usuario con wallet
  const authenticateUser = async () => {
    if (!publicKey || !connected) {
      setAuthState({ user: null, loading: false, error: null });
      return;
    }

    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    const loadingToast = showToast.loading('Authenticating wallet...');

    try {
      const walletAddress = publicKey.toString();
      
      // Llamar a la API de autenticación
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        throw new Error('Error al autenticar usuario');
      }

      const userData = await response.json();
      
      setAuthState({
        user: userData.user,
        loading: false,
        error: null,
      });
      
      showToast.dismiss(loadingToast);
      showToast.walletConnected(walletAddress);
    } catch (error) {
      console.error('Error en autenticación:', error);
      showToast.dismiss(loadingToast);
      showToast.error('Failed to authenticate wallet');
      setAuthState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  // Función para enviar score
  const submitScore = async (score: number, gameSessionId?: string) => {
    if (!authState.user || !publicKey) {
      showToast.warning('Please connect your wallet to submit scores');
      throw new Error('Usuario no autenticado');
    }

    const loadingToast = showToast.loading('Submitting score...');

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authState.user.id,
          score,
          gameSessionId: gameSessionId || `game_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar score');
      }

      const result = await response.json();
      
      showToast.dismiss(loadingToast);
      
      // Check if it's a new high score
      const userStats = await getUserStats();
      if (userStats && score > (userStats.bestScore || 0)) {
        showToast.newHighScore(score);
      } else {
        showToast.scoreSubmitted(score, userStats?.rank || 0);
      }
      
      return result;
    } catch (error) {
      console.error('Error al enviar score:', error);
      showToast.dismiss(loadingToast);
      showToast.error('Error submitting score');
      throw error;
    }
  };

  // Función para obtener scores del usuario
  const getUserScores = async () => {
    if (!publicKey) {
      return [];
    }

    try {
      const walletAddress = publicKey.toString();
      const response = await fetch(`/api/user/${walletAddress}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener scores del usuario');
      }

      const data = await response.json();
      return data.scores || [];
    } catch (error) {
      console.error('Error al obtener scores:', error);
      return [];
    }
  };

  // Función para obtener estadísticas del usuario
  const getUserStats = async (): Promise<{ bestScore: number; rank: number; totalGames: number } | null> => {
    if (!publicKey) return null;

    try {
      const walletAddress = publicKey.toString();
      const response = await fetch(`/api/user/${walletAddress}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas del usuario');
      }

      const data = await response.json();
      
      if (data.user) {
        return {
          bestScore: data.user.best_score || 0,
          rank: data.user.rank || 0,
          totalGames: data.user.total_games || 0
        };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setAuthState({ user: null, loading: false, error: null });
    showToast.walletDisconnected();
  };

  // Efecto para autenticar cuando se conecta la wallet
  useEffect(() => {
    if (connected && publicKey) {
      authenticateUser();
    } else {
      logout();
    }
  }, [connected, publicKey]);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user && connected,
    walletAddress: publicKey?.toString() || null,
    submitScore,
    getUserScores,
    getUserStats,
    logout,
    refreshAuth: authenticateUser,
  };
}