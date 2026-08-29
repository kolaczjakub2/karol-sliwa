import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, RESPONSE_INIT, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { CommentViewModel, PostViewModel } from '../../core/models/wp-post.model';
import { WordPressService } from '../../core/services/wordpress.service';
import { SeoService } from '../../core/services/seo.service';
import { PostArticleBodyComponent } from './components/post-article-body/post-article-body.component';
import { PostArticleHeaderComponent } from './components/post-article-header/post-article-header.component';
import { PostCommentsComponent } from './components/post-comments/post-comments.component';
import { CommentForm, CommentRow, CommentThreadNode } from './models/comment-thread.model';
import { NotFoundComponent } from '../not-found/not-found.component';

@Component({
  selector: 'ks-post-detail',
  standalone: true,
  imports: [
    PostArticleHeaderComponent,
    PostArticleBodyComponent,
    PostCommentsComponent,
    NotFoundComponent
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss'
})
export class PostDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly responseInit = inject(RESPONSE_INIT);
  private readonly wp = inject(WordPressService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly post = signal<PostViewModel | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly comments = signal<CommentViewModel[]>([]);
  readonly commentRows = computed(() => this.createCommentRows(this.comments()));
  readonly commentsLoading = signal(false);
  readonly commentsError = signal<string | null>(null);
  readonly submittingComment = signal(false);
  readonly commentNotice = signal<string | null>(null);
  readonly replyingTo = signal<CommentViewModel | null>(null);

  readonly commentForm: CommentForm = this.fb.group({
    authorName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    authorEmail: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    content: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(3000)]]
  });

  constructor() {
    this.route.paramMap.pipe(
      switchMap((params) => {
        this.loading.set(true);
        this.error.set(null);
        this.resetCommentsState();
        return this.wp.getPostBySlug(params.get('slug') ?? '');
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (post) => {
        this.post.set(post);
        this.loading.set(false);

        if (post) {
          this.seo.setArticle(post);
          if (this.isBrowser) this.loadComments(post.id);
        } else {
          if (this.responseInit) this.responseInit.status = 404;
          this.seo.setPage({
            title: 'Nie znaleziono artykułu | Karol Mówi',
            description: 'Nie znaleziono artykułu na stronie Karol Mówi.',
            path: this.route.snapshot.url.map((segment) => segment.path).join('/'),
            noIndex: true
          });
        }
      },
      error: (error: Error) => {
        this.seo.setPage({
          title: 'Błąd ładowania artykułu | Karol Mówi',
          description: 'Nie udało się pobrać artykułu z archiwum Karol Mówi.',
          path: this.route.snapshot.url.map((segment) => segment.path).join('/'),
          noIndex: true
        });
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  startReply(comment: CommentViewModel): void {
    this.replyingTo.set(comment);
    this.commentNotice.set(null);

    this.document.defaultView?.setTimeout(() => {
      this.document.getElementById('comment-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    });
  }

  cancelReply(): void {
    this.replyingTo.set(null);
  }

  scrollToComments(event: Event): void {
    event.preventDefault();

    this.document.getElementById('komentarze')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  submitComment(article: PostViewModel): void {
    this.commentNotice.set(null);

    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const value = this.commentForm.getRawValue();
    const parent = this.replyingTo();
    this.submittingComment.set(true);

    this.wp.createComment({
      postId: article.id,
      authorName: value.authorName,
      authorEmail: value.authorEmail,
      content: value.content,
      parentId: parent?.id
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (comment) => {
        this.submittingComment.set(false);
        this.commentForm.reset();
        this.replyingTo.set(null);

        if (comment.isPending) {
          this.commentNotice.set('Komentarz został wysłany i czeka na akceptację.');
        } else {
          this.comments.update((comments) => [...comments, comment]);
          this.commentNotice.set(parent ? 'Odpowiedź została dodana.' : 'Komentarz został dodany.');
        }

      },
      error: (error: Error) => {
        this.submittingComment.set(false);
        this.commentNotice.set(error.message);
      }
    });
  }

  private loadComments(postId: number): void {
    this.commentsLoading.set(true);
    this.commentsError.set(null);

    this.wp.getComments(postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.commentsLoading.set(false);
      },
      error: (error: Error) => {
        this.commentsError.set(error.message);
        this.commentsLoading.set(false);
      }
    });
  }

  private createCommentRows(comments: CommentViewModel[]): CommentRow[] {
    const nodeMap = new Map<number, CommentThreadNode>();
    const roots: CommentThreadNode[] = [];

    const sortedComments = [...comments].sort((first, second) => {
      const firstDate = new Date(first.date).getTime();
      const secondDate = new Date(second.date).getTime();
      return firstDate - secondDate;
    });

    for (const comment of sortedComments) {
      nodeMap.set(comment.id, { ...comment, children: [] });
    }

    for (const node of nodeMap.values()) {
      const parent = node.parentId ? nodeMap.get(node.parentId) : undefined;

      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    const rows: CommentRow[] = [];
    const walk = (nodes: CommentThreadNode[], depth: number, parentName?: string): void => {
      for (const node of nodes) {
        rows.push({ comment: node, depth, parentName });

        if (node.children.length) {
          walk(node.children, depth + 1, node.authorName);
        }
      }
    };

    walk(roots, 0);
    return rows;
  }

  private resetCommentsState(): void {
    this.comments.set([]);
    this.commentsLoading.set(false);
    this.commentsError.set(null);
    this.commentNotice.set(null);
    this.replyingTo.set(null);
    this.submittingComment.set(false);
  }
}
