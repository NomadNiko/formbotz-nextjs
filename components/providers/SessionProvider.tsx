'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider
      refetchOnWindowFocus={true}
      refetchInterval={0}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
