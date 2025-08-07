import type { APIRoute } from 'astro';
import { createServiceClient } from '../../../utils/supabase';

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const supabase = createServiceClient();
    const walletAddress = params.wallet;
    const searchParams = new URL(url).searchParams;
    const includeScores = searchParams.get('include_scores') === 'true';
    const scoresLimit = parseInt(searchParams.get('scores_limit') || '5');
    
    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Wallet address is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar formato de wallet address
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Solana wallet address format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Buscar usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'User not found'
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

    // Obtener total de juegos y promedio
    const { data: allScores, error: scoresError } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', user.id);

    const totalGames = allScores?.length || 0;
    const averageScore = totalGames > 0 ? 
      Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / totalGames) : 0;

    const userStats = {
      best_score: bestScoreData || 0,
      rank: rankData || null,
      total_games: totalGames,
      average_score: averageScore
    };

    let recentScores = null;
    
    // Incluir scores recientes si se solicita
    if (includeScores) {
      const { data: scoresData, error: recentScoresError } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(scoresLimit);

      if (!recentScoresError) {
        recentScores = scoresData;
      }
    }

    const responseData = {
      user,
      stats: userStats,
      ...(recentScores && { recent_scores: recentScores })
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        data: responseData
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        }
      }
    );

  } catch (error) {
    console.error('Unexpected error in user API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const supabase = createServiceClient();
    const walletAddress = params.wallet;
    const body = await request.json();
    
    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Wallet address is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar que solo se pueda actualizar el username
    const { username } = body;
    
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Valid username is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar longitud del username
    if (username.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Username must be 20 characters or less' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Actualizar usuario
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({ username: username.trim() })
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (updateError || !user) {
      console.error('Error updating user:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: { user }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error in user update API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};