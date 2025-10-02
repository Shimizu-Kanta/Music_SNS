import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface Props {
  session: Session;
}

export const Avatar = ({ session }: Props) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // 最初に現在のプロフィールからアバターURLを取得
    const getAvatarUrl = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.warn('Error fetching avatar url:', error);
      } else if (data) {
        setAvatarUrl(data.avatar_url);
      }
    };
    getAvatarUrl();
  }, [session]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      // 1. アップロードした画像の公開URLを取得
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // 2. profilesテーブルのavatar_urlを「公開URL」で更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);
      
      if (updateError) throw updateError;
      
      // 3. 画面上のアバターを新しい公開URLで更新
      setAvatarUrl(publicUrl);

    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          style={{ height: 150, width: 150, borderRadius: '50%' }}
        />
      ) : (
        <div style={{ height: 150, width: 150, backgroundColor: '#eee', borderRadius: '50%' }} />
      )}
      <div style={{ width: 150, textAlign: 'center', marginTop: '10px' }}>
        <label htmlFor="single" style={{ cursor: 'pointer' }}>
          {uploading ? 'アップロード中...' : '画像をアップロード'}
        </label>
        <input
          style={{ visibility: 'hidden', position: 'absolute' }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  );
};