#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ucbgwxtwnypzqrmshqrl.supabase.co';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SERVICE_ROLE_KEY environment variable is not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Email del Jhoan a mantener
const JHOAN_EMAIL = 'jdicabuco@gmail.com';

async function deleteTestPhysiotherapists() {
  try {
    console.log('🔍 Buscando todos los fisioterapeutas...\n');

    // Get all physiotherapists from profiles table
    const { data: physiotherapists, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'physiotherapist');

    if (fetchError) {
      throw new Error(`Error fetching profiles: ${fetchError.message}`);
    }

    console.log(`📋 Total de fisioterapeutas encontrados: ${physiotherapists.length}\n`);

    if (physiotherapists.length === 0) {
      console.log('✅ No hay fisioterapeutas para eliminar');
      return;
    }

    // Filter out Jhoan
    const toDelete = physiotherapists.filter(p => p.email !== JHOAN_EMAIL);
    const jhoanProfile = physiotherapists.find(p => p.email === JHOAN_EMAIL);

    console.log(`✅ Perfil de JHOAN a mantener:`);
    console.log(`   - Email: ${jhoanProfile?.email}`);
    console.log(`   - Nombre: ${jhoanProfile?.name}`);
    console.log(`   - ID: ${jhoanProfile?.id}\n`);

    if (toDelete.length === 0) {
      console.log('✅ Solo existe el perfil de Jhoan. Nada que eliminar.');
      return;
    }

    console.log(`🗑️  Perfiles a eliminar (${toDelete.length}):\n`);
    
    for (const profile of toDelete) {
      console.log(`   - ${profile.name} (${profile.email})`);
    }

    console.log('\n⚠️  Procediendo con la eliminación...\n');

    // Delete test profiles
    let deletedCount = 0;
    for (const profile of toDelete) {
      try {
        // 1. Delete from profiles table
        const { error: profileDeleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profile.id);

        if (profileDeleteError) {
          console.error(`❌ Error deleting profile ${profile.email}: ${profileDeleteError.message}`);
          continue;
        }

        // 2. Delete from auth
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(profile.id);

        if (authDeleteError) {
          console.error(`❌ Error deleting auth user ${profile.email}: ${authDeleteError.message}`);
          continue;
        }

        console.log(`✅ Eliminado: ${profile.name} (${profile.email})`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Error processing ${profile.email}: ${error.message}`);
      }
    }

    console.log(`\n✨ Operación completada!`);
    console.log(`   - Eliminados: ${deletedCount}`);
    console.log(`   - Conservado: ${jhoanProfile?.name} (${JHOAN_EMAIL})`);

  } catch (error) {
    console.error('❌ Error deleting physiotherapists:', error.message);
    process.exit(1);
  }
}

// Run the script
deleteTestPhysiotherapists();
