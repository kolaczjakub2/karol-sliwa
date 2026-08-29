import { Component, input, output } from '@angular/core';
import { AppIconComponent } from '../app-icon/app-icon.component';

@Component({
  selector: 'ks-category-tile',
  standalone: true,
  imports: [AppIconComponent],
  templateUrl: './category-tile.component.html',
  styleUrl: './category-tile.component.scss'
})
export class CategoryTileComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly selected = output<string>();
}
