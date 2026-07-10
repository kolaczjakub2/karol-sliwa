import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ks-collaboration-hero',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './collaboration-hero.component.html',
  styleUrl: './collaboration-hero.component.scss'
})
export class CollaborationHeroComponent {
  readonly email = input.required<string>();
}
