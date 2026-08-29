import { Component, input } from '@angular/core';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon.component';
import { SocialLink } from '../../models/about-page.model';

@Component({
  selector: 'ks-about-off-court',
  standalone: true,
  imports: [AppIconComponent],
  templateUrl: './about-off-court.component.html',
  styleUrl: './about-off-court.component.scss'
})
export class AboutOffCourtComponent {
  readonly socialLinks = input.required<SocialLink[]>();
}
