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
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        // Get the requester's identity
        const authHeader = req.headers.get('Authorization')!
        const token = authHeader.replace('Bearer ', '')
        const { data: { user: requester }, error: authError } = await supabaseClient.auth.getUser(token)

        if (authError || !requester) {
            throw new Error('No autorizado')
        }

        // Verify role (admin)
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', requester.id)
            .single()

        if (profileError || profile?.role !== 'admin') {
            throw new Error('Solo los administradores pueden eliminar usuarios')
        }

        const { userId } = await req.json()

        if (!userId) {
            throw new Error('Se requiere el ID del usuario a eliminar')
        }

        // 1. Delete user from Auth (this will cascade to profiles via trigger or we delete manually)
        const { error: deleteAuthError } = await supabaseClient.auth.admin.deleteUser(userId)

        if (deleteAuthError) {
            console.error('Error deleting auth user:', deleteAuthError)
            // Continue to try to clean up database records even if auth deletion fails
        }

        // 2. Delete from players table (if exists)
        const { error: deletePlayerError } = await supabaseClient
            .from('players')
            .delete()
            .eq('id', userId)

        if (deletePlayerError) {
            console.error('Error deleting player record:', deletePlayerError)
        }

        // 3. Delete from coaches table (if exists)
        // First delete from bridge table to avoid constraint issues if not cascading
        const { error: deleteBridgeError } = await supabaseClient
            .from('coach_categories')
            .delete()
            .eq('coach_id', userId)

        if (deleteBridgeError) {
            console.error('Error deleting coach_categories record:', deleteBridgeError)
        }

        const { error: deleteCoachError } = await supabaseClient
            .from('coaches')
            .delete()
            .eq('id', userId)

        if (deleteCoachError) {
            console.error('Error deleting coach record:', deleteCoachError)
        }

        // 4. Delete from profiles table (this might be handled by cascade, but we ensure it)
        const { error: deleteProfileError } = await supabaseClient
            .from('profiles')
            .delete()
            .eq('id', userId)

        if (deleteProfileError) {
            console.error('Error deleting profile record:', deleteProfileError)
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Usuario eliminado correctamente' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
