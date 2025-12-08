import { useState, useEffect } from 'react';
import { AdminCard } from '../../components';
import { supabase } from '../../../lib/supabase';
import { FileText, Download, Eye, Trash2, Edit, X, Upload } from 'lucide-react';

interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  scope: string;
  requires_upload: boolean;
  file_url: string | null;
  visible_in_kockakademin: boolean;
  visible_in_documents_tab: boolean;
  is_default_starter_pack: boolean;
  created_at: string;
  updated_at: string;
}

type DocumentStatus = 'active' | 'inactive';

export default function GlobalDocumentsTab() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentTemplate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingDoc, setEditingDoc] = useState<DocumentTemplate | null>(null);
  const [uploading, setUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'guideline',
    scope: 'all_chefs',
    visible_in_kockakademin: false,
    visible_in_documents_tab: true,
    is_default_starter_pack: false,
    requires_upload: false,
    file: null as File | null
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('scope', 'all_chefs')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Fel vid laddning av dokument:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (context: 'guideline' | 'guide') => {
    setModalMode('add');
    setEditingDoc(null);
    setFormData({
      title: '',
      description: '',
      category: context === 'guide' ? 'guide' : 'guideline',
      scope: 'all_chefs',
      visible_in_kockakademin: context === 'guide',
      visible_in_documents_tab: true,
      is_default_starter_pack: context === 'guideline',
      requires_upload: false,
      file: null
    });
    setShowModal(true);
  };

  const openEditModal = (doc: DocumentTemplate) => {
    setModalMode('edit');
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      description: doc.description,
      category: doc.category,
      scope: doc.scope,
      visible_in_kockakademin: doc.visible_in_kockakademin,
      visible_in_documents_tab: doc.visible_in_documents_tab,
      is_default_starter_pack: doc.is_default_starter_pack,
      requires_upload: doc.requires_upload,
      file: null
    });
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      alert('Vänligen fyll i titel');
      return;
    }

    setUploading(true);
    try {
      let fileUrl = editingDoc?.file_url || null;

      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `global/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, formData.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        fileUrl = publicUrl;
      }

      const docData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        scope: formData.scope,
        visible_in_kockakademin: formData.visible_in_kockakademin,
        visible_in_documents_tab: formData.visible_in_documents_tab,
        is_default_starter_pack: formData.is_default_starter_pack,
        requires_upload: formData.requires_upload,
        file_url: fileUrl,
        updated_at: new Date().toISOString()
      };

      if (modalMode === 'edit' && editingDoc) {
        const { error } = await supabase
          .from('document_templates')
          .update(docData)
          .eq('id', editingDoc.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('document_templates')
          .insert({
            ...docData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      setShowModal(false);
      fetchDocuments();
    } catch (error) {
      console.error('Fel vid spara dokument:', error);
      alert('Kunde inte spara dokument');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: DocumentTemplate) => {
    if (!confirm(`Är du säker på att du vill ta bort "${doc.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;
      fetchDocuments();
    } catch (error) {
      console.error('Fel vid borttagning:', error);
      alert('Kunde inte ta bort dokument');
    }
  };

  const toggleStatus = async (doc: DocumentTemplate) => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .update({
          visible_in_documents_tab: !doc.visible_in_documents_tab,
          updated_at: new Date().toISOString()
        })
        .eq('id', doc.id);

      if (error) throw error;
      fetchDocuments();
    } catch (error) {
      console.error('Fel vid uppdatering:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getScopeBadge = (scope: string) => {
    return scope === 'all_chefs' ? 'Alla kockar' : 'Specifika kockar';
  };

  const filteredGuidelines = documents.filter(doc => {
    const isGuideline = doc.category === 'guideline' || doc.category === 'policy';
    const matchesSearch = !searchQuery || doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && doc.visible_in_documents_tab) ||
      (statusFilter === 'inactive' && !doc.visible_in_documents_tab);

    return isGuideline && matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredGuides = documents.filter(doc => {
    const isGuide = doc.category === 'guide' && doc.visible_in_kockakademin;
    const matchesSearch = !searchQuery || doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && doc.visible_in_documents_tab) ||
      (statusFilter === 'inactive' && !doc.visible_in_documents_tab);

    return isGuide && matchesSearch && matchesStatus;
  });

  const countChefsWithAccess = (doc: DocumentTemplate) => {
    return doc.scope === 'all_chefs' ? 'Alla' : 'Specifika';
  };

  if (loading) {
    return (
      <AdminCard>
        <p className="text-gray-700">Laddar dokument...</p>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-2" style={{ fontFamily: 'Lobster, cursive' }}>
          Kockar – Dokument (översikt)
        </h2>
        <p className="text-sm text-gray-700">
          Hantera globala dokument, riktlinjer och guider som alla kockar (eller utvalda grupper) har tillgång till.
        </p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1 max-w-md">
          <label className="block text-sm font-medium text-black mb-1.5">Sök</label>
          <input
            type="text"
            placeholder="Sök på titel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          />
        </div>

        <div className="flex-1 max-w-[200px]">
          <label className="block text-sm font-medium text-black mb-1.5">Kategori</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          >
            <option value="all">Alla kategorier</option>
            <option value="guideline">Riktlinje</option>
            <option value="policy">Policy</option>
            <option value="guide">Guide</option>
          </select>
        </div>

        <div className="flex-1 max-w-[200px]">
          <label className="block text-sm font-medium text-black mb-1.5">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          >
            <option value="all">Alla</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Avpublicerad</option>
          </select>
        </div>
      </div>

      <AdminCard>
        <h3 className="text-xl font-bold text-black mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
          Startpaket & riktlinjer
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          Globala dokument och policys som kockar har tillgång till.
        </p>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Titel</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Typ</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Gäller för</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Senast uppdaterad</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Status</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-gray-800">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuidelines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500 text-sm">
                    Inga riktlinjer eller policys ännu
                  </td>
                </tr>
              ) : (
                filteredGuidelines.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-200">
                    <td className="py-2 px-3 text-sm text-gray-800">{doc.title}</td>
                    <td className="py-2 px-3 text-sm">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {doc.category === 'guideline' ? 'Riktlinje' : 'Policy'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800">{getScopeBadge(doc.scope)}</td>
                    <td className="py-2 px-3 text-sm text-gray-800">{formatDate(doc.updated_at)}</td>
                    <td className="py-2 px-3 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        doc.visible_in_documents_tab
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.visible_in_documents_tab ? 'Aktiv' : 'Avpublicerad'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(doc)}
                          className="text-black hover:text-gray-700"
                          title="Redigera"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-black hover:text-gray-700"
                            title="Visa/Ladda ner"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => toggleStatus(doc)}
                          className="text-black hover:text-gray-700"
                          title={doc.visible_in_documents_tab ? 'Avpublicera' : 'Publicera'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="text-red-600 hover:text-red-800"
                          title="Ta bort"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => openAddModal('guideline')}
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
          Guider och utbildningsmaterial för kockar i Kockakademin.
        </p>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Titel</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Modul/område</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Synlig för</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Antal kockar</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Senast uppdaterad</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-800">Status</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-gray-800">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuides.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500 text-sm">
                    Inga guider i Kockakademin ännu
                  </td>
                </tr>
              ) : (
                filteredGuides.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-200">
                    <td className="py-2 px-3 text-sm text-gray-800">{doc.title}</td>
                    <td className="py-2 px-3 text-sm">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Guide
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800">{getScopeBadge(doc.scope)}</td>
                    <td className="py-2 px-3 text-sm text-gray-800">{countChefsWithAccess(doc)}</td>
                    <td className="py-2 px-3 text-sm text-gray-800">{formatDate(doc.updated_at)}</td>
                    <td className="py-2 px-3 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        doc.visible_in_documents_tab
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.visible_in_documents_tab ? 'Aktiv' : 'Avpublicerad'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(doc)}
                          className="text-black hover:text-gray-700"
                          title="Redigera"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-black hover:text-gray-700"
                            title="Förhandsvisa"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => toggleStatus(doc)}
                          className="text-black hover:text-gray-700"
                          title={doc.visible_in_documents_tab ? 'Avpublicera' : 'Publicera'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="text-red-600 hover:text-red-800"
                          title="Ta bort"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => openAddModal('guide')}
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
        >
          Lägg till guide till Kockakademin
        </button>
      </AdminCard>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black">
                {modalMode === 'edit' ? 'Redigera dokument' : 'Lägg till dokument'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Titel *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Dokumenttitel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Beskrivning</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Beskrivning av dokumentet"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-800 mb-1">Omfattning</label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="all_chefs">Alla kockar</option>
                    <option value="single_chef">Specifika kockar</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.visible_in_kockakademin}
                    onChange={(e) => setFormData({ ...formData, visible_in_kockakademin: e.target.checked })}
                    className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-800">Visa i Kockakademin</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.visible_in_documents_tab}
                    onChange={(e) => setFormData({ ...formData, visible_in_documents_tab: e.target.checked })}
                    className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-800">Synlig i dokumentlistan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default_starter_pack}
                    onChange={(e) => setFormData({ ...formData, is_default_starter_pack: e.target.checked })}
                    className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-800">Ingår i startpaket för nya kockar</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Fil {modalMode === 'edit' && editingDoc?.file_url ? '(valfritt - lämna tomt för att behålla befintlig)' : ''}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  />
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                {editingDoc?.file_url && (
                  <p className="text-xs text-gray-600 mt-1">
                    Nuvarande fil: <a href={editingDoc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Visa</a>
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="flex-1 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm disabled:opacity-50"
                >
                  {uploading ? 'Sparar...' : (modalMode === 'edit' ? 'Uppdatera' : 'Lägg till')}
                </button>
                <button
                  onClick={() => setShowModal(false)}
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
