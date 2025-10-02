// 以前のAccount.tsxの中身をここに移動
// ただし、ファイル名がHomePageになるのでコンポーネント名も変更する

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { PostForm } from '../components/PostForm';
import { Timeline } from '../components/Timeline';
import { FavoriteMusicManager } from '../components/FavoriteMusicManager';
import type { Post } from '../types';

interface Props {
  session: Session;
}

export const HomePage = ({ session }: Props) => {
  // State管理
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [birthday, setBirthday] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  // プロフィールを取得する関数 (変更なし)
  const getProfile = useCallback(async () => {
    try {
      const { user } = session;
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, birthday`)
        .eq('id', user.id)
        .single();
      if (error && status !== 406) throw error;
      if (data) {
        setUsername(data.username);
        setBirthday(data.birthday);
      }
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  }, [session]);

  // 投稿を取得する関数をJOINを使う形に修正
  const fetchPosts = async () => {
    try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, profiles ( username ), likes(*), comments(*, profiles ( username ))') // JOINの記述
          .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPosts(data as Post[]);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  };

  // 最初にプロフィールと投稿を読み込む (変更なし)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getProfile();
      await fetchPosts();
      setLoading(false);
    }
    fetchData();
  }, [getProfile]);

  // プロフィールを更新する関数 (変更なし)
  const updateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      const { user } = session;
      const updates = {
        username,
        birthday,
        updated_at: new Date(),
      };
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
      alert('プロフィールを更新しました！');
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 新しい投稿をリアルタイムでタイムラインに追加する関数 (型を修正)
  const handlePostCreated = (newPost: Post) => {
    // 新しい投稿にはprofiles情報がないので、手動で追加する
    const postWithProfile = {
        ...newPost,
        profiles: {
            username: username || 'あなた'
        }
    };
    setPosts([postWithProfile, ...posts]);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #eee' }}>
        <Link to="/add-event">
          <button>新しいライブ参加履歴を登録する</button>
        </Link>
      </div>
      <h2>プロフィール編集</h2>
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
            {loading ? '処理中...' : 'プロフィールを更新'}
          </button>
        </div>
      </form>
      
      <button type="button" onClick={() => supabase.auth.signOut()} style={{ marginTop: '10px' }}>
        ログアウト
      </button>

      <hr style={{ margin: '30px 0' }} />

      <FavoriteMusicManager session={session} />

      <hr style={{ margin: '30px 0' }} />

      <PostForm session={session} onPostCreated={handlePostCreated} />
      <Timeline posts={posts} session={session} />
      
      {loading ? <p>タイムラインを読み込み中...</p> : <Timeline posts={posts} />}
    </div>
  );
};