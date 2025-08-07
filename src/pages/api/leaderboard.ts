import type { APIRoute } from 'astro';
import { createServiceClient } from '../../utils/supabase';
import type { LeaderboardEntry } from '../../utils/database.types';

export const GET: APIRoute = async ({ url }) => {
  try {
    const supabase = createServiceClient();
    const searchParams = new URL(url).searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Validar límite
    if (limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({ error: 'Limit must be between 1 and 100' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Obtener leaderboard usando la función SQL
    const { data, error } = await supabase
      .rpc('get_leaderboard', { limit_count: limit });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch leaderboard' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Formatear datos para el frontend
    const leaderboard = data?.map((entry, index) => ({
      rank: index + 1,
      id: entry.id,
      score: entry.score,
      wallet_address: entry.wallet_address,
      username: entry.username,
      created_at: entry.created_at,
      game_session_id: entry.game_session_id
    })) || [];

    return new Response(
      JSON.stringify({ 
        success: true,
        data: leaderboard,
        total: leaderboard.length
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60' // Cache por 1 minuto
        }
      }
    );

  } catch (error) {
    console.error('Unexpected error in leaderboard API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};