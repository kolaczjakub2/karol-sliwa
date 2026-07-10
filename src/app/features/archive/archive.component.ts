import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject, tap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { PostViewModel } from '../../core/models/wp-post.model';
import { WordPressService } from '../../core/services/wordpress.service';
import { SeoService } from '../../core/services/seo.service';
import { ArchiveHeroComponent } from './components/archive-hero/archive-hero.component';
import { ArchivePaginatorComponent } from './components/archive-paginator/archive-paginator.component';

const ARCHIVE_FILTER_POOL_SIZE = 100;

@Component({
  selector: 'ks-archive',
  standalone: true,
  imports: [MatProgressSpinnerModule, ArticleCardComponent, ArchiveHeroComponent, ArchivePaginatorComponent],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss'
})
export class ArchiveComponent {
  private readonly wp = inject(WordPressService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly search$ = new Subject<string>();
  private latestRequestId = 0;

  readonly posts = signal<PostViewModel[]>([]);
  readonly filteredPosts = signal<PostViewModel[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly page = signal(1);
  readonly perPage = signal(12);
  readonly total = signal(0);
  readonly searchTerm = signal('');
  readonly activeFilter = signal('Wszystko');

  readonly filterOptions = ['Wszystko', 'Podcast', 'Newsy'];
  readonly pageSizeOptions = [6, 12, 24];

  readonly displayedPosts = computed(() => {
    if (this.activeFilter() === 'Wszystko') return this.posts();

    const start = (this.page() - 1) * this.perPage();
    return this.filteredPosts().slice(start, start + this.perPage());
  });

  readonly displayedTotal = computed(() => this.activeFilter() === 'Wszystko' ? this.total() : this.filteredPosts().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.displayedTotal() / this.perPage())));
  readonly pageNumbers = computed(() => {
    const current = this.page();
    const totalPages = this.totalPages();
    const start = Math.max(1, Math.min(current - 1, totalPages - 2));
    const end = Math.min(totalPages, start + 2);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  constructor() {
    this.seo.setPage({
      title: 'Archiwum NBA | Karol Mowi',
      description: 'Archiwum tekstow, newsow, podcastow i analiz NBA publikowanych na stronie Karol Mowi.',
      path: '/archiwum',
      breadcrumbs: [
        { name: 'Start', path: '/' },
        { name: 'Archiwum', path: '/archiwum' }
      ]
    });

    this.loadPosts();

    this.search$.pipe(
      debounceTime(320),
      distinctUntilChanged(),
      tap(() => {
        this.page.set(1);
        this.loading.set(true);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.loadPosts());
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.search$.next(value);
  }

  setFilter(filter: string): void {
    if (filter === this.activeFilter()) return;

    this.activeFilter.set(filter);
    this.page.set(1);
    this.loadPosts();
  }

  setPage(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages());
    if (nextPage === this.page()) return;

    this.page.set(nextPage);

    if (this.activeFilter() === 'Wszystko') {
      this.loadPosts();
    }
  }

  setPageSize(value: number | string): void {
    const perPage = Number(value);
    if (!Number.isFinite(perPage) || perPage === this.perPage()) return;

    this.perPage.set(perPage);
    this.page.set(1);

    if (this.activeFilter() === 'Wszystko') {
      this.loadPosts();
    }
  }

  private loadPosts(): void {
    this.loading.set(true);
    this.error.set(null);

    const requestId = ++this.latestRequestId;
    const activeFilter = this.activeFilter();
    const options = activeFilter === 'Wszystko'
      ? { page: this.page(), perPage: this.perPage(), search: this.searchTerm() }
      : { page: 1, perPage: ARCHIVE_FILTER_POOL_SIZE, search: this.searchTerm() };

    this.wp.getPosts(options)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ items, total }) => {
          if (requestId !== this.latestRequestId) return;

          if (activeFilter === 'Wszystko') {
            this.posts.set(items);
          } else {
            this.filteredPosts.set(items.filter((post) => post.topicNames.includes(activeFilter)));
          }

          this.total.set(total);
          this.loading.set(false);
        },
        error: (error: Error) => {
          if (requestId !== this.latestRequestId) return;

          this.error.set(error.message);
          this.loading.set(false);
        }
      });
  }
}
