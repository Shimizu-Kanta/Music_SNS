import type { Post } from '../types';

interface Props {
  post: Post;
}

export const PostItem = ({ post }: Props) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', margin: '8px 0', borderRadius: '8px' }}>
      <p><strong>{post.author}</strong></p>
      <p>{post.content}</p>
      <small>{new Date(post.createdAt).toLocaleString()}</small>
    </div>
  );
};