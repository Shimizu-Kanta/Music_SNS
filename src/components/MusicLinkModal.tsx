import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  songName: string | null;
  artistName: string | null;
}

interface Links {
  spotify: string;
  youtubeMusic: string;
  appleMusic: string;
}

export const MusicLinkModal = ({ isOpen, onClose, songName, artistName }: Props) => {
  const [links, setLinks] = useState<Links | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // モーダルが開かれ、曲名とアーティスト名がある場合のみ実行
    if (isOpen && songName && artistName) {
      const fetchLinks = async () => {
        setIsLoading(true);
        setLinks(null); // 以前のリンクをクリア
        try {
          const { data, error } = await supabase.functions.invoke('music-link-generator', {
            body: { song_name: songName, artist_name: artistName },
          });

          if (error) throw error;
          setLinks(data);

        } catch (error) {
          if (error instanceof Error) alert('リンクの取得に失敗しました: ' + error.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchLinks();
    }
  }, [isOpen, songName, artistName]);

  if (!isOpen) {
    return null;
  }

  return (
    // オーバーレイ（背景を暗くする）
    <div onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', 
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      {/* モーダル本体 */}
      <div onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: 'white', padding: '20px', borderRadius: '8px',
        width: '90%', maxWidth: '400px'
      }}>
        <h3>{songName} - {artistName}</h3>
        {isLoading && <p>リンクを検索中...</p>}
        {links && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><a href={links.spotify} target="_blank" rel="noopener noreferrer">Spotifyで聴く</a></li>
            <li><a href={links.appleMusic} target="_blank" rel="noopener noreferrer">Apple Musicで聴く</a></li>
            <li><a href={links.youtubeMusic} target="_blank" rel="noopener noreferrer">YouTube Musicで聴く</a></li>
          </ul>
        )}
        <button onClick={onClose} style={{ marginTop: '20px' }}>閉じる</button>
      </div>
    </div>
  );
};