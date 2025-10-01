import type { Post } from '../types';

// データベースの代わりのダミーデータ
let posts: Post[] = [
  {
    id: 1,
    author: 'Taro',
    content: 'Reactの学習を始めました！',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    author: 'Jiro',
    content: 'Viteは本当に速いですね。',
    createdAt: new Date().toISOString(),
  },
];

// すべての投稿を取得する非同期関数（APIを模倣）
export const fetchPosts = async (): Promise<Post[]> => {
  // ネットワーク遅延をシミュレート
  await new Promise((resolve) => setTimeout(resolve, 500));
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// 新しい投稿を追加する非同期関数（APIを模倣）
export const createPost = async (content: string): Promise<Post> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newPost: Post = {
    id: posts.length + 1,
    author: 'You', // 簡単のため投稿者は固定
    content,
    createdAt: new Date().toISOString(),
  };

  posts = [newPost, ...posts];
  return newPost;
};