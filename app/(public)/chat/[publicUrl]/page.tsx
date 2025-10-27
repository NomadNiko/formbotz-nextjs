'use client';

import { useParams } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  const params = useParams();
  const publicUrl = params.publicUrl as string;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      {/* Mobile Container - Centered on Desktop */}
      <ChatInterface publicUrl={publicUrl} mode="full" />
    </div>
  );
}
