import { Component, input } from '@angular/core';
import { PromiseItem } from '../../models/collaboration-page.model';

@Component({
  selector: 'ks-collaboration-promises',
  standalone: true,
  templateUrl: './collaboration-promises.component.html',
  styleUrl: './collaboration-promises.component.scss'
})
export class CollaborationPromisesComponent {
  readonly promises = input.required<PromiseItem[]>();
}
