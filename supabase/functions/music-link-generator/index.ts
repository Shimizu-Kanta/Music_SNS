import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-control-allow-origin': '*',
  'Access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { song_name, artist_name } = await req.json();

    if (!song_name || !artist_name) {
      throw new Error('Song name and artist name are required.');
    }

    const searchQuery = encodeURIComponent(`${song_name} ${artist_name}`);

    const links = {
      spotify: `https://open.spotify.com/search/${searchQuery}`,
      youtubeMusic: `https://music.youtube.com/search?q=${searchQuery}`,
      appleMusic: `https://music.apple.com/search?term=${searchQuery}`,
    };

    return new Response(
      JSON.stringify(links),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})