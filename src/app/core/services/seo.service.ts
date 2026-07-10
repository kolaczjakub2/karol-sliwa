import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { PostViewModel } from '../models/wp-post.model';

interface BreadcrumbItem {
  name: string;
  path: string;
}

type JsonLd = Record<string, unknown> | Record<string, unknown>[];

interface PageSeo {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: JsonLd;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly siteUrl = 'https://karol-sliwa-redesign.netlify.app';
  private readonly siteName = 'Karol Mowi';
  private readonly twitterHandle = '@KarolMowiNBA';
  private readonly defaultImage = `${this.siteUrl}/assets/hero-fallback.svg`;

  setPage(config: PageSeo): void {
    const url = this.absoluteUrl(config.path);
    const image = this.absoluteUrl(config.image ?? this.defaultImage);
    const type = config.type ?? 'website';

    this.clearArticleTags();
    this.title.setTitle(config.title);
    this.updateTag('name', 'description', config.description);
    this.updateTag('name', 'robots', 'index, follow');
    this.updateTag('property', 'og:locale', 'pl_PL');
    this.updateTag('property', 'og:type', type);
    this.updateTag('property', 'og:site_name', this.siteName);
    this.updateTag('property', 'og:title', config.title);
    this.updateTag('property', 'og:description', config.description);
    this.updateTag('property', 'og:url', url);
    this.updateTag('property', 'og:image', image);
    this.updateTag('name', 'twitter:card', 'summary_large_image');
    this.updateTag('name', 'twitter:site', this.twitterHandle);
    this.updateTag('name', 'twitter:creator', this.twitterHandle);
    this.updateTag('name', 'twitter:title', config.title);
    this.updateTag('name', 'twitter:description', config.description);
    this.updateTag('name', 'twitter:image', image);
    this.setCanonical(url);
    this.setJsonLd(config.jsonLd ?? this.pageJsonLd(url, config.breadcrumbs));
  }

  setArticle(post: PostViewModel): void {
    const path = `/post/${post.slug}`;
    const url = this.absoluteUrl(path);
    const image = this.absoluteUrl(post.imageUrl);
    const description = this.truncate(post.excerptText || post.title, 155);
    const breadcrumbs = [
      { name: 'Start', path: '/' },
      { name: 'Archiwum', path: '/archiwum' },
      { name: post.title, path }
    ];

    this.setPage({
      title: `${post.title} | Karol Mowi`,
      description,
      path,
      image,
      type: 'article',
      breadcrumbs,
      jsonLd: [
        this.organizationJsonLd(),
        this.personJsonLd(post.authorName),
        this.breadcrumbJsonLd(breadcrumbs),
        {
          '@type': 'Article',
          '@id': `${url}#article`,
          headline: post.title,
          description,
          image,
          datePublished: post.date,
          dateModified: post.modifiedDate,
          author: {
            '@id': `${this.siteUrl}/o-mnie#person`
          },
          publisher: {
            '@id': `${this.siteUrl}/#organization`
          },
          mainEntityOfPage: url,
          articleSection: post.topicNames.at(0) ?? 'NBA',
          keywords: [...post.topicNames, ...post.categoryNames].join(', ')
        }
      ]
    });

    this.updateTag('property', 'article:published_time', post.date);
    this.updateTag('property', 'article:modified_time', post.modifiedDate);
    this.updateTag('property', 'article:author', post.authorName);
    this.updateTag('property', 'article:section', post.topicNames.at(0) ?? 'NBA');
  }

  private updateTag(attribute: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attribute]: key, content });
  }

  private clearArticleTags(): void {
    this.meta.removeTag("property='article:published_time'");
    this.meta.removeTag("property='article:modified_time'");
    this.meta.removeTag("property='article:author'");
    this.meta.removeTag("property='article:section'");
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private setJsonLd(data: JsonLd): void {
    let script = this.document.getElementById('structured-data');

    if (!script) {
      script = this.document.createElement('script');
      script.id = 'structured-data';
      script.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(Array.isArray(data)
      ? { '@context': 'https://schema.org', '@graph': data }
      : data);
  }

  private pageJsonLd(url: string, breadcrumbs?: BreadcrumbItem[]): Record<string, unknown>[] {
    return [
      this.organizationJsonLd(),
      this.personJsonLd('Karol Sliwa'),
      this.websiteJsonLd(url),
      ...(breadcrumbs?.length ? [this.breadcrumbJsonLd(breadcrumbs)] : [])
    ];
  }

  private websiteJsonLd(url: string): Record<string, unknown> {
    return {
      '@type': 'WebSite',
      '@id': `${this.siteUrl}/#website`,
      name: this.siteName,
      url: this.siteUrl,
      inLanguage: 'pl-PL',
      publisher: {
        '@id': `${this.siteUrl}/#organization`
      },
      mainEntityOfPage: url
    };
  }

  private organizationJsonLd(): Record<string, unknown> {
    return {
      '@type': 'Organization',
      '@id': `${this.siteUrl}/#organization`,
      name: this.siteName,
      url: this.siteUrl,
      logo: `${this.siteUrl}/assets/brand/logo-ball.png`,
      sameAs: [
        'https://www.facebook.com/KarolMowiNBA',
        'https://www.instagram.com/karol__sliwa/',
        'https://twitter.com/KarolMowiNBA',
        'https://www.youtube.com/@KarolMowi'
      ]
    };
  }

  private personJsonLd(name: string): Record<string, unknown> {
    return {
      '@type': 'Person',
      '@id': `${this.siteUrl}/o-mnie#person`,
      name,
      url: `${this.siteUrl}/o-mnie`,
      sameAs: [
        'https://www.facebook.com/KarolMowiNBA',
        'https://www.instagram.com/karol__sliwa/',
        'https://twitter.com/KarolMowiNBA',
        'https://www.youtube.com/@KarolMowi'
      ]
    };
  }

  private breadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
    return {
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: this.absoluteUrl(item.path)
      }))
    };
  }

  private absoluteUrl(value: string): string {
    if (/^https?:\/\//i.test(value)) return value;
    return `${this.siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
  }

  private truncate(value: string, maxLength: number): string {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength - 1).trim()}...`;
  }
}
