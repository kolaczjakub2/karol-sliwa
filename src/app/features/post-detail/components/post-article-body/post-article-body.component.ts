import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Component, computed, inject, input, output } from '@angular/core';
import { PostViewModel } from '../../../../core/models/wp-post.model';

@Component({
  selector: 'ks-post-article-body',
  standalone: true,
  templateUrl: './post-article-body.component.html',
  styleUrl: './post-article-body.component.scss'
})
export class PostArticleBodyComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly article = input.required<PostViewModel>();
  readonly commentsLinkClicked = output<Event>();
  readonly trustedContentHtml = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.article().contentHtml)
  );
}
