import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon.component';
import { CollaborationBrand, CooperationOption } from '../../models/collaboration-page.model';

@Component({
  selector: 'ks-collaboration-hero',
  standalone: true,
  imports: [RouterLink, AppIconComponent],
  templateUrl: './collaboration-hero.component.html',
  styleUrl: './collaboration-hero.component.scss'
})
export class CollaborationHeroComponent {
  readonly email = input.required<string>();
  readonly brands = input.required<CollaborationBrand[]>();
  readonly options = input.required<CooperationOption[]>();
}
