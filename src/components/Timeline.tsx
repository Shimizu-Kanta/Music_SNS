import type { Post } from '../types';
import { Link } from 'react-router-dom'; // ユーザー名をクリックしてプロフィールに飛べるように

interface Props {
  posts: Post[];
}

export const Timeline = ({ posts }: Props) => {
  return (
    <div>
      <h2>タイムライン</h2>
      {posts.map((post) => (
        <div key={post.id} style={{ border: '1px solid #ccc', padding: '15px', margin: '15px 0', borderRadius: '8px' }}>
          
          {/* --- 投稿者情報 --- */}
          <Link to={`/profile/${post.user_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <strong>{post.profiles?.username || '匿名ユーザー'}</strong>
          </Link>

          {/* --- 投稿本文 --- */}
          {post.content && <p style={{ marginTop: '10px' }}>{post.content}</p>}

          {/* --- タグ付けされた曲情報（存在する場合のみ表示） --- */}
          {post.album_art_url && (
            <div style={{ marginTop: '15px', border: '1px solid #eee', padding: '10px', display: 'flex', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
              <img src={post.album_art_url} alt={post.song_name || ''} width="64" height="64" style={{ marginRight: '15px' }} />
              <div>
                <div><strong>{post.song_name}</strong></div>
                <div>{post.artist_name}</div>
              </div>
            </div>
          )}

          {/* --- 投稿日時 --- */}
          <small style={{ display: 'block', marginTop: '10px', color: '#888' }}>
            Posted at: {new Date(post.created_at).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
};