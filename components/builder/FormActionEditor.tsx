'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Label, TextInput, Textarea, Select, Button } from 'flowbite-react';
import { HiPlus, HiTrash } from 'react-icons/hi';
import {
  FormAction,
  FormActionType,
  HttpMethod,
  EmailActionConfig,
  ApiActionConfig,
} from '@/types';

interface FormActionEditorProps {
  action: FormAction | null; // null = create new
  onSave: () => void;
  onCancel: () => void;
}

export default function FormActionEditor({
  action,
  onSave,
  onCancel,
}: FormActionEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<FormActionType>(FormActionType.EMAIL);

  // Email config
  const [recipients, setRecipients] = useState<string[]>(['']);

  // API config
  const [targetUrl, setTargetUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>(HttpMethod.POST);
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load existing action data
  useEffect(() => {
    if (action) {
      setName(action.name);
      setDescription(action.description || '');
      setType(action.type);

      if (action.type === FormActionType.EMAIL) {
        const config = action.config as EmailActionConfig;
        setRecipients(config.recipients.length > 0 ? config.recipients : ['']);
      } else if (action.type === FormActionType.API) {
        const config = action.config as ApiActionConfig;
        setTargetUrl(config.targetUrl);
        setMethod(config.method);

        const headerEntries = Object.entries(config.headers || {});
        setHeaders(
          headerEntries.length > 0
            ? headerEntries.map(([key, value]) => ({ key, value }))
            : [{ key: '', value: '' }]
        );
      }
    }
  }, [action]);

  const handleAddRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    let config: EmailActionConfig | ApiActionConfig;

    if (type === FormActionType.EMAIL) {
      const validRecipients = recipients.filter((r) => r.trim());
      if (validRecipients.length === 0) {
        setError('At least one email recipient is required');
        return;
      }
      config = { recipients: validRecipients };
    } else {
      if (!targetUrl.trim()) {
        setError('Target URL is required');
        return;
      }

      // Validate URL
      try {
        new URL(targetUrl);
      } catch {
        setError('Invalid URL format');
        return;
      }

      const validHeaders = headers
        .filter((h) => h.key.trim() && h.value.trim())
        .reduce((acc, h) => {
          acc[h.key] = h.value;
          return acc;
        }, {} as Record<string, string>);

      config = {
        targetUrl,
        method,
        headers: validHeaders,
      };
    }

    setSaving(true);

    try {
      const url = action
        ? `/api/form-actions/${action._id}`
        : '/api/form-actions';

      const response = await fetch(url, {
        method: action ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description.trim() || undefined,
          type,
          config,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save form action');
      }

      onSave();
    } catch (err) {
      console.error('Error saving form action:', err);
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={true} onClose={onCancel} size="2xl">
      <ModalHeader>
        {action ? 'Edit Form Action' : 'Create Form Action'}
      </ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="name">Name *</Label>
            <TextInput
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sales Team Notification"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="type">Action Type *</Label>
            <Select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as FormActionType)}
              disabled={!!action} // Can't change type when editing
            >
              <option value={FormActionType.EMAIL}>Email</option>
              <option value={FormActionType.API}>API Webhook</option>
            </Select>
          </div>

          {type === FormActionType.EMAIL && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Email Recipients *</Label>
                <Button size="xs" color="light" type="button" onClick={handleAddRecipient}>
                  <HiPlus className="mr-1 h-3 w-3" />
                  Add Recipient
                </Button>
              </div>
              <div className="space-y-2">
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex gap-2">
                    <TextInput
                      type="email"
                      value={recipient}
                      onChange={(e) => handleRecipientChange(index, e.target.value)}
                      placeholder="email@example.com"
                      className="flex-1"
                    />
                    {recipients.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        color="failure"
                        onClick={() => handleRemoveRecipient(index)}
                      >
                        <HiTrash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {type === FormActionType.API && (
            <>
              <div>
                <Label htmlFor="targetUrl">Target URL *</Label>
                <TextInput
                  id="targetUrl"
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://api.example.com/webhook"
                  required
                />
              </div>

              <div>
                <Label htmlFor="method">HTTP Method *</Label>
                <Select
                  id="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                >
                  <option value={HttpMethod.POST}>POST</option>
                  <option value={HttpMethod.PUT}>PUT</option>
                  <option value={HttpMethod.PATCH}>PATCH</option>
                </Select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Custom Headers (Optional)</Label>
                  <Button size="xs" color="light" type="button" onClick={handleAddHeader}>
                    <HiPlus className="mr-1 h-3 w-3" />
                    Add Header
                  </Button>
                </div>
                <div className="space-y-2">
                  {headers.map((header, index) => (
                    <div key={index} className="flex gap-2">
                      <TextInput
                        value={header.key}
                        onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                        placeholder="Header name (e.g., X-API-Key)"
                        className="flex-1"
                      />
                      <TextInput
                        value={header.value}
                        onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                        placeholder="Header value"
                        className="flex-1"
                      />
                      {headers.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          color="failure"
                          onClick={() => handleRemoveHeader(index)}
                        >
                          <HiTrash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Common headers: Authorization, X-API-Key, X-Custom-Header
                </p>
              </div>
            </>
          )}
        </form>
      </ModalBody>
      <ModalFooter>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : action ? 'Update Action' : 'Create Action'}
        </Button>
        <Button color="gray" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
