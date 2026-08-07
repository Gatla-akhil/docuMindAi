const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

let supabase = null;
let isSupabaseConnected = false;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url_here') {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    isSupabaseConnected = true;
    console.log(`[Supabase Connected]: Client initialized for ${supabaseUrl}`);
  } catch (err) {
    console.warn(`[Supabase Notice]: Could not initialize client (${err.message}).`);
  }
} else {
  console.log(`[Supabase Notice]: SUPABASE_URL / SUPABASE_KEY not set in backend/.env. Using hybrid database storage.`);
}

const getIsSupabaseConnected = () => isSupabaseConnected;

module.exports = {
  supabase,
  getIsSupabaseConnected
};
