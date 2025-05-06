
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
    
    // Get request data
    const { userId, updateData, requestingUserId } = await req.json();
    
    if (!userId || !updateData) {
      throw new Error("Missing required fields: userId and updateData");
    }
    
    // Verify the requesting user is an admin or the user being updated
    const isAuthorized = await verifyPermission(supabaseClient, requestingUserId, userId);
    
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ 
          error: "Unauthorized: You don't have permission to update this user" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403 
        }
      );
    }
    
    // Handle profile updates
    if (updateData.profile) {
      const { error: profileUpdateError } = await supabaseClient
        .from("profiles")
        .update(updateData.profile)
        .eq("id", userId);
      
      if (profileUpdateError) throw profileUpdateError;
    }
    
    // Handle role updates if present and user is admin
    if (updateData.role === 'admin' && await isAdmin(supabaseClient, requestingUserId)) {
      const { error: roleError } = await supabaseClient.rpc('set_admin_role', {
        email_address: updateData.email
      });
      
      if (roleError) throw roleError;
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "User updated successfully" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});

// Helper function to verify if requestingUser is admin or the same as targetUserId
async function verifyPermission(supabase, requestingUserId, targetUserId) {
  // If requesting user is the same as target user, allow the operation
  if (requestingUserId === targetUserId) {
    return true;
  }
  
  // Check if requesting user is an admin
  return await isAdmin(supabase, requestingUserId);
}

// Helper function to check if a user is admin
async function isAdmin(supabase, userId) {
  if (!userId) return false;
  
  // Check in user_roles table
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();
  
  if (roleError && roleError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error("Error checking user role:", roleError);
  }
  
  if (roleData?.role === 'admin') {
    return true;
  }
  
  // Check if user is Jenny specifically
  const { data: userData, error: userError } = await supabase
    .auth.admin.getUserById(userId);
  
  if (userError) {
    console.error("Error fetching user data:", userError);
    return false;
  }
  
  return userData?.user?.email === 'jenny@appetitecreative.com';
}
