import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostViewModel } from '../../../../core/models/wp-post.model';

@Component({
  selector: 'ks-post-article-header',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './post-article-header.component.html',
  styleUrl: './post-article-header.component.scss'
})
export class PostArticleHeaderComponent {
  readonly article = input.required<PostViewModel>();
}
