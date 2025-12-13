import { TextStyle } from '../types/landingPage';

export function getTextStyleClasses(style: TextStyle): string {
  const classes: string[] = [];

  switch (style.font) {
    case 'Lobster':
      classes.push('font-lobster');
      break;
    case 'Poppins':
    default:
      classes.push('font-sans');
      break;
  }

  if (style.style === 'bold' || style.style === 'italic') {
    if (style.style === 'bold') classes.push('font-bold');
    if (style.style === 'italic') classes.push('italic');
  }

  if (style.style === 'underline') {
    classes.push('underline');
  }

  switch (style.size) {
    case 'xs':
      classes.push('text-sm');
      break;
    case 's':
      classes.push('text-base');
      break;
    case 'm':
      classes.push('text-lg');
      break;
    case 'l':
      classes.push('text-2xl md:text-3xl');
      break;
    case 'xl':
      classes.push('text-3xl md:text-4xl lg:text-5xl');
      break;
  }

  switch (style.alignment) {
    case 'left':
      classes.push('text-left');
      break;
    case 'center':
      classes.push('text-center');
      break;
    case 'right':
      classes.push('text-right');
      break;
  }

  return classes.join(' ');
}

export function getTextStyleInline(style: TextStyle): React.CSSProperties {
  return {
    color: style.color || '#000000',
  };
}
