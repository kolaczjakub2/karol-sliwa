import { Component, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { CollaborationHeroComponent } from './components/collaboration-hero/collaboration-hero.component';
import { CollaborationBrand, CooperationOption } from './models/collaboration-page.model';

@Component({
  selector: 'ks-collaboration',
  standalone: true,
  imports: [
    CollaborationHeroComponent
  ],
  templateUrl: './collaboration.component.html',
  styleUrl: './collaboration.component.scss'
})
export class CollaborationComponent {
  private readonly seo = inject(SeoService);

  readonly email = 'karolsli@wp.pl';
  readonly brands: CollaborationBrand[] = [
    { name: 'Tissot', logoUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Tissot_Logo.svg' },
    { name: 'Unibet', logoUrl: 'https://www.google.com/s2/favicons?domain=unibet.com&sz=128' },
    { name: 'New Balance', logoUrl: 'https://cdn.simpleicons.org/newbalance' },
    { name: 'Decathlon', logoUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Decathlon_Logo.svg' },
    { name: 'Tarmak', logoUrl: 'https://www.google.com/s2/favicons?domain=decathlon.pl&sz=128' },
    { name: 'Converse', logoUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Converse_logo.svg' },
    { name: 'Reebok', logoUrl: 'https://cdn.simpleicons.org/reebok' },
    { name: 'Sklep Koszykarza', logoUrl: 'https://skstore.eu/img/logo.svg?v=356264353639636436' },
    { name: 'Wydawnictwo SQN', logoUrl: 'https://www.google.com/s2/favicons?domain=sqn.pl&sz=128' },
    { name: 'Compressport', logoUrl: 'https://www.google.com/s2/favicons?domain=compressport.com&sz=128' }
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
      title: 'Współpraca | Karol Mówi',
      description: 'Współpraca reklamowa, podcastowa i eventowa przy treściach NBA, koszykówce oraz projektach sportowych.',
      path: '/wspolpraca',
      breadcrumbs: [
        { name: 'Start', path: '/' },
        { name: 'Wspolpraca', path: '/wspolpraca' }
      ]
    });
  }
}
