'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Label, TextInput, Textarea } from 'flowbite-react';
import { HiArrowLeft } from 'react-icons/hi';
import Link from 'next/link';

export default function NewFormPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/dashboard/forms/${data.form._id}/edit`);
      } else {
        setError(data.error || 'Failed to create form');
      }
    } catch {
      setError('Failed to create form');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/forms">
          <Button color="light" size="sm">
            <HiArrowLeft className="mr-2 h-4 w-4" />
            Back to Forms
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Form
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Start building your conversational form
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <div>
            <div className="mb-2 block">
              <Label htmlFor="name">Form Name</Label>
            </div>
            <TextInput
              id="name"
              type="text"
              placeholder="e.g., Customer Feedback Survey"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
              ⚠️ Choose a short, generic name. Changing the name later will change the public URL and break any existing links.
            </p>
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="description">Description (optional)</Label>
            </div>
            <Textarea
              id="description"
              placeholder="Describe what this form is for..."
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" color="blue" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Form'}
            </Button>
            <Link href="/dashboard/forms">
              <Button color="light">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
