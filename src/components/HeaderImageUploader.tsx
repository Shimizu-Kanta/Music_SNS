import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface Props {
  session: Session;
}

export const HeaderImageUploader = ({ session }: Props) => {
  const [headerUrl, setHeaderUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const getHeaderUrl = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('header_url')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.warn('Error fetching header url:', error);
      } else if (data) {
        setHeaderUrl(data.header_url);
      }
    };
    getHeaderUrl();
  }, [session]);

  const uploadHeaderImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      // アバターと区別するためにheadersフォルダに保存
      const filePath = `${session.user.id}/headers/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // header_urlカラムを更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ header_url: publicUrl })
        .eq('id', session.user.id);
      
      if (updateError) throw updateError;
      
      setHeaderUrl(publicUrl);

    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h4>ヘッダー画像</h4>
      {headerUrl ? (
        <img
          src={headerUrl}
          alt="Header"
          style={{ height: '200px', width: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ height: '200px', width: '100%', backgroundColor: '#eee' }} />
      )}
      <div style={{ marginTop: '10px' }}>
        <label htmlFor="headerImage" style={{ cursor: 'pointer' }}>
          {uploading ? 'アップロード中...' : 'ヘッダー画像をアップロード'}
        </label>
        <input
          style={{ visibility: 'hidden', position: 'absolute' }}
          type="file"
          id="headerImage"
          accept="image/*"
          onChange={uploadHeaderImage}
          disabled={uploading}
        />
      </div>
    </div>
  );
};