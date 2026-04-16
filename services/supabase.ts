
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON;

console.log('--- Supabase Connection Diagnostic ---');
console.log('URL detectada:', supabaseUrl ? `${supabaseUrl.substring(0, 15)}... (OK)` : 'No detectada (Falta VITE_SUPABASE_URL)');
console.log('Anon Key detectada:', supabaseAnonKey ? '***... (OK)' : 'No detectada (Falta VITE_SUPABASE_ANON_KEY o VITE_SUPABASE_ANON)');
console.log('---------------------------------------');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Supabase credentials missing! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://MISSING-CREDENTIALS.supabase.co', 
  supabaseAnonKey || 'missing-key'
);
