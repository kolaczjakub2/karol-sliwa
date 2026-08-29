import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WordPressService } from '../../core/services/wordpress.service';
import { PostViewModel } from '../../core/models/wp-post.model';
import { SeoService } from '../../core/services/seo.service';
import { HomeAuthorComponent } from './components/home-author/home-author.component';
import { HomeHeroComponent } from './components/home-hero/home-hero.component';
import { HomeLatestComponent } from './components/home-latest/home-latest.component';
import { HomePodcastComponent } from './components/home-podcast/home-podcast.component';
import { HomeTopicsComponent } from './components/home-topics/home-topics.component';
import { FormatTile, HeroDirection } from './models/home-section.model';

const LATEST_POSTS_LIMIT = 8;
const HOME_POSTS_POOL_SIZE = 12;
const HOME_SCROLL_STORAGE_KEY = 'ks-home-scroll-y';

@Component({
  selector: 'ks-home',
  standalone: true,
  imports: [
    RouterLink,
    HomeHeroComponent,
    HomeTopicsComponent,
    HomeLatestComponent,
    HomePodcastComponent,
    HomeAuthorComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly router = inject(Router);
  private readonly wp = inject(WordPressService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sectionIds = ['najnowsze', 'podcast'] as const;
  private readonly observedSections = new Map<string, Element>();
  private readonly sectionOffset = 130;
  private readonly shouldRestoreScroll = this.shouldRestoreScrollOnEntry();
  private sectionSyncBound = false;
  private fragmentNavigationInProgress = false;
  private activeSectionFragment: string | null = null;

  readonly posts = signal<PostViewModel[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeFilter = signal('Wszystko');
  readonly heroIndex = signal(0);
  readonly heroDirection = signal<HeroDirection>('next');
  readonly heroPaused = signal(false);

  readonly heroPosts = computed(() => {
    const posts = this.posts();
    const withImages = posts.filter((post) => post.hasFeaturedImage);
    const withoutImages = posts.filter((post) => !post.hasFeaturedImage);

    return [...withImages, ...withoutImages].slice(0, 4);
  });

  readonly featured = computed(() => {
    const posts = this.heroPosts();
    if (!posts.length) return undefined;

    const normalizedIndex = Math.min(this.heroIndex(), posts.length - 1);
    return posts.at(normalizedIndex);
  });

  readonly heroSlide = computed(() => {
    const featured = this.featured();
    return featured ? [featured] : [];
  });

  readonly remainingPosts = computed(() => {
    const heroIds = new Set(this.heroPosts().map((post) => post.id));
    return this.posts().filter((post) => !heroIds.has(post.id));
  });

  readonly latestPosts = computed(() => this.posts().slice(0, LATEST_POSTS_LIMIT));
  readonly podcastPosts = computed(() => this.posts().filter((post) => post.topicNames.includes('Podcast')));
  readonly podcastPost = computed(
    () => this.podcastPosts().at(0) ?? this.findPostByKeyword(['podcast', 'small talk', 'nba small talk']) ?? this.remainingPosts().at(0)
  );
  readonly recentPodcastPosts = computed(() => {
    const currentPodcastId = this.podcastPost()?.id;
    return this.podcastPosts()
      .filter((post) => post.id !== currentPodcastId)
      .slice(0, 3);
  });

  readonly filterOptions = ['Wszystko', 'Podcast', 'Newsy'];
  readonly filteredLatest = computed(() => {
    const active = this.activeFilter();
    const posts = this.posts();

    if (active === 'Wszystko') return this.latestPosts();

    return posts
      .filter((post) => post.topicNames.includes(active))
      .slice(0, LATEST_POSTS_LIMIT);
  });

  readonly formats: FormatTile[] = [
    {
      icon: 'forum',
      title: 'Podcast',
      description: 'NBA Small Talk i rozmowy o tym, co naprawdę dzieje się wokół ligi.'
    },
    {
      icon: 'newspaper',
      title: 'Newsy',
      description: 'Transfery, draft, zapowiedzi, wyniki i najważniejsze informacje z NBA.'
    }
  ];

  constructor() {
    this.seo.setPage({
      title: 'Karol Mówi | NBA od 2006',
      description: 'Artykuły, newsy, analizy i podcast o NBA od Karola Śliwy. Autorski głos o koszykówce od 2006 roku.',
      path: '/'
    });

    this.loadPosts();

  }

  selectHero(index: number): void {
    if (index === this.heroIndex()) return;
    this.heroDirection.set(index > this.heroIndex() ? 'next' : 'prev');
    this.heroIndex.set(index);
  }

  nextHero(isAutoplay = false): void {
    const postsCount = this.heroPosts().length;
    if (postsCount < 2 || (isAutoplay && this.heroPaused())) return;

    this.heroDirection.set('next');
    this.heroIndex.update((index) => (index + 1) % postsCount);
  }

  previousHero(): void {
    const postsCount = this.heroPosts().length;
    if (postsCount < 2) return;

    this.heroDirection.set('prev');
    this.heroIndex.update((index) => (index - 1 + postsCount) % postsCount);
  }

  setHeroPaused(paused: boolean): void {
    this.heroPaused.set(paused);
  }

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  private loadPosts(): void {
    this.wp.getPosts({ perPage: HOME_POSTS_POOL_SIZE }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ items }) => {
        this.posts.set(items);
        this.loading.set(false);
        this.startSectionUrlSync();
        this.restoreSavedScrollPosition();
        const featuredPost = this.heroPosts().at(0);
        if (featuredPost) {
          this.seo.setPage({
            title: 'Karol Mówi | NBA od 2006',
            description: 'Artykuły, newsy, analizy i podcast o NBA od Karola Śliwy. Autorski głos o koszykówce od 2006 roku.',
            path: '/',
            image: featuredPost.imageUrl,
            imageWidth: featuredPost.imageWidth,
            imageHeight: featuredPost.imageHeight
          });
        }
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  private startSectionUrlSync(): void {
    if (!this.isBrowser) {
      return;
    }

    const win = this.document.defaultView;
    if (!win) {
      return;
    }

    const requestedFragment = win.location.hash.slice(1);
    if (this.sectionIds.includes(requestedFragment as (typeof this.sectionIds)[number])) {
      this.activeSectionFragment = requestedFragment;
      this.fragmentNavigationInProgress = true;
      this.scrollToDeferredFragment(requestedFragment);
    }

    if (!this.sectionSyncBound) {
      const updateFragment = () => {
        this.syncFragmentWithScroll();
        this.persistHomeScrollPosition();
      };
      win.addEventListener('scroll', updateFragment, { passive: true });
      win.addEventListener('resize', updateFragment);
      this.destroyRef.onDestroy(() => {
        win.removeEventListener('scroll', updateFragment);
        win.removeEventListener('resize', updateFragment);
      });
      this.sectionSyncBound = true;
    }

    win.setTimeout(() => {
      this.collectObservedSections();
      if (!this.fragmentNavigationInProgress) {
        this.syncFragmentWithScroll(true);
      }
      this.persistHomeScrollPosition();
    }, 0);
  }

  private scrollToDeferredFragment(fragment: string, attempt = 0): void {
    const win = this.document.defaultView;
    if (!win) return;

    const target = this.document.getElementById(fragment);
    if (this.hasLayoutApi(target)) {
      const header = this.document.querySelector('header.site-header');
      const headerHeight = this.hasLayoutApi(header) ? header.getBoundingClientRect().height : 96;
      const top = target.getBoundingClientRect().top + win.scrollY - headerHeight - 12;
      win.scrollTo({ top: Math.max(0, top), behavior: attempt === 0 ? 'auto' : 'smooth' });

      if (!target.classList.contains('deferred-section')) {
        this.fragmentNavigationInProgress = false;
        this.collectObservedSections();
        this.activeSectionFragment = fragment;
        return;
      }
    }

    if (attempt < 30) {
      win.setTimeout(() => this.scrollToDeferredFragment(fragment, attempt + 1), 100);
    } else {
      this.fragmentNavigationInProgress = false;
      this.collectObservedSections();
      this.syncFragmentWithScroll(true);
    }
  }

  private collectObservedSections(): void {
    this.observedSections.clear();
    for (const id of this.sectionIds) {
      const section = this.document.getElementById(id);
      if (this.hasLayoutApi(section) && section.getClientRects().length > 0) {
        this.observedSections.set(id, section);
      }
    }
  }

  private syncFragmentWithScroll(force = false): void {
    if (this.fragmentNavigationInProgress) {
      return;
    }
    const win = this.document.defaultView;
    if (!win) {
      return;
    }

    if (!this.observedSections.size) {
      this.collectObservedSections();
      if (!this.observedSections.size) {
        return;
      }
    }

    const sections = this.sectionIds
      .map((id) => this.observedSections.get(id))
      .filter((section): section is Element => Boolean(section && this.hasLayoutApi(section)));

    if (!sections.length) {
      return;
    }

    const firstSectionTop = sections[0].getBoundingClientRect().top + win.scrollY;
    if (win.scrollY + this.sectionOffset < firstSectionTop) {
      this.replaceHomeFragment(null, force);
      return;
    }

    let activeSectionId = sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top - this.sectionOffset <= 0) {
        activeSectionId = section.id;
      } else {
        break;
      }
    }

    this.replaceHomeFragment(activeSectionId, force);
  }

  private replaceHomeFragment(fragment: string | null, force = false): void {
    const win = this.document.defaultView;
    if (!win) {
      return;
    }

    if (!force && this.activeSectionFragment === fragment) {
      return;
    }

    this.activeSectionFragment = fragment;
    const path = `${win.location.pathname}${win.location.search}`;
    const currentUrl = `${path}${win.location.hash}`;
    const nextUrl = fragment ? `${path}#${fragment}` : path;
    if (nextUrl === currentUrl) {
      return;
    }

    win.history.replaceState(win.history.state, '', nextUrl);
  }

  private hasLayoutApi(value: unknown): value is Element & {
    getClientRects: () => DOMRectList;
    getBoundingClientRect: () => DOMRect;
  } {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as {
      getClientRects?: unknown;
      getBoundingClientRect?: unknown;
    };

    return typeof candidate.getClientRects === 'function'
      && typeof candidate.getBoundingClientRect === 'function';
  }

  private findPostByKeyword(keywords: string[]): PostViewModel | undefined {
    return this.posts().find((post) => {
      const haystack = `${post.title} ${post.excerptText} ${post.topicNames.join(' ')}`.toLowerCase();
      return keywords.some((keyword) => haystack.includes(keyword));
    });
  }

  private shouldRestoreScrollOnEntry(): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const win = this.document.defaultView;
    if (!win) {
      return false;
    }

    if (win.location.pathname !== '/' || Boolean(win.location.hash)) {
      return false;
    }

    const previousUrl = this.router.getCurrentNavigation()?.previousNavigation?.finalUrl?.toString();
    return this.isArticleUrl(previousUrl);
  }

  private isArticleUrl(value: string | undefined): boolean {
    if (!value) {
      return false;
    }

    const path = value.split(/[?#]/)[0];
    if (path.startsWith('/post/')) {
      return true;
    }

    const segments = path.split('/').filter(Boolean);
    if (segments.length !== 1) {
      return false;
    }

    return !['archiwum', 'o-mnie', 'wspolpraca'].includes(segments[0]);
  }

  private persistHomeScrollPosition(): void {
    if (!this.isBrowser) {
      return;
    }

    const win = this.document.defaultView;
    if (!win) {
      return;
    }

    win.sessionStorage.setItem(HOME_SCROLL_STORAGE_KEY, String(Math.max(0, Math.round(win.scrollY))));
  }

  private restoreSavedScrollPosition(attempt = 0): void {
    if (!this.shouldRestoreScroll || !this.isBrowser) {
      return;
    }

    const win = this.document.defaultView;
    if (!win) {
      return;
    }

    const raw = win.sessionStorage.getItem(HOME_SCROLL_STORAGE_KEY);
    const target = Number(raw);
    if (!Number.isFinite(target) || target <= 0) {
      return;
    }

    const maxScroll = this.document.documentElement.scrollHeight - win.innerHeight;
    if (maxScroll + 4 < target && attempt < 18) {
      win.setTimeout(() => this.restoreSavedScrollPosition(attempt + 1), 90);
      return;
    }

    win.scrollTo({ top: Math.min(target, Math.max(0, maxScroll)), behavior: 'auto' });
  }
}
