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
    const currentLogin = (body.current_login || "").toLowerCase().trim();
    const currentPassword = body.current_password || "";
    const newLogin = body.new_login ? body.new_login.toLowerCase().trim() : undefined;
    const newPassword = body.new_password || undefined;

    if (!currentLogin || !currentPassword) {
      return new Response(
        JSON.stringify({ error: "Current login and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!newLogin && !newPassword) {
      return new Response(
        JSON.stringify({ error: "Provide a new login or new password" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const currentHash = await hashPassword(currentPassword);

    const { data: admin, error: findError } = await supabase
      .from("site_users")
      .select("id, login, password_hash")
      .eq("login", currentLogin)
      .maybeSingle();

    if (findError || !admin) {
      return new Response(
        JSON.stringify({ error: "Invalid current credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (admin.password_hash !== currentHash) {
      return new Response(
        JSON.stringify({ error: "Invalid current credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const updates: Record<string, string> = {};
    if (newLogin) updates.login = newLogin;
    if (newPassword) updates.password_hash = await hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from("site_users")
      .update(updates)
      .eq("id", admin.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Credentials updated successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
