import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { Auth } from './components/Auth';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { AddEventPage } from './pages/AddEventPage';
import { Routes, Route } from 'react-router-dom';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // 最初のセッションチェック中はローディング表示
  }

  // ここで、全てのルートのelementを `!session ? <Auth /> : ...` の形式に統一します
  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      <Routes>
        <Route path="/" element={!session ? <Auth /> : <HomePage session={session} />} />
        <Route path="/profile/:userId" element={!session ? <Auth /> : <ProfilePage session={session} />} />
        <Route path="/add-event" element={!session ? <Auth /> : <AddEventPage session={session} />} />
      </Routes>
    </div>
  );
}

export default App;