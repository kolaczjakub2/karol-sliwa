import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { filter } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';

interface NavItem {
  label: string;
  routerLink: string;
  fragment?: string;
  exact?: boolean;
}

interface SocialLink {
  label: string;
  href: string;
  icon: 'facebook' | 'instagram' | 'x' | 'youtube';
}

@Component({
  selector: 'ks-site-header',
  standalone: true,
  imports: [
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss'
})
export class SiteHeaderComponent {
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);
  readonly menuOpen = signal(false);
  readonly currentUrl = signal(this.router.url);

  readonly socialLinks: SocialLink[] = [
    { label: 'Facebook', href: 'https://www.facebook.com/KarolMowiNBA', icon: 'facebook' },
    { label: 'Instagram', href: 'https://www.instagram.com/karol__sliwa/', icon: 'instagram' },
    { label: 'X', href: 'https://twitter.com/KarolMowiNBA', icon: 'x' },
    { label: 'YouTube', href: 'https://www.youtube.com/@KarolMowi', icon: 'youtube' }
  ];
  readonly navItems: NavItem[] = [
    { label: 'Start', routerLink: '/', exact: true },
    { label: 'Najnowsze', routerLink: '/', fragment: 'najnowsze' },
    { label: 'Podcast', routerLink: '/', fragment: 'podcast' },
    { label: 'Archiwum', routerLink: '/archiwum' },
    { label: 'O mnie', routerLink: '/o-mnie' }
  ];
  readonly mobileNavItems = this.navItems;

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => this.currentUrl.set(event.urlAfterRedirects.split('?')[0]));
  }

  toggleMenu(): void {
    this.menuOpen.update((value) => !value);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  isNavItemActive(item: NavItem): boolean {
    const url = this.currentUrl();

    if (item.fragment) {
      return url === `${item.routerLink}#${item.fragment}`;
    }

    if (item.exact) {
      return url === item.routerLink;
    }

    return url.startsWith(item.routerLink);
  }

  handleNavItemClick(item: NavItem, event: Event): void {
    this.closeMenu();

    const fragment = item.fragment;
    if (!fragment) return;

    event.preventDefault();
    this.router.navigate([item.routerLink], { fragment }).then(() => {
      this.currentUrl.set(this.router.url.split('?')[0]);
      this.scrollToFragment(fragment);
    });
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  themeButtonIcon(): string {
    return this.theme.isLight() ? 'dark_mode' : 'light_mode';
  }

  themeButtonLabel(): string {
    return this.theme.isLight() ? 'Przełącz na ciemny motyw' : 'Przełącz na jasny motyw';
  }

  private scrollToFragment(fragment: string, attempt = 0): void {
    const target = document.getElementById(fragment);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (attempt < 20) {
      window.setTimeout(() => this.scrollToFragment(fragment, attempt + 1), 120);
    }
  }
}
