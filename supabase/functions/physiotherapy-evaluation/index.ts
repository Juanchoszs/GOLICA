import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PhysiotherapyEvaluation {
  id?: string;
  player_id: string;
  user_id?: string;
  player_name: string;
  player_age?: number;
  player_identification?: string;
  player_gender?: string;
  player_eps?: string;
  evaluation_date: string;
  evaluator_name?: string;
  
  // Antecedents
  pathological_history?: string;
  pathological_history_details?: string;
  surgical_history?: string;
  surgical_history_details?: string;
  hospitalization_history?: string;
  hospitalization_history_details?: string;
  traumatic_history?: string;
  traumatic_history_details?: string;
  pharmacological_history?: string;
  pharmacological_history_details?: string;
  allergic_history?: string;
  allergic_history_details?: string;
  toxic_history?: string;
  toxic_history_details?: string;
  
  // Habits/Psychosocial
  meals_per_day?: number;
  feeding_perception?: string;
  daily_water_consumption?: string;
  average_sleep_hours?: number;
  sleep_quality?: string;
  alcohol_consumption?: string;
  tobacco_consumption?: string;
  spa_consumption?: string;
  
  // Anthropometric measures
  height_cm?: number;
  weight_kg?: number;
  imc?: number;
  systolic_pressure?: number;
  diastolic_pressure?: number;
  abdominal_perimeter_cm?: number;
  heart_rate_rest?: number;
  oxygen_saturation_percent?: number;
  
  // Musculoskeletal evaluation
  rom_mmss_status?: string;
  strength_mmss_status?: string;
  symmetry_mmss_status?: string;
  plancha_core_classification?: string;
  plancha_core_time_seconds?: number;
  
  // Balance test
  romberg_time_open_eyes_seconds?: number;
  romberg_time_closed_eyes_seconds?: number;
  romberg_balance_control_open_eyes?: string;
  romberg_balance_control_closed_eyes?: string;
  
  // Ruffier index
  ruffier_fc_rest_p1?: number;
  ruffier_fc_post_effort_p2?: number;
  ruffier_fc_recovery_p3?: number;
  ruffier_index_value?: number;
  ruffier_classification?: string;
  
  // Unipodal squat
  squat_knee_alignment?: string;
  squat_trunk_control?: string;
  squat_movement_quality?: string;
  
  // Notes
  physiotherapist_note?: string;
  physiotherapist_recommendation?: string;
  evolution_note?: string;
}

async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const method = req.method;
    const url = new URL(req.url);
    const path = url.pathname;

    // Route: GET /physiotherapy-evaluation/:id
    if (method === "GET" && path.includes("/physiotherapy-evaluation/")) {
      const id = path.split("/").pop();

      const { data, error } = await supabase
        .from("physiotherapy_evaluations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Route: GET /physiotherapy-evaluation (list all)
    if (method === "GET" && path.includes("physiotherapy-evaluation")) {
      const { data, error } = await supabase
        .from("physiotherapy_evaluations")
        .select("*")
        .eq("is_active", true)
        .order("evaluation_date", { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Route: POST /physiotherapy-evaluation (create)
    if (method === "POST" && path.includes("physiotherapy-evaluation")) {
      const body: PhysiotherapyEvaluation = await req.json();

      const evaluationData = {
        ...body,
        user_id: user.id,
        updated_by: user.id,
        consent_given: true,
      };

      const { data, error } = await supabase
        .from("physiotherapy_evaluations")
        .insert([evaluationData])
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Route: PUT /physiotherapy-evaluation/:id (update)
    if (method === "PUT" && path.includes("/physiotherapy-evaluation/")) {
      const id = path.split("/").pop();
      const body: PhysiotherapyEvaluation = await req.json();

      const updateData = {
        ...body,
        updated_by: user.id,
      };

      const { data, error } = await supabase
        .from("physiotherapy_evaluations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Route: DELETE /physiotherapy-evaluation/:id
    if (method === "DELETE" && path.includes("/physiotherapy-evaluation/")) {
      const id = path.split("/").pop();

      const { data, error } = await supabase
        .from("physiotherapy_evaluations")
        .update({ is_active: false, updated_by: user.id })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ message: "Evaluation marked as inactive", data }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

serve(handleRequest);
