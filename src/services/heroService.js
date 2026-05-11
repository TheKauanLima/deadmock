import { supabase } from './supabase';

export async function listHeroes({ visibility = 'public', limit = 100 } = {}) {
  const q = supabase.from('heroes').select('*').order('created_at', { ascending: false }).limit(limit);
  if (visibility) q.eq('visibility', visibility);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getHero(id) {
  const { data, error } = await supabase.from('heroes').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createHero(payload) {
  // payload: { name, owner_id, visibility, base_stats, computed_hp }
  const { data, error } = await supabase.from('heroes').insert([payload]).select().single();
  if (error) throw error;
  return data;
}

export async function updateHero(id, changes) {
  const { data, error } = await supabase.from('heroes').update(changes).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteHero(id) {
  const { error } = await supabase.from('heroes').delete().eq('id', id);
  if (error) throw error;
  return true;
}
