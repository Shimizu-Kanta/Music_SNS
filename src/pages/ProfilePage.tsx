import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '../types';

// 型定義
interface FavoriteSong {
  id: number;
  song_name: string;
  artist_name: string;
  album_art_url: string | null;
}
interface FavoriteArtist {
  id: number;
  artist_name: string;
  artist_image_url: string | null;
}
interface AttendedConcert {
  id: number;
  notes: string | null;
  concerts: {
    event_date: string;
    artist_name: string;
    event_name: string | null;
    venue_name: string;
  } | null;
}

interface Props {
  session: Session;
}

export const ProfilePage = ({ session }: Props) => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoriteSongs, setFavoriteSongs] = useState<FavoriteSong[]>([]);
  const [favoriteArtists, setFavoriteArtists] = useState<FavoriteArtist[]>([]);
  const [attendedConcerts, setAttendedConcerts] = useState<AttendedConcert[]>([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      setLoading(true);

      // 並行して全データを取得
      const [
        profileRes,
        songsRes,
        artistsRes,
        concertsRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('favorite_songs').select('id, song_name, artist_name, album_art_url').eq('user_id', userId).order('sort_order'),
        supabase.from('favorite_artists').select('id, artist_name, artist_image_url').eq('user_id', userId),
        supabase.from('user_attended_concerts').select(`id, notes, concerts (event_date, artist_name, event_name, venue_name)`).eq('user_id', userId).order('event_date', { foreignTable: 'concerts', ascending: false })
      ]);

      if (profileRes.error || songsRes.error || artistsRes.error || concertsRes.error) {
        console.error('Error fetching profile data:', { 
          profileError: profileRes.error, 
          songsError: songsRes.error, 
          artistsError: artistsRes.error, 
          concertsError: concertsRes.error 
        });
      } else {
        setProfile(profileRes.data);
        setFavoriteSongs(songsRes.data || []);
        setFavoriteArtists(artistsRes.data || []);
        setAttendedConcerts(concertsRes.data || []);
      }

      setLoading(false);
    };

    fetchProfileData();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found.</div>;

  const isOwnProfile = session.user.id === userId;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}> {/* ←これが唯一の親要素 */}
      {/* ▼▼▼ ヘッダー画像表示エリア ▼▼▼ */}
      <div style={{ height: '250px', backgroundColor: '#eee', marginBottom: '-50px' }}>
        {profile.header_url && (
          <img src={profile.header_url} alt="Header" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* ▼▼▼ プロフィールヘッダーエリア ▼▼▼ */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white' }} />
            ) : (
              <div style={{ width: '120px', height: '120px', backgroundColor: '#eee', borderRadius: '50%', border: '4px solid white' }} />
            )}
            <div>
              <h1 style={{ margin: 0 }}>{profile.username}</h1>
              {profile.birthday && <p style={{ margin: 0 }}>生年月日: {new Date(profile.birthday).toLocaleDateString()}</p>}
            </div>
          </div>
          {isOwnProfile && (
            <Link to="/profile/edit">
              <button>プロフィールを編集する</button>
            </Link>
          )}
        </div>

        {/* ▼▼▼ 自己紹介文表示エリア ▼▼▼ */}
        {profile.bio && (
          <p style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
            {profile.bio}
          </p>
        )}
      </div>

      <div style={{ padding: '20px' }}></div>

      {/* --- お気に入り楽曲 --- */}
      <hr style={{ margin: '30px 0' }} />
      <div>
        <h2>お気に入り楽曲</h2>
        {favoriteSongs.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {favoriteSongs.map(song => (
              <div key={song.id} style={{ textAlign: 'center', width: '100px' }}>
                <img src={song.album_art_url || 'http://googleusercontent.com/404'} alt={song.song_name} width="100" height="100" />
                <p style={{ margin: 0, fontSize: '0.8em', wordBreak: 'break-all' }}>{song.song_name}</p>
              </div>
            ))}
          </div>
        ) : <p>お気に入りの楽曲はありません。</p>}
      </div>

      {/* --- お気に入りアーティスト --- */}
      <hr style={{ margin: '30px 0' }} />
      <div>
        <h2>お気に入りアーティスト</h2>
        {favoriteArtists.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {favoriteArtists.map(artist => (
              <div key={artist.id} style={{ textAlign: 'center', width: '100px' }}>
                <img src={artist.artist_image_url || 'http://googleusercontent.com/404'} alt={artist.artist_name} width="100" height="100" style={{ borderRadius: '50%' }} />
                <p style={{ margin: 0 }}>{artist.artist_name}</p>
              </div>
            ))}
          </div>
        ) : <p>お気に入りのアーティストはありません。</p>}
      </div>
      
      {/* --- 参加したライブ --- */}
      <hr style={{ margin: '30px 0' }} />
      <div>
        <h2>参加したライブ</h2>
        {attendedConcerts.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {attendedConcerts.map(item => (
              item.concerts && (
                <li key={item.id} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>{new Date(item.concerts.event_date).toLocaleDateString()}</strong>: {item.concerts.artist_name}
                  {item.concerts.event_name && ` (${item.concerts.event_name})`}
                  <br />
                  <small>会場: {item.concerts.venue_name}</small>
                  {item.notes && <p style={{ margin: '5px 0 0 10px', whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '5px' }}>メモ: {item.notes}</p>}
                </li>
              )
            ))}
          </ul>
        ) : (
          <p>まだ参加したライブが登録されていません。</p>
        )}
      </div>

    </div> // ← 正しい閉じタグの位置はここ
  );
};