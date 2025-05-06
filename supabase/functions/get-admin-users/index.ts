
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    // Create supabase client with admin privileges using env vars
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get auth users using the admin API
    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    // Get profile data
    const { data: profiles, error: profilesError } = await supabaseClient
      .from("profiles")
      .select("*");

    if (profilesError) {
      throw profilesError;
    }

    // Get user roles
    const { data: userRoles, error: userRolesError } = await supabaseClient
      .from("user_roles")
      .select("*");

    if (userRolesError) {
      throw userRolesError;
    }

    // Create maps for profiles and roles
    const profilesMap = {};
    if (profiles) {
      profiles.forEach((profile) => {
        profilesMap[profile.id] = profile;
      });
    }

    const rolesMap = {};
    if (userRoles) {
      userRoles.forEach((roleEntry) => {
        rolesMap[roleEntry.user_id] = roleEntry.role;
      });
    }

    // Combine user and profile data
    const users = authUsers.users.map((user) => {
      const profile = profilesMap[user.id] || {};
      
      // Check if user is an admin either via user_roles or being Jenny
      const isAdmin = rolesMap[user.id] === 'admin' || 
                      user.email === 'jenny@appetitecreative.com';
      
      if (isAdmin && profile) {
        profile.role = 'admin';
      }
      
      return {
        ...user,
        profile,
      };
    });

    return new Response(JSON.stringify({ users }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
