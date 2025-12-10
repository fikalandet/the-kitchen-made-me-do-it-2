import { useState } from 'react';
import { X } from 'lucide-react';

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
  label: string;
}

const EMOJI_CATEGORIES = {
  'Tävling & Priser': ['🏆', '🥇', '🥈', '🥉', '🎖️', '👑', '💎', '⭐', '✨', '🌟'],
  'Firande': ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍾', '🥳', '🪅', '🎆'],
  'Mat & Dryck': ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🍜', '🍱', '🍣', '🍰', '🧁', '🍪'],
  'Sport & Aktivitet': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎯', '🎲', '🎮', '🎪'],
  'Symboler': ['💫', '💥', '🔥', '💪', '👍', '❤️', '💚', '💙', '💜', '🧡'],
  'Ansikten': ['😀', '😍', '🤩', '😎', '🥰', '😋', '😊', '🙌', '👏', '🤝']
};

export default function EmojiPicker({ value, onChange, label }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Tävling & Priser');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left hover:border-gray-400 transition-colors flex items-center justify-between"
        >
          <span className="text-2xl">{value || 'Välj emoji'}</span>
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <div className="flex gap-2 mb-3 flex-wrap">
              {(Object.keys(EMOJI_CATEGORIES) as Array<keyof typeof EMOJI_CATEGORIES>).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#56c5c5] text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
              {EMOJI_CATEGORIES[selectedCategory].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onChange(emoji);
                    setIsOpen(false);
                  }}
                  className={`p-2 text-2xl rounded-lg hover:bg-gray-100 transition-all ${
                    value === emoji ? 'bg-[#a1c798] scale-110' : ''
                  } ${
                    emoji === '⭐' || emoji === '✨' || emoji === '🌟'
                      ? 'animate-pulse'
                      : ''
                  }`}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Tips: Stjärnor (⭐ ✨ 🌟) glimrar automatiskt!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
