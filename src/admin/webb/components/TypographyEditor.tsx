import { TextStyle } from '../../../lib/types/landingPage';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TypographyEditorProps {
  label: string;
  value: TextStyle;
  onChange: (value: TextStyle) => void;
  multiline?: boolean;
}

const COLOR_PRESETS = [
  { value: '#a1c798', label: 'Mintgrön' },
  { value: '#f6f2e0', label: 'Beige' },
  { value: '#56c5c5', label: 'Turkos' },
  { value: '#000000', label: 'Svart' },
  { value: '#ffffff', label: 'Vit' }
];

export default function TypographyEditor({ label, value, onChange, multiline = false }: TypographyEditorProps) {
  const updateField = (field: keyof TextStyle, newValue: any) => {
    onChange({ ...value, [field]: newValue });
  };

  const toggleStyle = (style: 'bold' | 'italic' | 'underline') => {
    updateField('style', value.style === style ? 'normal' : style);
  };

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
      <label className="block text-sm font-semibold text-gray-900">{label}</label>

      {/* Text Input */}
      {multiline ? (
        <textarea
          value={value.text}
          onChange={(e) => updateField('text', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
          placeholder="Skriv text..."
        />
      ) : (
        <input
          type="text"
          value={value.text}
          onChange={(e) => updateField('text', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
          placeholder="Skriv text..."
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Font */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Typsnitt</label>
          <select
            value={value.font}
            onChange={(e) => updateField('font', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] text-sm"
          >
            <option value="Poppins">Poppins</option>
            <option value="Lobster">Lobster</option>
          </select>
        </div>

        {/* Size */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Storlek</label>
          <select
            value={value.size}
            onChange={(e) => updateField('size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] text-sm"
          >
            <option value="xs">XS</option>
            <option value="s">S</option>
            <option value="m">M</option>
            <option value="l">L</option>
            <option value="xl">XL</option>
          </select>
        </div>
      </div>

      {/* Style Buttons */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Stil</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => toggleStyle('bold')}
            className={`p-2 rounded border transition-colors ${
              value.style === 'bold'
                ? 'bg-[#a1c798] text-white border-[#a1c798]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title="Fet"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleStyle('italic')}
            className={`p-2 rounded border transition-colors ${
              value.style === 'italic'
                ? 'bg-[#a1c798] text-white border-[#a1c798]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title="Kursiv"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleStyle('underline')}
            className={`p-2 rounded border transition-colors ${
              value.style === 'underline'
                ? 'bg-[#a1c798] text-white border-[#a1c798]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title="Understruken"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Justering</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => updateField('alignment', 'left')}
            className={`p-2 rounded border transition-colors ${
              value.alignment === 'left'
                ? 'bg-[#a1c798] text-white border-[#a1c798]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title="Vänster"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => updateField('alignment', 'center')}
            className={`p-2 rounded border transition-colors ${
              value.alignment === 'center'
                ? 'bg-[#a1c798] text-white border-[#a1c798]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title="Centrerad"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => updateField('alignment', 'right')}
            className={`p-2 rounded border transition-colors ${
              value.alignment === 'right'
                ? 'bg-[#a1c798] text-white border-[#a1c798]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title="Höger"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Textfärg</label>
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
              value={value.color || '#000000'}
              onChange={(e) => updateField('color', e.target.value)}
              className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={value.color}
              onChange={(e) => updateField('color', e.target.value)}
              placeholder="#000000"
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#a1c798]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
