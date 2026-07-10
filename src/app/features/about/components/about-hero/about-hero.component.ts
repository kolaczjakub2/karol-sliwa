import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ks-about-hero',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './about-hero.component.html',
  styleUrl: './about-hero.component.scss'
})
export class AboutHeroComponent {
  readonly portraitUrl = input.required<string>();
}
