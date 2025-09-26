'use client';

import { useEffect, useState } from 'react';
import { createClient, type User } from '@supabase/supabase-js';
import * as styles from './AuthBar.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthBar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className={styles.authBarContainer}>
      {user ? (
        <>
          <span className={styles.userEmail}>Hi, {user.email}</span>
          <button onClick={signOut}>Logout</button>
        </>
      ) : (
        <button onClick={signIn}>Google로 로그인하기</button>
      )}
    </header>
  );
}
