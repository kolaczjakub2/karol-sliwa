import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripHtml',
  standalone: true
})
export class StripHtmlPipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 160): string {
    if (!value) return '';

    const text = value
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#8217;/g, '’')
      .replace(/\s+/g, ' ')
      .trim();

    return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
  }
}
