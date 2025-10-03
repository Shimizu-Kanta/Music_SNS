import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Spotify APIの認証情報を取得する関数
const getSpotifyToken = async () => {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Spotify API credentials are not set in environment variables.');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to fetch Spotify token.');
  }
  return data.access_token;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, type } = await req.json(); // typeを受け取るように変更

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required.' }), { status: 400 });
    }

    const token = await getSpotifyToken();
    
    // typeパラメータを使って検索タイプを動的に変更
    // typeが指定されていなければ、デフォルトで'track'を検索
    const searchType = type || 'track'; 
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${searchType}&limit=10`;

    const spotifyResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!spotifyResponse.ok) {
      const errorData = await spotifyResponse.json();
      throw new Error(errorData.error.message || 'Failed to search on Spotify.');
    }

    const searchData = await spotifyResponse.json();

    return new Response(
      JSON.stringify(searchData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});