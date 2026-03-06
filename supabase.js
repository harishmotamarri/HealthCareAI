const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase;

try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized.');
} catch (error) {
    console.error('❌ Error initializing Supabase client:', error.message);
}

module.exports = supabase;
