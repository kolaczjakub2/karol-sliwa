import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, isDevMode, PLATFORM_ID } from '@angular/core';
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
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
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
      .set('_fields', 'id,slug,link,date,modified,title,excerpt,_links,_embedded')
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
    const rawContentHtml = post.content?.rendered ?? '';
    const excerptHasReadMore = this.hasReadMoreLink(post.excerpt.rendered);
    const excerptText = this.decodeHtml(this.stripHtml(this.removeReadMoreLink(post.excerpt.rendered)));
    const title = this.decodeHtml(this.stripHtml(post.title.rendered));
    const topicNames = this.inferTopicNames(title, excerptText);

    const imageSizes = Object.values(media?.media_details?.sizes ?? {});
    const selectedImage = media?.media_details?.sizes?.['large']
      ?? imageSizes.reduce<(typeof imageSizes)[number] | undefined>(
        (largest, image) => !largest || image.width > largest.width ? image : largest,
        undefined
      );
    const sourceImageUrl = media?.source_url ?? selectedImage?.source_url;
    const imageWidth = media?.media_details?.width ?? selectedImage?.width ?? 1200;
    const imageHeight = media?.media_details?.height ?? selectedImage?.height ?? 675;
    const responsiveWidths = [320, 480, 560, 640, 672, 768, 1024, 1280, 1600]
      .filter((width) => width < imageWidth)
      .concat(Math.min(imageWidth, 1920));
    const imageUrl = sourceImageUrl
      ? this.optimizedImageUrl(sourceImageUrl, Math.min(imageWidth, 1600))
      : this.fallbackImage;
    const imageSrcSet = sourceImageUrl
      ? [...new Set(responsiveWidths)]
        .map((width) => `${this.optimizedImageUrl(sourceImageUrl, width)} ${width}w`)
        .join(', ')
      : undefined;
    const contentWithoutDuplicateImage = this.removeLeadingFeaturedImage(rawContentHtml, sourceImageUrl);
    const contentWithoutAds = this.removeExecutableAndAdContent(contentWithoutDuplicateImage);
    const contentHtml = this.replaceYouTubeEmbeds(contentWithoutAds);
    const contentText = this.decodeHtml(this.stripHtml(contentHtml));

    return {
      id: post.id,
      slug: post.slug,
      link: post.link,
      title,
      excerptHtml: post.excerpt.rendered,
      excerptText,
      excerptHasReadMore,
      contentHtml,
      date: post.date,
      modifiedDate: post.modified,
      readTime: this.estimateReadTime(contentText),
      authorName: author?.name ?? 'Karol Śliwa',
      authorAvatar: author?.avatar_urls?.['48'] ?? author?.avatar_urls?.['96'],
      imageUrl,
      imageSrcSet,
      imageWidth,
      imageHeight,
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
    const textarea = this.document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
  }

  private removeLeadingFeaturedImage(contentHtml: string, featuredImageUrl?: string): string {
    if (!contentHtml || !featuredImageUrl) {
      return contentHtml;
    }

    const container = this.document.createElement('div');
    container.innerHTML = contentHtml;

    const firstElement = Array.from(container.children).find((element) => {
      const text = element.textContent?.replace(/\s+/g, '') ?? '';
      return text.length > 0 || Boolean(element.querySelector('img, picture, video, iframe'));
    });

    if (
      firstElement
      && this.isDuplicateFeaturedMediaBlock(firstElement, featuredImageUrl)
      && this.isMediaOnlyElement(firstElement)
      && !this.containsNonImageLink(firstElement, featuredImageUrl)
    ) {
      firstElement.remove();
      return container.innerHTML;
    }

    const firstImage = container.querySelector('img');
    if (!firstImage || !this.isSameImageAsset(firstImage.getAttribute('src'), featuredImageUrl)) {
      return contentHtml;
    }

    const wrapper = firstImage.closest('figure, p, div');
    if (
      wrapper?.parentElement === container
      && this.isMediaOnlyElement(wrapper)
      && !this.containsNonImageLink(wrapper, featuredImageUrl)
    ) {
      wrapper.remove();
      return container.innerHTML;
    }

    return contentHtml;
  }

  private replaceYouTubeEmbeds(contentHtml: string): string {
    if (!contentHtml || !/youtu(?:be\.com|\.be)/i.test(contentHtml)) return contentHtml;

    return contentHtml.replace(
      /<iframe\b[^>]*\bsrc=["'](?:https?:)?\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})[^"']*["'][^>]*>\s*<\/iframe>/gi,
      (_iframe, videoId: string) => {
        const posterUrl = this.optimizedImageUrl(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, 960);
        return `<a class="youtube-facade" href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer" aria-label="Obejrzyj materiał na YouTube"><img src="${posterUrl}" alt="" width="960" height="540" loading="lazy" decoding="async"><span class="youtube-facade__play" aria-hidden="true">▶</span><span class="youtube-facade__label">Obejrzyj na YouTube</span></a>`;
      }
    );
  }

  private removeExecutableAndAdContent(contentHtml: string): string {
    return contentHtml
      .replace(/<div\b[^>]*class=["'][^"']*\bkarol-po-tresci\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<ins\b[^>]*class=["'][^"']*\badsbygoogle\b[^"']*["'][^>]*>[\s\S]*?<\/ins>/gi, '')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '');
  }

  private isDuplicateFeaturedMediaBlock(element: Element, featuredImageUrl: string): boolean {
    const media = element.matches('img, source') ? element : element.querySelector('img, source');
    const srcSet = media?.getAttribute('srcset');
    const mediaUrl = media?.getAttribute('src') ?? srcSet?.split(',')[0]?.trim().split(/\s+/)[0];
    return this.isSameImageAsset(mediaUrl, featuredImageUrl);
  }

  private isMediaOnlyElement(element: Element): boolean {
    const childElements = Array.from(element.children);
    if (childElements.length === 0) {
      return false;
    }

    return childElements.every((child) => ['IMG', 'PICTURE', 'SOURCE', 'FIGCAPTION', 'SPAN', 'A'].includes(child.tagName));
  }

  private containsNonImageLink(element: Element, featuredImageUrl: string): boolean {
    const links = element.matches('a[href]')
      ? [element as HTMLAnchorElement, ...Array.from(element.querySelectorAll('a[href]'))]
      : Array.from(element.querySelectorAll('a[href]'));
    return links.some((link) => !this.isSameImageAsset(link.getAttribute('href'), featuredImageUrl));
  }

  private isSameImageAsset(candidateUrl: string | null | undefined, featuredImageUrl: string): boolean {
    if (!candidateUrl) {
      return false;
    }

    const candidateIdentity = this.extractImageIdentity(candidateUrl);
    const featuredIdentity = this.extractImageIdentity(featuredImageUrl);
    return Boolean(candidateIdentity && featuredIdentity && candidateIdentity === featuredIdentity);
  }

  private extractImageIdentity(value: string): string | null {
    const sanitizedValue = value.trim().toLowerCase();
    if (!sanitizedValue) {
      return null;
    }

    const withoutProtocol = sanitizedValue.replace(/^https?:\/\/[^/]+/i, '');
    const withoutHash = withoutProtocol.split('#')[0] ?? '';
    const pathOnly = withoutHash.split('?')[0] ?? '';
    const fileName = pathOnly.split('/').filter(Boolean).at(-1);
    if (!fileName) {
      return null;
    }

    return fileName.replace(/-\d+x\d+(?=\.[a-z0-9]+$)/, '');
  }

  private optimizedImageUrl(sourceUrl: string, width: number): string {
    if (this.isBrowser && (isDevMode() || this.isLocalHost())) {
      return sourceUrl;
    }

    return `/.netlify/images?url=${encodeURIComponent(sourceUrl)}&w=${width}&fm=webp&q=60`;
  }

  private isLocalHost(): boolean {
    const hostname = this.document.location?.hostname?.toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  }
}
