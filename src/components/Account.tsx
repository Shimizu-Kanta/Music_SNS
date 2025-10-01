// 1. `useCallback`をreactからインポート
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { PostForm } from './PostForm'; // PostFormをインポート
import { Timeline } from './Timeline'; // Timelineをインポート

interface Props {
  session: Session;
}

export const Account = ({ session }: Props) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [birthday, setBirthday] = useState<string | null>(null);

  // 2. getProfile関数を`useCallback`で囲む
  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { user } = session;

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, birthday`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setBirthday(data.birthday);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
    // 3. getProfile関数が依存している値をuseCallbackの依存配列に入れる
  }, [session]);

  useEffect(() => {
    getProfile();
    // 4. useEffectの依存配列にgetProfileを追加する
  }, [getProfile]);


  // ... updateProfile関数やreturn文は変更なし ...
const updateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      const { user } = session;

      // 更新するデータから `id` を除外します
      const updates = {
        username,
        birthday,
        updated_at: new Date(),
      };

      // update()とeq()を使って、更新対象の行を明確に指定します
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id); // `id`がログインユーザーのIDと一致する行を更新

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setLoading(false);
      alert('プロフィールを更新しました！');
    }
  };

  return (
    <div>
      <form onSubmit={updateProfile}>
        <div>
          <label htmlFor="email">メールアドレス</label>
          <input id="email" type="text" value={session.user.email} disabled />
        </div>
        <div>
          <label htmlFor="username">ユーザー名</label>
          <input
            id="username"
            type="text"
            value={username || ''}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="birthday">誕生日</label>
          <input
            id="birthday"
            type="date"
            value={birthday || ''}
            onChange={(e) => setBirthday(e.target.value)}
          />
        </div>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? '更新中...' : 'プロフィールを更新'}
          </button>
        </div>
      </form>

      <button type="button" onClick={() => supabase.auth.signOut()}>
        ログアウト
      </button>

      {/* --- ここから下を追加 --- */}
      <hr style={{ margin: '30px 0' }} />

      {/* 投稿フォームを配置。session情報を渡す */}
      <PostForm session={session} onPostCreated={() => {}} />
      
      {/* タイムラインを配置 */}
      <Timeline />
    </div>
  );
};