import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Upload, X } from 'lucide-react';

export const KitchenInfoTab: React.FC = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    kitchen_name: '',
    description: '',
    profile_image_url: '',
    banner_image_url: '',
    welcome_video_url: '',
    show_obs_notification: false,
    obs_notification_title: '',
    obs_notification_text: '',
    obs_notification_bg_color: 'light-yellow',
    wish_food_enabled: false,
    wish_food_info_text: '',
  });

  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({
    profile_image: false,
    banner_image: false,
    welcome_video: false,
  });

  useEffect(() => {
    if (user) {
      fetchKitchenInfo();
    }
  }, [user]);

  const fetchKitchenInfo = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('kitchen_name, description, profile_image_url, banner_image_url, welcome_video_url, show_obs_notification, obs_notification_title, obs_notification_text, obs_notification_bg_color, wish_food_enabled, wish_food_info_text')
      .eq('id', user?.id)
      .single();

    if (data) {
      setFormData({
        kitchen_name: data.kitchen_name || '',
        description: data.description || '',
        profile_image_url: data.profile_image_url || '',
        banner_image_url: data.banner_image_url || '',
        welcome_video_url: data.welcome_video_url || '',
        show_obs_notification: data.show_obs_notification || false,
        obs_notification_title: data.obs_notification_title || '',
        obs_notification_text: data.obs_notification_text || '',
        obs_notification_bg_color: data.obs_notification_bg_color || 'light-yellow',
        wish_food_enabled: data.wish_food_enabled || false,
        wish_food_info_text: data.wish_food_info_text || '',
      });
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleFileUpload = async (file: File, type: 'profile_image' | 'banner_image' | 'welcome_video') => {
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      if (type === 'welcome_video') {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = async () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 60) {
            alert('Videon är för lång. Max 60 sekunder tillåtet.');
            setUploading(prev => ({ ...prev, [type]: false }));
            return;
          }
          await uploadFile(file, type);
        };
        video.src = URL.createObjectURL(file);
      } else {
        await uploadFile(file, type);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Kunde inte ladda upp filen. Försök igen.');
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const uploadFile = async (file: File, type: 'profile_image' | 'banner_image' | 'welcome_video') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('kitchen-media')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('kitchen-media')
        .getPublicUrl(fileName);

      const fieldMap = {
        profile_image: 'profile_image_url',
        banner_image: 'banner_image_url',
        welcome_video: 'welcome_video_url',
      };

      handleChange(fieldMap[type], publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          kitchen_name: formData.kitchen_name,
          description: formData.description,
          profile_image_url: formData.profile_image_url,
          banner_image_url: formData.banner_image_url,
          welcome_video_url: formData.welcome_video_url,
          show_obs_notification: formData.show_obs_notification,
          obs_notification_title: formData.obs_notification_title,
          obs_notification_text: formData.obs_notification_text,
          obs_notification_bg_color: formData.obs_notification_bg_color,
          wish_food_enabled: formData.wish_food_enabled,
          wish_food_info_text: formData.wish_food_info_text,
        })
        .eq('id', user?.id);

      if (error) throw error;

      setHasChanges(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error saving kitchen info:', error);
      alert('Kunde inte spara. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-lobster text-3xl text-gray-800 mb-2">Köksinfo</h2>
        <p className="text-gray-600">Berätta om ditt kök och ladda upp bilder</p>
      </div>

      <div className="rounded-lg shadow p-6 space-y-6" style={{ backgroundColor: '#f6f2e0' }}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kökets namn <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.kitchen_name}
            onChange={(e) => handleChange('kitchen_name', e.target.value)}
            placeholder="T.ex. Annas Hembageri"
            minLength={2}
            maxLength={60}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.kitchen_name.length}/60 tecken</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beskrivning
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Beskriv ditt kök, din matfilosofi och vad som gör din mat speciell..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profilbild <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            {formData.profile_image_url ? (
              <div className="relative">
                <img
                  src={formData.profile_image_url}
                  alt="Profilbild"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button
                  onClick={() => handleChange('profile_image_url', '')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                {uploading.profile_image ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                ) : (
                  <Upload size={32} className="text-gray-400" />
                )}
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Ladda upp fil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'profile_image')}
                  disabled={uploading.profile_image}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Eller ange URL</label>
                <input
                  type="url"
                  value={formData.profile_image_url}
                  onChange={(e) => handleChange('profile_image_url', e.target.value)}
                  placeholder="Bildlänk (URL)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500">Rekommenderad storlek: 400x400px</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bannerbild
          </label>
          <div className="space-y-2">
            {formData.banner_image_url && (
              <div className="relative">
                <img
                  src={formData.banner_image_url}
                  alt="Banner"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleChange('banner_image_url', '')}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {uploading.banner_image && (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ladda upp fil</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'banner_image')}
                disabled={uploading.banner_image}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Eller ange URL</label>
              <input
                type="url"
                value={formData.banner_image_url}
                onChange={(e) => handleChange('banner_image_url', e.target.value)}
                placeholder="Bildlänk (URL)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500">Rekommenderad storlek: 1920x500px</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Välkomstvideo
          </label>
          <div className="space-y-2">
            {formData.welcome_video_url && (
              <div className="relative">
                <video src={formData.welcome_video_url} controls className="w-full h-48 rounded-lg" />
                <button
                  onClick={() => handleChange('welcome_video_url', '')}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {uploading.welcome_video && (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ladda upp fil <span className="text-red-500">(Max 60 sekunder)</span></label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'welcome_video')}
                disabled={uploading.welcome_video}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Eller ange URL</label>
              <input
                type="url"
                value={formData.welcome_video_url}
                onChange={(e) => handleChange('welcome_video_url', e.target.value)}
                placeholder="Videolänk (URL)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500">Välkomna dina kunder med en kort video (valfritt). <span className="font-semibold">Max 60 sekunder</span></p>
          </div>
        </div>

        <div className="border-t pt-6" style={{ borderColor: '#d1d5db' }}>
          <h3 className="font-lobster text-xl text-gray-800 mb-4">OBS!-rad</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="show_obs"
                checked={formData.show_obs_notification}
                onChange={(e) => handleChange('show_obs_notification', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="show_obs" className="text-sm font-medium text-gray-700">
                Visa OBS!-notifiering på min profil
              </label>
            </div>
            {formData.show_obs_notification && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rubrik (fet)
                  </label>
                  <input
                    type="text"
                    value={formData.obs_notification_title}
                    onChange={(e) => handleChange('obs_notification_title', e.target.value)}
                    placeholder="T.ex. Viktigt meddelande"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text (normal)
                  </label>
                  <textarea
                    value={formData.obs_notification_text}
                    onChange={(e) => handleChange('obs_notification_text', e.target.value)}
                    placeholder="T.ex. Tillfälligt stängt för semester 10-20 augusti"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bakgrundsfärg
                  </label>
                  <select
                    value={formData.obs_notification_bg_color}
                    onChange={(e) => handleChange('obs_notification_bg_color', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light-blue">Blå</option>
                    <option value="light-yellow">Gul</option>
                    <option value="light-purple">Lila</option>
                    <option value="light-pink">Rosa</option>
                    <option value="black">Svart</option>
                    <option value="light-teal">Turkos</option>
                    <option value="white">Vit</option>
                  </select>
                </div>
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Förhandsvisning
                  </label>
                  <div
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor:
                        formData.obs_notification_bg_color === 'light-pink' ? '#fce7f3' :
                        formData.obs_notification_bg_color === 'black' ? '#000000' :
                        formData.obs_notification_bg_color === 'white' ? '#ffffff' :
                        formData.obs_notification_bg_color === 'light-teal' ? '#a8e6e3' :
                        formData.obs_notification_bg_color === 'light-yellow' ? '#fef3c7' :
                        formData.obs_notification_bg_color === 'light-blue' ? '#dbeafe' :
                        formData.obs_notification_bg_color === 'light-purple' ? '#e9d5ff' :
                        '#fef3c7',
                      color: formData.obs_notification_bg_color === 'black' ? '#ffffff' : '#000000'
                    }}
                  >
                    <div>
                      {formData.obs_notification_title && (
                        <div className="font-bold mb-1">{formData.obs_notification_title}</div>
                      )}
                      {formData.obs_notification_text && (
                        <div>{formData.obs_notification_text}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="wish_food_enabled"
                  checked={formData.wish_food_enabled}
                  onChange={(e) => handleChange('wish_food_enabled', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="wish_food_enabled" className="text-sm font-medium text-gray-700">
                  Hos mig kan du önska käk!
                </label>
              </div>
              {formData.wish_food_enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Informationstext för önskningar
                  </label>
                  <textarea
                    value={formData.wish_food_info_text}
                    onChange={(e) => handleChange('wish_food_info_text', e.target.value)}
                    placeholder="T.ex. Jag lagar inte rätter med skaldjür."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Denna text visas högst upp i modalen när kunden ska skriva sin önskan
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving || formData.kitchen_name.length < 2}
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
