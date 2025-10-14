'use client';

import { useEffect, useState } from 'react';

export default function TypingIndicator() {
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '.';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg bg-white px-4 py-2 shadow-sm dark:bg-gray-800">
        <p className="text-gray-900 dark:text-white">
          <span className="inline-block w-8">{dots}</span>
        </p>
      </div>
    </div>
  );
}
