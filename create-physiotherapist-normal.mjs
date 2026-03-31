import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ucbgwxtwnypzqrmshqrl.supabase.co';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SERVICE_ROLE_KEY environment variable is not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

/**
 * Create a normal physiotherapist (not area chief)
 * This is for regular physiotherapists who can view and manage daily exercises
 */
async function createNormalPhysiotherapist() {
  try {
    const physicianData = {
      fullName: 'CARLOS MARTINEZ',
      email: 'carmartinez@gmail.com',
      password: 'carlos.fisio',
      identification: '98765432',
      phone: '3205432109'
    };

    console.log('📝 Creating normal physiotherapist...');
    console.log(`Email: ${physicianData.email}`);
    console.log(`Name: ${physicianData.fullName}`);

    // Step 1: Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: physicianData.email,
      password: physicianData.password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.warn('⚠️  Warning: Email already exists in Auth');
      } else {
        throw new Error(`Auth error: ${authError.message}`);
      }
    }

    const userId = authData?.user?.id;
    if (!userId) {
      throw new Error('Failed to create auth user');
    }

    console.log(`✅ Auth user created: ${userId}`);

    // Step 2: Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: physicianData.email,
        name: physicianData.fullName,
        role: 'physiotherapist',
        identification: physicianData.identification,
        phone: physicianData.phone,
        is_area_chief: false
      })
      .select()
      .single();

    if (profileError) {
      throw new Error(`Profile error: ${profileError.message}`);
    }

    console.log('✅ Profile created successfully');
    console.log('\n✨ Physiotherapist created successfully!');
    console.log('\n📋 Credentials:');
    console.log(`  Email: ${physicianData.email}`);
    console.log(`  Password: ${physicianData.password}`);
    console.log(`  Name: ${physicianData.fullName}`);
    console.log(`  Role: physiotherapist (normal)`);
    console.log(`  ID: ${physicianData.identification}`);

    return profileData;
  } catch (error) {
    console.error('❌ Error creating physiotherapist:', error.message);
    process.exit(1);
  }
}

// Run the script
createNormalPhysiotherapist();
