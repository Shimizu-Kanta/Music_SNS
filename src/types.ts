// このファイルがアプリ全体の「型」のマスターになります
export interface Post {
  id: number;
  created_at: string;
  content: string;
  user_id: string;
  profiles: {
    username: string;
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
  website: string | null;
}