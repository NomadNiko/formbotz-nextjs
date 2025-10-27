'use client';

import { useState } from 'react';
import { Button, Card } from 'flowbite-react';
import { HiClipboardCopy, HiCheck, HiExternalLink } from 'react-icons/hi';

interface EmbedCodeDisplayProps {
  publicUrl: string;
}

export default function EmbedCodeDisplay({ publicUrl }: EmbedCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const appUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'https://formbotz.nomadsoft.us';

  const embedCode = `<script src="${appUrl}/api/widget/${publicUrl}/loader.js"></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTest = () => {
    window.open(`/widget/${publicUrl}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Embed Code
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {"Copy and paste this code snippet into your website's HTML, just before the closing "}{' '}
          <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-800">&lt;/body&gt;</code> tag.
        </p>
      </div>

      <Card>
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900">
            <code className="text-gray-800 dark:text-gray-200">{embedCode}</code>
          </pre>
          <Button
            size="sm"
            color="gray"
            onClick={handleCopy}
            className="absolute right-2 top-2"
          >
            {copied ? (
              <>
                <HiCheck className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <HiClipboardCopy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <Button color="light" onClick={handleTest} className="mt-2">
          <HiExternalLink className="mr-2 h-5 w-5" />
          Test Widget
        </Button>
      </Card>

      <Card>
        <h4 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
          Installation Instructions
        </h4>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-300">
          <li>{"Copy the embed code above"}</li>
          <li>
            {"Paste it into your website's HTML, just before the closing "}<code>&lt;/body&gt;</code> tag
          </li>
          <li>{"Save and publish your website"}</li>
          <li>{"The widget will appear as a floating button on your site"}</li>
        </ol>
      </Card>

      <Card>
        <h4 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
          Framework-Specific Examples
        </h4>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              React / Next.js
            </p>
            <pre className="overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-900">
              <code className="text-gray-800 dark:text-gray-200">{`useEffect(() => {
  const script = document.createElement('script');
  script.src = '${appUrl}/api/widget/${publicUrl}/loader.js';
  document.body.appendChild(script);
  return () => {
    document.body.removeChild(script);
  };
}, []);`}</code>
            </pre>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Vue / Nuxt
            </p>
            <pre className="overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-900">
              <code className="text-gray-800 dark:text-gray-200">{`mounted() {
  const script = document.createElement('script');
  script.src = '${appUrl}/api/widget/${publicUrl}/loader.js';
  document.body.appendChild(script);
}`}</code>
            </pre>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Plain HTML
            </p>
            <pre className="overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-900">
              <code className="text-gray-800 dark:text-gray-200">{embedCode}</code>
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
