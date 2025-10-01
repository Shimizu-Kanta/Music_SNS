import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Auth } from './components/Auth';
import { HomePage } from './pages/HomePage'; // 新しく作ったHomePageをインポート
import { ProfilePage } from './pages/ProfilePage';
import { Routes, Route, Link } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

// ここにProfilePageを後で追加します
// import { ProfilePage } from './pages/ProfilePage';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      <header style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
        <nav>
          <Link to="/">ホーム</Link>
          {session && (
            // 自分のプロフィールページへのリンクを追加
            <Link to={`/profile/${session.user.id}`} style={{ marginLeft: '20px' }}>
              マイプロフィール
            </Link>
          )}
        </nav>
      </header>

      <main>
        {!session ? (
          // ログインしていない場合は、常にログインフォームを表示
          <Auth />
        ) : (
          // ログインしている場合は、URLに応じてページを切り替える
          <Routes>
            <Route path="/" element={<HomePage session={session} />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

export default App;
