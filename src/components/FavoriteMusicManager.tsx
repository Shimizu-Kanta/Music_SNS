import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
}
interface FavoriteSong {
  id: number;
  user_id: string; // user_idを型に含めておく
  song_id: string;
  song_name: string;
  artist_name: string;
  sort_order: number;
}

const SortableSongItem = ({ song, onRemove }: { song: FavoriteSong, onRemove: (id: number) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    userSelect: 'none' as const,
    padding: '8px',
    margin: '0 0 8px 0',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    display: 'flex',
    alignItems: 'center', // vertically center
    justifyContent: 'space-between',
  };

  return (
    // listenersをliから外す
    <li ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* ドラッグ用のハンドル（取っ手）を作成し、listenersとattributesをここに適用 */}
        <span 
          {...attributes} 
          {...listeners} 
          style={{ cursor: 'grab', marginRight: '10px', fontSize: '1.2em' }}
        >
          ⠿
        </span>
        <span>{song.song_name} - {song.artist_name}</span>
      </div>
      <button onClick={() => onRemove(song.id)}>削除</button>
    </li>
  );
};

interface Props {
  session: Session;
}

export const FavoriteMusicManager = ({ session }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ tracks: { items: SpotifyTrack[] }; artists: { items: SpotifyArtist[] } } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [favoriteSongs, setFavoriteSongs] = useState<FavoriteSong[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from('favorite_songs')
          .select('*') // user_idも取得するために'*'
          .eq('user_id', session.user.id)
          .order('sort_order');
        if (error) throw error;
        if (data) setFavoriteSongs(data);
      } catch (error) {
        if (error instanceof Error) alert('お気に入りリストの取得に失敗しました: ' + error.message);
      }
    };
    fetchFavorites();
  }, [session.user.id]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = favoriteSongs.findIndex((song) => song.id === active.id);
      const newIndex = favoriteSongs.findIndex((song) => song.id === over.id);
      const newSongs = arrayMove(favoriteSongs, oldIndex, newIndex);
      setFavoriteSongs(newSongs);

      // ▼▼▼ ここが最重要の修正点 ▼▼▼
      const updates = newSongs.map((song, index) => ({
        id: song.id,
        user_id: song.user_id, // この行を追加！
        sort_order: index + 1,
      }));
      // ▲▲▲ ここまで ▲▲▲

      try {
        const { error } = await supabase.from('favorite_songs').upsert(updates);
        if (error) throw error;
      } catch (error) {
        if (error instanceof Error) alert('順番の保存に失敗しました: ' + error.message);
        setFavoriteSongs(favoriteSongs);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      const { data, error } = await supabase.functions.invoke('spotify-search', {
        body: { query: searchQuery },
      });
      if (error) throw error;
      setSearchResults(data);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const addFavoriteSong = async (track: SpotifyTrack) => {
    const newArtistName = track.artists.map(a => a.name).join(', ');
    if (favoriteSongs.some(song => song.song_name === track.name && song.artist_name === newArtistName)) {
      alert('既に追加されています。');
      return;
    }
    try {
      const newSong = {
        user_id: session.user.id,
        song_id: track.id,
        song_name: track.name,
        artist_name: track.artists.map(a => a.name).join(', '),
        sort_order: favoriteSongs.length + 1,
      };
      const { data, error } = await supabase.from('favorite_songs').insert(newSong).select().single();
      if (error) throw error;
      if (data) setFavoriteSongs([...favoriteSongs, data]);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  };

  const removeFavoriteSong = async (songId: number) => {
    try {
      const { error } = await supabase
        .from('favorite_songs')
        .delete()
        .eq('id', songId)
        .eq('user_id', session.user.id); //  user_idのチェックを追加
      if (error) throw error;

      setFavoriteSongs(favoriteSongs.filter(song => song.id !== songId));
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  };

  return (
    <div>
      <h3>お気に入りミュージック管理</h3>
      <div>
        <h4>現在のリスト（ドラッグ＆ドロップで並び替え）</h4>
        {favoriteSongs.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={favoriteSongs}
              strategy={verticalListSortingStrategy}
            >
              <ol style={{ listStyle: 'none', padding: 0 }}>
                {favoriteSongs.map((song) => (
                  <SortableSongItem key={song.id} song={song} onRemove={removeFavoriteSong} />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        ) : (
          <p>まだ登録されていません。</p>
        )}
      </div>
      
      <hr />
      <div>
        <h4>曲・アーティストを検索</h4>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="曲名やアーティスト名で検索"
        />
        <button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? '検索中...' : '検索'}
        </button>
      </div>
      {searchResults && (
        <div>
          <h4>検索結果</h4>
          <h5>曲</h5>
          <ul>
            {searchResults.tracks.items.map(track => (
              <li key={track.id}>
                {track.name} by {track.artists.map(a => a.name).join(', ')}{' '}
                <button onClick={() => addFavoriteSong(track)}>追加</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};