import { Component, input, output } from '@angular/core';
import { CategoryTileComponent } from '../../../../shared/components/category-tile/category-tile.component';
import { FormatTile } from '../../models/home-section.model';

@Component({
  selector: 'ks-home-topics',
  standalone: true,
  imports: [CategoryTileComponent],
  templateUrl: './home-topics.component.html',
  styleUrl: './home-topics.component.scss'
})
export class HomeTopicsComponent {
  readonly formats = input.required<FormatTile[]>();
  readonly formatSelected = output<string>();
}
