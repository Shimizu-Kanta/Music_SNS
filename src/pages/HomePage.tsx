import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { PostForm } from '../components/PostForm';
import { Timeline } from '../components/Timeline';
import type { Post } from '../types';

interface Props {
  session: Session;
}

export const HomePage = ({ session }: Props) => {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url), likes(*), comments(*, profiles(username, avatar_url)))')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else if (data) {
      setPosts(data);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      
      <PostForm session={session} onPostCreated={handlePostCreated} />
      <Timeline posts={posts} session={session} />
    </div>
  );
};