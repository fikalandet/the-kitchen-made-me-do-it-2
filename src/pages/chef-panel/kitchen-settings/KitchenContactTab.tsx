import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, Twitter, Linkedin } from 'lucide-react';

export const KitchenContactTab: React.FC = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    address: '',
    postal_code: '',
    city: '',
    phone: '',
    email: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    youtube_url: '',
    twitter_url: '',
    linkedin_url: '',
    other_contact: '',
  });

  useEffect(() => {
    if (user) {
      fetchContactInfo();
    }
  }, [user]);

  const fetchContactInfo = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('phone, email, address, postal_code, city, instagram_url, facebook_url, tiktok_url, youtube_url, twitter_url, linkedin_url, other_contact')
      .eq('id', user?.id)
      .single();

    if (data) {
      setFormData({
        address: data.address || '',
        postal_code: data.postal_code || '',
        city: data.city || '',
        phone: data.phone || '',
        email: data.email || '',
        instagram_url: data.instagram_url || '',
        facebook_url: data.facebook_url || '',
        tiktok_url: data.tiktok_url || '',
        youtube_url: data.youtube_url || '',
        twitter_url: data.twitter_url || '',
        linkedin_url: data.linkedin_url || '',
        other_contact: data.other_contact || '',
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          address: formData.address,
          postal_code: formData.postal_code,
          city: formData.city,
          phone: formData.phone,
          email: formData.email,
          instagram_url: formData.instagram_url,
          facebook_url: formData.facebook_url,
          tiktok_url: formData.tiktok_url,
          youtube_url: formData.youtube_url,
          twitter_url: formData.twitter_url,
          linkedin_url: formData.linkedin_url,
          other_contact: formData.other_contact,
        })
        .eq('id', user?.id);

      if (error) throw error;

      setHasChanges(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error saving contact info:', error);
      alert('Kunde inte spara. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-lobster text-3xl text-gray-800 mb-2">Kontaktuppgifter</h2>
        <p className="text-gray-600">Hantera hur kunder kan nå dig</p>
      </div>

      <div className="rounded-lg shadow p-6 space-y-6" style={{ backgroundColor: '#f6f2e0' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-1" />
              Adress
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Gata och nummer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postnummer
            </label>
            <input
              type="text"
              value={formData.postal_code}
              onChange={(e) => handleChange('postal_code', e.target.value)}
              placeholder="123 45"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ort
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="T.ex. Stockholm"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="border-t border-gray-300 pt-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Kontakt</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-1" />
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="070-123 45 67"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-1" />
                E-post
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="din@email.se"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Sociala medier</h3>
          <p className="text-sm text-gray-600 mb-4">
            Ange fullständiga URL:er till dina sociala medier. Dessa visas automatiskt på din kökssida.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Instagram size={16} className="inline mr-1" />
                Instagram
              </label>
              <input
                type="url"
                value={formData.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/dittkok"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Facebook size={16} className="inline mr-1" />
                Facebook
              </label>
              <input
                type="url"
                value={formData.facebook_url}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/dittkok"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TikTok
              </label>
              <input
                type="url"
                value={formData.tiktok_url}
                onChange={(e) => handleChange('tiktok_url', e.target.value)}
                placeholder="https://tiktok.com/@dittkok"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Youtube size={16} className="inline mr-1" />
                YouTube
              </label>
              <input
                type="url"
                value={formData.youtube_url}
                onChange={(e) => handleChange('youtube_url', e.target.value)}
                placeholder="https://youtube.com/@dittkok"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Twitter size={16} className="inline mr-1" />
                Twitter (X)
              </label>
              <input
                type="url"
                value={formData.twitter_url}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
                placeholder="https://twitter.com/dittkok"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Linkedin size={16} className="inline mr-1" />
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => handleChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/company/dittkok"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Övrig kontaktinformation
          </label>
          <textarea
            value={formData.other_contact}
            onChange={(e) => handleChange('other_contact', e.target.value)}
            placeholder="T.ex. särskilda öppettider, speciella instruktioner..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-6 py-2 rounded-lg text-white font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#56c5c5' }}
          >
            {saving ? 'Sparar...' : 'Spara ändringar'}
          </button>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 rounded-lg shadow-lg p-4 animate-fade-in" style={{ backgroundColor: '#56c5c5' }}>
          <p className="text-white font-medium">✓ Sparat!</p>
        </div>
      )}
    </div>
  );
};
