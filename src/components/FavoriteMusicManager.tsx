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

// 型定義
interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    images: { url: string }[];
  }
}
interface FavoriteSong {
  id: number;
  user_id: string;
  song_id: string;
  song_name: string;
  artist_name: string;
  sort_order: number;
  album_art_url: string | null;
}

// ドラッグ可能なリストアイテムコンポーネント
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
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  return (
    <li ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span 
          {...attributes} 
          {...listeners} 
          style={{ cursor: 'grab', marginRight: '10px', fontSize: '1.2em' }}
        >
          ⠿
        </span>
        {song.album_art_url && (
            <img src={song.album_art_url} alt={song.song_name} width="50" height="50" style={{ marginRight: '10px' }} />
        )}
        <div>
            <div><strong>{song.song_name}</strong></div>
            <div>{song.artist_name}</div>
        </div>
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
  const [searchResults, setSearchResults] = useState<{ tracks: { items: SpotifyTrack[] } } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [favoriteSongs, setFavoriteSongs] = useState<FavoriteSong[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from('favorite_songs')
          .select('*')
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

      const updates = newSongs.map((song, index) => ({
        id: song.id,
        user_id: song.user_id, 
        sort_order: index, // 0から始まるように修正
      }));

      try {
        const { error } = await supabase.from('favorite_songs').upsert(updates);
        if (error) throw error;
      } catch (error) {
        if (error instanceof Error) {
          alert('順番の保存に失敗しました: ' + error.message);
          // エラーが起きたら元の順序に戻す
          const { data } = await supabase.from('favorite_songs').select('*').eq('user_id', session.user.id).order('sort_order');
          if(data) setFavoriteSongs(data);
        }
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      const { data, error } = await supabase.functions.invoke('spotify-search', {
        body: { query: searchQuery, type: 'track' }, // type: 'track' を明示
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
        sort_order: favoriteSongs.length, // 0から始まるように修正
        album_art_url: track.album.images[0]?.url || null,
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
        .eq('user_id', session.user.id);
      if (error) throw error;
      setFavoriteSongs(favoriteSongs.filter(song => song.id !== songId));
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  };

  return (
    <div>
      <h3>お気に入り楽曲</h3>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={favoriteSongs.map(song => song.id)} strategy={verticalListSortingStrategy}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {favoriteSongs.map(song => (
              <SortableSongItem key={song.id} song={song} onRemove={removeFavoriteSong} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      
      <hr />

      <div>
        <h4>曲を検索</h4>
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

      {searchResults && searchResults.tracks && (
        <div>
          <h4>検索結果</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {searchResults.tracks.items.map(track => (
              <li key={track.id} onClick={() => addFavoriteSong(track)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', margin: '10px 0', padding: '5px', border: '1px solid #eee' }}>
                {track.album.images[0] && (
                  <img src={track.album.images[0].url} alt={track.name} width="50" height="50" style={{ marginRight: '10px' }} />
                )}
                <div>
                  <div><strong>{track.name}</strong></div>
                  <div>{track.artists.map(artist => artist.name).join(', ')}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};