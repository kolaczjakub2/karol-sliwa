export interface WpRenderedField {
  rendered: string;
}

export interface WpAuthor {
  id: number;
  name: string;
  url?: string;
  avatar_urls?: Record<string, string>;
}

export interface WpFeaturedMedia {
  id: number;
  source_url: string;
  alt_text?: string;
  media_details?: {
    sizes?: Record<string, { source_url: string; width: number; height: number }>;
  };
}

export interface WpTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
}

export interface WpPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  link: string;
  title: WpRenderedField;
  excerpt: WpRenderedField;
  content: WpRenderedField;
  author: number;
  categories: number[];
  _embedded?: {
    author?: WpAuthor[];
    'wp:featuredmedia'?: WpFeaturedMedia[];
    'wp:term'?: WpTerm[][];
  };
}

export interface PostViewModel {
  id: number;
  slug: string;
  link: string;
  title: string;
  excerptHtml: string;
  excerptText: string;
  excerptHasReadMore: boolean;
  contentHtml: string;
  date: string;
  modifiedDate: string;
  readTime: number;
  authorName: string;
  authorAvatar?: string;
  imageUrl: string;
  imageAlt: string;
  hasFeaturedImage: boolean;
  categoryNames: string[];
  topicNames: string[];
}

export interface PagedPosts {
  items: PostViewModel[];
  total: number;
  totalPages: number;
}

export interface WpComment {
  id: number;
  post: number;
  parent: number;
  author_name: string;
  author_url?: string;
  author_avatar_urls?: Record<string, string>;
  date: string;
  status?: 'approved' | 'hold' | 'spam' | 'trash' | string;
  content: WpRenderedField;
}

export interface CommentViewModel {
  id: number;
  postId: number;
  parentId: number;
  authorName: string;
  authorUrl?: string;
  authorAvatar?: string;
  date: string;
  status?: string;
  contentHtml: string;
  isPending: boolean;
}

export interface CommentSubmission {
  postId: number;
  authorName: string;
  authorEmail: string;
  authorUrl?: string;
  content: string;
  parentId?: number;
}
