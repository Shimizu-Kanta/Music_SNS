import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

interface Props {
  session: Session;
}

export const AddEventPage = ({ session }: Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [artistName, setArtistName] = useState('');
  const [eventName, setEventName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate || !artistName || !venueName) {
      alert('開催日、アーティスト名、会場名は必須です。');
      return;
    }

    try {
      setLoading(true);
      // rpc呼び出しから p_city を削除
      const { error } = await supabase.rpc('add_attended_concert', {
        p_event_date: eventDate,
        p_artist_name: artistName,
        p_venue_name: venueName,
        p_event_name: eventName,
        p_notes: notes,
      });

      if (error) throw error;
      
      alert('ライブ情報を登録しました！');
      navigate(`/profile/${session.user.id}`);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto' }}>
      <h2>ライブ参加履歴を登録</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>開催日 *</label>
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
        </div>
        <div>
          <label>アーティスト名 *</label>
          <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} required />
        </div>
        <div>
          <label>イベント名</label>
          <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} />
        </div>
        <div>
          <label>会場名 *</label>
          <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)} required />
        </div>
        {/* cityの入力欄を削除 */}
        <div>
          <label>メモ</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}></textarea>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '登録中...' : '登録する'}
        </button>
      </form>
    </div>
  );
};