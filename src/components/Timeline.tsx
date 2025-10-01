import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// PostFormで定義した型を再利用
interface Post {
  id: number;
  created_at: string;
  content: string;
  user_id: string;
}

export const Timeline = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select('*') // すべての列を選択
          .order('created_at', { ascending: false }); // 作成日時が新しい順に並べる

        if (error) throw error;
        if (data) setPosts(data);
      } catch (error) {
        if (error instanceof Error) alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p>読み込み中...</p>;

  return (
    <div>
      {/* ここにPostFormを配置する想定だが、まずはタイムライン表示から */}
      <h2>タイムライン</h2>
      {posts.map((post) => (
        <div key={post.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <p>{post.content}</p>
          <small>Posted at: {new Date(post.created_at).toLocaleString()}</small>
          {/* ユーザー名も表示したい場合は、profilesテーブルと結合する必要がある（次のステップ） */}
        </div>
      ))}
    </div>
  );
};