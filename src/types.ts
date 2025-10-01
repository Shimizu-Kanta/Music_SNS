// このファイルがアプリ全体の「型」のマスターになります
export interface Post {
  id: number;
  created_at: string;
  content: string;
  user_id: string;
  profiles: {
    username: string;
  } | null;
}