import { useState } from 'react';
import { StepsContent, Step, TextStyle } from '../../../../lib/types/landingPage';
import TypographyEditor from '../../components/TypographyEditor';
import { ChevronDown, ChevronUp, Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';
import IconPicker from '../../components/IconPicker';

interface StepsEditorProps {
  content: StepsContent;
  onChange: (content: StepsContent) => void;
}

const DEFAULT_TEXT_STYLE: TextStyle = {
  text: '',
  font: 'Poppins',
  style: 'normal',
  size: 'm',
  alignment: 'center',
  color: '#000000'
};

const DEFAULT_STEP: Step = {
  icon: 'Circle',
  title: 'Nytt steg',
  text: 'Beskrivning av steget'
};

export default function StepsEditor({ content, onChange }: StepsEditorProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const updateHeading = (heading: TextStyle) => {
    onChange({ ...content, heading });
  };

  const updateStep = (index: number, step: Step) => {
    const newSteps = [...(content.steps || [])];
    newSteps[index] = step;
    onChange({ ...content, steps: newSteps });
  };

  const addStep = () => {
    const newSteps = [...(content.steps || []), DEFAULT_STEP];
    onChange({ ...content, steps: newSteps });
    setExpandedStep(newSteps.length - 1);
  };

  const removeStep = (index: number) => {
    const newSteps = (content.steps || []).filter((_, i) => i !== index);
    onChange({ ...content, steps: newSteps });
    if (expandedStep === index) setExpandedStep(null);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...(content.steps || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSteps.length) return;

    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    onChange({ ...content, steps: newSteps });
  };

  const heading = content.heading || { ...DEFAULT_TEXT_STYLE, text: 'Så funkar det', size: 'l', font: 'Lobster' };
  const steps = content.steps || [];

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Steg-sektion visar en process eller guide i numrerade steg
      </div>

      <TypographyEditor
        label="Rubrik"
        value={heading}
        onChange={updateHeading}
      />

      {/* Steps Overview */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-900">
            Steg ({steps.length})
          </label>
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#a1c798] text-white text-sm rounded-lg hover:bg-[#8fb386] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lägg till steg
          </button>
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="border border-gray-200 rounded-lg bg-gray-50">
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#a1c798] text-white text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{step.title}</div>
                      <div className="text-sm text-gray-600 truncate">{step.text}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveStep(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      title="Flytta upp"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(index, 'down')}
                      disabled={index === steps.length - 1}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      title="Flytta ner"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                      className="p-1.5 text-[#a1c798] hover:text-[#8fb386]"
                      title="Redigera"
                    >
                      {expandedStep === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-1.5 text-red-600 hover:text-red-800"
                      title="Ta bort"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedStep === index && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Ikon</label>
                      <IconPicker
                        value={step.icon}
                        onChange={(icon) => updateStep(index, { ...step, icon })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Titel</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateStep(index, { ...step, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Text</label>
                      <textarea
                        value={step.text}
                        onChange={(e) => updateStep(index, { ...step, text: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {steps.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Inga steg ännu. Klicka på "Lägg till steg" för att börja.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
