import { Component, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { AboutContactComponent } from './components/about-contact/about-contact.component';
import { AboutEventsComponent } from './components/about-events/about-events.component';
import { AboutHeroComponent } from './components/about-hero/about-hero.component';
import { AboutOffCourtComponent } from './components/about-off-court/about-off-court.component';
import { EventCard, SocialLink } from './models/about-page.model';

@Component({
  selector: 'ks-about',
  standalone: true,
  imports: [
    AboutHeroComponent,
    AboutEventsComponent,
    AboutOffCourtComponent,
    AboutContactComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  private readonly seo = inject(SeoService);

  readonly portraitUrl = 'https://karolsliwa.com/wp-content/uploads/2019/03/12122561_1040071692699736_6667472967283408481_n.jpg';

  readonly eventCards: EventCard[] = [
    { year: '2014', title: 'Mistrzostwa Świata', place: 'Hiszpania' },
    { year: '2015', title: 'EuroBasket', place: 'Francja' },
    { year: '2016', title: 'NBA All-Star Weekend', place: 'Toronto' },
    { year: '2017', title: 'FIBA Asia Cup', place: 'Liban' },
    { year: '2017', title: 'EuroBasket', place: 'Helsinki' },
    { year: '2019', title: 'Finały NBA', place: 'USA / Kanada' }
  ];

  readonly milestoneCards: EventCard[] = [
    { year: '2006–dziś', title: 'Karol Mówi', place: 'Autorska strona o NBA' },
    { year: '2007–dziś', title: 'Sędzia koszykarski', place: 'Polska, Finlandia i Szwecja' },
    { year: '2008–2012', title: 'Probasket.pl', place: 'Praca redakcyjna' }
  ];

  readonly socialLinks: SocialLink[] = [
    { label: 'Facebook', href: 'https://www.facebook.com/KarolMowiNBA', icon: 'facebook' },
    { label: 'Instagram', href: 'https://www.instagram.com/karol__sliwa/', icon: 'instagram' },
    { label: 'X / Twitter', href: 'https://twitter.com/KarolMowiNBA', icon: 'x' },
    { label: 'YouTube', href: 'https://www.youtube.com/@KarolMowi', icon: 'youtube' }
  ];

  constructor() {
    this.seo.setPage({
      title: 'O mnie | Karol Mówi',
      description: 'Poznaj Karola Śliwę: autora strony Karol Mówi, sędziego koszykarskiego oraz twórcę tekstów i podcastów o NBA.',
      path: '/o-mnie',
      image: this.portraitUrl,
      breadcrumbs: [
        { name: 'Start', path: '/' },
        { name: 'O mnie', path: '/o-mnie' }
      ]
    });
  }
}
