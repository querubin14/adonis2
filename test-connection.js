require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Variables de entorno no encontradas en .env.local');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('--- Iniciando Test de Conexión ---');
  console.log('URL:', supabaseUrl);
  
  try {
    // Intentamos obtener las tablas públicas (no fallará si el cliente está bien config)
    const { data, error } = await supabase.from('products').select('*').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('✅ Conexión Exitosa: El cliente responde, pero la tabla "products" aún no existe (esto es normal si no has ejecutado el SQL).');
      } else {
        console.error('❌ Error de Supabase:', error.message);
      }
    } else {
      console.log('✅ Conexión Exitosa: La conexión es estable y la tabla "products" está disponible.');
    }
  } catch (err) {
    console.error('❌ Error Crítico:', err.message);
  }
}

testConnection();
