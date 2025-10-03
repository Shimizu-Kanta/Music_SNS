import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { PostForm } from '../components/PostForm';
import { Timeline } from '../components/Timeline';
import { TimelineFilter } from '../components/TimelineFilter';
import type { Post, FilterType, Comment, Like } from '../types'; // CommentとLikeをインポート

interface Props {
  session: Session;
}

// RPCから返ってくるデータの「型」をより具体的に定義
interface FilteredPost {
  id: number;
  created_at: string;
  content: string;
  user_id: string;
  song_id: string | null;
  song_name: string | null;
  artist_name: string | null;
  album_art_url: string | null;
  artist_id: string | null;
  username: string;
  avatar_url: string | null;
  // any[] の代わりに、具体的な型を指定
  likes: Like[] | null;
  comments: Comment[] | null;
}

export const HomePage = ({ session }: Props) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filter, setFilter] = useState<{ type: FilterType; artistId?: string }>({ type: 'ALL' });

  const fetchPosts = useCallback(async (currentFilter: typeof filter) => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_filtered_timeline', {
      p_user_id: session.user.id,
      p_filter_type: currentFilter.type,
      p_artist_id: currentFilter.artistId,
    });

    if (error) {
      console.error('Error fetching timeline:', error);
      setPosts([]);
    } else if (data) {
      // p の型を FilteredPost に指定
      const formattedData = data.map((p: FilteredPost) => ({
        ...p,
        profiles: { username: p.username, avatar_url: p.avatar_url },
        likes: p.likes || [], 
        comments: p.comments || [],
      }));
      setPosts(formattedData as Post[]);
    }
    setLoading(false);
  }, [session.user.id]);

  useEffect(() => {
    fetchPosts(filter);
  }, [filter, fetchPosts]);

  const handlePostCreated = (newPost: Post) => {
    if (filter.type === 'ALL' || filter.type === 'FOLLOWS') {
      setPosts([newPost, ...posts]);
    } else {
      setFilter({ type: 'ALL' });
    }
  };
  
  const handleFilterChange = (type: FilterType, artistId?: string) => {
    setFilter({ type, artistId });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <PostForm session={session} onPostCreated={handlePostCreated} />
      
      <TimelineFilter session={session} onFilterChange={handleFilterChange} />
      
      {loading ? (
        <p>タイムラインを読み込み中...</p>
      ) : (
        <Timeline posts={posts} session={session} />
      )}
    </div>
  );
};