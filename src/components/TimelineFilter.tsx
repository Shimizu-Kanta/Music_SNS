import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { FilterType } from '../types'; // types.tsからインポート！

interface FavoriteArtist {
  artist_name: string;
  artist_id: string;
}

interface Props {
  session: Session;
  onFilterChange: (type: FilterType, artistId?: string) => void;
}

export const TimelineFilter = ({ session, onFilterChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [favoriteArtists, setFavoriteArtists] = useState<FavoriteArtist[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from('favorite_artists')
        .select('artist_name, artist_id')
        .eq('user_id', session.user.id);
      
      if (error) {
        console.error('お気に入りアーティストの取得に失敗しました', error);
      } else if (data) {
        setFavoriteArtists(data);
      }
    };
    fetchFavorites();
  }, [session.user.id]);

  const handleSelect = (type: FilterType, artistId?: string) => {
    onFilterChange(type, artistId);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <button onClick={() => setIsOpen(!isOpen)}>
        ☰ タイムラインを絞り込み
      </button>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, border: '1px solid #ccc', backgroundColor: 'white', zIndex: 100, width: '200px' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: '10px' }}>
            <li style={{ cursor: 'pointer', padding: '8px' }} onClick={() => handleSelect('ALL')}>すべて</li>
            <li style={{ cursor: 'pointer', padding: '8px' }} onClick={() => handleSelect('FOLLOWS')}>フォロー中</li>
            <li style={{ cursor: 'pointer', padding: '8px' }} onClick={() => handleSelect('FAVORITES')}>お気に入り</li>
            <hr />
            {favoriteArtists.map(artist => (
              <li key={artist.artist_id} style={{ cursor: 'pointer', padding: '8px' }} onClick={() => handleSelect('ARTIST', artist.artist_id)}>
                {artist.artist_name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};