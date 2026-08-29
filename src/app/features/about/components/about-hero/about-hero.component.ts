import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon.component';

@Component({
  selector: 'ks-about-hero',
  standalone: true,
  imports: [RouterLink, AppIconComponent],
  templateUrl: './about-hero.component.html',
  styleUrl: './about-hero.component.scss'
})
export class AboutHeroComponent {
  readonly portraitUrl = input.required<string>();
}
