const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsedUrl = new URL(imageUrl);
    const allowedHosts = new Set(["upload.wikimedia.org", "en.wikipedia.org"]);

    if (parsedUrl.protocol !== "https:" || !allowedHosts.has(parsedUrl.hostname)) {
      return new Response(JSON.stringify({ error: "Unsupported image host" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Lovable Auction Image Proxy",
      },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(JSON.stringify({ error: `Failed to fetch image (${upstream.status})` }), {
        status: upstream.status || 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set("Content-Type", upstream.headers.get("content-type") || "image/jpeg");
    responseHeaders.set("Cache-Control", "public, max-age=86400");

    return new Response(upstream.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
