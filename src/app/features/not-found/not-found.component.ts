import { Component, RESPONSE_INIT, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'ks-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="not-found">
      <span aria-hidden="true">404</span>
      <h1>Ta strona wypadła poza boisko</h1>
      <p>Nie znaleźliśmy tego adresu. Wróć na stronę główną albo przejdź do archiwum.</p>
      <div>
        <a routerLink="/">Strona główna</a>
        <a routerLink="/archiwum">Archiwum</a>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .not-found { min-height: min(720px, 75vh); display: grid; place-content: center; justify-items: center; gap: 18px; padding: 48px 20px; text-align: center; }
    span { color: var(--color-orange); font: 700 clamp(5rem, 18vw, 12rem)/.8 var(--font-display); }
    h1 { margin: 0; font: 700 clamp(2rem, 5vw, 4rem)/1 var(--font-display); letter-spacing: -.05em; }
    p { max-width: 620px; margin: 0; color: var(--color-muted); line-height: 1.7; }
    div { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
    a { min-height: 48px; display: inline-grid; place-items: center; padding: 0 22px; border: 1px solid var(--color-border); border-radius: 999px; color: var(--color-text); text-decoration: none; font-weight: 800; }
    a:first-child { border-color: var(--color-orange); background: var(--color-orange); color: var(--color-on-accent); }
  `]
})
export class NotFoundComponent {
  private readonly responseInit = inject(RESPONSE_INIT);
  private readonly seo = inject(SeoService);

  constructor() {
    if (this.responseInit) this.responseInit.status = 404;
    this.seo.setPage({
      title: '404 | Karol Mowi',
      description: 'Nie znaleziono strony pod tym adresem.',
      path: '/404',
      noIndex: true
    });
  }
}
