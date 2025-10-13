'use client';

import { Label, TextInput, Checkbox } from 'flowbite-react';
import { FormSettings as IFormSettings } from '@/types';

interface FormSettingsProps {
  settings: IFormSettings;
  onUpdate: (settings: IFormSettings) => void;
}

export default function FormSettings({ settings, onUpdate }: FormSettingsProps) {
  const handleUpdate = (updates: Partial<IFormSettings>) => {
    onUpdate({ ...settings, ...updates });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">
        Form Settings
      </h3>

      <div>
        <div className="mb-2 block">
          <Label htmlFor="brandColor">Brand Color</Label>
        </div>
        <TextInput
          id="brandColor"
          type="color"
          value={settings.brandColor || '#3b82f6'}
          onChange={(e) => handleUpdate({ brandColor: e.target.value })}
        />
      </div>

      <div>
        <div className="mb-2 block">
          <Label htmlFor="welcomeMessage">Welcome Message</Label>
        </div>
        <TextInput
          id="welcomeMessage"
          placeholder="Welcome! Let's get started..."
          value={settings.welcomeMessage || ''}
          onChange={(e) => handleUpdate({ welcomeMessage: e.target.value })}
        />
      </div>

      <div>
        <div className="mb-2 block">
          <Label htmlFor="thankYouMessage">Thank You Message</Label>
        </div>
        <TextInput
          id="thankYouMessage"
          placeholder="Thank you for your submission!"
          value={settings.thankYouMessage || ''}
          onChange={(e) => handleUpdate({ thankYouMessage: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="enableProgressBar"
            checked={settings.enableProgressBar !== false}
            onChange={(e) =>
              handleUpdate({ enableProgressBar: e.target.checked })
            }
          />
          <Label htmlFor="enableProgressBar">Show progress bar</Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="allowBackNavigation"
            checked={settings.allowBackNavigation !== false}
            onChange={(e) =>
              handleUpdate({ allowBackNavigation: e.target.checked })
            }
          />
          <Label htmlFor="allowBackNavigation">Allow back navigation</Label>
        </div>
      </div>
    </div>
  );
}
