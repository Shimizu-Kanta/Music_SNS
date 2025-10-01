import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { Post } from '../types';

interface Props {
  session: Session;
  onPostCreated: (newPost: Post) => void;
}

export const PostForm = ({ session, onPostCreated }: Props) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      const { user } = session;
      const { data, error } = await supabase
        .from('posts')
        .insert({ content: content, user_id: user.id })
        .select() // INSERTしたデータを返してもらう
        .single(); // 1行だけ返ってくるのでsingle()

      if (error) throw error;

      alert('投稿しました！');
      setContent('');
      if (data) {
        onPostCreated(data as Post); // 親コンポーネントに新しい投稿を通知
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="いまどうしてる？"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        style={{ width: '100%' }}
      />
      <button type="submit" disabled={loading}>
        {loading ? '投稿中...' : '投稿'}
      </button>
    </form>
  );
};