import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import {
  CommentSubmission,
  CommentViewModel,
  PagedPosts,
  PostViewModel,
  WpComment,
  WpPost,
  WpTerm
} from '../models/wp-post.model';

interface GetPostsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  categories?: number[];
}

interface TopicRule {
  phrase: string;
  weight: number;
}

interface TopicDefinition {
  name: string;
  rules: TopicRule[];
}

@Injectable({ providedIn: 'root' })
export class WordPressService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'https://karolsliwa.com/wp-json/wp/v2';
  private readonly fallbackImage = 'assets/fallback-nba.svg';
  private readonly topicDefinitions: TopicDefinition[] = [
    {
      name: 'Podcast',
      rules: [
        { phrase: 'nba small talk', weight: 9 },
        { phrase: 'small talk', weight: 8 },
        { phrase: 'podcast', weight: 7 },
        { phrase: 'odcinek', weight: 4 },
        { phrase: 'rozmawiamy', weight: 3 },
        { phrase: 'sluchaj', weight: 3 },
        { phrase: 'gosc', weight: 2 }
      ]
    }
  ];

  getPosts(options: GetPostsOptions = {}): Observable<PagedPosts> {
    let params = new HttpParams()
      .set('_embed', '1')
      .set('page', String(options.page ?? 1))
      .set('per_page', String(options.perPage ?? 12));

    if (options.search?.trim()) {
      params = params.set('search', options.search.trim());
    }

    if (options.categories?.length) {
      params = params.set('categories', options.categories.join(','));
    }

    return this.http
      .get<WpPost[]>(`${this.apiBase}/posts`, { observe: 'response', params })
      .pipe(
        map((response: HttpResponse<WpPost[]>) => ({
          items: (response.body ?? []).map((post) => this.toViewModel(post)),
          total: Number(response.headers.get('X-WP-Total') ?? 0),
          totalPages: Number(response.headers.get('X-WP-TotalPages') ?? 1)
        })),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  getPostBySlug(slug: string): Observable<PostViewModel | null> {
    const params = new HttpParams().set('_embed', '1').set('slug', slug);

    return this.http.get<WpPost[]>(`${this.apiBase}/posts`, { params }).pipe(
      map((posts) => posts.at(0) ? this.toViewModel(posts[0]) : null)
    );
  }

  getComments(postId: number): Observable<CommentViewModel[]> {
    const params = new HttpParams()
      .set('post', String(postId))
      .set('orderby', 'date')
      .set('order', 'asc')
      .set('per_page', '100')
      .set('_', String(Date.now()));

    return this.http.get<WpComment[]>(`${this.apiBase}/comments`, { params }).pipe(
      map((comments) => comments.map((comment) => this.toCommentViewModel(comment)))
    );
  }

  createComment(payload: CommentSubmission): Observable<CommentViewModel> {
    const body: Record<string, string | number> = {
      post: payload.postId,
      author_name: payload.authorName.trim(),
      author_email: payload.authorEmail.trim(),
      content: payload.content.trim()
    };

    const url = payload.authorUrl?.trim();
    if (url) {
      body['author_url'] = url;
    }

    if (payload.parentId) {
      body['parent'] = payload.parentId;
    }

    return this.http.post<WpComment>(`${this.apiBase}/comments`, body).pipe(
      map((comment) => this.toCommentViewModel(comment))
    );
  }

  private toViewModel(post: WpPost): PostViewModel {
    const media = post._embedded?.['wp:featuredmedia']?.[0];
    const author = post._embedded?.author?.[0];
    const categoryNames = this.extractCategories(post._embedded?.['wp:term']);
    const contentText = this.decodeHtml(this.stripHtml(post.content.rendered));
    const excerptHasReadMore = this.hasReadMoreLink(post.excerpt.rendered);
    const excerptText = this.decodeHtml(this.stripHtml(this.removeReadMoreLink(post.excerpt.rendered)));
    const title = this.decodeHtml(this.stripHtml(post.title.rendered));
    const topicNames = this.inferTopicNames(title, excerptText);

    const imageUrl = media?.media_details?.sizes?.['large']?.source_url ?? media?.source_url ?? this.fallbackImage;

    return {
      id: post.id,
      slug: post.slug,
      link: post.link,
      title,
      excerptHtml: post.excerpt.rendered,
      excerptText,
      excerptHasReadMore,
      contentHtml: post.content.rendered,
      date: post.date,
      modifiedDate: post.modified,
      readTime: this.estimateReadTime(contentText),
      authorName: author?.name ?? 'Karol Śliwa',
      authorAvatar: author?.avatar_urls?.['48'] ?? author?.avatar_urls?.['96'],
      imageUrl,
      imageAlt: media?.alt_text || this.decodeHtml(this.stripHtml(post.title.rendered)),
      hasFeaturedImage: Boolean(media?.source_url),
      categoryNames,
      topicNames
    };
  }

  private toCommentViewModel(comment: WpComment): CommentViewModel {
    const status = comment.status ?? 'approved';

    return {
      id: comment.id,
      postId: comment.post,
      parentId: comment.parent,
      authorName: this.decodeHtml(this.stripHtml(comment.author_name || 'Czytelnik')),
      authorUrl: comment.author_url,
      authorAvatar: comment.author_avatar_urls?.['48'] ?? comment.author_avatar_urls?.['96'],
      date: comment.date,
      status,
      contentHtml: comment.content.rendered,
      isPending: status === 'hold' || status === 'pending'
    };
  }

  private extractCategories(termGroups?: WpTerm[][]): string[] {
    return (termGroups ?? [])
      .flat()
      .filter((term) => term.taxonomy === 'category')
      .map((term) => term.name)
      .slice(0, 3);
  }

  private estimateReadTime(text: string): number {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220));
  }

  private stripHtml(value: string): string {
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private hasReadMoreLink(value: string): boolean {
    return /class=["'][^"']*\bread-more-link\b/i.test(value);
  }

  private removeReadMoreLink(value: string): string {
    return value.replace(/<a\b[^>]*class=["'][^"']*\bread-more-link\b[^"']*["'][^>]*>.*?<\/a>/gis, '');
  }

  private inferTopicNames(title: string, excerpt: string): string[] {
    const normalizedTitle = this.normalizeForMatching(title);
    const normalizedExcerpt = this.normalizeForMatching(excerpt);

    const scores = this.topicDefinitions.map((topic) => ({
      name: topic.name,
      score: topic.rules.reduce((total, rule) => {
        const phrase = this.normalizeForMatching(rule.phrase);
        const titleHits = this.countPhraseHits(normalizedTitle, phrase);
        const excerptHits = this.countPhraseHits(normalizedExcerpt, phrase);
        return total + (titleHits * rule.weight * 2) + (excerptHits * rule.weight);
      }, 0)
    }));

    return scores.some((topic) => topic.name === 'Podcast' && topic.score >= 5) ? ['Podcast'] : ['Newsy'];
  }

  private normalizeForMatching(value: string): string {
    return this.decodeHtml(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l')
      .replace(/[^\p{L}\p{N}+.-]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private countPhraseHits(haystack: string, phrase: string): number {
    if (!phrase) return 0;

    const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|\\s)${escapedPhrase}(?=\\s|$)`, 'g');
    return haystack.match(pattern)?.length ?? 0;
  }

  private decodeHtml(value: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
  }
}
