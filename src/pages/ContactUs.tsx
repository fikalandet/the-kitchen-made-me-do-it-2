import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Send } from 'lucide-react';

interface TextLines {
  lines: string[];
  rotate: boolean;
  interval_seconds: number;
  placement: string;
}

interface ContactUsPageData {
  image_url: string | null;
  image_placement: string;
  title_text: string;
  title_font: string;
  title_weight: string;
  title_size: string;
  title_color: string;
  title_align: string;
  text_lines: TextLines;
  ingress_text: string | null;
  ingress_font: string;
  ingress_weight: string;
  ingress_size: string;
  ingress_color: string;
  ingress_align: string;
  background_type: string;
  background_color: string;
  background_image: string | null;
  form_background_color: string;
  form_border_radius: string;
  form_padding: string;
}

interface FormData {
  name: string;
  customer_id: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  honeypot: string;
}

export function ContactUs() {
  const { user } = useAuth();
  const [pageData, setPageData] = useState<ContactUsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    customer_id: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    honeypot: ''
  });

  useEffect(() => {
    fetchPageData();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_id: user.id,
        email: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!pageData?.text_lines?.rotate || !pageData.text_lines.lines.length) return;

    const interval = setInterval(() => {
      setCurrentLineIndex(prev => (prev + 1) % pageData.text_lines.lines.length);
    }, (pageData.text_lines.interval_seconds || 10) * 1000);

    return () => clearInterval(interval);
  }, [pageData]);

  const fetchPageData = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_us_page')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (data) setPageData(data);
    } catch (err) {
      console.error('Error fetching page data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFontFamily = (font: string) => {
    const fonts: Record<string, string> = {
      poppins: 'Poppins, sans-serif',
      lobster: 'Lobster, cursive',
      roboto: 'Roboto, sans-serif',
      open_sans: 'Open Sans, sans-serif',
      lato: 'Lato, sans-serif',
      playfair: 'Playfair Display, serif',
      montserrat: 'Montserrat, sans-serif',
      merriweather: 'Merriweather, serif',
      inter: 'Inter, sans-serif',
      default: 'system-ui, sans-serif'
    };
    return fonts[font] || fonts.default;
  };

  const getTextSize = (size: string) => {
    const sizes: Record<string, string> = {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    };
    return sizes[size] || sizes.md;
  };

  const getTitleSize = (size: string) => {
    const sizes: Record<string, string> = {
      sm: '1.5rem',
      md: '2rem',
      lg: '2.5rem',
      xl: '3rem',
      '2xl': '4rem'
    };
    return sizes[size] || sizes.xl;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Namn är obligatoriskt';
    }

    if (!user && !formData.email.trim()) {
      newErrors.email = 'E-post är obligatorisk';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ogiltig e-postadress';
    }

    if (!formData.subject) {
      newErrors.subject = 'Ämne är obligatoriskt';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Meddelande är obligatoriskt';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.honeypot) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const { data, error } = await supabase
        .from('contact_tickets')
        .insert([{
          user_id: user?.id || null,
          customer_id: formData.customer_id || null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message,
          honeypot: formData.honeypot || null
        }])
        .select()
        .single();

      if (error) throw error;

      setTicketId(data.id);
      setSubmitted(true);
      setFormData({
        name: '',
        customer_id: user?.id || '',
        email: user?.email || '',
        phone: '',
        subject: '',
        message: '',
        honeypot: ''
      });
    } catch (err) {
      console.error('Error submitting ticket:', err);
      setErrors({ submit: 'Ett fel uppstod. Försök igen.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f6f2e0' }}>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

  const bgStyle: React.CSSProperties = {
    backgroundColor: pageData?.background_type === 'color' ? (pageData?.background_color || '#f6f2e0') : 'transparent',
    backgroundImage: pageData?.background_type === 'image' && pageData?.background_image ? `url(${pageData.background_image})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  const textLines = pageData?.text_lines;
  const currentLine = textLines?.rotate && textLines.lines.length > 0
    ? textLines.lines[currentLineIndex]
    : null;

  const getBorderRadius = (radius: string) => {
    const radiuses: Record<string, string> = {
      none: '0',
      small: '0.375rem',
      medium: '1.25rem',
      large: '1.5rem'
    };
    return radiuses[radius] || radiuses.medium;
  };

  const getPadding = (padding: string) => {
    const paddings: Record<string, string> = {
      small: '1.5rem',
      medium: '2rem',
      large: '3rem'
    };
    return paddings[padding] || paddings.medium;
  };

  const formWrapperStyle: React.CSSProperties = {
    backgroundColor: pageData?.form_background_color || '#ffffff',
    borderRadius: getBorderRadius(pageData?.form_border_radius || 'medium'),
    padding: getPadding(pageData?.form_padding || 'medium')
  };

  const imageOnLeft = pageData?.image_placement === 'left';

  const contentSection = (
    <div>
      <h1
        className="mb-4"
        style={{
          fontFamily: getFontFamily(pageData?.title_font || 'lobster'),
          fontWeight: pageData?.title_weight === 'bold' ? '700' : '400',
          fontSize: getTitleSize(pageData?.title_size || 'xl'),
          color: pageData?.title_color || '#000000',
          textAlign: (pageData?.title_align as any) || 'center'
        }}
      >
        {pageData?.title_text || 'Kontakta oss'}
      </h1>

      {currentLine && (
        <p
          className="mb-4 transition-opacity duration-500"
          style={{
            fontFamily: getFontFamily(pageData?.title_font || 'poppins'),
            fontWeight: '400',
            fontSize: getTextSize('lg'),
            color: pageData?.title_color || '#000000',
            textAlign: (pageData?.title_align as any) || 'center'
          }}
        >
          {currentLine}
        </p>
      )}

      {pageData?.ingress_text && (
        <p
          className="mb-8"
          style={{
            fontFamily: getFontFamily(pageData?.ingress_font || 'poppins'),
            fontWeight: pageData?.ingress_weight === 'bold' ? '700' : '400',
            fontSize: getTextSize(pageData?.ingress_size || 'lg'),
            color: pageData?.ingress_color || '#374151',
            textAlign: (pageData?.ingress_align as any) || 'center'
          }}
        >
          {pageData.ingress_text}
        </p>
      )}

      <div className="mt-8">
        {submitted ? (
          <div style={formWrapperStyle} className="shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tack för ditt meddelande!</h2>
            <p className="text-gray-600 mb-4">
              Vi har mottagit ditt ärende och återkommer så snart vi kan.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Ärendenummer: <span className="font-mono">{ticketId?.slice(0, 8)}</span>
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 bg-[#a1c798] text-white rounded-lg hover:bg-[#8fb386] transition-colors"
            >
              Skicka ett nytt meddelande
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={formWrapperStyle} className="shadow-sm space-y-6">
            <div style={{ position: 'absolute', left: '-9999px' }}>
              <label htmlFor="honeypot">Lämna detta fält tomt</label>
              <input
                type="text"
                id="honeypot"
                name="honeypot"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Namn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ditt namn"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {user && (
              <div>
                <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Kund-ID
                </label>
                <input
                  type="text"
                  id="customer_id"
                  value={formData.customer_id}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Detta fält fylls i automatiskt när du är inloggad</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-post {!user && <span className="text-red-500">*</span>}
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                readOnly={!!user}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent ${
                  user ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="din@email.se"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefon (valfritt)
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent"
                placeholder="070-123 45 67"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Ämne <span className="text-red-500">*</span>
              </label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Välj ämne...</option>
                <option value="Betalning">Betalning</option>
                <option value="Guldskeden">Guldskeden</option>
                <option value="Info">Info</option>
                <option value="Klagomål">Klagomål</option>
                <option value="Poäng">Poäng</option>
                <option value="Support">Support</option>
                <option value="Önskemål">Önskemål</option>
                <option value="Övrigt">Övrigt</option>
              </select>
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Meddelande <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#a1c798] focus:border-transparent resize-none ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Skriv ditt meddelande här..."
              />
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-4 bg-[#a1c798] text-white font-semibold rounded-lg hover:bg-[#8fb386] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                'Skickar...'
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Skicka meddelande
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  const borderRadius = getBorderRadius(pageData?.form_border_radius || 'medium');

  const imageSection = pageData?.image_url ? (
    <div
      className="h-full min-h-[280px] md:min-h-0 overflow-hidden shadow-lg"
      style={{ borderRadius }}
    >
      <img
        src={pageData.image_url}
        alt="Kontakta oss"
        className="w-full h-full object-cover"
      />
    </div>
  ) : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f2e0' }}>
      <div style={bgStyle} className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {pageData?.image_url ? (
            <>
              <div
                className="hidden md:grid gap-8 items-stretch"
                style={{
                  gridTemplateColumns: imageOnLeft ? '40fr 60fr' : '60fr 40fr'
                }}
              >
                {imageOnLeft ? (
                  <>
                    {imageSection}
                    {contentSection}
                  </>
                ) : (
                  <>
                    {contentSection}
                    {imageSection}
                  </>
                )}
              </div>
              <div className="md:hidden space-y-8">
                {imageSection}
                {contentSection}
              </div>
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              {contentSection}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
