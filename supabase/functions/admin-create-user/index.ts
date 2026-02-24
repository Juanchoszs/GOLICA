import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        
        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Configuración de Supabase incompleta')
        }
        
        const supabaseClient = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        // Get the requester's identity
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No se proporcionó token de autorización')
        }
        
        const token = authHeader.replace('Bearer ', '')
        const { data: { user: requester }, error: authError } = await supabaseClient.auth.getUser(token)

        if (authError || !requester) {
            console.error('Auth error:', authError)
            throw new Error('No autorizado - sesión inválida')
        }

        // Verify role (admin)
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', requester.id)
            .single()

        if (profileError || profile?.role !== 'admin') {
            throw new Error('Solo los administradores pueden crear usuarios')
        }

        const body = await req.json().catch(() => null)
        if (!body) {
            throw new Error('Cuerpo de la petición inválido')
        }
        
        const { email, password, name, role, identification, phone, category, position, assigned_categories, birth_date, previous_team, description } = body

        // Validaciones
        if (!email || !password || !name || !identification) {
            throw new Error('Faltan campos requeridos: email, password, name, identification')
        }

        // 1. Check duplicates via profiles (lighter and avoids admin list pagination)
        const { data: existingProfile, error: existingProfileError } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle()

        if (existingProfileError) {
            console.error('Error checking existing profile by email:', existingProfileError)
        }
        if (existingProfile) {
            throw new Error(`Ya existe un usuario con el email: ${email}`)
        }

        // 2. Create User in Auth
        console.log('Creating user with email:', email)
        const { data: userData, error: createUserError } = await supabaseClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, role }
        })

        if (createUserError) {
            console.error('Error creating user:', createUserError)
            throw new Error(`Error al crear usuario: ${createUserError.message}`)
        }

        const userId = userData.user.id
        console.log('User created with ID:', userId)

        // 3. Wait a moment for trigger to create profile, then update it
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Update profile with additional data
        const { error: updateProfileError } = await supabaseClient
            .from('profiles')
            .update({ name, identification, phone: phone || null, initial_password: password })
            .eq('id', userId)

        if (updateProfileError) {
            console.error('Error updating profile:', updateProfileError)
            // Don't fail if profile update fails, the user was already created
        }

        // 4. Insert specific metadata (ATOMIC for player)
        if (role === 'player') {
            const basePlayerPayload: Record<string, unknown> = {
                id: userId,
                category: category || null,
                position: position || null,
                status: 'active',
                identification: identification || null,
                phone: phone || null,
                previous_team: previous_team || null,
                description: description || null,
                email: email || null,
                name: name || null,
            }

            const fullPlayerPayload: Record<string, unknown> = {
                ...basePlayerPayload,
            }
            if (birth_date) {
                fullPlayerPayload.birth_date = birth_date
            }

            // Retry without birth_date if the column doesn't exist in the project.
            const minimalPlayerPayload: Record<string, unknown> = {
                ...basePlayerPayload,
            }

            const tryUpsert = async (payload: Record<string, unknown>) => {
                return await supabaseClient
                    .from('players')
                    .upsert(payload, { onConflict: 'id' })
            }

            // First attempt: full payload
            let upsertResult = await tryUpsert(fullPlayerPayload)

            // Retry with minimal payload if schema mismatch
            if (upsertResult.error) {
                console.error('Error upserting player (full payload):', upsertResult.error)
                upsertResult = await tryUpsert(minimalPlayerPayload)
            }

            if (upsertResult.error) {
                console.error('Error upserting player (minimal payload):', upsertResult.error)

                // Rollback: if we can't create players row, we delete the auth user to avoid ghost accounts
                try {
                    await supabaseClient.auth.admin.deleteUser(userId)
                } catch (rollbackErr) {
                    console.error('Rollback error deleting auth user:', rollbackErr)
                }

                throw new Error('No se pudo crear el registro en la tabla players. El usuario fue revertido. Revisa el esquema/RLS de players.')
            }

            // Force-update fields that must not remain null
            const { error: forceUpdateError } = await supabaseClient
                .from('players')
                .update({
                    category: category || null,
                    position: position || null,
                    status: 'active',
                    identification: identification || null,
                    phone: phone || null,
                    previous_team: previous_team || null,
                    description: description || null,
                    email: email || null,
                    name: name || null,
                    ...(birth_date ? { birth_date } : {}),
                })
                .eq('id', userId)

            if (forceUpdateError) {
                console.error('Error force-updating player fields:', forceUpdateError)
                try {
                    await supabaseClient.auth.admin.deleteUser(userId)
                } catch (rollbackErr) {
                    console.error('Rollback error deleting auth user:', rollbackErr)
                }
                throw new Error('No se pudo completar la información en players. El usuario fue revertido.')
            }

            // Verify persisted values
            const { data: verifyPlayer, error: verifyError } = await supabaseClient
                .from('players')
                .select('id, category, position, previous_team, description, email, name, birth_date')
                .eq('id', userId)
                .maybeSingle()

            if (verifyError || !verifyPlayer) {
                console.error('Error verifying player row:', verifyError)
                try {
                    await supabaseClient.auth.admin.deleteUser(userId)
                } catch (rollbackErr) {
                    console.error('Rollback error deleting auth user:', rollbackErr)
                }
                throw new Error('No se pudo verificar el registro en players. El usuario fue revertido.')
            }

            if (!verifyPlayer.position || !verifyPlayer.category) {
                console.error('Verification failed: missing position/category in players:', verifyPlayer)
                try {
                    await supabaseClient.auth.admin.deleteUser(userId)
                } catch (rollbackErr) {
                    console.error('Rollback error deleting auth user:', rollbackErr)
                }
                throw new Error('Players quedó incompleto (sin categoría/posición). El usuario fue revertido.')
            }

        } else if (role === 'coach') {
            const { error: coachError } = await supabaseClient
                .from('coaches')
                .insert([{ id: userId, assigned_categories }])

            if (coachError) {
                console.error('Error inserting coach:', coachError)
                // Rollback for coaches too (avoid ghost accounts)
                try {
                    await supabaseClient.auth.admin.deleteUser(userId)
                } catch (rollbackErr) {
                    console.error('Rollback error deleting auth user:', rollbackErr)
                }
                throw new Error(`No se pudo crear el registro de coach: ${coachError.message}`)
            }
        }

        console.log('User creation completed successfully')
        return new Response(
            JSON.stringify({ success: true, userId }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('Function error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
