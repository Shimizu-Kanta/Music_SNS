import { useState, useEffect } from 'react';
import type { Post } from '../types';
import { fetchPosts, createPost } from '../api/posts';
import { PostForm } from '../components/PostForm';
import { PostItem } from '../components/PostItem';

export const Timeline = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // 初期表示時に投稿データを取得
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts();
        setPosts(data);
      } catch (error) {
        console.error('投稿の取得に失敗しました', error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  // 新しい投稿を追加する処理
  const handlePostSubmit = async (content: string) => {
    try {
      const newPost = await createPost(content);
      // 投稿リストの先頭に新しい投稿を追加
      setPosts([newPost, ...posts]);
    } catch (error) {
      console.error('投稿に失敗しました', error);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>ミニマムSNS</h1>
      <PostForm onSubmit={handlePostSubmit} />

      <h2 style={{ marginTop: '40px' }}>タイムライン</h2>
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <div>
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};