import { CTAButton } from '../../../lib/types/landingPage';

interface CTAButtonEditorProps {
  label: string;
  value: CTAButton;
  onChange: (value: CTAButton) => void;
}

const COLOR_PRESETS = [
  { value: '#a1c798', label: 'Mintgrön' },
  { value: '#f6f2e0', label: 'Beige' },
  { value: '#56c5c5', label: 'Turkos' },
  { value: '#000000', label: 'Svart' },
  { value: '#ffffff', label: 'Vit' }
];

export default function CTAButtonEditor({ label, value, onChange }: CTAButtonEditorProps) {
  const updateField = (field: keyof CTAButton, newValue: string) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <label className="block text-sm font-semibold text-gray-900">{label}</label>

      {/* Button Text */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Knapptext</label>
        <input
          type="text"
          value={value.text}
          onChange={(e) => updateField('text', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
          placeholder="T.ex. Kom igång"
        />
      </div>

      {/* Link */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Länk</label>
        <input
          type="text"
          value={value.link}
          onChange={(e) => updateField('link', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
          placeholder="/login eller https://..."
        />
      </div>

      {/* Background Color */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Bakgrundsfärg</label>
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => updateField('color', preset.value)}
                className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                  value.color === preset.value ? 'border-gray-900 ring-2 ring-gray-400' : 'border-gray-300'
                }`}
                style={{ backgroundColor: preset.value }}
                title={preset.label}
              />
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={value.color || '#56c5c5'}
              onChange={(e) => updateField('color', e.target.value)}
              className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={value.color}
              onChange={(e) => updateField('color', e.target.value)}
              placeholder="#56c5c5"
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#a1c798]"
            />
          </div>
        </div>
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Textfärg</label>
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => updateField('text_color', preset.value)}
                className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                  value.text_color === preset.value ? 'border-gray-900 ring-2 ring-gray-400' : 'border-gray-300'
                }`}
                style={{ backgroundColor: preset.value }}
                title={preset.label}
              />
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={value.text_color || '#ffffff'}
              onChange={(e) => updateField('text_color', e.target.value)}
              className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={value.text_color || ''}
              onChange={(e) => updateField('text_color', e.target.value)}
              placeholder="#ffffff"
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#a1c798]"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Förhandsgranskning</label>
        <button
          type="button"
          className="px-6 py-3 rounded-lg font-medium text-sm transition-all hover:opacity-90"
          style={{
            backgroundColor: value.color,
            color: value.text_color || '#ffffff'
          }}
        >
          {value.text || 'Knapptext'}
        </button>
      </div>
    </div>
  );
}
