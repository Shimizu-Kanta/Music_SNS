import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Spotify APIからアクセストークンを取得する関数
async function getAccessToken() {
  // ▼▼▼ ここのURLを修正 ▼▼▼
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET),
    },
    body: "grant_type=client_credentials",
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error("Spotify Token Error:", data);
    throw new Error("Failed to get access token from Spotify.");
  }
  
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    const searchQuery = query;

    if (!searchQuery) {
      return new Response("Search query is missing", { status: 400 });
    }

    const accessToken = await getAccessToken();

    // ▼▼▼ ここのURLを修正 ▼▼▼
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track,artist&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const searchData = await searchResponse.json();

    return new Response(JSON.stringify(searchData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Edge Function crashed:", error);
    return new Response(JSON.stringify({ message: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});