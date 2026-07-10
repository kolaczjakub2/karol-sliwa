import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoryLabel',
  standalone: true
})
export class CategoryLabelPipe implements PipeTransform {
  transform(categories: string[] | null | undefined): string {
    return categories?.[0]?.toUpperCase() ?? 'NBA';
  }
}
