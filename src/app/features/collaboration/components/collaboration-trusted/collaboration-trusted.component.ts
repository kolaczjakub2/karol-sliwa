import { Component, input } from '@angular/core';

@Component({
  selector: 'ks-collaboration-trusted',
  standalone: true,
  templateUrl: './collaboration-trusted.component.html',
  styleUrl: './collaboration-trusted.component.scss'
})
export class CollaborationTrustedComponent {
  readonly brands = input.required<string[]>();
}
