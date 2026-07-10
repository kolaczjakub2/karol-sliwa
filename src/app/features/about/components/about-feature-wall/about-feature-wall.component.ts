import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FeatureCard } from '../../models/about-page.model';

@Component({
  selector: 'ks-about-feature-wall',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './about-feature-wall.component.html',
  styleUrl: './about-feature-wall.component.scss'
})
export class AboutFeatureWallComponent {
  readonly cards = input.required<FeatureCard[]>();
}
