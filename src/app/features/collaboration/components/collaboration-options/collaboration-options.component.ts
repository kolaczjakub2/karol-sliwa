import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CooperationOption } from '../../models/collaboration-page.model';

@Component({
  selector: 'ks-collaboration-options',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './collaboration-options.component.html',
  styleUrl: './collaboration-options.component.scss'
})
export class CollaborationOptionsComponent {
  readonly options = input.required<CooperationOption[]>();
}
