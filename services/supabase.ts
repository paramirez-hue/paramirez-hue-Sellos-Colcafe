
import { createClient } from '@supabase/supabase-js';

// Rebuscamos las variables en todas las fuentes posibles (import.meta.env y process.env)
const getEnv = (name: string) => {
  return import.meta.env[name] || (typeof process !== 'undefined' ? process.env[name] : undefined);
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON') || getEnv('SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON');

console.log('--- Supabase Connection Diagnostic ---');
console.log('URL detectada:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}... (OK)` : 'No detectada (Verifique Secrets)');
console.log('Anon Key detectada:', supabaseAnonKey ? '*** (OK)' : 'No detectada (Verifique Secrets)');
console.log('---------------------------------------');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Supabase credentials missing! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://MISSING-CREDENTIALS.supabase.co', 
  supabaseAnonKey || 'missing-key'
);
