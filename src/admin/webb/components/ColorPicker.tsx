import { useState, useEffect } from 'react';

interface ColorPreset {
  value: string;
  label: string;
}

interface ColorPickerProps {
  label: string;
  value: string | undefined;
  onChange: (color: string) => void;
  presets?: ColorPreset[];
}

const DEFAULT_PRESETS: ColorPreset[] = [
  { value: '#a1c798', label: 'Mintgrön' },
  { value: '#f6f2e0', label: 'Beige' },
  { value: '#56c5c5', label: 'Turkos' },
  { value: '#ffffff', label: 'Vit' },
  { value: '#000000', label: 'Svart' }
];

export default function ColorPicker({ label, value, onChange, presets }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value || '');
  const colorPresets = presets || DEFAULT_PRESETS;

  useEffect(() => {
    if (value) {
      setHexInput(value);
    }
  }, [value]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHexInput(newValue);

    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setHexInput(newValue);
  };

  const handlePresetClick = (color: string) => {
    onChange(color);
    setHexInput(color);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {colorPresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePresetClick(preset.value)}
              className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                value === preset.value ? 'border-gray-900 ring-2 ring-gray-400' : 'border-gray-300'
              }`}
              style={{ backgroundColor: preset.value }}
              title={preset.label}
            />
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <input
            type="color"
            value={value || '#ffffff'}
            onChange={handleColorChange}
            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
          />

          <input
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            placeholder="#000000"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
          />
        </div>

        {value && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: value }}
            />
            <span>Vald färg: {value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
