import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface Props {
  session: Session;
}

export const ProfileEdit = ({ session }: Props) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [birthday, setBirthday] = useState<string | null>(null);
  const [bio, setBio] = useState('');

  useEffect(() => {
    let ignore = false;
    const getProfile = async () => {
      setLoading(true);
      const { user } = session;

      const { data, error } = await supabase
        .from('profiles')
        .select(`username, birthday, bio`) 
        .eq('id', user.id)
        .single();

      if (!ignore) {
        if (error) {
          console.warn(error);
        } else if (data) {
          setUsername(data.username || '');
          setBirthday(data.birthday); 
          setBio(data.bio || '');
        }
      }
      setLoading(false);
    };

    getProfile();
    return () => {
      ignore = true;
    };
  }, [session]);

  const updateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    const { user } = session;

    const { error } = await supabase
      .from('profiles')
      .update({ username, birthday, bio, updated_at: new Date() })
      .eq('id', user.id); // 更新する行をIDで直接指定

    if (error) {
      alert(error.message);
    } else {
      alert('プロフィールを更新しました！');
    }
    setLoading(false);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
      <h3>プロフィール編集</h3>
      <form onSubmit={updateProfile}>
        <div>
          <label htmlFor="username">ユーザー名</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="birthday">生年月日</label>
          <input
            id="birthday"
            type="date"
            value={birthday || ''}
            onChange={(e) => setBirthday(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="bio">自己紹介</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="自己紹介文を入力..."
          />
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? '更新中 ...' : '更新'}
          </button>
        </div>
      </form>
    </div>
  );
};