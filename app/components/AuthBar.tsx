'use client';

import { useEffect, useState } from 'react';
import { createClient, type User } from '@supabase/supabase-js';

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
    <div
      style={{
        padding: 8,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {user ? (
        <>
          <span style={{ fontSize: 14 }}>Hi, {user.email}</span>
          <button onClick={signOut}>Logout</button>
        </>
      ) : (
        <button onClick={signIn}>Continue with Google</button>
      )}
    </div>
  );
}
