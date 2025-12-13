import { useState } from 'react';
import { FAQContent, FAQItem, TextStyle } from '../../../../lib/types/landingPage';
import TypographyEditor from '../../components/TypographyEditor';
import { ChevronDown, ChevronUp, Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';

interface FAQEditorProps {
  content: FAQContent;
  onChange: (content: FAQContent) => void;
}

const DEFAULT_TEXT_STYLE: TextStyle = {
  text: '',
  font: 'Poppins',
  style: 'normal',
  size: 'm',
  alignment: 'center',
  color: '#000000'
};

const DEFAULT_FAQ_ITEM: FAQItem = {
  question: 'Ny fråga',
  answer: 'Svar på frågan'
};

export default function FAQEditor({ content, onChange }: FAQEditorProps) {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const updateHeading = (heading: TextStyle) => {
    onChange({ ...content, heading });
  };

  const updateQuestion = (index: number, item: FAQItem) => {
    const newQuestions = [...(content.questions || [])];
    newQuestions[index] = item;
    onChange({ ...content, questions: newQuestions });
  };

  const addQuestion = () => {
    const newQuestions = [...(content.questions || []), DEFAULT_FAQ_ITEM];
    onChange({ ...content, questions: newQuestions });
    setExpandedItem(newQuestions.length - 1);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = (content.questions || []).filter((_, i) => i !== index);
    onChange({ ...content, questions: newQuestions });
    if (expandedItem === index) setExpandedItem(null);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...(content.questions || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newQuestions.length) return;

    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    onChange({ ...content, questions: newQuestions });
  };

  const heading = content.heading || { ...DEFAULT_TEXT_STYLE, text: 'Vanliga frågor', size: 'l', font: 'Lobster' };
  const questions = content.questions || [];

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        FAQ-sektion med vanliga frågor och svar som visas i ett accordion-format
      </div>

      <TypographyEditor
        label="Rubrik"
        value={heading}
        onChange={updateHeading}
      />

      {/* FAQ Overview */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-900">
            Frågor ({questions.length})
          </label>
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#a1c798] text-white text-sm rounded-lg hover:bg-[#8fb386] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lägg till fråga
          </button>
        </div>

        <div className="space-y-2">
          {questions.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg bg-gray-50">
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.question}</div>
                    <div className="text-sm text-gray-600 truncate mt-1">{item.answer}</div>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      title="Flytta upp"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, 'down')}
                      disabled={index === questions.length - 1}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      title="Flytta ner"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                      className="p-1.5 text-[#a1c798] hover:text-[#8fb386]"
                      title="Redigera"
                    >
                      {expandedItem === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="p-1.5 text-red-600 hover:text-red-800"
                      title="Ta bort"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedItem === index && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Fråga</label>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => updateQuestion(index, { ...item, question: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Svar</label>
                      <textarea
                        value={item.answer}
                        onChange={(e) => updateQuestion(index, { ...item, answer: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Inga frågor ännu. Klicka på "Lägg till fråga" för att börja.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
