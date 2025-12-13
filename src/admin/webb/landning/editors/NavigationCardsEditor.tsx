import { useState } from 'react';
import { NavigationCardsContent, NavigationCard, TextStyle } from '../../../../lib/types/landingPage';
import TypographyEditor from '../../components/TypographyEditor';
import IconPicker from '../../components/IconPicker';
import { ChevronDown, ChevronUp, Plus, Trash2, MoveUp, MoveDown, Upload, Image as ImageIcon } from 'lucide-react';

interface NavigationCardsEditorProps {
  content: NavigationCardsContent;
  onChange: (content: NavigationCardsContent) => void;
}

const COLOR_PRESETS = [
  { value: '#a1c798', label: 'Mintgrön' },
  { value: '#f6f2e0', label: 'Beige' },
  { value: '#56c5c5', label: 'Turkos' },
  { value: '#000000', label: 'Svart' },
  { value: '#ffffff', label: 'Vit' }
];

const DEFAULT_TEXT_STYLE: TextStyle = {
  text: '',
  font: 'Poppins',
  style: 'normal',
  size: 'm',
  alignment: 'center',
  color: '#000000'
};

const DEFAULT_CARD: NavigationCard = {
  title: { ...DEFAULT_TEXT_STYLE, text: 'Nytt kort', size: 'l' },
  subtitle: { ...DEFAULT_TEXT_STYLE, text: '', size: 's' },
  icon: 'Circle',
  background_color: '#f6f2e0',
  text_color: '#000000',
  use_image_cover: false,
  target_section: ''
};

export default function NavigationCardsEditor({ content, onChange }: NavigationCardsEditorProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const updateCard = (index: number, card: NavigationCard) => {
    const newCards = [...(content.cards || [])];
    newCards[index] = card;
    onChange({ ...content, cards: newCards });
  };

  const addCard = () => {
    const newCards = [...(content.cards || []), DEFAULT_CARD];
    onChange({ ...content, cards: newCards });
    setExpandedCard(newCards.length - 1);
  };

  const removeCard = (index: number) => {
    const newCards = (content.cards || []).filter((_, i) => i !== index);
    onChange({ ...content, cards: newCards });
    if (expandedCard === index) setExpandedCard(null);
  };

  const moveCard = (index: number, direction: 'up' | 'down') => {
    const newCards = [...(content.cards || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newCards.length) return;

    [newCards[index], newCards[newIndex]] = [newCards[newIndex], newCards[index]];
    onChange({ ...content, cards: newCards });
  };

  const cards = content.cards || [];

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Navigeringskort som länkar till olika sektioner på sidan
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-900">
            Kort ({cards.length})
          </label>
          <button
            type="button"
            onClick={addCard}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#a1c798] text-white text-sm rounded-lg hover:bg-[#8fb386] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lägg till kort
          </button>
        </div>

        <div className="space-y-2">
          {cards.map((card, index) => (
            <div key={index} className="border border-gray-200 rounded-lg bg-gray-50">
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{card.title?.text || 'Tomt kort'}</div>
                    {card.subtitle?.text && (
                      <div className="text-sm text-gray-600">{card.subtitle.text}</div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-3">
                    <button
                      type="button"
                      onClick={() => moveCard(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      title="Flytta upp"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCard(index, 'down')}
                      disabled={index === cards.length - 1}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      title="Flytta ner"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                      className="p-1.5 text-[#a1c798] hover:text-[#8fb386]"
                      title="Redigera"
                    >
                      {expandedCard === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCard(index)}
                      className="p-1.5 text-red-600 hover:text-red-800"
                      title="Ta bort"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedCard === index && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <TypographyEditor
                      label="Rubrik"
                      value={card.title}
                      onChange={(title) => updateCard(index, { ...card, title })}
                    />

                    <TypographyEditor
                      label="Underrad (valfri)"
                      value={card.subtitle || { ...DEFAULT_TEXT_STYLE, text: '' }}
                      onChange={(subtitle) => updateCard(index, { ...card, subtitle })}
                    />

                    {/* Icon or Image */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Ikon eller Bild</label>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ikon</label>
                        <IconPicker
                          value={card.icon || 'Circle'}
                          onChange={(icon) => updateCard(index, { ...card, icon })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Eller Bild-URL</label>
                        <input
                          type="text"
                          value={card.image || ''}
                          onChange={(e) => updateCard(index, { ...card, image: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                        />
                        <p className="text-xs text-gray-500 mt-1">Om bild anges, används den istället för ikon</p>
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Bakgrundsfärg</label>
                        <div className="space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            {COLOR_PRESETS.map((preset) => (
                              <button
                                key={preset.value}
                                type="button"
                                onClick={() => updateCard(index, { ...card, background_color: preset.value })}
                                className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                                  card.background_color === preset.value ? 'border-gray-900 ring-2 ring-gray-400' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: preset.value }}
                                title={preset.label}
                              />
                            ))}
                          </div>
                          <input
                            type="color"
                            value={card.background_color || '#f6f2e0'}
                            onChange={(e) => updateCard(index, { ...card, background_color: e.target.value })}
                            className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Textfärg</label>
                        <div className="space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            {COLOR_PRESETS.map((preset) => (
                              <button
                                key={preset.value}
                                type="button"
                                onClick={() => updateCard(index, { ...card, text_color: preset.value })}
                                className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                                  card.text_color === preset.value ? 'border-gray-900 ring-2 ring-gray-400' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: preset.value }}
                                title={preset.label}
                              />
                            ))}
                          </div>
                          <input
                            type="color"
                            value={card.text_color || '#000000'}
                            onChange={(e) => updateCard(index, { ...card, text_color: e.target.value })}
                            className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Cover Option */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          id={`cover-${index}`}
                          checked={card.use_image_cover || false}
                          onChange={(e) => updateCard(index, { ...card, use_image_cover: e.target.checked })}
                          className="w-4 h-4 text-[#a1c798] rounded focus:ring-[#a1c798]"
                        />
                        <label htmlFor={`cover-${index}`} className="text-sm font-medium text-gray-700">
                          Täck kortet med bild
                        </label>
                      </div>

                      {card.use_image_cover && (
                        <div className="space-y-3 mt-3 pt-3 border-t border-gray-200">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Bild-URL</label>
                            <input
                              type="text"
                              value={card.cover_image || ''}
                              onChange={(e) => updateCard(index, { ...card, cover_image: e.target.value })}
                              placeholder="https://..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Overlay-färg</label>
                            <input
                              type="color"
                              value={card.overlay_color || '#000000'}
                              onChange={(e) => updateCard(index, { ...card, overlay_color: e.target.value })}
                              className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Overlay-opacitet ({Math.round((card.overlay_opacity || 0.3) * 100)}%)
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={card.overlay_opacity || 0.3}
                              onChange={(e) => updateCard(index, { ...card, overlay_opacity: parseFloat(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Target Section */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Länk till sektion (ankar-id)</label>
                      <input
                        type="text"
                        value={card.target_section}
                        onChange={(e) => updateCard(index, { ...card, target_section: e.target.value })}
                        placeholder="t.ex. #sa-funkar-det"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                      />
                      <p className="text-xs text-gray-500 mt-1">Ange ankar-id för sektionen som kortet ska scrolla till</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {cards.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Inga kort ännu. Klicka på "Lägg till kort" för att börja.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
