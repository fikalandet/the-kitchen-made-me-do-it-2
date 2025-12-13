import { useState } from 'react';
import { BenefitsContent, BenefitCategory, BenefitCard, TextStyle } from '../../../../lib/types/landingPage';
import TypographyEditor from '../../components/TypographyEditor';
import IconPicker from '../../components/IconPicker';
import { ImageUpload } from '../../../components/ImageUpload';
import { ChevronDown, ChevronUp, Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';

interface BenefitsEditorProps {
  content: BenefitsContent;
  onChange: (content: BenefitsContent) => void;
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
  alignment: 'left',
  color: '#000000'
};

const DEFAULT_CARD: BenefitCard = {
  icon: 'Circle',
  title: { ...DEFAULT_TEXT_STYLE, text: 'Nytt kort', style: 'bold' },
  text: { ...DEFAULT_TEXT_STYLE, text: 'Beskrivning' }
};

const DEFAULT_CATEGORY: BenefitCategory = {
  name: { ...DEFAULT_TEXT_STYLE, text: 'Ny kategori', size: 'l', style: 'bold' },
  intro: { ...DEFAULT_TEXT_STYLE, text: '' },
  cards: []
};

export default function BenefitsEditor({ content, onChange }: BenefitsEditorProps) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<{ categoryIndex: number; cardIndex: number } | null>(null);

  const updateHeading = (heading: TextStyle) => {
    onChange({ ...content, heading });
  };

  const updateIntro = (intro: TextStyle) => {
    onChange({ ...content, intro });
  };

  const updateCategory = (index: number, category: BenefitCategory) => {
    const newCategories = [...(content.categories || [])];
    newCategories[index] = category;
    onChange({ ...content, categories: newCategories });
  };

  const addCategory = () => {
    const newCategories = [...(content.categories || []), DEFAULT_CATEGORY];
    onChange({ ...content, categories: newCategories });
    setExpandedCategory(newCategories.length - 1);
  };

  const removeCategory = (index: number) => {
    const newCategories = (content.categories || []).filter((_, i) => i !== index);
    onChange({ ...content, categories: newCategories });
    if (expandedCategory === index) setExpandedCategory(null);
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newCategories = [...(content.categories || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newCategories.length) return;

    [newCategories[index], newCategories[newIndex]] = [newCategories[newIndex], newCategories[index]];
    onChange({ ...content, categories: newCategories });
  };

  const updateCard = (categoryIndex: number, cardIndex: number, card: BenefitCard) => {
    const newCategories = [...(content.categories || [])];
    const newCards = [...newCategories[categoryIndex].cards];
    newCards[cardIndex] = card;
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], cards: newCards };
    onChange({ ...content, categories: newCategories });
  };

  const addCard = (categoryIndex: number) => {
    const newCategories = [...(content.categories || [])];
    const newCards = [...newCategories[categoryIndex].cards, DEFAULT_CARD];
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], cards: newCards };
    onChange({ ...content, categories: newCategories });
    setExpandedCard({ categoryIndex, cardIndex: newCards.length - 1 });
  };

  const removeCard = (categoryIndex: number, cardIndex: number) => {
    const newCategories = [...(content.categories || [])];
    const newCards = newCategories[categoryIndex].cards.filter((_, i) => i !== cardIndex);
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], cards: newCards };
    onChange({ ...content, categories: newCategories });
    if (expandedCard?.categoryIndex === categoryIndex && expandedCard?.cardIndex === cardIndex) {
      setExpandedCard(null);
    }
  };

  const moveCard = (categoryIndex: number, cardIndex: number, direction: 'up' | 'down') => {
    const newCategories = [...(content.categories || [])];
    const newCards = [...newCategories[categoryIndex].cards];
    const newIndex = direction === 'up' ? cardIndex - 1 : cardIndex + 1;
    if (newIndex < 0 || newIndex >= newCards.length) return;

    [newCards[cardIndex], newCards[newIndex]] = [newCards[newIndex], newCards[cardIndex]];
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], cards: newCards };
    onChange({ ...content, categories: newCategories });
  };

  const heading = content.heading || { ...DEFAULT_TEXT_STYLE, text: 'Fördelar', size: 'xl', alignment: 'center' };
  const intro = content.intro || { ...DEFAULT_TEXT_STYLE, text: '' };
  const categories = content.categories || [];

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Fördelar organiserade i kategorier, varje kategori innehåller flera fördels-kort
      </div>

      <TypographyEditor
        label="Rubrik"
        value={heading}
        onChange={updateHeading}
      />

      <TypographyEditor
        label="Ingress (valfri)"
        value={intro}
        onChange={updateIntro}
        multiline
      />

      {/* Categories */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-900">
            Kategorier ({categories.length})
          </label>
          <button
            type="button"
            onClick={addCategory}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#a1c798] text-white text-sm rounded-lg hover:bg-[#8fb386] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lägg till kategori
          </button>
        </div>

        <div className="space-y-2">
          {categories.map((category, catIndex) => (
            <div key={catIndex} className="border border-gray-200 rounded-lg bg-gray-50">
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{category.name?.text || 'Tom kategori'}</div>
                    <div className="text-sm text-gray-600">
                      {category.cards.length} kort
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <button
                      type="button"
                      onClick={() => moveCategory(catIndex, 'up')}
                      disabled={catIndex === 0}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      title="Flytta upp"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCategory(catIndex, 'down')}
                      disabled={catIndex === categories.length - 1}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      title="Flytta ner"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedCategory(expandedCategory === catIndex ? null : catIndex)}
                      className="p-1.5 text-[#a1c798] hover:text-[#8fb386]"
                      title="Redigera"
                    >
                      {expandedCategory === catIndex ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCategory(catIndex)}
                      className="p-1.5 text-red-600 hover:text-red-800"
                      title="Ta bort"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedCategory === catIndex && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <TypographyEditor
                      label="Kategorinamn"
                      value={category.name}
                      onChange={(name) => updateCategory(catIndex, { ...category, name })}
                    />

                    <TypographyEditor
                      label="Kategori-ingress (valfri)"
                      value={category.intro || { ...DEFAULT_TEXT_STYLE, text: '' }}
                      onChange={(intro) => updateCategory(catIndex, { ...category, intro })}
                      multiline
                    />

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Bakgrundsfärg (valfri)</label>
                      <div className="flex gap-2 flex-wrap">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => updateCategory(catIndex, { ...category, background_color: preset.value })}
                            className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                              category.background_color === preset.value ? 'border-gray-900 ring-2 ring-gray-400' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: preset.value }}
                            title={preset.label}
                          />
                        ))}
                        <input
                          type="color"
                          value={category.background_color || '#ffffff'}
                          onChange={(e) => updateCategory(catIndex, { ...category, background_color: e.target.value })}
                          className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Cards within category */}
                    <div className="border-t border-gray-300 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-gray-900">
                          Fördels-kort ({category.cards.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => addCard(catIndex)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#56c5c5] text-white text-sm rounded-lg hover:bg-[#45b4b4] transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Lägg till kort
                        </button>
                      </div>

                      <div className="space-y-2">
                        {category.cards.map((card, cardIndex) => (
                          <div key={cardIndex} className="border border-gray-300 rounded-lg bg-white">
                            <div className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 text-sm">{card.title?.text || 'Tomt kort'}</div>
                                  <div className="text-xs text-gray-600 truncate">{card.text?.text || ''}</div>
                                </div>
                                <div className="flex gap-1 ml-3">
                                  <button
                                    type="button"
                                    onClick={() => moveCard(catIndex, cardIndex, 'up')}
                                    disabled={cardIndex === 0}
                                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                                    title="Flytta upp"
                                  >
                                    <MoveUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveCard(catIndex, cardIndex, 'down')}
                                    disabled={cardIndex === category.cards.length - 1}
                                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                                    title="Flytta ner"
                                  >
                                    <MoveDown className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedCard(
                                        expandedCard?.categoryIndex === catIndex && expandedCard?.cardIndex === cardIndex
                                          ? null
                                          : { categoryIndex: catIndex, cardIndex }
                                      )
                                    }
                                    className="p-1 text-[#56c5c5] hover:text-[#45b4b4]"
                                    title="Redigera"
                                  >
                                    {expandedCard?.categoryIndex === catIndex && expandedCard?.cardIndex === cardIndex ? (
                                      <ChevronUp className="w-3 h-3" />
                                    ) : (
                                      <ChevronDown className="w-3 h-3" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeCard(catIndex, cardIndex)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                    title="Ta bort"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {expandedCard?.categoryIndex === catIndex && expandedCard?.cardIndex === cardIndex && (
                                <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                                  <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-700">Ikon eller Bild</label>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Ikon</label>
                                      <IconPicker
                                        value={card.icon || 'Circle'}
                                        onChange={(icon) => updateCard(catIndex, cardIndex, { ...card, icon })}
                                      />
                                    </div>
                                    <div>
                                      <ImageUpload
                                        label="Eller ladda upp bild"
                                        value={card.image}
                                        onChange={(url) => updateCard(catIndex, cardIndex, { ...card, image: url })}
                                      />
                                    </div>
                                  </div>

                                  <TypographyEditor
                                    label="Rubrik"
                                    value={card.title}
                                    onChange={(title) => updateCard(catIndex, cardIndex, { ...card, title })}
                                  />

                                  <TypographyEditor
                                    label="Text"
                                    value={card.text}
                                    onChange={(text) => updateCard(catIndex, cardIndex, { ...card, text })}
                                    multiline
                                  />

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Kort-bakgrund</label>
                                      <input
                                        type="color"
                                        value={card.background_color || '#ffffff'}
                                        onChange={(e) => updateCard(catIndex, cardIndex, { ...card, background_color: e.target.value })}
                                        className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Textfärg</label>
                                      <input
                                        type="color"
                                        value={card.text_color || '#000000'}
                                        onChange={(e) => updateCard(catIndex, cardIndex, { ...card, text_color: e.target.value })}
                                        className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {category.cards.length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            <p>Inga kort i denna kategori. Klicka på "Lägg till kort" för att börja.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Inga kategorier ännu. Klicka på "Lägg till kategori" för att börja.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
