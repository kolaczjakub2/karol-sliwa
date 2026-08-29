import { Component, RESPONSE_INIT, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'ks-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
  private readonly responseInit = inject(RESPONSE_INIT);
  private readonly seo = inject(SeoService);

  constructor() {
    if (this.responseInit) {
      this.responseInit.status = 404;
    }

    this.seo.setPage({
      title: '404 | Karol Mówi',
      description: 'Nie znaleziono strony pod tym adresem.',
      path: '/404',
      noIndex: true
    });
  }
}
