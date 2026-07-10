import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SocialLink } from '../../models/about-page.model';

@Component({
  selector: 'ks-about-off-court',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './about-off-court.component.html',
  styleUrl: './about-off-court.component.scss'
})
export class AboutOffCourtComponent {
  readonly socialLinks = input.required<SocialLink[]>();
}
