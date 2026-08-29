import { Component, input } from '@angular/core';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon.component';

@Component({
  selector: 'ks-collaboration-contact',
  standalone: true,
  imports: [AppIconComponent],
  templateUrl: './collaboration-contact.component.html',
  styleUrl: './collaboration-contact.component.scss'
})
export class CollaborationContactComponent {
  readonly email = input.required<string>();
}
