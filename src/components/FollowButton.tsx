import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface Props {
  session: Session;
  targetUserId: string;
}

export const FollowButton = ({ session, targetUserId }: Props) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // コンポーネントが表示された時に、フォロー状態を確認する
  useEffect(() => {
    const checkFollowStatus = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', session.user.id)
        .eq('following_id', targetUserId);

      if (error) {
        console.error('Error checking follow status:', error);
      } else if (data && data.length > 0) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
      setIsLoading(false);
    };

    checkFollowStatus();
  }, [session.user.id, targetUserId]);

  // フォロー/アンフォローを切り替える関数
  const toggleFollow = async () => {
    setIsLoading(true);

    if (isFollowing) {
      // --- アンフォロー処理 ---
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', session.user.id)
        .eq('following_id', targetUserId);
      
      if (error) {
        alert('アンフォローに失敗しました。');
      } else {
        setIsFollowing(false);
      }
    } else {
      // --- フォロー処理 ---
      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: session.user.id,
          following_id: targetUserId,
        });
      
      if (error) {
        alert('フォローに失敗しました。');
      } else {
        setIsFollowing(true);
      }
    }
    setIsLoading(false);
  };

  return (
    <button onClick={toggleFollow} disabled={isLoading}>
      {isLoading ? '読み込み中...' : (isFollowing ? 'フォロー中' : 'フォローする')}
    </button>
  );
};