import { Component, input } from '@angular/core';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon.component';
import { FeatureCard } from '../../models/about-page.model';

@Component({
  selector: 'ks-about-feature-wall',
  standalone: true,
  imports: [AppIconComponent],
  templateUrl: './about-feature-wall.component.html',
  styleUrl: './about-feature-wall.component.scss'
})
export class AboutFeatureWallComponent {
  readonly cards = input.required<FeatureCard[]>();
}
