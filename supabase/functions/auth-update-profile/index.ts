import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const userId = body.userId;
    const currentPassword = body.currentPassword || "";
    const newEmail = body.newEmail ? body.newEmail.toLowerCase().trim() : null;
    const newLogin = body.newLogin ? body.newLogin.toLowerCase().trim() : null;
    const newPassword = body.newPassword || null;

    if (!userId || !currentPassword) {
      return new Response(
        JSON.stringify({ error: "User ID and current password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const currentHash = await hashPassword(currentPassword);

    const { data: user, error: userError } = await supabase
      .from("site_users")
      .select("id, login, email, password_hash")
      .eq("id", userId)
      .maybeSingle();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (user.password_hash !== currentHash) {
      return new Response(
        JSON.stringify({ error: "Current password is incorrect" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const updates: Record<string, string> = {};

    if (newEmail) {
      if (!newEmail.includes("@")) {
        return new Response(
          JSON.stringify({ error: "Invalid email format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { data: existing } = await supabase
        .from("site_users")
        .select("id")
        .eq("email", newEmail)
        .neq("id", userId)
        .maybeSingle();
      if (existing) {
        return new Response(
          JSON.stringify({ error: "This email is already in use" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      updates.email = newEmail;
    }

    if (newLogin) {
      if (newLogin.length < 3) {
        return new Response(
          JSON.stringify({ error: "Login must be at least 3 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { data: existing } = await supabase
        .from("site_users")
        .select("id")
        .eq("login", newLogin)
        .neq("id", userId)
        .maybeSingle();
      if (existing) {
        return new Response(
          JSON.stringify({ error: "This login is already taken" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      updates.login = newLogin;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 6 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      updates.password_hash = await hashPassword(newPassword);
    }

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: "No changes to apply" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("site_users")
      .update(updates)
      .eq("id", userId)
      .select("id, login, name, is_admin, email, balance, created_at")
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ user: updated }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
