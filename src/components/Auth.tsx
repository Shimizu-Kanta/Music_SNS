import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // 先ほど作ったSupabaseクライアントをインポート

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('ログインしました！');
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('確認メールを送信しました。メールを確認してログインしてください。');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>ログイン / 新規登録</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? <span>処理中...</span> : <span>ログイン</span>}
          </button>
          {/* formの外に置くことで、Enterキーで発火しないようにする */}
          <button type="button" onClick={handleSignUp} disabled={loading}>
            {loading ? <span>処理中...</span> : <span>新規登録</span>}
          </button>
        </div>
      </form>
    </div>
  );
};