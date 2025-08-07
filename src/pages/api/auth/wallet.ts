import type { APIRoute } from 'astro';
import { createServiceClient } from '../../../utils/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    
    // Validar datos requeridos
    const { wallet_address, signature, message, username } = body;
    
    if (!wallet_address || !signature || !message) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: wallet_address, signature, message' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar formato de wallet address (Solana)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet_address)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Solana wallet address format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // TODO: Aquí se debería verificar la firma de Solana
    // Por ahora, asumimos que la verificación se hace en el frontend
    // En una implementación completa, se usaría @solana/web3.js para verificar
    
    // Crear o actualizar usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        wallet_address,
        username: username || `Player_${wallet_address.slice(-6)}`
      }, {
        onConflict: 'wallet_address'
      })
      .select()
      .single();

    if (userError || !user) {
      console.error('Error creating/updating user:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate user' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Obtener estadísticas del usuario
    const { data: bestScoreData } = await supabase
      .rpc('get_user_best_score', { user_wallet: wallet_address });
    
    const { data: rankData } = await supabase
      .rpc('get_user_rank', { user_wallet: wallet_address });

    // Obtener total de juegos
    const { count: totalGames } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const userStats = {
      best_score: bestScoreData || 0,
      rank: rankData || null,
      total_games: totalGames || 0
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          user,
          stats: userStats,
          authenticated: true
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error in wallet auth API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const supabase = createServiceClient();
    const searchParams = new URL(url).searchParams;
    const walletAddress = searchParams.get('wallet');
    
    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: 'wallet parameter is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Buscar usuario por wallet address
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'User not found',
          authenticated: false
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Obtener estadísticas del usuario
    const { data: bestScoreData } = await supabase
      .rpc('get_user_best_score', { user_wallet: walletAddress });
    
    const { data: rankData } = await supabase
      .rpc('get_user_rank', { user_wallet: walletAddress });

    // Obtener total de juegos
    const { count: totalGames } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const userStats = {
      best_score: bestScoreData || 0,
      rank: rankData || null,
      total_games: totalGames || 0
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          user,
          stats: userStats,
          authenticated: true
        }
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30'
        }
      }
    );

  } catch (error) {
    console.error('Unexpected error in wallet check API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};