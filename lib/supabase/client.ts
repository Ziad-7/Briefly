import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Only warn in the browser if keys are missing
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseKey)) {
  console.warn('Supabase credentials missing! Check your Vercel Environment Variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
