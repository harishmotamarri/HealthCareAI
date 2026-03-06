// Initialize Supabase JS Client
const supabaseUrl = 'https://yqatauqqvwyoahpuqukp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxYXRhdXFxdnd5b2FocHVxdWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NTE4NDMsImV4cCI6MjA4ODMyNzg0M30.PnJjnD3YJE82MJUh0hc8cAOZ6j16MjkljjuNex3ePpw';

window.supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
