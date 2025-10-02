import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { Post } from '../types';

// Spotifyの検索結果の型を定義
interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

interface Props {
  session: Session;
  onPostCreated: (newPost: Post) => void;
}

export const PostForm = ({ session, onPostCreated }: Props) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // 曲検索用の新しいStateを追加
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [selectedSong, setSelectedSong] = useState<SpotifyTrack | null>(null);

  // 曲を検索する関数
  const handleSongSearch = async () => {
    if (!songSearchQuery.trim()) return;
    try {
      const { data, error } = await supabase.functions.invoke('spotify-search', {
        body: { query: songSearchQuery },
      });
      if (error) throw error;
      setSearchResults(data.tracks.items);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  };

  // 検索結果から曲を選択する関数
  const selectSong = (track: SpotifyTrack) => {
    setSelectedSong(track);
    setSearchResults([]); // 選択したら検索結果はクリア
    setSongSearchQuery(''); // 検索窓もクリア
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim() && !selectedSong) {
      alert('投稿内容を入力するか、曲を選択してください。');
      return;
    }

    try {
      setLoading(true);
      const newPost = {
        user_id: session.user.id,
        content,
        // 選択された曲の情報を追加
        song_id: selectedSong?.id,
        song_name: selectedSong?.name,
        artist_name: selectedSong?.artists.map((a) => a.name).join(', '),
        album_art_url: selectedSong?.album.images[0]?.url,
      };

      const { data, error } = await supabase
        .from('posts')
        .insert(newPost)
        .select('*, profiles(username)') // 投稿後すぐにユーザー名も取得
        .single();

      if (error) throw error;

      if (data) {
        onPostCreated(data);
        setContent('');
        setSelectedSong(null);
      }
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
      <textarea
        placeholder="いまどうしてる？"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      
      {/* --- 曲検索UI --- */}
      <div>
        <input
          type="text"
          placeholder="曲を検索して添付..."
          value={songSearchQuery}
          onChange={(e) => setSongSearchQuery(e.target.value)}
        />
        <button type="button" onClick={handleSongSearch}>検索</button>
      </div>

      {/* --- 検索結果表示 --- */}
      {searchResults.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {searchResults.map((track) => (
            <li key={track.id} onClick={() => selectSong(track)} style={{ cursor: 'pointer', padding: '5px' }}>
              {track.name} - {track.artists.map((a) => a.name).join(', ')}
            </li>
          ))}
        </ul>
      )}

      {/* --- 選択した曲の表示 --- */}
      {selectedSong && (
        <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0', backgroundColor: '#f0f0f0', padding: '10px' }}>
          <img src={selectedSong.album.images[0]?.url} alt={selectedSong.name} width="50" height="50" style={{ marginRight: '10px' }} />
          <div>
            <strong>{selectedSong.name}</strong>
            <p style={{ margin: 0 }}>{selectedSong.artists.map((a) => a.name).join(', ')}</p>
          </div>
          <button type="button" onClick={() => setSelectedSong(null)} style={{ marginLeft: 'auto' }}>✖</button>
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? '投稿中...' : '投稿する'}
      </button>
    </form>
  );
};