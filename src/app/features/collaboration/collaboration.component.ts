import { Component, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { CollaborationContactComponent } from './components/collaboration-contact/collaboration-contact.component';
import { CollaborationHeroComponent } from './components/collaboration-hero/collaboration-hero.component';
import { CollaborationOptionsComponent } from './components/collaboration-options/collaboration-options.component';
import { CollaborationPromisesComponent } from './components/collaboration-promises/collaboration-promises.component';
import { CollaborationTrustedComponent } from './components/collaboration-trusted/collaboration-trusted.component';
import { CooperationOption, PromiseItem } from './models/collaboration-page.model';

@Component({
  selector: 'ks-collaboration',
  standalone: true,
  imports: [
    CollaborationHeroComponent,
    CollaborationPromisesComponent,
    CollaborationOptionsComponent,
    CollaborationTrustedComponent,
    CollaborationContactComponent
  ],
  templateUrl: './collaboration.component.html',
  styleUrl: './collaboration.component.scss'
})
export class CollaborationComponent {
  private readonly seo = inject(SeoService);

  readonly email = 'karolsli@wp.pl';
  readonly brands = ['Tissot', 'Unibet', 'New Balance', 'Decathlon', 'Tarmak', 'Converse', 'Reebok', 'Sklep Koszykarza', 'Wydawnictwo SQN', 'Compressport'];
  readonly promises: PromiseItem[] = [
    { value: 'Od 2006', label: 'ciągłość i rozpoznawalność' },
    { value: 'NBA', label: 'jasny kontekst odbiorców' },
    { value: 'Podcast', label: 'formaty tekstowe i audio' },
    { value: 'Bez szablonu', label: 'pomysł ważniejszy niż pakiet' }
  ];
  readonly options: CooperationOption[] = [
    {
      icon: 'campaign',
      title: 'Kampania lub akcja specjalna',
      description: 'Jednorazowy projekt, launch, konkurs, promocja produktu albo dłuższa obecność przy wybranym temacie.'
    },
    {
      icon: 'edit_note',
      title: 'Tekst, analiza, lokowanie',
      description: 'Naturalna forma obecności przy treściach NBA, koszykówce, sprzęcie, książkach lub wydarzeniach.'
    },
    {
      icon: 'mic',
      title: 'Podcast i formaty audio',
      description: 'Rozmowa, wzmianka, partner odcinka albo wspólna seria, jeśli temat pasuje do społeczności Karol Mówi.'
    },
    {
      icon: 'sports_basketball',
      title: 'Eventy i projekty koszykarskie',
      description: 'Turniej, premiera, spotkanie, prowadzenie, moderacja albo współpraca przy wydarzeniu sportowym.'
    }
  ];

  constructor() {
    this.seo.setPage({
      title: 'Wspolpraca | Karol Mowi',
      description: 'Wspolpraca reklamowa, podcastowa i eventowa przy tresciach NBA, koszykowce oraz projektach sportowych.',
      path: '/wspolpraca',
      breadcrumbs: [
        { name: 'Start', path: '/' },
        { name: 'Wspolpraca', path: '/wspolpraca' }
      ]
    });
  }
}
