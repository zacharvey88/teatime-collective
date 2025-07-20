import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kntdzvkvfyoiwjfnlvgg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudGR6dmt2ZnlvaXdqZm5sdmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNDE2MTUsImV4cCI6MjA2ODYxNzYxNX0.-8oTxt7JZ7eJuGfELaesTGqjugJiO5S15ic4Vhlntqc';

export const supabase = createClient(supabaseUrl, supabaseKey); 