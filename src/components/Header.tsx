import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface Props {
  session: Session;
}

export const Header = ({ session }: Props) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
    } else {
      // ログアウト後は Auth ページにリダイレクトされる
      navigate('/'); 
    }
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#f8f8f8',
      borderBottom: '1px solid #ddd',
      marginBottom: '20px'
    }}>
      <div className="logo">
        <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
          Music SNS
        </Link>
      </div>
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '20px' }}>
          <li>
            <Link to="/">ホーム</Link>
          </li>
          <li>
            {/* 自分のプロフィールへのリンク */}
            <Link to={`/profile/${session.user.id}`}>マイプロフィール</Link>
          </li>
          <li>
            <Link to="/add-event">ライブ履歴登録</Link>
          </li>
          <li>
            <button onClick={handleLogout}>ログアウト</button>
          </li>
        </ul>
      </nav>
    </header>
  );
};