import type { Post } from '../types';

interface Props {
  posts: Post[];
}

export const Timeline = ({ posts }: Props) => {
  return (
    <div>
      <h2>タイムライン</h2>
      {posts.map((post) => (
        <div key={post.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <p>
            <strong>{post.profiles?.username || '匿名ユーザー'}</strong>
          </p>
          <p>{post.content}</p>
          <small>Posted at: {new Date(post.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};