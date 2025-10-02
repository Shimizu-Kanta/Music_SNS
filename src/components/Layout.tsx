import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import type { Session } from '@supabase/supabase-js';

interface Props {
  session: Session;
}

export const Layout = ({ session }: Props) => {
  return (
    <div>
      <Header session={session} />
      <main>
        {/* ここに各ページの中身が表示されます */}
        <Outlet />
      </main>
      {/* フッターなどを追加したければ、将来的にここに追加できます */}
    </div>
  );
};