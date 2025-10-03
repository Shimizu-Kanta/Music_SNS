import { supabase } from '../lib/supabaseClient';
import type { Post } from '../types';

// Supabaseからすべての投稿を取得する本物の関数
export const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url), likes(*), comments(*, profiles:user_id(username, avatar_url))')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    throw error; // エラーを呼び出し元に伝える
  }
  return data || [];
};

// Supabaseに新しい投稿を追加する本物の関数
export const createPost = async (content: string, user_id: string): Promise<Post> => {
  const { data, error } = await supabase
    .from('posts')
    .insert({ content, user_id })
    .select('*, profiles(username, avatar_url), likes(*), comments(*)') // 投稿後すぐに全データを取得
    .single();
    
  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }
  return data;
};