import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminCard, AdminButton } from '../../components';
import { ArrowLeft, Save, Eye, Plus, Trash2, MoveUp, MoveDown, EyeOff, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { LandingPage, LandingPageSection } from '../../../lib/types/landingPage';
import ColorPicker from '../components/ColorPicker';

export default function LandningEditor() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [sections, setSections] = useState<LandingPageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      const { data: pageData, error: pageError } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (pageError) throw pageError;

      if (pageData) {
        setPage(pageData);

        const { data: sectionsData, error: sectionsError } = await supabase
          .from('landing_page_sections')
          .select('*')
          .eq('landing_page_id', pageData.id)
          .order('section_order', { ascending: true });

        if (sectionsError) throw sectionsError;

        setSections(sectionsData || []);
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePage = async () => {
    if (!page) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({
          title: page.title,
          meta_description: page.meta_description,
          is_published: page.is_published
        })
        .eq('id', page.id);

      if (error) throw error;

      alert('Sidan har sparats!');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Ett fel uppstod när sidan skulle sparas');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (sectionId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('landing_page_sections')
        .update({ is_visible: !currentVisibility })
        .eq('id', sectionId);

      if (error) throw error;

      setSections(sections.map(s =>
        s.id === sectionId ? { ...s, is_visible: !currentVisibility } : s
      ));
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleMoveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const reorderedSections = [...sections];
    [reorderedSections[currentIndex], reorderedSections[newIndex]] =
      [reorderedSections[newIndex], reorderedSections[currentIndex]];

    const updates = reorderedSections.map((section, index) => ({
      id: section.id,
      section_order: index + 1
    }));

    try {
      for (const update of updates) {
        await supabase
          .from('landing_page_sections')
          .update({ section_order: update.section_order })
          .eq('id', update.id);
      }

      setSections(reorderedSections.map((s, i) => ({ ...s, section_order: i + 1 })));
    } catch (error) {
      console.error('Error reordering sections:', error);
    }
  };

  const handleSaveSection = async (sectionId: string, updatedSection: Partial<LandingPageSection>) => {
    try {
      const { error } = await supabase
        .from('landing_page_sections')
        .update(updatedSection)
        .eq('id', sectionId);

      if (error) throw error;

      setSections(sections.map(s =>
        s.id === sectionId ? { ...s, ...updatedSection } : s
      ));

      alert('Sektionen har sparats!');
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Ett fel uppstod när sektionen skulle sparas');
    }
  };

  const updateSectionContent = (sectionId: string, newContent: any) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, content: newContent } : s
    ));
  };

  const getSectionTypeName = (type: string): string => {
    const names: Record<string, string> = {
      hero: 'Hero',
      navigation_cards: 'Navigeringskort',
      benefits: 'Fördelar',
      steps: 'Steg',
      stories: 'Framgångshistorier',
      faq: 'FAQ',
      cta: 'Call-to-Action',
      trust: 'Trygghet'
    };
    return names[type] || type;
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Laddar...</h2>
      </div>
    );
  }

  if (!page) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sidan hittades inte</h2>
        <Link to="/admin/webb/landning" className="text-[#a1c798] hover:underline">
          Tillbaka till landningssidor
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/admin/webb/landning"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Tillbaka till landningssidor
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Redigera: {page.title}</h2>
          <p className="text-gray-600 text-sm">Slug: /{page.slug}</p>
        </div>
        <div className="flex gap-3">
          <a
            href={`/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Förhandsgranska
          </a>
          <AdminButton
            onClick={handleSavePage}
            disabled={saving}
            icon={<Save className="w-4 h-4" />}
          >
            {saving ? 'Sparar...' : 'Spara'}
          </AdminButton>
        </div>
      </div>

      <div className="space-y-6">
        <AdminCard title="Grundinställningar">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sidtitel
              </label>
              <input
                type="text"
                value={page.title}
                onChange={(e) => setPage({ ...page, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description (SEO)
              </label>
              <textarea
                value={page.meta_description || ''}
                onChange={(e) => setPage({ ...page, meta_description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                placeholder="Beskrivning för sökmotorer..."
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={page.is_published}
                onChange={(e) => setPage({ ...page, is_published: e.target.checked })}
                className="w-4 h-4 text-[#a1c798] rounded"
              />
              <span className="text-sm font-medium text-gray-700">Publicerad</span>
            </label>
          </div>
        </AdminCard>

        <AdminCard title="Sektioner">
          <div className="space-y-4">
            {sections.map((section, index) => {
              const isExpanded = selectedSection === section.id;
              return (
                <div
                  key={section.id}
                  className={`border rounded-lg ${
                    section.is_visible ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-500">
                          #{section.section_order}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getSectionTypeName(section.section_type)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {section.is_visible ? 'Synlig' : 'Dold'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMoveSection(section.id, 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Flytta upp"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(section.id, 'down')}
                          disabled={index === sections.length - 1}
                          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Flytta ner"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(section.id, section.is_visible)}
                          className="p-2 text-gray-600 hover:text-gray-900"
                          title={section.is_visible ? 'Dölj' : 'Visa'}
                        >
                          {section.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setSelectedSection(isExpanded ? null : section.id)}
                          className="p-2 text-[#a1c798] hover:text-[#8fb386]"
                          title="Redigera"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
                      <div className="space-y-4">
                        <ColorPicker
                          label="Bakgrundsfärg"
                          value={section.background_color || '#ffffff'}
                          onChange={(color) => {
                            const updatedSection = {
                              ...section,
                              background_type: 'color',
                              background_color: color
                            };
                            setSections(sections.map(s => s.id === section.id ? updatedSection : s));
                          }}
                        />

                        {/* Hero Section */}
                        {section.section_type === 'hero' && section.content && 'heading' in section.content && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik</label>
                              <input
                                type="text"
                                value={section.content.heading?.text || ''}
                                onChange={(e) => {
                                  const newContent = {
                                    ...section.content,
                                    heading: { ...section.content.heading, text: e.target.value }
                                  };
                                  updateSectionContent(section.id, newContent);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                              />
                            </div>
                            {'intro' in section.content && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ingress</label>
                                <textarea
                                  value={section.content.intro?.text || ''}
                                  onChange={(e) => {
                                    const newContent = {
                                      ...section.content,
                                      intro: { ...section.content.intro, text: e.target.value }
                                    };
                                    updateSectionContent(section.id, newContent);
                                  }}
                                  rows={3}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                                />
                              </div>
                            )}
                            {'cta' in section.content && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">CTA-text</label>
                                  <input
                                    type="text"
                                    value={section.content.cta?.text || ''}
                                    onChange={(e) => {
                                      const newContent = {
                                        ...section.content,
                                        cta: { ...section.content.cta, text: e.target.value }
                                      };
                                      updateSectionContent(section.id, newContent);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">CTA-länk</label>
                                  <input
                                    type="text"
                                    value={section.content.cta?.link || ''}
                                    onChange={(e) => {
                                      const newContent = {
                                        ...section.content,
                                        cta: { ...section.content.cta, link: e.target.value }
                                      };
                                      updateSectionContent(section.id, newContent);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Benefits, Steps, Trust Sections */}
                        {(section.section_type === 'benefits' || section.section_type === 'steps' || section.section_type === 'trust') && section.content && 'heading' in section.content && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik</label>
                              <input
                                type="text"
                                value={section.content.heading?.text || ''}
                                onChange={(e) => {
                                  const newContent = {
                                    ...section.content,
                                    heading: { ...section.content.heading, text: e.target.value }
                                  };
                                  updateSectionContent(section.id, newContent);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                              />
                            </div>
                            {'intro' in section.content && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ingress</label>
                                <textarea
                                  value={section.content.intro?.text || ''}
                                  onChange={(e) => {
                                    const newContent = {
                                      ...section.content,
                                      intro: { ...section.content.intro, text: e.target.value }
                                    };
                                    updateSectionContent(section.id, newContent);
                                  }}
                                  rows={3}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                                />
                              </div>
                            )}
                            {('cards' in section.content || 'steps' in section.content) && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {section.section_type === 'steps' ? 'Steg' : 'Kort'} ({('steps' in section.content ? section.content.steps?.length : section.content.cards?.length) || 0})
                                </label>
                                <p className="text-sm text-gray-500">
                                  För att redigera enskilda kort, klicka på dem nedan
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Stories Section */}
                        {section.section_type === 'stories' && section.content && 'heading' in section.content && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik</label>
                              <input
                                type="text"
                                value={section.content.heading?.text || ''}
                                onChange={(e) => {
                                  const newContent = {
                                    ...section.content,
                                    heading: { ...section.content.heading, text: e.target.value }
                                  };
                                  updateSectionContent(section.id, newContent);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                              />
                            </div>
                            {'stories' in section.content && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Historier ({section.content.stories?.length || 0})
                                </label>
                                <p className="text-sm text-gray-500">
                                  För att redigera enskilda historier, använd databasverktyget
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* FAQ Section */}
                        {section.section_type === 'faq' && section.content && 'heading' in section.content && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik</label>
                              <input
                                type="text"
                                value={section.content.heading?.text || ''}
                                onChange={(e) => {
                                  const newContent = {
                                    ...section.content,
                                    heading: { ...section.content.heading, text: e.target.value }
                                  };
                                  updateSectionContent(section.id, newContent);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                              />
                            </div>
                            {'questions' in section.content && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Frågor ({section.content.questions?.length || 0})
                                </label>
                                <p className="text-sm text-gray-500">
                                  För att redigera enskilda frågor, använd databasverktyget
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* CTA Section */}
                        {section.section_type === 'cta' && section.content && 'heading' in section.content && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik</label>
                              <input
                                type="text"
                                value={section.content.heading?.text || ''}
                                onChange={(e) => {
                                  const newContent = {
                                    ...section.content,
                                    heading: { ...section.content.heading, text: e.target.value }
                                  };
                                  updateSectionContent(section.id, newContent);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                              />
                            </div>
                            {'text' in section.content && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                                <textarea
                                  value={section.content.text?.text || ''}
                                  onChange={(e) => {
                                    const newContent = {
                                      ...section.content,
                                      text: { ...section.content.text, text: e.target.value }
                                    };
                                    updateSectionContent(section.id, newContent);
                                  }}
                                  rows={3}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                                />
                              </div>
                            )}
                            {'cta' in section.content && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">CTA-text</label>
                                  <input
                                    type="text"
                                    value={section.content.cta?.text || ''}
                                    onChange={(e) => {
                                      const newContent = {
                                        ...section.content,
                                        cta: { ...section.content.cta, text: e.target.value }
                                      };
                                      updateSectionContent(section.id, newContent);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">CTA-länk</label>
                                  <input
                                    type="text"
                                    value={section.content.cta?.link || ''}
                                    onChange={(e) => {
                                      const newContent = {
                                        ...section.content,
                                        cta: { ...section.content.cta, link: e.target.value }
                                      };
                                      updateSectionContent(section.id, newContent);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <AdminButton
                            onClick={() => handleSaveSection(section.id, section)}
                            icon={<Save className="w-4 h-4" />}
                          >
                            Spara ändringar
                          </AdminButton>
                          <button
                            onClick={() => setSelectedSection(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900"
                          >
                            Stäng
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {sections.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>Inga sektioner ännu</p>
                <p className="text-sm mt-2">Lägg till sektioner via databasen</p>
              </div>
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
