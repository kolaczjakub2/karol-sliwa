import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ks-collaboration-contact',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './collaboration-contact.component.html',
  styleUrl: './collaboration-contact.component.scss'
})
export class CollaborationContactComponent {
  readonly email = input.required<string>();
}
