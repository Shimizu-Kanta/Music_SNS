// このファイルがアプリ全体の「型」のマスターになります
export interface Post {
  id: number;
  created_at: string;
  content: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url?: string | null;
  } | null;
  song_id?: string | null;
  song_name?: string | null;
  artist_name?: string | null;
  album_art_url?: string | null;
  likes: {
    user_id: string;
  }[];
  comments: Comment[];
}

export interface Comment {
  id: number;
  created_at: string;
  content: string;
  user_id: string;
  post_id: number;
  profiles: {
    username: string;
  } | null;
}

export interface Profile {
  id: string;
  updated_at: string | null;
  username: string;
  birthday: Date | null;
  created_at: string | null;
  avatar_url: string | null;
  header_url: string | null;
  bio: string | null;
  website: string | null;
}

// 「いいね」の型定義
export interface Like {
  user_id: string;
  post_id: number;
  created_at: string;
}

export type FilterType = 'ALL' | 'FOLLOWS' | 'FAVORITES' | 'ARTIST';