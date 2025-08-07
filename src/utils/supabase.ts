import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Cliente para frontend (usando anon key)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Cliente para backend (usando service role key)
export function createServiceClient() {
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('Missing Supabase service role key');
  }
  
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Funciones helper para el leaderboard
export async function getLeaderboard(limit: number = 10) {
  const { data, error } = await supabase
    .from('scores')
    .select(`
      *,
      users!inner(
        wallet_address,
        username
      )
    `)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return null;
  }

  return data;
}

export async function getUserScores(walletAddress: string) {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('users.wallet_address', walletAddress)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user scores:', error);
    return null;
  }

  return data;
}

export async function insertScore(userId: string, score: number, gameSessionId: string) {
  const { data, error } = await supabase
    .from('scores')
    .insert({
      user_id: userId,
      score,
      game_session_id: gameSessionId
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting score:', error);
    return null;
  }

  return data;
}

export async function upsertUser(walletAddress: string, username?: string) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      wallet_address: walletAddress,
      username: username || `Player_${walletAddress.slice(-6)}`
    }, {
      onConflict: 'wallet_address'
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user:', error);
    return null;
  }

  return data;
}