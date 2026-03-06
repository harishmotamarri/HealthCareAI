const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key on server to bypass RLS for admin operations
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase;

try {
    supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
    console.log('✅ Supabase client initialized.');
} catch (error) {
    console.error('❌ Error initializing Supabase client:', error.message);
}

module.exports = supabase;
