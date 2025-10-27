'use client';

import Image from 'next/image';
import { Label, TextInput, Select, Textarea } from 'flowbite-react';
import { WidgetSettings as IWidgetSettings } from '@/types';

interface WidgetSettingsProps {
  settings: IWidgetSettings;
  brandColor?: string;
  onUpdate: (updates: Partial<IWidgetSettings>) => void;
}

export default function WidgetSettings({ settings, brandColor, onUpdate }: WidgetSettingsProps) {
  const handleUpdate = (field: keyof IWidgetSettings, value: unknown) => {
    onUpdate({ [field]: value });
  };

  const currentButtonColor = settings.buttonColor || brandColor || '#3b82f6';
  const currentButtonSize = settings.buttonSize || 100;
  const currentHorizontalOffset = settings.horizontalOffset || 20;
  const currentVerticalOffset = settings.verticalOffset || 20;
  const currentPosition = settings.position || 'bottom-right';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Widget Configuration
        </h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Customize how your form widget appears on your website
        </p>
      </div>

      {/* Position Selector */}
      <div>
        <div className="mb-2">
          <Label htmlFor="widget-position">Button Position</Label>
        </div>
        <Select
          id="widget-position"
          value={currentPosition}
          onChange={(e) => handleUpdate('position', e.target.value)}
        >
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="top-right">Top Right</option>
          <option value="top-left">Top Left</option>
        </Select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Where the floating button appears on the page
        </p>
      </div>

      {/* Button Color */}
      <div>
        <div className="mb-2">
          <Label htmlFor="widget-button-color">Button Color</Label>
        </div>
        <div className="flex gap-2">
          <input
            type="color"
            id="widget-button-color"
            value={currentButtonColor}
            onChange={(e) => handleUpdate('buttonColor', e.target.value)}
            className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
          />
          <TextInput
            value={currentButtonColor}
            onChange={(e) => handleUpdate('buttonColor', e.target.value)}
            placeholder="#3b82f6"
            className="flex-1"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {settings.buttonColor ? 'Custom color' : `Using form brand color (${brandColor || '#3b82f6'})`}
        </p>
      </div>

      {/* Button Size */}
      <div>
        <div className="mb-2">
          <Label htmlFor="widget-button-size">Button Size: {currentButtonSize}px</Label>
        </div>
        <input
          type="range"
          id="widget-button-size"
          min="50"
          max="150"
          value={currentButtonSize}
          onChange={(e) => handleUpdate('buttonSize', parseInt(e.target.value))}
          className="w-full"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Adjust the size of the floating button (50px - 150px)
        </p>
      </div>

      {/* Offsets */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2">
            <Label htmlFor="widget-horizontal-offset">Horizontal Offset</Label>
          </div>
          <TextInput
            id="widget-horizontal-offset"
            type="number"
            value={currentHorizontalOffset}
            onChange={(e) => handleUpdate('horizontalOffset', parseInt(e.target.value) || 0)}
            addon="px"
            min={0}
            max={100}
          />
        </div>
        <div>
          <div className="mb-2">
            <Label htmlFor="widget-vertical-offset">Vertical Offset</Label>
          </div>
          <TextInput
            id="widget-vertical-offset"
            type="number"
            value={currentVerticalOffset}
            onChange={(e) => handleUpdate('verticalOffset', parseInt(e.target.value) || 0)}
            addon="px"
            min={0}
            max={100}
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Distance from screen edges (0-100px)
      </p>

      {/* Custom CSS */}
      <div>
        <div className="mb-2">
          <Label htmlFor="widget-custom-css">Custom CSS (Advanced)</Label>
        </div>
        <Textarea
          id="widget-custom-css"
          rows={4}
          value={settings.customCSS || ''}
          onChange={(e) => handleUpdate('customCSS', e.target.value)}
          placeholder=".formbotz-widget-button { ... }"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Add custom CSS to further customize the widget appearance
        </p>
      </div>

      {/* Visual Preview */}
      <div>
        <div className="mb-2">
          <Label>Preview</Label>
        </div>
        <div className="relative h-48 overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
          <div
            className="absolute rounded-full shadow-lg"
            style={{
              width: `${Math.min(currentButtonSize * 0.3, 60)}px`,
              height: `${Math.min(currentButtonSize * 0.3, 60)}px`,
              backgroundColor: currentButtonColor,
              ...(currentPosition.includes('bottom') ? { bottom: `${Math.min(currentVerticalOffset * 0.5, 20)}px` } : { top: `${Math.min(currentVerticalOffset * 0.5, 20)}px` }),
              ...(currentPosition.includes('right') ? { right: `${Math.min(currentHorizontalOffset * 0.5, 20)}px` } : { left: `${Math.min(currentHorizontalOffset * 0.5, 20)}px` }),
            }}
          >
            <Image
              src="/formbotz-star.png"
              alt="Widget button"
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
            Button position preview
          </div>
        </div>
      </div>
    </div>
  );
}
