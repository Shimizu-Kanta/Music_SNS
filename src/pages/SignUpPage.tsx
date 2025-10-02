import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

export const SignUpPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username, // ここでusernameを渡す
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert('確認メールを送信しました。メールボックスを確認してください。');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>アカウント登録</h2>
      <form onSubmit={handleSignUp}>
        <div>
          <label>ユーザー名</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>メールアドレス</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>パスワード</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '登録中...' : '登録する'}
        </button>
      </form>
      <p>
        アカウントをお持ちですか？ <Link to="/login">ログイン</Link>
      </p>
    </div>
  );
};