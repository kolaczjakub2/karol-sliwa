import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { PostViewModel } from '../../../core/models/wp-post.model';
import { CategoryLabelPipe } from '../../pipes/category-label.pipe';

@Component({
  selector: 'ks-article-card',
  standalone: true,
  imports: [RouterLink, DatePipe, MatCardModule, MatChipsModule, CategoryLabelPipe],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.scss'
})
export class ArticleCardComponent {
  readonly post = input.required<PostViewModel>();
  readonly compact = input(false);
}
