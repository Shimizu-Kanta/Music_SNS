import type { Session } from '@supabase/supabase-js';
import { ProfileEdit } from '../components/ProfileEdit';
import { FavoriteMusicManager } from '../components/FavoriteMusicManager';
import { FavoriteArtistManager } from '../components/FavoriteArtistManager';
import { Avatar } from '../components/Avatar';

interface Props {
  session: Session;
}

export const EditProfilePage = ({ session }: Props) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>プロフィールの編集</h1>
      
      <Avatar session={session} />
      <hr style={{ margin: '30px 0' }} />
      <ProfileEdit session={session} />
      <hr style={{ margin: '30px 0' }} />
      <FavoriteMusicManager session={session} />
      <hr style={{ margin: '30px 0' }} />
      <FavoriteArtistManager session={session} />
    </div>
  );
};