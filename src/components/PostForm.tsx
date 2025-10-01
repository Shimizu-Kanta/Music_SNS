import { useState } from 'react';

interface Props {
  onSubmit: (content: string) => void;
}

export const PostForm = ({ onSubmit }: Props) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return; // 空の投稿は禁止
    onSubmit(content);
    setContent(''); // フォームをクリア
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="いまどうしてる？"
        style={{ width: '100%', minHeight: '80px', padding: '8px' }}
      />
      <button type="submit" style={{ marginTop: '8px' }}>投稿する</button>
    </form>
  );
};