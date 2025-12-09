import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X, Eye, Video } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';
import ColorPicker from './ColorPicker';
import { supabase } from '../../../lib/supabase';

interface TjuvkikSettings {
  backgroundColor?: string;
  heading?: string;
  headingFont?: string;
  headingBold?: boolean;
  headingAlignment?: 'left' | 'center';
  headingColor?: string;
  subtitleTexts?: string[];
  subtitleRotationInterval?: number;
  subtitlePlacement?: 'inline' | 'below';
  subtitleColor?: string;
  cardsPerRow?: number;
}

interface TjuvkikEditorProps {
  settings: TjuvkikSettings;
  onSettingsChange: (settings: TjuvkikSettings) => void;
}

interface ChefReel {
  id: string;
  chef_id: string;
  product_id: string | null;
  video_url: string;
  thumbnail_url: string | null;
  title: string;
  duration_seconds: number;
  status: 'pending_review' | 'approved' | 'rejected';
  rejection_reason: string | null;
  admin_notes: string | null;
  views_count: number;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  chef?: {
    display_name: string;
    avatar_url: string | null;
  };
}

export default function TjuvkikEditor({ settings, onSettingsChange }: TjuvkikEditorProps) {
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [reels, setReels] = useState<ChefReel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReel, setSelectedReel] = useState<ChefReel | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending_review');

  const updateSetting = (key: keyof TjuvkikSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  useEffect(() => {
    fetchReels();
  }, [filterStatus]);

  useEffect(() => {
    const subtitleTexts = settings.subtitleTexts || [];
    if (subtitleTexts.length <= 1) return;

    const rotationInterval = settings.subtitleRotationInterval || 10000;
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setActiveSubtitleIndex((prev) => (prev + 1) % subtitleTexts.length);
        setFadeIn(true);
      }, 300);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [settings.subtitleTexts, settings.subtitleRotationInterval]);

  const addSubtitleText = () => {
    const subtitleTexts = settings.subtitleTexts || [];
    updateSetting('subtitleTexts', [...subtitleTexts, '']);
  };

  const removeSubtitleText = (index: number) => {
    const subtitleTexts = settings.subtitleTexts || [];
    updateSetting('subtitleTexts', subtitleTexts.filter((_, i) => i !== index));
  };

  const updateSubtitleText = (index: number, value: string) => {
    const subtitleTexts = settings.subtitleTexts || [];
    const newTexts = [...subtitleTexts];
    newTexts[index] = value;
    updateSetting('subtitleTexts', newTexts);
  };

  const fetchReels = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('chef_reels')
        .select(`
          *,
          chef:profiles!chef_reels_chef_id_fkey(display_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReels(data || []);
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReel = async (reelId: string) => {
    try {
      const { error } = await supabase
        .from('chef_reels')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', reelId);

      if (error) throw error;
      fetchReels();
      setSelectedReel(null);
    } catch (error) {
      console.error('Error approving reel:', error);
      alert('Kunde inte godkänna video');
    }
  };

  const handleRejectReel = async (reelId: string) => {
    if (!rejectionReason.trim()) {
      alert('Vänligen ange en anledning för avvisning');
      return;
    }

    try {
      const { error } = await supabase
        .from('chef_reels')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', reelId);

      if (error) throw error;
      fetchReels();
      setSelectedReel(null);
      setRejectionReason('');
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting reel:', error);
      alert('Kunde inte avvisa video');
    }
  };

  const handleDeleteReel = async (reelId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna video permanent?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('chef_reels')
        .delete()
        .eq('id', reelId);

      if (error) throw error;
      fetchReels();
      setSelectedReel(null);
    } catch (error) {
      console.error('Error deleting reel:', error);
      alert('Kunde inte ta bort video');
    }
  };

  const subtitleTexts = settings.subtitleTexts || [''];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tjuvkik i köket</h3>
          <p className="text-sm text-gray-600">Anpassa inställningar för Tjuvkik i köket-sektionen</p>
        </div>
      </div>

      <CollapsibleCard title="Bakgrund" defaultExpanded={true}>
        <ColorPicker
          label="Bakgrundsfärg för hela sektionen"
          value={settings.backgroundColor || '#ffffff'}
          onChange={(color) => updateSetting('backgroundColor', color)}
        />
      </CollapsibleCard>

      <CollapsibleCard title="Rubrik" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rubriktext
            </label>
            <input
              type="text"
              value={settings.heading || ''}
              onChange={(e) => updateSetting('heading', e.target.value)}
              placeholder="Tjuvkik i köket"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typsnitt
            </label>
            <select
              value={settings.headingFont || 'lobster'}
              onChange={(e) => updateSetting('headingFont', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            >
              <option value="lobster">Lobster</option>
              <option value="sans">Sans Serif</option>
              <option value="serif">Serif</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.headingBold || false}
                onChange={(e) => updateSetting('headingBold', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Fet stil</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placering
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('headingAlignment', 'left')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.headingAlignment === 'left'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Vänster
              </button>
              <button
                onClick={() => updateSetting('headingAlignment', 'center')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.headingAlignment === 'center'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Centrerad
              </button>
            </div>
          </div>

          <ColorPicker
            label="Rubrik – textfärg"
            value={settings.headingColor || '#374151'}
            onChange={(color) => updateSetting('headingColor', color)}
          />
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Textrad(er) efter rubriken" defaultExpanded={true}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Textrader (roterar automatiskt)
              </label>
              <button
                onClick={addSubtitleText}
                className="flex items-center gap-1 px-3 py-1 bg-[#56c5c5] text-white text-sm rounded-lg hover:bg-[#45b4b4] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Lägg till
              </button>
            </div>

            <div className="space-y-2">
              {subtitleTexts.map((text, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => updateSubtitleText(index, e.target.value)}
                    placeholder={`Textrad ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                  />
                  {subtitleTexts.length > 1 && (
                    <button
                      onClick={() => removeSubtitleText(index)}
                      className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervall för textrad-rotation
            </label>
            <select
              value={settings.subtitleRotationInterval || 10000}
              onChange={(e) => updateSetting('subtitleRotationInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
            >
              <option value={10000}>10 sekunder</option>
              <option value={60000}>1 minut</option>
              <option value={3600000}>1 timme</option>
              <option value={86400000}>1 dag</option>
              <option value={604800000}>1 vecka</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placering av textrad
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('subtitlePlacement', 'inline')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                På samma rad
              </button>
              <button
                onClick={() => updateSetting('subtitlePlacement', 'below')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  settings.subtitlePlacement === 'below'
                    ? 'border-[#56c5c5] bg-[#56c5c5] text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Under rubriken
              </button>
            </div>
          </div>

          <ColorPicker
            label="Textrad – textfärg"
            value={settings.subtitleColor || '#374151'}
            onChange={(color) => updateSetting('subtitleColor', color)}
          />
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Produktkort" defaultExpanded={true}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Antal produktkort synliga i följd
          </label>
          <input
            type="number"
            min="1"
            max="8"
            value={settings.cardsPerRow || 4}
            onChange={(e) => updateSetting('cardsPerRow', parseInt(e.target.value) || 4)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Rekommenderat: 4 för desktop, 1-2 för mobil (responsivt)
          </p>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Video-moderering" defaultExpanded={true}>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Granska och godkänn videos som kockar laddar upp
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('pending_review')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filterStatus === 'pending_review'
                    ? 'bg-[#56c5c5] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Väntar ({reels.filter(r => r.status === 'pending_review').length})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filterStatus === 'approved'
                    ? 'bg-[#56c5c5] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Godkända
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filterStatus === 'rejected'
                    ? 'bg-[#56c5c5] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Avvisade
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-[#56c5c5] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Alla
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Laddar videos...</div>
          ) : reels.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Inga videos att visa</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[9/16] bg-gray-100">
                    {reel.thumbnail_url ? (
                      <img
                        src={reel.thumbnail_url}
                        alt={reel.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {Math.floor(reel.duration_seconds / 60)}:{(reel.duration_seconds % 60).toString().padStart(2, '0')}
                    </div>
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                      reel.status === 'approved' ? 'bg-green-500 text-white' :
                      reel.status === 'rejected' ? 'bg-red-500 text-white' :
                      'bg-yellow-500 text-black'
                    }`}>
                      {reel.status === 'approved' ? 'Godkänd' :
                       reel.status === 'rejected' ? 'Avvisad' :
                       'Väntar'}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                      {reel.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      {reel.chef?.display_name || 'Okänd kock'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <Eye className="w-3 h-3" />
                      <span>{reel.views_count} visningar</span>
                    </div>
                    <div className="flex gap-2">
                      {reel.status === 'pending_review' && (
                        <>
                          <button
                            onClick={() => handleApproveReel(reel.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            Godkänn
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReel(reel);
                              setRejectionReason('');
                              setAdminNotes('');
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                            Avvisa
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteReel(reel.id)}
                        className="px-3 py-1.5 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedReel && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Avvisa video</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Video: {selectedReel.title}
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Anledning (syns för kocken) *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                      placeholder="T.ex. Innehåller olämpligt material, dålig videokvalitet..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interna anteckningar (valfritt)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                      placeholder="Interna noteringar..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRejectReel(selectedReel.id)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Avvisa video
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReel(null);
                        setRejectionReason('');
                        setAdminNotes('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Preview" defaultExpanded={true}>
        <div
          className="p-8 rounded-lg"
          style={{ backgroundColor: settings.backgroundColor || '#ffffff' }}
        >
          <div
            className={`mb-6 ${
              settings.headingAlignment === 'center' ? 'text-center' : 'text-left'
            }`}
          >
            {settings.subtitlePlacement === 'inline' || !settings.subtitlePlacement ? (
              <div className={`flex items-center gap-3 mb-2 ${settings.headingAlignment === 'center' ? 'justify-center' : ''}`}>
                <h2
                  className={`text-3xl ${
                    settings.headingFont === 'lobster' ? 'font-lobster' : ''
                  } ${settings.headingBold ? 'font-bold' : ''}`}
                  style={{
                    fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                    color: settings.headingColor || '#374151'
                  }}
                >
                  {settings.heading || 'Tjuvkik i köket'}
                </h2>
                {subtitleTexts.length > 0 && subtitleTexts[0] && (
                  <>
                    <span className="text-gray-400 text-2xl">|</span>
                    <div className="min-h-[24px] flex items-center">
                      <p
                        className="transition-opacity duration-300"
                        style={{
                          opacity: fadeIn ? 1 : 0,
                          color: settings.subtitleColor || '#374151'
                        }}
                      >
                        {subtitleTexts[activeSubtitleIndex] || subtitleTexts[0]}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div>
                <h2
                  className={`text-3xl ${
                    settings.headingFont === 'lobster' ? 'font-lobster' : ''
                  } ${settings.headingBold ? 'font-bold' : ''}`}
                  style={{
                    fontFamily: settings.headingFont === 'serif' ? 'serif' : settings.headingFont === 'sans' ? 'sans-serif' : undefined,
                    color: settings.headingColor || '#374151'
                  }}
                >
                  {settings.heading || 'Tjuvkik i köket'}
                </h2>
                {subtitleTexts.length > 0 && subtitleTexts[0] && (
                  <div className="min-h-[24px] flex items-center mt-2">
                    <p
                      className="transition-opacity duration-300"
                      style={{
                        opacity: fadeIn ? 1 : 0,
                        color: settings.subtitleColor || '#374151'
                      }}
                    >
                      {subtitleTexts[activeSubtitleIndex] || subtitleTexts[0]}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${settings.cardsPerRow || 4}, 1fr)` }}>
            {[1, 2, 3, 4].slice(0, settings.cardsPerRow || 4).map((i) => (
              <div key={i} className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                <div className="w-full h-full relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-black border-b-8 border-b-transparent ml-1"></div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-sm font-semibold">Reels-kort {i}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
