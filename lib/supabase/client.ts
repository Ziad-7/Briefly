import { createClient } from '@supabase/supabase-js';

// Fallback to empty strings or placeholders during build time to avoid crashing
// These keys must be provided as environment variables in Vercel for the app to function at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
