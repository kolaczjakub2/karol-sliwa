import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
const HOME_POSTS_POOL_SIZE = 64;

@Component({
  selector: 'ks-home',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
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
  private readonly wp = inject(WordPressService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);

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
      title: 'Karol Mowi | NBA od 2006',
      description: 'Artykuly, newsy, analizy i podcast o NBA od Karola Sliwy. Autorski glos o koszykowce od 2006 roku.',
      path: '/'
    });

    this.loadPosts();

    const autoplayId = setInterval(() => this.nextHero(true), 8500);
    this.destroyRef.onDestroy(() => clearInterval(autoplayId));
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
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  private findPostByKeyword(keywords: string[]): PostViewModel | undefined {
    return this.posts().find((post) => {
      const haystack = `${post.title} ${post.excerptText} ${post.topicNames.join(' ')}`.toLowerCase();
      return keywords.some((keyword) => haystack.includes(keyword));
    });
  }
}
