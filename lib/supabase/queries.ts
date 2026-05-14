import { supabase } from './client';
import { Brief } from '../types';

export async function createBrief(data: Partial<Brief>) {
  const { data: brief, error } = await supabase
    .from('briefs')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating brief:', error);
    throw new Error(error.message);
  }

  return brief;
}

export async function getBrief(id: string) {
  const { data: brief, error } = await supabase
    .from('briefs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error getting brief:', error);
    throw new Error(error.message);
  }

  return brief;
}

export async function listBriefs() {
  const { data: briefs, error } = await supabase
    .from('briefs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing briefs:', error);
    throw new Error(error.message);
  }

  return briefs;
}

export async function updateBriefStatus(id: string, status: string) {
  const { data: brief, error } = await supabase
    .from('briefs')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating brief status:', error);
    throw new Error(error.message);
  }

  return brief;
}
