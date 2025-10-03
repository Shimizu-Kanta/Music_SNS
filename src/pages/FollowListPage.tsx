import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// RPCから返されるユーザーの型
interface FollowUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

export const FollowListPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!userId) return;
      setIsLoading(true);

      const isFollowersPage = location.pathname.includes('/followers');
      const rpcName = isFollowersPage ? 'get_followers' : 'get_following';
      setPageTitle(isFollowersPage ? 'フォロワー' : 'フォロー中');

      // RPCを呼び出す
      const { data, error } = await supabase.rpc(rpcName, { p_user_id: userId });

      if (error) {
        console.error(`Error fetching ${rpcName}:`, error);
      } else {
        setUsers(data || []);
      }
      setIsLoading(false);
    };

    fetchUsers();
  }, [userId, location.pathname]);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>{pageTitle}</h1>
      {users.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map(user => (
            <li key={user.id} style={{ marginBottom: '15px' }}>
              <Link to={`/profile/${user.id}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }} />
                ) : (
                  <div style={{ width: '50px', height: '50px', backgroundColor: '#eee', borderRadius: '50%', marginRight: '15px' }} />
                )}
                <strong>{user.username}</strong>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>ユーザーが見つかりません。</p>
      )}
    </div>
  );
};