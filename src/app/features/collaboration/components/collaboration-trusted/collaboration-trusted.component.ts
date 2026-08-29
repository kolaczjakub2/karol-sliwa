import { Component, input } from '@angular/core';
import { CollaborationBrand } from '../../models/collaboration-page.model';

@Component({
  selector: 'ks-collaboration-trusted',
  standalone: true,
  templateUrl: './collaboration-trusted.component.html',
  styleUrl: './collaboration-trusted.component.scss'
})
export class CollaborationTrustedComponent {
  readonly brands = input.required<CollaborationBrand[]>();
}
