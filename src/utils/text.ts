import { TextStyle } from '../lib/types/landingPage';

export function renderText(value: string | TextStyle | null | undefined): string {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && 'text' in value) {
    return value.text;
  }

  return '';
}
