'use client';

import { Label, TextInput, Checkbox, Radio } from 'flowbite-react';
import { FormSettings as IFormSettings, TypingDelay } from '@/types';

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
          <Label htmlFor="backgroundImageUrl">Background Image URL</Label>
        </div>
        <TextInput
          id="backgroundImageUrl"
          type="url"
          placeholder="https://example.com/background.jpg"
          value={settings.backgroundImageUrl || ''}
          onChange={(e) => handleUpdate({ backgroundImageUrl: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="useDarkText"
          checked={settings.useDarkText || false}
          onChange={(e) =>
            handleUpdate({ useDarkText: e.target.checked })
          }
        />
        <Label htmlFor="useDarkText">Dark Text? (for light brand colors)</Label>
      </div>

      <div>
        <div className="mb-2 block">
          <Label>Typing Delay</Label>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Radio
              id="delay-none"
              name="typingDelay"
              value={TypingDelay.NONE}
              checked={(settings.typingDelay || TypingDelay.NORMAL) === TypingDelay.NONE}
              onChange={(e) => handleUpdate({ typingDelay: e.target.value })}
            />
            <Label htmlFor="delay-none">No Delay</Label>
          </div>
          <div className="flex items-center gap-2">
            <Radio
              id="delay-short"
              name="typingDelay"
              value={TypingDelay.SHORT}
              checked={(settings.typingDelay || TypingDelay.NORMAL) === TypingDelay.SHORT}
              onChange={(e) => handleUpdate({ typingDelay: e.target.value })}
            />
            <Label htmlFor="delay-short">Short Delay (1.5 seconds)</Label>
          </div>
          <div className="flex items-center gap-2">
            <Radio
              id="delay-normal"
              name="typingDelay"
              value={TypingDelay.NORMAL}
              checked={(settings.typingDelay || TypingDelay.NORMAL) === TypingDelay.NORMAL}
              onChange={(e) => handleUpdate({ typingDelay: e.target.value })}
            />
            <Label htmlFor="delay-normal">Normal Delay (2.5 seconds)</Label>
          </div>
        </div>
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

        <div className="flex items-center gap-2">
          <Checkbox
            id="emailNotifications"
            checked={settings.emailNotifications || false}
            onChange={(e) =>
              handleUpdate({ emailNotifications: e.target.checked })
            }
          />
          <Label htmlFor="emailNotifications">Email me when form is completed</Label>
        </div>
      </div>
    </div>
  );
}
