import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Auth } from './components/Auth';
import { Account } from './components/Account'; // これから作ります
import type { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 最初に現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // ログイン状態の変化を監視するリスナーを設定
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // コンポーネントがアンマウントされるときにリスナーを解除
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      <h1>音楽SNSへようこそ！</h1>
      {/* sessionがなければAuthコンポーネント、あればAccountコンポーネントを表示 */}
      {!session ? <Auth /> : <Account key={session.user.id} session={session} />}
    </div>
  );
}

export default App;
