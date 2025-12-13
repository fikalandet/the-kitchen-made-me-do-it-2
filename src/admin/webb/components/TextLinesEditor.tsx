import { TextLines } from '../../../lib/types/landingPage';
import { Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';

interface TextLinesEditorProps {
  label: string;
  value: TextLines;
  onChange: (value: TextLines) => void;
}

const DEFAULT_TEXT_LINES: TextLines = {
  lines: [],
  rotate: false,
  interval_seconds: 10,
  placement: 'after_heading'
};

export default function TextLinesEditor({ label, value, onChange }: TextLinesEditorProps) {
  const textLines = value || DEFAULT_TEXT_LINES;

  const updateField = (field: keyof TextLines, newValue: any) => {
    onChange({ ...textLines, [field]: newValue });
  };

  const addLine = () => {
    const newLines = [...textLines.lines, ''];
    onChange({ ...textLines, lines: newLines });
  };

  const removeLine = (index: number) => {
    const newLines = textLines.lines.filter((_, i) => i !== index);
    onChange({ ...textLines, lines: newLines });
  };

  const updateLine = (index: number, text: string) => {
    const newLines = [...textLines.lines];
    newLines[index] = text;
    onChange({ ...textLines, lines: newLines });
  };

  const moveLine = (index: number, direction: 'up' | 'down') => {
    const newLines = [...textLines.lines];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newLines.length) return;

    [newLines[index], newLines[newIndex]] = [newLines[newIndex], newLines[index]];
    onChange({ ...textLines, lines: newLines });
  };

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <label className="block text-sm font-semibold text-gray-900">{label}</label>

      <div className="space-y-3">
        {/* Rotation Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rotate"
            checked={textLines.rotate}
            onChange={(e) => updateField('rotate', e.target.checked)}
            className="w-4 h-4 text-[#a1c798] rounded focus:ring-[#a1c798]"
          />
          <label htmlFor="rotate" className="text-sm font-medium text-gray-700">
            Rotera textrader
          </label>
        </div>

        {textLines.rotate && (
          <>
            {/* Interval */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Rotationsintervall
              </label>
              <select
                value={textLines.interval_seconds}
                onChange={(e) => updateField('interval_seconds', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] text-sm"
              >
                <option value={5}>5 sekunder</option>
                <option value={10}>10 sekunder</option>
                <option value={30}>30 sekunder</option>
                <option value={60}>1 minut</option>
                <option value={300}>5 minuter</option>
                <option value={86400}>1 gång per dag</option>
                <option value={604800}>1 gång per vecka</option>
              </select>
            </div>

            {/* Placement */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Placering
              </label>
              <select
                value={textLines.placement}
                onChange={(e) => updateField('placement', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] text-sm"
              >
                <option value="after_heading">Direkt efter rubrik</option>
                <option value="below_heading">Under rubrik</option>
              </select>
            </div>
          </>
        )}

        {/* Lines */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-700">
              Textrader ({textLines.lines.length})
            </label>
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1 px-2 py-1 bg-[#56c5c5] text-white text-xs rounded hover:bg-[#45b4b4] transition-colors"
            >
              <Plus className="w-3 h-3" />
              Lägg till rad
            </button>
          </div>

          <div className="space-y-2">
            {textLines.lines.map((line, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveLine(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    title="Flytta upp"
                  >
                    <MoveUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLine(index, 'down')}
                    disabled={index === textLines.lines.length - 1}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    title="Flytta ner"
                  >
                    <MoveDown className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={line}
                  onChange={(e) => updateLine(index, e.target.value)}
                  placeholder={`Rad ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#a1c798]"
                />
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                  title="Ta bort"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {textLines.lines.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                <p>Inga textrader ännu. Klicka på "Lägg till rad" för att börja.</p>
              </div>
            )}
          </div>
        </div>

        {textLines.rotate && textLines.lines.length > 0 && (
          <div className="text-xs text-gray-600 italic">
            <p>
              {textLines.lines.length} {textLines.lines.length === 1 ? 'rad' : 'rader'} kommer att roteras var{' '}
              {textLines.interval_seconds < 60
                ? `${textLines.interval_seconds} sekund${textLines.interval_seconds !== 1 ? 'er' : ''}`
                : textLines.interval_seconds === 60
                ? '1 minut'
                : textLines.interval_seconds === 300
                ? '5 minuter'
                : textLines.interval_seconds === 86400
                ? 'dag'
                : 'vecka'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
