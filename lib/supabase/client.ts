import { createClient } from '@supabase/supabase-js';

// Fallback to placeholders ONLY to allow the build to pass if environment variables are missing
// Note: NEXT_PUBLIC_ variables are baked into the bundle at build time. 
// If they are missing during the Vercel build, the app will fail at runtime.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
