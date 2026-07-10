import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ks-archive-hero',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  templateUrl: './archive-hero.component.html',
  styleUrl: './archive-hero.component.scss'
})
export class ArchiveHeroComponent {
  readonly searchTerm = input.required<string>();
  readonly filterOptions = input.required<string[]>();
  readonly activeFilter = input.required<string>();

  readonly searchChange = output<string>();
  readonly filterChange = output<string>();
}
