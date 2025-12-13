import { useState } from 'react';
import { BenefitsContent, BenefitCategory, BenefitCard, TextStyle } from '../../../../lib/types/landingPage';
import TypographyEditor from '../../components/TypographyEditor';
import IconPicker from '../../components/IconPicker';
import { ImageUpload } from '../../../components/ImageUpload';
import ColorPicker from '../../components/ColorPicker';
import { ChevronDown, ChevronUp, Plus, Trash2, MoveUp, MoveDown, Edit2, X } from 'lucide-react';

interface BenefitsEditorProps {
  content: BenefitsContent;
  onChange: (content: BenefitsContent) => void;
}

const DEFAULT_TEXT_STYLE: TextStyle = {
  text: '',
  font: 'Poppins',
  style: 'normal',
  size: 'm',
  alignment: 'center',
  color: '#000000'
};

const DEFAULT_CARD: BenefitCard = {
  icon: 'Circle',
  title: { ...DEFAULT_TEXT_STYLE, text: 'Nytt kort', style: 'bold', size: 'm' },
  text: { ...DEFAULT_TEXT_STYLE, text: 'Beskrivning', size: 's' }
};

const DEFAULT_CATEGORY: BenefitCategory = {
  name: { ...DEFAULT_TEXT_STYLE, text: 'Ny kategori', size: 'l', style: 'bold' },
  intro: { ...DEFAULT_TEXT_STYLE, text: '', size: 's' },
  background_color: '#f6f2e0',
  cards: []
};

export default function BenefitsEditor({ content, onChange }: BenefitsEditorProps) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [editingCard, setEditingCard] = useState<{ categoryIndex: number; cardIndex: number } | null>(null);

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
    if ((content.categories || []).length >= 10) {
      alert('Du kan ha max 10 kategorier');
      return;
    }
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
  };

  const removeCard = (categoryIndex: number, cardIndex: number) => {
    const newCategories = [...(content.categories || [])];
    const newCards = newCategories[categoryIndex].cards.filter((_, i) => i !== cardIndex);
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], cards: newCards };
    onChange({ ...content, categories: newCategories });
    if (editingCard?.categoryIndex === categoryIndex && editingCard?.cardIndex === cardIndex) {
      setEditingCard(null);
    }
  };

  const categories = content.categories || [];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">A. Bakgrund</h3>
        <ColorPicker
          label="Bakgrundsfärg för hela sektionen"
          value={content.section_id || '#ffffff'}
          onChange={(color) => onChange({ ...content, section_id: color })}
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">B. Huvudrubrik</h3>
        <TypographyEditor
          label="Rubrik"
          value={content.heading || { ...DEFAULT_TEXT_STYLE, text: '', size: 'xl' }}
          onChange={updateHeading}
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">C. Textrad (under rubrik)</h3>
        <TypographyEditor
          label="Ingress/beskrivning"
          value={content.intro || { ...DEFAULT_TEXT_STYLE, text: '' }}
          onChange={updateIntro}
          multiline
        />
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">D. Kategorier ({categories.length}/10)</h3>
          <button
            type="button"
            onClick={addCategory}
            disabled={categories.length >= 10}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#a1c798] text-white text-sm rounded-lg hover:bg-[#8fb386] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Lägg till kategori
          </button>
        </div>

        <div className="space-y-3">
          {categories.map((category, catIndex) => (
            <div
              key={catIndex}
              className="border-2 border-purple-300 rounded-lg overflow-hidden"
              style={{ backgroundColor: '#e9d5ff' }}
            >
              <div
                className="p-4 flex items-center justify-between"
                style={{ backgroundColor: category.background_color || '#f3e8ff' }}
              >
                <div className="flex-1">
                  <div className="font-bold text-purple-900">
                    Kategori: {category.name?.text || 'Tom kategori'}
                  </div>
                  <div className="text-sm text-purple-700 mt-1">
                    {category.cards.length} kort
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveCategory(catIndex, 'up')}
                    disabled={catIndex === 0}
                    className="p-1.5 text-purple-600 hover:text-purple-900 disabled:opacity-30"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCategory(catIndex, 'down')}
                    disabled={catIndex === categories.length - 1}
                    className="p-1.5 text-purple-600 hover:text-purple-900 disabled:opacity-30"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedCategory(expandedCategory === catIndex ? null : catIndex)}
                    className="p-1.5 text-purple-600 hover:text-purple-900"
                  >
                    {expandedCategory === catIndex ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCategory(catIndex)}
                    className="p-1.5 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expandedCategory === catIndex && (
                <div className="p-4 space-y-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <TypographyEditor
                      label="Kategori-rubrik"
                      value={category.name}
                      onChange={(name) => updateCategory(catIndex, { ...category, name })}
                    />
                    <ColorPicker
                      label="Bakgrundsfärg"
                      value={category.background_color || '#f6f2e0'}
                      onChange={(color) => updateCategory(catIndex, { ...category, background_color: color })}
                    />
                  </div>

                  <TypographyEditor
                    label="Kategori-intro (valfri)"
                    value={category.intro || { ...DEFAULT_TEXT_STYLE, text: '' }}
                    onChange={(intro) => updateCategory(catIndex, { ...category, intro })}
                    multiline
                  />

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">E. Kort i denna kategori</h4>
                      <button
                        type="button"
                        onClick={() => addCard(catIndex)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#56c5c5] text-white text-sm rounded-lg hover:bg-[#4ab3b3] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Lägg till kort
                      </button>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {category.cards.map((card, cardIndex) => (
                        <button
                          key={cardIndex}
                          type="button"
                          onClick={() => setEditingCard({ categoryIndex: catIndex, cardIndex })}
                          className={`relative p-3 rounded-lg border-2 text-center hover:shadow-md transition-all ${
                            editingCard?.categoryIndex === catIndex && editingCard?.cardIndex === cardIndex
                              ? 'border-[#56c5c5] bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{card.icon || '○'}</div>
                          <div className="text-xs font-semibold truncate">{card.title?.text || 'Tom'}</div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCard(catIndex, cardIndex);
                            }}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </button>
                      ))}
                    </div>

                    {editingCard?.categoryIndex === catIndex && editingCard.cardIndex !== undefined && (
                      <div className="mt-4 p-4 bg-gray-50 border-2 border-[#56c5c5] rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-900">
                            Redigera kort {editingCard.cardIndex + 1}
                          </h5>
                          <button
                            type="button"
                            onClick={() => setEditingCard(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-2">Ikon</label>
                              <IconPicker
                                value={category.cards[editingCard.cardIndex].icon || 'Circle'}
                                onChange={(icon) => updateCard(catIndex, editingCard.cardIndex, {
                                  ...category.cards[editingCard.cardIndex],
                                  icon
                                })}
                              />
                            </div>
                            <ImageUpload
                              label="Eller bild"
                              value={category.cards[editingCard.cardIndex].image}
                              onChange={(url) => updateCard(catIndex, editingCard.cardIndex, {
                                ...category.cards[editingCard.cardIndex],
                                image: url
                              })}
                            />
                          </div>

                          <TypographyEditor
                            label="Rubrik"
                            value={category.cards[editingCard.cardIndex].title}
                            onChange={(title) => updateCard(catIndex, editingCard.cardIndex, {
                              ...category.cards[editingCard.cardIndex],
                              title
                            })}
                          />

                          <TypographyEditor
                            label="Text"
                            value={category.cards[editingCard.cardIndex].text}
                            onChange={(text) => updateCard(catIndex, editingCard.cardIndex, {
                              ...category.cards[editingCard.cardIndex],
                              text
                            })}
                            multiline
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <ColorPicker
                              label="Bakgrundsfärg"
                              value={category.cards[editingCard.cardIndex].background_color || '#ffffff'}
                              onChange={(color) => updateCard(catIndex, editingCard.cardIndex, {
                                ...category.cards[editingCard.cardIndex],
                                background_color: color
                              })}
                            />
                            <ColorPicker
                              label="Textfärg"
                              value={category.cards[editingCard.cardIndex].text_color || '#000000'}
                              onChange={(color) => updateCard(catIndex, editingCard.cardIndex, {
                                ...category.cards[editingCard.cardIndex],
                                text_color: color
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
