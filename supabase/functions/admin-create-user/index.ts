import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get environment variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? ''

        console.log('[DEBUG] Environment check:')
        console.log('  - SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
        console.log('  - SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✓' : '✗')

        if (!supabaseUrl) {
            throw new Error('SUPABASE_URL not configured')
        }

        if (!supabaseServiceRoleKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
        }

        // Initialize Supabase client with service role key
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Parse request body
        const body = await req.json().catch(() => null)
        if (!body) {
            throw new Error('Invalid JSON body')
        }

        console.log('[DEBUG] Received body keys:', Object.keys(body))

        const { 
            email, 
            password, 
            name, 
            role = 'physiotherapist',
            identification, 
            phone, 
            category, 
            position, 
            assigned_categories, 
            birth_date, 
            previous_team, 
            description, 
            is_chief = false, 
            reports_to 
        } = body

        // Validate required fields
        if (!email || !password || !name) {
            throw new Error('Missing required fields: email, password, name')
        }

        console.log(`[DEBUG] Creating user: ${email} as ${role}`)

        // Create auth user
        console.log('[DEBUG] Creating auth user...')
        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                name,
                identification,
                phone
            }
        })

        if (createError || !userData?.user) {
            console.error('[ERROR] Failed to create auth user:', createError?.message || 'Unknown error')
            throw new Error(`Failed to create auth user: ${createError?.message || 'Unknown error'}`)
        }

        const userId = userData.user.id
        console.log('[DEBUG] Auth user created:', userId)

        // Create profile
        console.log('[DEBUG] Creating profile...')
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                email,
                name,
                role,
                identification: identification ?? null,
                phone: phone ?? null
            })

        if (profileError) {
            console.error('[ERROR] Profile insert failed:', profileError.message)
            await supabase.auth.admin.deleteUser(userId).catch(() => {})
            throw new Error(`Failed to create profile: ${profileError.message}`)
        }

        console.log('[DEBUG] Profile created')

        // Role-specific tables
        if (role === 'player') {
            console.log('[DEBUG] Creating player record...')
            const { error: playerError } = await supabase
                .from('players')
                .insert({
                    id: userId,
                    email,
                    name,
                    category: category ?? null,
                    position: position ?? null,
                    status: 'active',
                    identification: identification ?? null,
                    phone: phone ?? null,
                    previous_team: previous_team ?? null,
                    description: description ?? null,
                    birth_date: birth_date ?? null
                })

            if (playerError) {
                console.error('[ERROR] Player insert failed:', playerError.message)
                await supabase.auth.admin.deleteUser(userId).catch(() => {})
                throw new Error(`Failed to create player: ${playerError.message}`)
            }

        } else if (role === 'coach') {
            console.log('[DEBUG] Creating coach record...')
            const { error: coachError } = await supabase
                .from('coaches')
                .insert({
                    id: userId,
                    assigned_categories: assigned_categories ?? []
                })

            if (coachError) {
                console.error('[ERROR] Coach insert failed:', coachError.message)
                await supabase.auth.admin.deleteUser(userId).catch(() => {})
                throw new Error(`Failed to create coach: ${coachError.message}`)
            }

        } else if (role === 'physiotherapist') {
            console.log('[DEBUG] Creating physiotherapist record...')
            const { error: physioError } = await supabase
                .from('physiotherapists')
                .insert({
                    id: userId,
                    identification: identification ?? null,
                    phone: phone ?? null,
                    assigned_categories: assigned_categories ?? [],
                    is_chief: is_chief === true,
                    reports_to: reports_to ?? null
                })

            if (physioError) {
                console.error('[ERROR] Physiotherapist insert failed:', physioError.message)
                await supabase.auth.admin.deleteUser(userId).catch(() => {})
                throw new Error(`Failed to create physiotherapist: ${physioError.message}`)
            }
        }

        console.log('[SUCCESS] User created:', userId)
        return new Response(
            JSON.stringify({ 
                success: true, 
                userId, 
                email,
                role
            }),
            { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
                status: 201 
            }
        )

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[FATAL] Function error:', errorMessage)
        return new Response(
            JSON.stringify({ 
                success: false, 
                error: errorMessage 
            }),
            { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
                status: 400 
            }
        )
    }
})
