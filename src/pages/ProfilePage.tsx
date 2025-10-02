import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { ProfileEdit } from '../components/ProfileEdit';
import { FavoriteMusicManager } from '../components/FavoriteMusicManager';
import type { Profile } from '../types';

// AttendedConcertの型定義からcityを削除
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
  const [attendedConcerts, setAttendedConcerts] = useState<AttendedConcert[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);

      // プロフィール情報を取得
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // 参加したライブの情報を取得（select句からcityを削除）
      const { data: concertsData, error: concertsError } = await supabase
        .from('user_attended_concerts')
        .select(`
          id,
          notes,
          concerts (
            event_date,
            artist_name,
            event_name,
            venue_name
          )
        `)
        .eq('user_id', userId)
        .order('event_date', { foreignTable: 'concerts', ascending: false });

      if (concertsError) {
        console.error('Error fetching attended concerts:', concertsError);
      } else {
        setAttendedConcerts(concertsData);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found.</div>;

  const isOwnProfile = session.user.id === userId;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>{profile.username}'s Profile</h1>
      
      {isOwnProfile && <ProfileEdit session={session} />}

      <hr style={{ margin: '30px 0' }} />

      <FavoriteMusicManager session={session} />

      <hr style={{ margin: '30px 0' }} />
      <div>
        <h2>参加したライブ</h2>
        {attendedConcerts.length > 0 ? (
          <ul>
            {attendedConcerts.map(item => (
              item.concerts && (
                <li key={item.id} style={{ marginBottom: '15px' }}>
                  <strong>{new Date(item.concerts.event_date).toLocaleDateString()}</strong>: {item.concerts.artist_name}
                  {item.concerts.event_name && ` (${item.concerts.event_name})`}
                  <br />
                  {/* 表示部分からcityを削除 */}
                  <small>会場: {item.concerts.venue_name}</small>
                  {item.notes && <p style={{ margin: '5px 0 0 10px', whiteSpace: 'pre-wrap' }}>メモ: {item.notes}</p>}
                </li>
              )
            ))}
          </ul>
        ) : (
          <p>まだ参加したライブが登録されていません。</p>
        )}
      </div>
    </div>
  );
};