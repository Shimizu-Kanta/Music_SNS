import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { AddEventPage } from './pages/AddEventPage';
import { EditProfilePage } from './pages/EditProfilePage'; 
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage'; // 新しくインポート
import { SignUpPage } from './pages/SignUpPage'; // 新しくインポート

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
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* ログインしていないユーザー向けのルート */}
      {!session && (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          {/* 他のどのパスに来ても/loginにリダイレクト */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}

      {/* ログインしているユーザー向けのルート */}
      {session && (
        <Route element={<Layout session={session} />}>
          <Route path="/" element={<HomePage session={session} />} />
          <Route path="/profile/:userId" element={<ProfilePage session={session} />} />
          <Route path="/add-event" element={<AddEventPage session={session} />} />
          <Route path="/profile/edit" element={<EditProfilePage session={session} />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
}

export default App;