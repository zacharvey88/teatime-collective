'use client';

import { SessionProvider } from 'next-auth/react';

interface AdminSessionProviderProps {
  children: React.ReactNode;
}

export default function AdminSessionProvider({ children }: AdminSessionProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
