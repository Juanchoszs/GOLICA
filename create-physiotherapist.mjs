#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuración
const SUPABASE_URL = 'https://ucbgwxtwnypzqrmshqrl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjYmd3eHR3bnlwenFybXNocXJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk4MTA4NywiZXhwIjoyMDg4NTU3MDg3fQ.JYTHIV6mR8ojkRl5klT0xWwC6k0S4fiEEXv4eFDK7o4';

// Datos del Jefe de Área
const physiotherapist = {
  email: 'jdicabuco@gmail.com',
  password: 'jhoan.fisio',
  full_name: 'JHOAN DAVID',
  identification: '107342443',
  phone: '3182150916',
  is_area_chief: true
};

async function createPhysiotherapist() {
  console.log('🚀 Iniciando registro de Fisioterapeuta...\n');
  
  // Crear cliente con Service Role (acceso total)
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    console.log('📝 Datos a registrar:');
    console.log(`  - Email: ${physiotherapist.email}`);
    console.log(`  - Nombre: ${physiotherapist.full_name}`);
    console.log(`  - ID: ${physiotherapist.identification}`);
    console.log(`  - Teléfono: ${physiotherapist.phone}`);
    console.log(`  - Es Jefe de Área: ${physiotherapist.is_area_chief}\n`);

    // 1. Verificar si el usuario ya existe
    console.log('1️⃣  Buscando usuario existente...');
    const { data: existingUsers, error: searchError } = await supabase.auth.admin.listUsers();
    
    let userId = null;
    if (searchError) {
      console.error('❌ Error al buscar:', searchError.message);
      return;
    }

    const existingUser = existingUsers.users.find(u => u.email === physiotherapist.email);
    
    if (existingUser) {
      console.log(`✅ Usuario ya existe: ${existingUser.id}\n`);
      userId = existingUser.id;
    } else {
      // Crear usuario en Auth
      console.log('1️⃣  Creando usuario en Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: physiotherapist.email,
        password: physiotherapist.password,
        email_confirm: true,
        user_metadata: {
          full_name: physiotherapist.full_name,
          identification: physiotherapist.identification,
          phone: physiotherapist.phone,
        }
      });

      if (authError) {
        console.error('❌ Error en Auth:', authError.message);
        return;
      }

      console.log(`✅ Usuario creado en Auth`);
      userId = authData.user.id;
    }
    
    console.log(`   ID: ${userId}\n`);

    // 2. Crear o actualizar perfil en tabla profiles
    console.log('2️⃣  Creando/actualizando perfil en base de datos...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: physiotherapist.email,
        name: physiotherapist.full_name,
        identification: physiotherapist.identification,
        phone: physiotherapist.phone,
        role: 'physiotherapist',
        initial_password: physiotherapist.password
      })
      .select();

    if (profileError) {
      console.error('❌ Error en profiles:', profileError.message);
      return;
    }

    console.log(`✅ Perfil creado/actualizado correctamente\n`);

    // 3. Verificar que se creó correctamente
    console.log('3️⃣  Verificando registro...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.error('❌ Error al verificar:', verifyError.message);
      return;
    }

    console.log('✅ Verificación exitosa:\n');
    console.log(JSON.stringify(verifyData, null, 2));

    console.log('\n🎉 ¡Fisioterapeuta registrado correctamente!');
    console.log(`\n📧 Puede loguearse con:`);
    console.log(`   Email: ${physiotherapist.email}`);
    console.log(`   Contraseña: ${physiotherapist.password}`);

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

createPhysiotherapist();
