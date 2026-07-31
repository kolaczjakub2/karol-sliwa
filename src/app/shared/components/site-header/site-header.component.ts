import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
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
  imports: [RouterLink],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss'
})
export class SiteHeaderComponent {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly theme = inject(ThemeService);
  readonly menuOpen = signal(false);
  readonly currentUrl = signal(this.readCurrentUrl());

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
    ).subscribe((event) => this.setCurrentUrl(event.urlAfterRedirects));

    if (!this.isBrowser) {
      return;
    }

    const win = this.document.defaultView;
    if (!win) {
      return;
    }

    const syncMenu = () => this.setCurrentUrl(this.readCurrentUrl());
    win.addEventListener('scroll', syncMenu, { passive: true });
    win.addEventListener('popstate', syncMenu);
    win.addEventListener('hashchange', syncMenu);
    this.destroyRef.onDestroy(() => {
      win.removeEventListener('scroll', syncMenu);
      win.removeEventListener('popstate', syncMenu);
      win.removeEventListener('hashchange', syncMenu);
    });
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
    const targetUrl = `${item.routerLink}#${fragment}`;
    const win = this.document.defaultView;

    if (win && this.isSamePath(win.location.pathname, item.routerLink)) {
      win.history.replaceState(win.history.state, '', targetUrl);
      this.setCurrentUrl(targetUrl);
      this.scrollToFragment(fragment);
      return;
    }

    this.router.navigateByUrl(targetUrl).then(() => {
      this.setCurrentUrl(this.readCurrentUrl());
      this.scrollToFragment(fragment);
    });
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  themeButtonLabel(): string {
    return this.theme.isLight() ? 'Przełącz na ciemny motyw' : 'Przełącz na jasny motyw';
  }

  private scrollToFragment(fragment: string, attempt = 0): void {
    const win = this.document.defaultView;
    if (!win) {
      return;
    }

    const target = this.document.getElementById(fragment);

    if (target) {
      const header = this.document.querySelector('header.site-header');
      const headerHeight = header instanceof HTMLElement ? header.getBoundingClientRect().height : 96;
      const scrollTop = target.getBoundingClientRect().top + win.scrollY - headerHeight - 12;

      win.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
      return;
    }

    if (attempt < 20) {
      win.setTimeout(() => this.scrollToFragment(fragment, attempt + 1), 120);
    }
  }

  private readCurrentUrl(): string {
    if (!this.isBrowser) {
      return this.normalizeUrl(this.router.url);
    }

    const win = this.document.defaultView;
    if (!win) {
      return this.normalizeUrl(this.router.url);
    }

    return this.normalizeUrl(`${win.location.pathname}${win.location.search}${win.location.hash}`);
  }

  private setCurrentUrl(value: string): void {
    const normalized = this.normalizeUrl(value);
    if (this.currentUrl() === normalized) {
      return;
    }

    this.currentUrl.set(normalized);
  }

  private normalizeUrl(value: string): string {
    const pathWithHash = value.replace(/\?.*(?=#|$)/, '');
    return pathWithHash || '/';
  }

  private isSamePath(currentPath: string, targetPath: string): boolean {
    return this.normalizePath(currentPath) === this.normalizePath(targetPath);
  }

  private normalizePath(path: string): string {
    if (!path || path === '/') {
      return '/';
    }

    return path.endsWith('/') ? path.slice(0, -1) : path;
  }
}
