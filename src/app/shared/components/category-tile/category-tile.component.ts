import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ks-category-tile',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './category-tile.component.html',
  styleUrl: './category-tile.component.scss'
})
export class CategoryTileComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly selected = output<string>();
}
