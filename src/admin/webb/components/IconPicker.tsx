import { Home, Heart, Star, Crown, Moon, TrendingUp, Users, Lightbulb, Coffee, Zap, Sparkles, Sun, Cloud, Smile, Frown, Meh, ThumbsUp, X } from 'lucide-react';

const ICONS = [
  { key: 'home', icon: Home, label: 'Hem' },
  { key: 'heart', icon: Heart, label: 'Hjärta' },
  { key: 'star', icon: Star, label: 'Stjärna' },
  { key: 'crown', icon: Crown, label: 'Krona' },
  { key: 'moon', icon: Moon, label: 'Måne' },
  { key: 'trending-up', icon: TrendingUp, label: 'Uppåt' },
  { key: 'users', icon: Users, label: 'Användare' },
  { key: 'lightbulb', icon: Lightbulb, label: 'Lampa' },
  { key: 'coffee', icon: Coffee, label: 'Kaffe' },
  { key: 'zap', icon: Zap, label: 'Energi' },
  { key: 'sparkles', icon: Sparkles, label: 'Gnistor' },
  { key: 'sun', icon: Sun, label: 'Sol' },
  { key: 'cloud', icon: Cloud, label: 'Moln' },
  { key: 'smile', icon: Smile, label: 'Glad' },
  { key: 'frown', icon: Frown, label: 'Ledsen' },
  { key: 'meh', icon: Meh, label: 'Meh' },
  { key: 'thumbs-up', icon: ThumbsUp, label: 'Tumme upp' }
];

interface IconPickerProps {
  label: string;
  value: string;
  onChange: (iconKey: string) => void;
}

export default function IconPicker({ label, value, onChange }: IconPickerProps) {
  const selectedIcon = ICONS.find(i => i.key === value);
  const SelectedIconComponent = selectedIcon?.icon;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <div className="mb-2 p-3 border border-gray-300 rounded-lg flex items-center gap-2">
        {SelectedIconComponent ? (
          <>
            <SelectedIconComponent className="w-6 h-6 text-gray-700" />
            <span className="text-sm text-gray-700">{selectedIcon.label}</span>
          </>
        ) : (
          <span className="text-sm text-gray-500">Ingen ikon vald</span>
        )}
      </div>

      <div className="grid grid-cols-6 gap-2 p-3 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
        {ICONS.map(({ key, icon: Icon, label: iconLabel }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all hover:bg-gray-100 ${
              value === key ? 'bg-[#56c5c5] text-white hover:bg-[#45b4b4]' : 'bg-white'
            }`}
            title={iconLabel}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  );
}

export { ICONS };
