import { useState, useEffect } from 'react';
import { AdminCard } from '../../components';
import { supabase } from '../../../lib/supabase';
import { Upload, FileText, Download, Eye, Image, X } from 'lucide-react';

interface ChefDocumentsTabProps {
  chefId: string;
}

interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  scope: string;
  requires_upload: boolean;
  file_url: string | null;
  visible_in_kockakademin: boolean;
  updated_at: string;
}

interface ChefDocument {
  id: string;
  chef_id: string;
  template_id: string | null;
  title: string;
  source: string;
  file_url: string | null;
  status: string;
  notes: string | null;
  document_type: string;
  created_at: string;
  updated_at: string;
  template?: DocumentTemplate;
}

export default function ChefDocumentsTab({ chefId }: ChefDocumentsTabProps) {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [chefDocs, setChefDocs] = useState<ChefDocument[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadContext, setUploadContext] = useState<'guideline' | 'guide'>('guideline');
  const [hasFoodRegistration, setHasFoodRegistration] = useState(false);
  const [updatingCheckbox, setUpdatingCheckbox] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'guideline',
    file: null as File | null
  });

  useEffect(() => {
    fetchDocuments();
    fetchChefProfile();
  }, [chefId]);

  const fetchChefProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('has_food_registration_receipt')
        .eq('id', chefId)
        .maybeSingle();

      if (error) throw error;
      setHasFoodRegistration(data?.has_food_registration_receipt || false);
    } catch (error) {
      console.error('Fel vid laddning av kockprofil:', error);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const [templatesRes, docsRes] = await Promise.all([
        supabase
          .from('document_templates')
          .select('*')
          .or('scope.eq.all_chefs,scope.eq.single_chef'),
        supabase
          .from('chef_documents')
          .select('*, template:document_templates(*)')
          .eq('chef_id', chefId)
      ]);

      if (templatesRes.error) throw templatesRes.error;
      if (docsRes.error) throw docsRes.error;

      setTemplates(templatesRes.data || []);
      setChefDocs(docsRes.data || []);
    } catch (error) {
      console.error('Fel vid laddning av dokument:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodRegistrationChange = async (checked: boolean) => {
    setUpdatingCheckbox(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_food_registration_receipt: checked })
        .eq('id', chefId);

      if (error) throw error;
      setHasFoodRegistration(checked);
    } catch (error) {
      console.error('Fel vid uppdatering av kvitto-status:', error);
    } finally {
      setUpdatingCheckbox(false);
    }
  };

  const openUploadModal = (context: 'guideline' | 'guide') => {
    setUploadContext(context);
    setFormData({
      title: '',
      description: '',
      category: context === 'guide' ? 'guide' : 'guideline',
      file: null
    });
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!formData.title || !formData.file) {
      alert('Vänligen fyll i titel och välj en fil');
      return;
    }

    setUploading(true);
    try {
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${chefId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('chef_documents')
        .insert({
          chef_id: chefId,
          title: formData.title,
          source: 'admin_upload_single',
          file_url: publicUrl,
          status: 'uploaded',
          notes: formData.description,
          document_type: 'formal'
        });

      if (dbError) throw dbError;

      if (uploadContext === 'guide') {
        await supabase.from('document_templates').insert({
          title: formData.title,
          description: formData.description,
          category: 'guide',
          scope: 'single_chef',
          requires_upload: false,
          file_url: publicUrl,
          visible_in_kockakademin: true
        });
      }

      setShowUploadModal(false);
      fetchDocuments();
    } catch (error) {
      console.error('Fel vid uppladdning:', error);
      alert('Kunde inte ladda upp dokument');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const guidelines = templates.filter(t =>
    (t.category === 'guideline' || t.category === 'policy') &&
    t.scope === 'all_chefs'
  );

  const guides = templates.filter(t =>
    t.category === 'guide' &&
    t.visible_in_kockakademin
  );

  const chefUploadedDocs = chefDocs.filter(d => d.file_url && d.source === 'chef_upload');
  const formalDocs = chefUploadedDocs.filter(d => d.document_type === 'formal');
  const mediaDocs = chefUploadedDocs.filter(d => d.document_type === 'media');

  if (loading) {
    return (
      <AdminCard>
        <p className="text-gray-700">Laddar dokument...</p>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-6">
      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Startpaket & riktlinjer
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          Globala dokument och policys som kocken har tillgång till.
        </p>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Titel</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Typ</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Senast uppdaterad</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-gray-800">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {guidelines.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500 text-sm">
                    Inga riktlinjer eller policys ännu
                  </td>
                </tr>
              ) : (
                guidelines.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-200">
                    <td className="py-2 px-3 text-sm text-gray-800">{doc.title}</td>
                    <td className="py-2 px-3 text-sm">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {doc.category === 'guideline' ? 'Riktlinje' : 'Policy'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800">{formatDate(doc.updated_at)}</td>
                    <td className="py-2 px-3 text-sm text-right">
                      <button className="text-black hover:text-gray-700 mr-2">
                        <Eye className="w-4 h-4" />
                      </button>
                      {doc.file_url && (
                        <button className="text-black hover:text-gray-700">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => openUploadModal('guideline')}
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
        >
          Lägg till dokument
        </button>
      </AdminCard>

      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Kockakademin – guider
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          Kocken har {guides.length} guider i Kockakademin
        </p>

        {guides.length > 0 && (
          <div className="space-y-2 mb-4">
            {guides.slice(0, 5).map((guide) => (
              <div key={guide.id} className="flex items-center gap-2 text-sm text-gray-800">
                <FileText className="w-4 h-4" />
                <span>{guide.title}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => openUploadModal('guide')}
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
        >
          Lägg till dokument
        </button>
      </AdminCard>

      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Kockens uppladdade filer
        </h3>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-300">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasFoodRegistration}
              onChange={(e) => handleFoodRegistrationChange(e.target.checked)}
              disabled={updatingCheckbox}
              className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-800">
              Kvitto finns för livsmedelsregistrering
            </span>
          </label>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Formella dokument</h4>
          <p className="text-xs text-gray-600 mb-3">Till exempel kvitto på livsmedelsregistrering, försäkring, avtal osv.</p>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Titel</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Typ / Kategori</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Status</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Senast uppdaterad</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-800">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {formalDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500 text-sm">
                      Inga formella dokument uppladdade ännu
                    </td>
                  </tr>
                ) : (
                  formalDocs.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-200">
                      <td className="py-2 px-3 text-sm text-gray-800">{doc.title}</td>
                      <td className="py-2 px-3 text-sm">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Formellt
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                          doc.status === 'uploaded' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {doc.status === 'approved' ? 'Godkänt' :
                           doc.status === 'uploaded' ? 'Uppladdat' : doc.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-800">{formatDate(doc.updated_at)}</td>
                      <td className="py-2 px-3 text-sm text-right space-x-2">
                        <button className="text-black hover:text-gray-700">
                          <Eye className="w-4 h-4 inline" />
                        </button>
                        <button className="text-black hover:text-gray-700">
                          <Download className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Matbilder & media</h4>
          <p className="text-xs text-gray-600 mb-3">Bilder på kockens rätter, kök och annat visuellt material.</p>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Titel / Beskrivning</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Typ</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Senast uppdaterad</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-800">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {mediaDocs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500 text-sm">
                      Inga matbilder eller media uppladdade ännu
                    </td>
                  </tr>
                ) : (
                  mediaDocs.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-200">
                      <td className="py-2 px-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-800">{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-sm">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Bild
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-800">{formatDate(doc.updated_at)}</td>
                      <td className="py-2 px-3 text-sm text-right space-x-2">
                        <button className="text-black hover:text-gray-700">
                          <Eye className="w-4 h-4 inline" />
                        </button>
                        <button className="text-black hover:text-gray-700">
                          <Download className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminCard>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black">Lägg till dokument</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Titel</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Dokumenttitel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Beskrivning (valfritt)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Beskrivning av dokumentet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="guideline">Riktlinje</option>
                  <option value="policy">Policy</option>
                  <option value="guide">Guide</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Fil</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm disabled:opacity-50"
                >
                  {uploading ? 'Laddar upp...' : 'Ladda upp'}
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
