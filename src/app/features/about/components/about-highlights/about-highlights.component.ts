import { Component, input } from '@angular/core';
import { Highlight } from '../../models/about-page.model';

@Component({
  selector: 'ks-about-highlights',
  standalone: true,
  templateUrl: './about-highlights.component.html',
  styleUrl: './about-highlights.component.scss'
})
export class AboutHighlightsComponent {
  readonly highlights = input.required<Highlight[]>();
}
