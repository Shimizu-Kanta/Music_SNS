import { useState, useEffect } from 'react';
import type { Post, Comment } from '../types'; // Commentをインポート
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

// コメント投稿フォームを小さなコンポーネントとして作成
const CommentForm = ({ postId, userId, onCommentPosted }: { postId: number, userId: string, onCommentPosted: (newComment: Comment) => void }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: userId, content: comment })
        .select('*, profiles(username)')
        .single();
      
      if (error) throw error;
      if (data) {
        onCommentPosted(data);
        setComment('');
      }
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCommentSubmit} style={{ display: 'flex', marginTop: '10px' }}>
      <input
        type="text"
        placeholder="コメントを追加..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{ flexGrow: 1, marginRight: '8px' }}
      />
      <button type="submit" disabled={loading}>{loading ? '...' : '投稿'}</button>
    </form>
  );
};


interface Props {
  posts: Post[];
  session: Session | null;
}

export const Timeline = ({ posts: initialPosts, session }: Props) => {

  const [posts, setPosts] = useState(initialPosts);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  if (!session) {
    // まだセッション情報が読み込まれていない場合は、ローディング表示などを出すか、何も表示しない
    return <div>Loading...</div>; 
  }

  const handleLike = async (postId: number) => {
    const userId = session.user.id;
    const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: userId });
    
    if (error) {
      alert(error.message);
    } else {
      const updatedPosts = posts.map(p => 
        p.id === postId ? { ...p, likes: [...p.likes, { user_id: userId }] } : p
      );
      setPosts(updatedPosts);
    }
  };

  const handleUnlike = async (postId: number) => {
    const userId = session.user.id;
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    
    if (error) {
      alert(error.message);
    } else {
      const updatedPosts = posts.map(p => 
        p.id === postId ? { ...p, likes: p.likes.filter(l => l.user_id !== userId) } : p
      );
      setPosts(updatedPosts);
    }
  };

  // 新しいコメントが投稿されたときに呼ばれる関数
  const handleCommentAdded = (postId: number, newComment: Comment) => {
    const updatedPosts = posts.map(p => 
      p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p
    );
    setPosts(updatedPosts);
  };

  return (
    <div>
      <h2>タイムライン</h2>
      {posts.map((post) => {
        // post.likesがない場合も考慮して、より安全なコードに
        const isLikedByCurrentUser = post.likes?.some(like => like.user_id === session.user.id);
        const likeCount = post.likes?.length || 0;

        return (
          <div key={post.id} style={{ border: '1px solid #ccc', padding: '15px', margin: '15px 0', borderRadius: '8px' }}>
            
            <Link to={`/profile/${post.user_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <strong>{post.profiles?.username || '匿名ユーザー'}</strong>
            </Link>
            
            {post.content && <p style={{ marginTop: '10px' }}>{post.content}</p>}
            
            {post.album_art_url && (
              <div style={{ marginTop: '15px', border: '1px solid #eee', padding: '10px', display: 'flex', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
                <img src={post.album_art_url} alt={post.song_name || ''} width="64" height="64" style={{ marginRight: '15px' }} />
                <div>
                  <div><strong>{post.song_name}</strong></div>
                  <div>{post.artist_name}</div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
              <button onClick={() => isLikedByCurrentUser ? handleUnlike(post.id) : handleLike(post.id)}>
                {isLikedByCurrentUser ? '❤️ いいね済み' : '♡ いいね'}
              </button>
              <span style={{ marginLeft: '8px' }}>{likeCount}</span>
            </div>
            
            <small style={{ display: 'block', marginTop: '10px', color: '#888' }}>
              Posted at: {new Date(post.created_at).toLocaleString()}
            </small>

            <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              {post.comments?.map(comment => (
                <div key={comment.id} style={{ marginBottom: '8px' }}>
                  <Link to={`/profile/${comment.user_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <strong>{comment.profiles?.username || '匿名'}</strong>
                  </Link>
                  <p style={{ margin: '0 0 0 10px', display: 'inline' }}>{comment.content}</p>
                </div>
              ))}
              <CommentForm 
                postId={post.id} 
                userId={session.user.id} 
                onCommentPosted={(newComment) => handleCommentAdded(post.id, newComment)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};