import { Component, input } from '@angular/core';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon.component';
import { CooperationOption } from '../../models/collaboration-page.model';

@Component({
  selector: 'ks-collaboration-options',
  standalone: true,
  imports: [AppIconComponent],
  templateUrl: './collaboration-options.component.html',
  styleUrl: './collaboration-options.component.scss'
})
export class CollaborationOptionsComponent {
  readonly options = input.required<CooperationOption[]>();
}
