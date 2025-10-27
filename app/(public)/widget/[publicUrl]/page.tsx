'use client';

import { useParams } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';
import { useEffect } from 'react';

export default function WidgetPage() {
  const params = useParams();
  const publicUrl = params.publicUrl as string;

  useEffect(() => {
    // Notify parent window that widget is loaded
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'FORMBOTZ_WIDGET_LOADED' }, '*');
    }
  }, []);

  const handleClose = () => {
    // Notify parent window to close the widget
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'FORMBOTZ_WIDGET_CLOSE' }, '*');
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      <ChatInterface
        publicUrl={publicUrl}
        mode="widget"
        skipPasswordProtection={false}
        onClose={handleClose}
      />
    </div>
  );
}
