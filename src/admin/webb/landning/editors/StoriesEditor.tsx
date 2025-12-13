import { useState } from 'react';
import { StoriesContent, Story, TextStyle } from '../../../../lib/types/landingPage';
import TypographyEditor from '../../components/TypographyEditor';
import { ChevronDown, ChevronUp, Plus, Trash2, MoveUp, MoveDown, Upload } from 'lucide-react';

interface StoriesEditorProps {
  content: StoriesContent;
  onChange: (content: StoriesContent) => void;
}

const DEFAULT_TEXT_STYLE: TextStyle = {
  text: '',
  font: 'Poppins',
  style: 'normal',
  size: 'm',
  alignment: 'left',
  color: '#000000'
};

const DEFAULT_STORY: Story = {
  name: 'Namn',
  age: '',
  city: '',
  subtitle: { ...DEFAULT_TEXT_STYLE, text: '', size: 's', style: 'italic' },
  description: { ...DEFAULT_TEXT_STYLE, text: 'Min historia...' }
};

export default function StoriesEditor({ content, onChange }: StoriesEditorProps) {
  const [expandedStory, setExpandedStory] = useState<number | null>(null);

  const updateHeading = (heading: TextStyle) => {
    onChange({ ...content, heading });
  };

  const updateIntro = (intro: TextStyle) => {
    onChange({ ...content, intro });
  };

  const updateStory = (index: number, story: Story) => {
    const newStories = [...(content.stories || [])];
    newStories[index] = story;
    onChange({ ...content, stories: newStories });
  };

  const addStory = () => {
    const newStories = [...(content.stories || []), DEFAULT_STORY];
    onChange({ ...content, stories: newStories });
    setExpandedStory(newStories.length - 1);
  };

  const removeStory = (index: number) => {
    const newStories = (content.stories || []).filter((_, i) => i !== index);
    onChange({ ...content, stories: newStories });
    if (expandedStory === index) setExpandedStory(null);
  };

  const moveStory = (index: number, direction: 'up' | 'down') => {
    const newStories = [...(content.stories || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newStories.length) return;

    [newStories[index], newStories[newIndex]] = [newStories[newIndex], newStories[index]];
    onChange({ ...content, stories: newStories });
  };

  const heading = content.heading || { ...DEFAULT_TEXT_STYLE, text: 'Framgångshistorier', size: 'xl', alignment: 'center' };
  const intro = content.intro || { ...DEFAULT_TEXT_STYLE, text: '', alignment: 'center' };
  const stories = content.stories || [];

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Framgångshistorier från kockar som använder plattformen
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

      {/* Stories Overview */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-900">
            Historier ({stories.length})
          </label>
          <button
            type="button"
            onClick={addStory}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#a1c798] text-white text-sm rounded-lg hover:bg-[#8fb386] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lägg till historia
          </button>
        </div>

        <div className="space-y-2">
          {stories.map((story, index) => (
            <div key={index} className="border border-gray-200 rounded-lg bg-gray-50">
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {story.image && (
                      <img
                        src={story.image}
                        alt={story.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{story.name}</div>
                      <div className="text-sm text-gray-600">
                        {[story.age, story.city].filter(Boolean).join(', ') || 'Ingen info'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <button
                      type="button"
                      onClick={() => moveStory(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      title="Flytta upp"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStory(index, 'down')}
                      disabled={index === stories.length - 1}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      title="Flytta ner"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedStory(expandedStory === index ? null : index)}
                      className="p-1.5 text-[#a1c798] hover:text-[#8fb386]"
                      title="Redigera"
                    >
                      {expandedStory === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStory(index)}
                      className="p-1.5 text-red-600 hover:text-red-800"
                      title="Ta bort"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedStory === index && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Bild-URL</label>
                      <input
                        type="text"
                        value={story.image || ''}
                        onChange={(e) => updateStory(index, { ...story, image: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                      />
                      {story.image && (
                        <img
                          src={story.image}
                          alt="Preview"
                          className="mt-2 w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Namn</label>
                        <input
                          type="text"
                          value={story.name}
                          onChange={(e) => updateStory(index, { ...story, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ålder</label>
                        <input
                          type="text"
                          value={story.age || ''}
                          onChange={(e) => updateStory(index, { ...story, age: e.target.value })}
                          placeholder="t.ex. 34 år"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ort</label>
                        <input
                          type="text"
                          value={story.city || ''}
                          onChange={(e) => updateStory(index, { ...story, city: e.target.value })}
                          placeholder="t.ex. Stockholm"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                        />
                      </div>
                    </div>

                    <TypographyEditor
                      label="Underrubrik (valfri)"
                      value={story.subtitle || { ...DEFAULT_TEXT_STYLE, text: '' }}
                      onChange={(subtitle) => updateStory(index, { ...story, subtitle })}
                    />

                    <TypographyEditor
                      label="Beskrivning"
                      value={story.description}
                      onChange={(description) => updateStory(index, { ...story, description })}
                      multiline
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {stories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Inga historier ännu. Klicka på "Lägg till historia" för att börja.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
