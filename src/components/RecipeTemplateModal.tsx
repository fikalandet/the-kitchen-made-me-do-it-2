import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Palette, Type, Bold, Italic, Image as ImageIcon, Grid } from 'lucide-react';

interface RecipeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  cuisine_type: string | null;
  meal_type: string | null;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  membership_level: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface RecipeTemplateModalProps {
  template: RecipeTemplate;
  templateIndex: number;
  onClose: () => void;
  onSave: (data: any) => void;
}

const RecipeTemplateModal: React.FC<RecipeTemplateModalProps> = ({ template, templateIndex, onClose, onSave }) => {
  const [recipeTitle, setRecipeTitle] = useState(template.name);
  const [description, setDescription] = useState(template.description);
  const [servings, setServings] = useState(template.servings);
  const [prepTime, setPrepTime] = useState(template.prep_time_minutes);
  const [cookTime, setCookTime] = useState(template.cook_time_minutes);

  const [bgColor, setBgColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const [recipeImages, setRecipeImages] = useState<string[]>([]);
  const [imageCount, setImageCount] = useState(1);
  const [imageShape, setImageShape] = useState<'round' | 'square' | 'rectangle'>('rectangle');
  const [imageSize, setImageSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [imagePosition, setImagePosition] = useState<'top' | 'bottom' | 'left' | 'right' | 'center'>('top');
  const [collageType, setCollageType] = useState<'none' | 'grid' | 'scattered' | 'overlap'>('none');

  const [titleFont, setTitleFont] = useState('');
  const [titleColor, setTitleColor] = useState('#000000');
  const [titleSize, setTitleSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('large');
  const [titleBold, setTitleBold] = useState(false);
  const [titleItalic, setTitleItalic] = useState(false);
  const [titleUnderline, setTitleUnderline] = useState(false);

  const [descFont, setDescFont] = useState('');
  const [descColor, setDescColor] = useState('#333333');
  const [descSize, setDescSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [descBold, setDescBold] = useState(false);
  const [descItalic, setDescItalic] = useState(false);

  const [accentColor, setAccentColor] = useState('#a1c798');
  const [styleTheme, setStyleTheme] = useState<'romantic' | 'luxury' | 'budget' | 'modern' | 'rustic' | 'playful'>('modern');

  const [showInfoBoxes, setShowInfoBoxes] = useState(true);
  const [infoBoxStyle, setInfoBoxStyle] = useState<'emoji' | 'icon' | 'text' | 'minimal' | 'badge'>('emoji');
  const [infoBoxBgColor, setInfoBoxBgColor] = useState('#ffffff');
  const [infoBoxTextColor, setInfoBoxTextColor] = useState('#000000');
  const [infoBoxBorderColor, setInfoBoxBorderColor] = useState('#a1c798');
  const [infoBoxOpacity, setInfoBoxOpacity] = useState(80);
  const [infoBoxShape, setInfoBoxShape] = useState<'rounded' | 'square' | 'pill'>('rounded');
  const [showPrepTime, setShowPrepTime] = useState(true);
  const [showCookTime, setShowCookTime] = useState(true);
  const [showServings, setShowServings] = useState(true);
  const [showDifficulty, setShowDifficulty] = useState(true);
  const [prepIcon, setPrepIcon] = useState('⏱️');
  const [cookIcon, setCookIcon] = useState('🔥');
  const [servingsIcon, setServingsIcon] = useState('👥');
  const [difficultyIcon, setDifficultyIcon] = useState('📊');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    webFonts.forEach(font => {
      if (!document.querySelector(`link[href="${font.url}"]`)) {
        const link = document.createElement('link');
        link.href = font.url;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    });
  }, []);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const promises = files.slice(0, imageCount).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(images => {
      setRecipeImages(images);
    });
  };

  const handleSave = () => {
    onSave({
      recipe_title: recipeTitle,
      description_story: description,
      servings,
      prep_time_minutes: prepTime,
      cook_time_minutes: cookTime,
      category: template.category,
      cuisine_types: template.cuisine_type ? [template.cuisine_type] : [],
      difficulty: template.difficulty
    });
    onClose();
  };

  const themePresets = {
    romantic: {
      bgColor: '#fff5f7',
      titleColor: '#d4526e',
      descColor: '#6b4e58',
      accentColor: '#f4a7bb',
      titleFont: 'font-serif',
      descFont: 'font-serif',
      decoration: '💕'
    },
    luxury: {
      bgColor: '#1a1a1a',
      titleColor: '#d4af37',
      descColor: '#e5e5e5',
      accentColor: '#8b7355',
      titleFont: 'font-serif',
      descFont: 'font-sans',
      decoration: '✨'
    },
    budget: {
      bgColor: '#f9f9f9',
      titleColor: '#2d5016',
      descColor: '#4a4a4a',
      accentColor: '#7cb342',
      titleFont: 'font-sans',
      descFont: 'font-sans',
      decoration: '💰'
    },
    modern: {
      bgColor: '#ffffff',
      titleColor: '#2c3e50',
      descColor: '#34495e',
      accentColor: '#3498db',
      titleFont: 'font-sans',
      descFont: 'font-sans',
      decoration: '🔷'
    },
    rustic: {
      bgColor: '#f5efe6',
      titleColor: '#5d4037',
      descColor: '#6d4c41',
      accentColor: '#8d6e63',
      titleFont: 'font-mono',
      descFont: 'font-serif',
      decoration: '🌾'
    },
    playful: {
      bgColor: '#fff9e6',
      titleColor: '#ff6b6b',
      descColor: '#4ecdc4',
      accentColor: '#ffe66d',
      titleFont: 'font-sans',
      descFont: 'font-sans',
      decoration: '🎨'
    }
  };

  const applyTheme = (theme: keyof typeof themePresets) => {
    const preset = themePresets[theme];
    setStyleTheme(theme);
    setBgColor(preset.bgColor);
    setTitleColor(preset.titleColor);
    setDescColor(preset.descColor);
    setAccentColor(preset.accentColor);
    setTitleFont(preset.titleFont);
    setDescFont(preset.descFont);
  };

  const fontOptions = [
    { name: 'Serif Klassisk', class: 'font-serif', style: 'Traditionell, tidlös' },
    { name: 'Sans Modern', class: 'font-sans', style: 'Ren, professionell' },
    { name: 'Mono Teknisk', class: 'font-mono', style: 'Precis, strukturerad' },
  ];

  const extendedFontOptions = [
    { name: 'Serif Klassisk', class: 'font-serif', category: 'Klassisk' },
    { name: 'Sans Modern', class: 'font-sans', category: 'Modern' },
    { name: 'Mono Teknisk', class: 'font-mono', category: 'Teknisk' },
  ];

  const webFonts = [
    { name: 'Dancing Script', class: 'dancing-script', category: 'Handskriven', url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap' },
    { name: 'Pacifico', class: 'pacifico', category: 'Lekfull', url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap' },
    { name: 'Great Vibes', class: 'great-vibes', category: 'Elegant Skrivstil', url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap' },
    { name: 'Satisfy', class: 'satisfy', category: 'Handskriven', url: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap' },
    { name: 'Amatic SC', class: 'amatic-sc', category: 'Handskriven', url: 'https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap' },
    { name: 'Indie Flower', class: 'indie-flower', category: 'Lekfull', url: 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap' },
    { name: 'Caveat', class: 'caveat', category: 'Handskriven', url: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap' },
    { name: 'Courgette', class: 'courgette', category: 'Rund', url: 'https://fonts.googleapis.com/css2?family=Courgette&display=swap' },
    { name: 'Cookie', class: 'cookie', category: 'Elegant Skrivstil', url: 'https://fonts.googleapis.com/css2?family=Cookie&display=swap' },
    { name: 'Allura', class: 'allura', category: 'Elegant Skrivstil', url: 'https://fonts.googleapis.com/css2?family=Allura&display=swap' },
    { name: 'Kaushan Script', class: 'kaushan-script', category: 'Handskriven', url: 'https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap' },
    { name: 'Lobster', class: 'lobster', category: 'Fet', url: 'https://fonts.googleapis.com/css2?family=Lobster&display=swap' },
    { name: 'Righteous', class: 'righteous', category: 'Fet', url: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap' },
    { name: 'Permanent Marker', class: 'permanent-marker', category: 'Lekfull', url: 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap' },
    { name: 'Shadows Into Light', class: 'shadows-into-light', category: 'Handskriven', url: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap' },
    { name: 'Pathway Gothic One', class: 'pathway-gothic-one', category: 'Modern', url: 'https://fonts.googleapis.com/css2?family=Pathway+Gothic+One&display=swap' },
    { name: 'Abril Fatface', class: 'abril-fatface', category: 'Lyxig', url: 'https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap' },
    { name: 'Playfair Display', class: 'playfair-display', category: 'Lyxig', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap' },
    { name: 'Cinzel', class: 'cinzel', category: 'Lyxig', url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap' },
    { name: 'Satisfy', class: 'satisfy', category: 'Romantisk', url: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap' },
  ];

  const titleSizeClasses = {
    small: 'text-3xl',
    medium: 'text-5xl',
    large: 'text-7xl',
    xlarge: 'text-9xl'
  };

  const descSizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl'
  };

  const imageSizeClasses = {
    small: { w: 'w-32', h: 'h-32' },
    medium: { w: 'w-64', h: 'h-64' },
    large: { w: 'w-96', h: 'h-96' }
  };

  const imageShapeClasses = {
    round: 'rounded-full',
    square: 'rounded-lg aspect-square',
    rectangle: 'rounded-xl aspect-video'
  };

  const removeImage = (index: number) => {
    setRecipeImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const renderImages = () => {
    if (recipeImages.length === 0) return null;

    const sizeConfig = imageSizeClasses[imageSize];
    const shapeClass = imageShapeClasses[imageShape];

    if (collageType === 'grid' && recipeImages.length > 1) {
      return (
        <div className={`grid ${recipeImages.length === 2 ? 'grid-cols-2' : recipeImages.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
          {recipeImages.map((img, idx) => (
            <div key={idx} className="relative group">
              <img src={img} alt={`Recipe ${idx + 1}`} className={`${sizeConfig.w} ${sizeConfig.h} ${shapeClass} object-cover`} />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    if (collageType === 'scattered') {
      return (
        <div className="relative h-96">
          {recipeImages.map((img, idx) => (
            <div key={idx} className="absolute group" style={{ top: `${idx * 20}%`, left: `${idx * 15}%`, zIndex: idx }}>
              <img
                src={img}
                alt={`Recipe ${idx + 1}`}
                className={`${sizeConfig.w} ${sizeConfig.h} ${shapeClass} object-cover transform rotate-${idx * 12 - 6}`}
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    if (collageType === 'overlap') {
      return (
        <div className="relative flex justify-center items-center h-96">
          {recipeImages.map((img, idx) => (
            <div key={idx} className="absolute group" style={{ left: `${30 + idx * 10}%`, zIndex: recipeImages.length - idx, transform: `rotate(${idx * 5 - 5}deg)` }}>
              <img
                src={img}
                alt={`Recipe ${idx + 1}`}
                className={`${sizeConfig.w} ${sizeConfig.h} ${shapeClass} object-cover shadow-2xl`}
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={`flex justify-center items-center gap-4 flex-wrap`}>
        {recipeImages.map((img, idx) => (
          <div key={idx} className="relative group">
            <img src={img} alt={`Recipe ${idx + 1}`} className={`${sizeConfig.w} ${sizeConfig.h} ${shapeClass} object-cover shadow-lg`} />
            <button
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const getImagePositionClass = () => {
    switch(imagePosition) {
      case 'top': return 'flex-col';
      case 'bottom': return 'flex-col-reverse';
      case 'left': return 'flex-row';
      case 'right': return 'flex-row-reverse';
      case 'center': return 'flex-col';
      default: return 'flex-col';
    }
  };

  const getInfoBoxShapeClass = () => {
    switch(infoBoxShape) {
      case 'rounded': return 'rounded-xl';
      case 'square': return 'rounded-none';
      case 'pill': return 'rounded-full';
      default: return 'rounded-xl';
    }
  };

  const renderInfoBox = (icon: string, label: string, content: React.ReactNode, unit: string) => {
    const shapeClass = getInfoBoxShapeClass();
    const bgOpacity = infoBoxOpacity / 100;
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 255, g: 255, b: 255 };
    };
    const rgb = hexToRgb(infoBoxBgColor);
    const bgColorWithOpacity = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bgOpacity})`;

    if (infoBoxStyle === 'emoji') {
      return (
        <div className={`text-center p-4 backdrop-blur shadow-lg border-2 ${shapeClass}`} style={{ backgroundColor: bgColorWithOpacity, borderColor: infoBoxBorderColor }}>
          <div className="text-3xl mb-2">{icon}</div>
          <label className="block text-xs font-bold mb-2" style={{ color: infoBoxTextColor }}>{label}</label>
          {content}
          {unit && <span className="text-xs" style={{ color: infoBoxTextColor }}>{unit}</span>}
        </div>
      );
    }

    if (infoBoxStyle === 'icon') {
      return (
        <div className={`text-center p-4 backdrop-blur shadow-lg border-2 ${shapeClass}`} style={{ backgroundColor: bgColorWithOpacity, borderColor: infoBoxBorderColor }}>
          <div className="text-5xl mb-2">{icon}</div>
          {content}
          {unit && <span className="text-xs" style={{ color: infoBoxTextColor }}>{unit}</span>}
        </div>
      );
    }

    if (infoBoxStyle === 'text') {
      return (
        <div className={`text-center p-4 backdrop-blur shadow-lg border-2 ${shapeClass}`} style={{ backgroundColor: bgColorWithOpacity, borderColor: infoBoxBorderColor }}>
          <label className="block text-sm font-bold mb-2" style={{ color: infoBoxTextColor }}>{label}</label>
          {content}
          {unit && <span className="text-xs" style={{ color: infoBoxTextColor }}>{unit}</span>}
        </div>
      );
    }

    if (infoBoxStyle === 'minimal') {
      return (
        <div className={`text-center p-3 ${shapeClass}`} style={{ backgroundColor: bgColorWithOpacity }}>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">{icon}</span>
            {content}
            {unit && <span className="text-xs" style={{ color: infoBoxTextColor }}>{unit}</span>}
          </div>
        </div>
      );
    }

    if (infoBoxStyle === 'badge') {
      return (
        <div className={`inline-block px-4 py-2 ${shapeClass} shadow-md`} style={{ backgroundColor: infoBoxBorderColor }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-bold" style={{ color: infoBoxTextColor }}>{label}:</span>
            <div className="inline-block">{content}</div>
            {unit && <span className="text-xs" style={{ color: infoBoxTextColor }}>{unit}</span>}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden relative flex">

        {/* Customization Sidebar */}
        <div className="w-96 bg-gray-50 border-r border-gray-200 p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Anpassa Recept
            </h3>
          </div>

          {/* Theme Presets */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Välj Stil-tema</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(themePresets).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => applyTheme(key as keyof typeof themePresets)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    styleTheme === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{theme.decoration}</span>
                    <span className="text-sm font-bold capitalize">{key === 'romantic' ? 'Romantiskt' : key === 'luxury' ? 'Lyxigt' : key === 'budget' ? 'Budget' : key === 'modern' ? 'Modernt' : key === 'rustic' ? 'Rustikt' : 'Lekfullt'}</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.bgColor, border: '1px solid #ddd' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.titleColor }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.accentColor }}></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Background Settings */}
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Bakgrundsfärg
            </label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Bakgrundsbild (valfritt)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm font-medium"
            >
              {backgroundImage ? 'Ändra bakgrundsbild' : 'Ladda upp bakgrundsbild'}
            </button>
            {backgroundImage && (
              <button
                onClick={() => setBackgroundImage(null)}
                className="w-full mt-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                Ta bort bakgrundsbild
              </button>
            )}
          </div>

          {/* Recipe Images */}
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Receptbilder
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Antal bilder</label>
                <select
                  value={imageCount}
                  onChange={(e) => setImageCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="1">1 bild</option>
                  <option value="2">2 bilder</option>
                  <option value="3">3 bilder</option>
                  <option value="4">4 bilder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bildform</label>
                <select
                  value={imageShape}
                  onChange={(e) => setImageShape(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="rectangle">Rektangulär</option>
                  <option value="square">Fyrkantig</option>
                  <option value="round">Rund</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bildstorlek</label>
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="small">Liten</option>
                  <option value="medium">Medium</option>
                  <option value="large">Stor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Placering</label>
                <select
                  value={imagePosition}
                  onChange={(e) => setImagePosition(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="top">Uppe</option>
                  <option value="bottom">Nere</option>
                  <option value="left">Vänster</option>
                  <option value="right">Höger</option>
                  <option value="center">Mitten</option>
                </select>
              </div>

              {imageCount > 1 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    <Grid className="w-3 h-3 inline mr-1" />
                    Kollage-typ
                  </label>
                  <select
                    value={collageType}
                    onChange={(e) => setCollageType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="none">Ingen kollage</option>
                    <option value="grid">Rutnät</option>
                    <option value="scattered">Utspridd</option>
                    <option value="overlap">Överlappande</option>
                  </select>
                </div>
              )}

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm font-medium"
              >
                {recipeImages.length > 0 ? `Ändra bilder (${recipeImages.length})` : 'Ladda upp bilder'}
              </button>
              {recipeImages.length > 0 && (
                <button
                  onClick={() => setRecipeImages([])}
                  className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  Ta bort bilder
                </button>
              )}
            </div>
          </div>

          {/* Title Styling */}
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Rubrik-stil
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Typsnitt</label>
                <select
                  value={titleFont}
                  onChange={(e) => setTitleFont(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm max-h-60 overflow-y-auto"
                >
                  <option value="">Standard</option>
                  <optgroup label="System">
                    {extendedFontOptions.map((font) => (
                      <option key={font.class} value={font.class}>
                        {font.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Handskrivna & Eleganta">
                    {webFonts.map((font) => (
                      <option key={font.class} value={font.class}>
                        {font.name} ({font.category})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Storlek</label>
                <select
                  value={titleSize}
                  onChange={(e) => setTitleSize(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="small">Liten</option>
                  <option value="medium">Medium</option>
                  <option value="large">Stor</option>
                  <option value="xlarge">Extra stor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Färg</label>
                <input
                  type="color"
                  value={titleColor}
                  onChange={(e) => setTitleColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setTitleBold(!titleBold)}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                    titleBold ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTitleItalic(!titleItalic)}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                    titleItalic ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTitleUnderline(!titleUnderline)}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 text-sm ${
                    titleUnderline ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  U
                </button>
              </div>
            </div>
          </div>

          {/* Description Styling */}
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Beskrivnings-stil
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Typsnitt</label>
                <select
                  value={descFont}
                  onChange={(e) => setDescFont(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm max-h-60 overflow-y-auto"
                >
                  <option value="">Standard</option>
                  <optgroup label="System">
                    {extendedFontOptions.map((font) => (
                      <option key={font.class} value={font.class}>
                        {font.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Handskrivna & Eleganta">
                    {webFonts.map((font) => (
                      <option key={font.class} value={font.class}>
                        {font.name} ({font.category})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Storlek</label>
                <select
                  value={descSize}
                  onChange={(e) => setDescSize(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="small">Liten</option>
                  <option value="medium">Medium</option>
                  <option value="large">Stor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Färg</label>
                <input
                  type="color"
                  value={descColor}
                  onChange={(e) => setDescColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setDescBold(!descBold)}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                    descBold ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDescItalic(!descItalic)}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                    descItalic ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <Italic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Accent Color */}
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Accentfärg</label>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
            />
          </div>

          {/* Info Boxes Customization */}
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Info-rutor
            </label>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showInfoBoxes}
                  onChange={(e) => setShowInfoBoxes(e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">Visa info-rutor</label>
              </div>

              {showInfoBoxes && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Stil</label>
                    <select
                      value={infoBoxStyle}
                      onChange={(e) => setInfoBoxStyle(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="emoji">Emoji & Kort</option>
                      <option value="icon">Endast Symboler</option>
                      <option value="text">Endast Text</option>
                      <option value="minimal">Minimalistisk</option>
                      <option value="badge">Märke-stil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Form</label>
                    <select
                      value={infoBoxShape}
                      onChange={(e) => setInfoBoxShape(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="rounded">Rundad</option>
                      <option value="square">Fyrkantig</option>
                      <option value="pill">Piller</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Bakgrundsfärg</label>
                    <input
                      type="color"
                      value={infoBoxBgColor}
                      onChange={(e) => setInfoBoxBgColor(e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Textfärg</label>
                    <input
                      type="color"
                      value={infoBoxTextColor}
                      onChange={(e) => setInfoBoxTextColor(e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Kantfärg</label>
                    <input
                      type="color"
                      value={infoBoxBorderColor}
                      onChange={(e) => setInfoBoxBorderColor(e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Transparens: {infoBoxOpacity}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={infoBoxOpacity}
                      onChange={(e) => setInfoBoxOpacity(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <label className="block text-xs font-medium text-gray-600 mb-2">Visa specifika rutor</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showPrepTime}
                          onChange={(e) => setShowPrepTime(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label className="text-sm text-gray-700 flex-1">Förberedelse</label>
                        <input
                          type="text"
                          value={prepIcon}
                          onChange={(e) => setPrepIcon(e.target.value)}
                          className="w-12 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          maxLength={2}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showCookTime}
                          onChange={(e) => setShowCookTime(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label className="text-sm text-gray-700 flex-1">Tillagning</label>
                        <input
                          type="text"
                          value={cookIcon}
                          onChange={(e) => setCookIcon(e.target.value)}
                          className="w-12 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          maxLength={2}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showServings}
                          onChange={(e) => setShowServings(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label className="text-sm text-gray-700 flex-1">Portioner</label>
                        <input
                          type="text"
                          value={servingsIcon}
                          onChange={(e) => setServingsIcon(e.target.value)}
                          className="w-12 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          maxLength={2}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showDifficulty}
                          onChange={(e) => setShowDifficulty(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label className="text-sm text-gray-700 flex-1">Svårighet</label>
                        <input
                          type="text"
                          value={difficultyIcon}
                          onChange={(e) => setDifficultyIcon(e.target.value)}
                          className="w-12 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          maxLength={2}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Preview */}
        <div className="flex-1 relative overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className={`min-h-full p-12 flex ${getImagePositionClass()} gap-8`}
            style={{
              backgroundColor: bgColor,
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Images */}
            {recipeImages.length > 0 && imagePosition !== 'center' && (
              <div className={`${imagePosition === 'left' || imagePosition === 'right' ? 'w-1/3' : 'w-full'}`}>
                {renderImages()}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 space-y-6">
              <div className="text-center">
                <input
                  type="text"
                  value={recipeTitle}
                  onChange={(e) => setRecipeTitle(e.target.value)}
                  className={`w-full text-center bg-transparent border-none focus:outline-none ${titleSizeClasses[titleSize]} ${titleFont || 'font-serif'} ${titleBold ? 'font-bold' : ''} ${titleItalic ? 'italic' : ''} ${titleUnderline ? 'underline' : ''}`}
                  style={{ color: titleColor }}
                  placeholder="Receptnamn..."
                />
                <div className="w-32 h-1 mx-auto mt-4" style={{ backgroundColor: accentColor }}></div>
              </div>

              {imagePosition === 'center' && recipeImages.length > 0 && (
                <div className="my-8">
                  {renderImages()}
                </div>
              )}

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full text-center bg-transparent border-none focus:outline-none resize-none leading-relaxed ${descSizeClasses[descSize]} ${descFont || 'font-sans'} ${descBold ? 'font-semibold' : ''} ${descItalic ? 'italic' : ''}`}
                style={{ color: descColor }}
                placeholder="Beskriv din rätt..."
              />

              {/* Recipe Details */}
              {showInfoBoxes && (
                <div className={`grid grid-cols-2 ${showPrepTime && showCookTime && showServings && showDifficulty ? 'md:grid-cols-4' : showPrepTime && showCookTime && showServings || showPrepTime && showCookTime && showDifficulty || showPrepTime && showServings && showDifficulty || showCookTime && showServings && showDifficulty ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 mt-8`}>
                  {showPrepTime && renderInfoBox(
                    prepIcon,
                    'Förberedelse',
                    <input
                      type="number"
                      value={prepTime}
                      onChange={(e) => setPrepTime(Number(e.target.value))}
                      className="w-full text-center bg-transparent border-2 rounded-lg px-2 py-1 focus:outline-none font-bold"
                      style={{ borderColor: infoBoxBorderColor, color: infoBoxTextColor }}
                    />,
                    'min'
                  )}

                  {showCookTime && renderInfoBox(
                    cookIcon,
                    'Tillagning',
                    <input
                      type="number"
                      value={cookTime}
                      onChange={(e) => setCookTime(Number(e.target.value))}
                      className="w-full text-center bg-transparent border-2 rounded-lg px-2 py-1 focus:outline-none font-bold"
                      style={{ borderColor: infoBoxBorderColor, color: infoBoxTextColor }}
                    />,
                    'min'
                  )}

                  {showServings && renderInfoBox(
                    servingsIcon,
                    'Portioner',
                    <input
                      type="number"
                      value={servings}
                      onChange={(e) => setServings(Number(e.target.value))}
                      className="w-full text-center bg-transparent border-2 rounded-lg px-2 py-1 focus:outline-none font-bold"
                      style={{ borderColor: infoBoxBorderColor, color: infoBoxTextColor }}
                    />,
                    'pers'
                  )}

                  {showDifficulty && renderInfoBox(
                    difficultyIcon,
                    'Svårighet',
                    <div className="text-center py-1 font-bold" style={{ color: infoBoxTextColor }}>
                      {template.difficulty}
                    </div>,
                    ''
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-white border-t flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-2xl transition-all text-lg transform hover:scale-105"
              style={{ backgroundColor: accentColor }}
            >
              Använd denna mall
            </button>
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Avbryt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeTemplateModal;
