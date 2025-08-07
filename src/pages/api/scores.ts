import type { APIRoute } from 'astro';
import { createServiceClient } from '../../utils/supabase';
import { v4 as uuidv4 } from 'uuid';

export const POST: APIRoute = async ({ request }) => {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    
    // Validar datos requeridos
    const { wallet_address, score, username } = body;
    
    if (!wallet_address || typeof score !== 'number' || score < 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing or invalid required fields: wallet_address, score' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar que el score sea un número entero positivo
    if (!Number.isInteger(score) || score < 0) {
      return new Response(
        JSON.stringify({ error: 'Score must be a positive integer' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

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
        JSON.stringify({ error: 'Failed to create or update user' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Insertar nuevo score
    const gameSessionId = uuidv4();
    const { data: scoreData, error: scoreError } = await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        score,
        game_session_id: gameSessionId
      })
      .select()
      .single();

    if (scoreError || !scoreData) {
      console.error('Error inserting score:', scoreError);
      return new Response(
        JSON.stringify({ error: 'Failed to save score' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Obtener el ranking del usuario
    const { data: rankData, error: rankError } = await supabase
      .rpc('get_user_rank', { user_wallet: wallet_address });

    const userRank = rankError ? null : rankData;

    // Obtener el mejor score del usuario
    const { data: bestScoreData, error: bestScoreError } = await supabase
      .rpc('get_user_best_score', { user_wallet: wallet_address });

    const bestScore = bestScoreError ? score : bestScoreData;

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          score: scoreData,
          user: user,
          rank: userRank,
          best_score: bestScore,
          is_new_best: score >= bestScore
        }
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error in scores API:', error);
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
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: 'wallet parameter is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Obtener scores del usuario
    const { data, error } = await supabase
      .from('scores')
      .select(`
        *,
        users!inner(
          wallet_address,
          username
        )
      `)
      .eq('users.wallet_address', walletAddress)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user scores:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user scores' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Obtener estadísticas del usuario
    const { data: bestScoreData } = await supabase
      .rpc('get_user_best_score', { user_wallet: walletAddress });
    
    const { data: rankData } = await supabase
      .rpc('get_user_rank', { user_wallet: walletAddress });

    const stats = {
      total_games: data?.length || 0,
      best_score: bestScoreData || 0,
      rank: rankData || null,
      average_score: data?.length ? 
        Math.round(data.reduce((sum, score) => sum + score.score, 0) / data.length) : 0
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        data: data || [],
        stats
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
    console.error('Unexpected error in user scores API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};