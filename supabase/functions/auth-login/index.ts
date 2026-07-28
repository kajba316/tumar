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
    const loginOrEmail = (body.login || body.email || "").toLowerCase().trim();
    const password = body.password || "";

    if (!loginOrEmail || !password) {
      return new Response(
        JSON.stringify({ error: "Login and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const passwordHash = await hashPassword(password);

    const isEmail = loginOrEmail.includes("@");
    const query = supabase
      .from("site_users")
      .select("id, login, name, is_admin, email, balance, created_at")
      .eq("password_hash", passwordHash);

    if (isEmail) {
      query.eq("email", loginOrEmail);
    } else {
      query.eq("login", loginOrEmail);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = btoa(`${data.id}:${Date.now()}`);

    // Log login history
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : null;
    const userAgent = req.headers.get("user-agent") || null;

    await supabase.from("login_history").insert({
      user_id: data.id,
      ip_address: ip,
      user_agent: userAgent,
    });

    return new Response(
      JSON.stringify({ user: data, token }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
