import { useParams } from 'react-router-dom';

export const ProfilePage = () => {
  // URLのパラメータから :userId の部分を取得する
  const { userId } = useParams<{ userId: string }>();

  return (
    <div>
      <h2>プロフィールページ</h2>
      <p>表示しているユーザーのID: {userId}</p>
      {/* ここに、これからユーザー情報を表示する処理を追加していきます */}
    </div>
  );
};