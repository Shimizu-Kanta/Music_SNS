import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

// ... (interface定義は変更なし) ...
interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
}
interface SpotifyArtist {
  id: string;
  name: string;
}
interface FavoriteSong {
  id: number;
  song_name: string;
  artist_name: string;
}

interface Props {
  session: Session;
}

export const FavoriteMusicManager = ({ session }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ tracks: { items: SpotifyTrack[] }; artists: { items: SpotifyArtist[] } } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [favoriteSongs, setFavoriteSongs] = useState<FavoriteSong[]>([]);

  // useEffect (お気に入りリスト取得) は変更なし
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from('favorite_songs')
          .select('id, song_name, artist_name')
          .eq('user_id', session.user.id)
          .order('sort_order');
        if (error) throw error;
        if (data) setFavoriteSongs(data);
      } catch (error) {
        if (error instanceof Error) {
          alert('お気に入りリストの取得に失敗しました: ' + error.message);
        }
      }
    };
    fetchFavorites();
  }, [session.user.id]);

  // Spotifyの曲を検索する関数
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      // ↓↓↓ ここを修正します ↓↓↓
      const { data, error } = await supabase.functions.invoke('spotify-search', {
        // headersは不要になり、bodyはオブジェクトを直接渡します
        body: { query: searchQuery },
      });
      // ↑↑↑ ここまで修正 ↑↑↑
      if (error) throw error;
      setSearchResults(data);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  // ... (addFavoriteSong, removeFavoriteSong, return文は変更なし) ...
  const addFavoriteSong = async (track: SpotifyTrack) => {
    if (favoriteSongs.some(song => song.song_name === track.name)) {
      alert('既に追加されています。');
      return;
    }
    
    try {
      const newSong = {
        user_id: session.user.id,
        song_id: track.id,
        song_name: track.name,
        artist_name: track.artists.map(a => a.name).join(', '),
        sort_order: favoriteSongs.length + 1,
      };
      const { data, error } = await supabase.from('favorite_songs').insert(newSong).select().single();
      if (error) throw error;
      if (data) setFavoriteSongs([...favoriteSongs, data]);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  };

  const removeFavoriteSong = async (songId: number) => {
    try {
      const { error } = await supabase.from('favorite_songs').delete().eq('id', songId);
      if (error) throw error;
      setFavoriteSongs(favoriteSongs.filter(song => song.id !== songId));
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  };


  return (
    <div>
      <h3>お気に入りミュージック管理</h3>
      <div>
        <h4>現在のリスト</h4>
        {favoriteSongs.length > 0 ? (
          <ol>
            {favoriteSongs.map(song => (
              <li key={song.id}>
                {song.song_name} - {song.artist_name}{' '}
                <button onClick={() => removeFavoriteSong(song.id)}>削除</button>
              </li>
            ))}
          </ol>
        ) : (
          <p>まだ登録されていません。</p>
        )}
      </div>
      <hr />
      <div>
        <h4>曲・アーティストを検索</h4>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="曲名やアーティスト名で検索"
        />
        <button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? '検索中...' : '検索'}
        </button>
      </div>
      {searchResults && (
        <div>
          <h4>検索結果</h4>
          <h5>曲</h5>
          <ul>
            {searchResults.tracks.items.map(track => (
              <li key={track.id}>
                {track.name} by {track.artists.map(a => a.name).join(', ')}{' '}
                <button onClick={() => addFavoriteSong(track)}>追加</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};