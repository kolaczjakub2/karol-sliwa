import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SeoService } from '../../core/services/seo.service';

interface TimelineItem {
  period: string;
  title: string;
  description: string;
}

interface Highlight {
  value: string;
  label: string;
}

interface FeatureCard {
  icon: string;
  kicker: string;
  title: string;
  description: string;
}

interface EventCard {
  year: string;
  title: string;
  place: string;
}

interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

@Component({
  selector: 'ks-about',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  private readonly seo = inject(SeoService);

  readonly portraitUrl = 'https://karolsliwa.com/wp-content/uploads/2019/03/12122561_1040071692699736_6667472967283408481_n.jpg';

  readonly highlights: Highlight[] = [
    { value: '2006', label: 'start strony o NBA' },
    { value: '2007', label: 'początek pracy jako sędzia koszykówki' },
    { value: 'NBA / FIBA', label: 'akredytacje i relacje z dużych imprez' },
    { value: 'Ålandy', label: 'dom między Szwecją i Finlandią' }
  ];

  readonly featureCards: FeatureCard[] = [
    {
      icon: 'sports_basketball',
      kicker: 'Parkiet',
      title: 'Sędzia i były gracz amatorski',
      description: 'Od czerwca 2007 roku sędziuje koszykówkę, a wcześniej przez wiele sezonów grał w amatorskiej lidze w Lublinie.'
    },
    {
      icon: 'public',
      kicker: 'Relacje',
      title: 'Akredytacje NBA i FIBA',
      description: 'Pracował przy dużych wydarzeniach koszykarskich w Europie i Ameryce Północnej, także przy Finałach NBA.'
    },
    {
      icon: 'mic',
      kicker: 'Głos',
      title: 'NBA Small Talk i Karol Mówi',
      description: 'Autorskie teksty, podcast i obserwacje pisane bez redakcyjnego autopilota, z dużą ilością kontekstu.'
    }
  ];

  readonly eventCards: EventCard[] = [
    { year: '2014', title: 'Mistrzostwa Świata', place: 'Hiszpania' },
    { year: '2015', title: 'EuroBasket', place: 'Francja' },
    { year: '2016', title: 'NBA All-Star Weekend', place: 'Toronto' },
    { year: '2017', title: 'FIBA Asia Cup', place: 'Liban' },
    { year: '2017', title: 'EuroBasket', place: 'Helsinki' },
    { year: '2019', title: 'Finały NBA', place: 'USA / Kanada' }
  ];

  readonly socialLinks: SocialLink[] = [
    { label: 'Facebook', href: 'https://www.facebook.com/KarolMowiNBA', icon: 'thumb_up' },
    { label: 'Instagram', href: 'https://www.instagram.com/karol__sliwa/', icon: 'photo_camera' },
    { label: 'X / Twitter', href: 'https://twitter.com/KarolMowiNBA', icon: 'alternate_email' },
    { label: 'YouTube', href: 'https://www.youtube.com/@KarolMowi', icon: 'smart_display' }
  ];

  readonly timeline: TimelineItem[] = [
    {
      period: '2006 - dziś',
      title: 'Karol Mówi',
      description: 'Autorska strona o NBA prowadzona nieprzerwanie od października 2006 roku.'
    },
    {
      period: '2007 - dziś',
      title: 'Sędzia koszykarski',
      description: 'Od czerwca 2007 roku na parkietach jako arbiter, od sezonu 2013/14 także w Finlandii i Szwecji.'
    },
    {
      period: '2008 - 2012',
      title: 'Probasket.pl',
      description: 'Praca redakcyjna przy jednym z ważnych polskich serwisów koszykarskich.'
    },
    {
      period: '2009 - 2016',
      title: 'Magazyn MVP',
      description: 'Stała współpraca z papierowym magazynem o NBA oraz jego stroną internetową.'
    },
    {
      period: '2014 - 2020',
      title: 'Relacje z imprez NBA i FIBA',
      description: 'Mistrzostwa Świata, EuroBaskety, NBA All-Star Weekend, Finały NBA i inne duże wydarzenia.'
    },
    {
      period: '2020',
      title: 'Pytanie do Michaela Jordana',
      description: 'W styczniu 2020 roku zadał pytanie Michaelowi Jordanowi podczas oficjalnej dostępności medialnej.'
    }
  ];

  constructor() {
    this.seo.setPage({
      title: 'O mnie | Karol Mowi',
      description: 'Poznaj Karola Sliwe: autora strony Karol Mowi, sedziego koszykarskiego oraz tworce tekstow i podcastow o NBA.',
      path: '/o-mnie',
      image: this.portraitUrl,
      breadcrumbs: [
        { name: 'Start', path: '/' },
        { name: 'O mnie', path: '/o-mnie' }
      ]
    });
  }
}
