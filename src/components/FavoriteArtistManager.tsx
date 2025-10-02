import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

// Spotifyのアーティスト検索結果の型
interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string }[];
}

// データベースに保存されているアーティストの型
interface FavoriteArtist {
  id: number;
  artist_id: string;
  artist_name: string;
  artist_image_url: string | null;
}

interface Props {
  session: Session;
}

export const FavoriteArtistManager = ({ session }: Props) => {
  const [artists, setArtists] = useState<FavoriteArtist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyArtist[]>([]);

  useEffect(() => {
    fetchFavoriteArtists();
  }, []);

  const fetchFavoriteArtists = async () => {
    const { data, error } = await supabase
      .from('favorite_artists')
      .select('*')
      .eq('user_id', session.user.id);
    if (error) {
      console.error('Error fetching favorite artists:', error);
    } else if (data) {
      setArtists(data);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const { data, error } = await supabase.functions.invoke('spotify-search', {
      body: { query: searchQuery, type: 'artist' }, // type: 'artist' を指定
    });
    if (error) console.error(error);
    if (data) setSearchResults(data.artists.items);
  };

  const addArtist = async (artist: SpotifyArtist) => {
    const newArtist = {
      user_id: session.user.id,
      artist_id: artist.id,
      artist_name: artist.name,
      artist_image_url: artist.images[0]?.url,
    };
    const { data, error } = await supabase
      .from('favorite_artists')
      .insert(newArtist)
      .select()
      .single();
    if (error) {
      alert(error.message);
    } else if (data) {
      setArtists([...artists, data]);
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const deleteArtist = async (id: number) => {
    await supabase.from('favorite_artists').delete().eq('id', id);
    setArtists(artists.filter(artist => artist.id !== id));
  };

  return (
    <div>
      <h3>お気に入りアーティスト</h3>
      <div>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="アーティストを検索..." />
        <button onClick={handleSearch}>検索</button>
      </div>

      {searchResults.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {searchResults.map(artist => (
            <li key={artist.id} onClick={() => addArtist(artist)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {artist.images[0] && <img src={artist.images[0].url} alt={artist.name} width="50" style={{ marginRight: '10px' }} />}
              {artist.name}
            </li>
          ))}
        </ul>
      )}

      <div>
        {artists.map(artist => (
          <div key={artist.id} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
            {artist.artist_image_url && <img src={artist.artist_image_url} alt={artist.artist_name} width="50" style={{ marginRight: '10px' }} />}
            <span>{artist.artist_name}</span>
            <button onClick={() => deleteArtist(artist.id)} style={{ marginLeft: 'auto' }}>削除</button>
          </div>
        ))}
      </div>
    </div>
  );
};