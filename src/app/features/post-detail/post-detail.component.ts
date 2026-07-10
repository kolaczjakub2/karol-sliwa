import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommentViewModel, PostViewModel } from '../../core/models/wp-post.model';
import { WordPressService } from '../../core/services/wordpress.service';
import { SeoService } from '../../core/services/seo.service';

interface CommentThreadNode extends CommentViewModel {
  children: CommentThreadNode[];
}

interface CommentRow {
  comment: CommentThreadNode;
  depth: number;
  parentName?: string;
}

@Component({
  selector: 'ks-post-detail',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss'
})
export class PostDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly wp = inject(WordPressService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly snackBar = inject(MatSnackBar);

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

  readonly commentForm = this.fb.group({
    authorName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    authorEmail: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    authorUrl: ['', [Validators.maxLength(180)]],
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
          this.loadComments(post.id);
        } else {
          this.seo.setPage({
            title: 'Nie znaleziono artykulu | Karol Mowi',
            description: 'Nie znaleziono artykulu na stronie Karol Mowi.',
            path: this.route.snapshot.url.map((segment) => segment.path).join('/')
          });
        }
      },
      error: (error: Error) => {
        this.seo.setPage({
          title: 'Blad ladowania artykulu | Karol Mowi',
          description: 'Nie udalo sie pobrac artykulu z archiwum Karol Mowi.',
          path: this.route.snapshot.url.map((segment) => segment.path).join('/')
        });
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  startReply(comment: CommentViewModel): void {
    this.replyingTo.set(comment);
    this.commentNotice.set(null);

    window.setTimeout(() => {
      document.getElementById('comment-form')?.scrollIntoView({
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

    document.getElementById('komentarze')?.scrollIntoView({
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
      authorUrl: value.authorUrl,
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

        this.snackBar.open(this.commentNotice() ?? 'Komentarz wysłany.', 'OK', { duration: 4200 });
      },
      error: (error: Error) => {
        this.submittingComment.set(false);
        this.commentNotice.set(error.message);
        this.snackBar.open(error.message, 'OK', { duration: 6200 });
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
