import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostViewModel } from '../../../../core/models/wp-post.model';
import { ArticleCardComponent } from '../../../../shared/components/article-card/article-card.component';

@Component({
  selector: 'ks-home-latest',
  standalone: true,
  imports: [RouterLink, ArticleCardComponent],
  templateUrl: './home-latest.component.html',
  styleUrl: './home-latest.component.scss'
})
export class HomeLatestComponent {
  readonly posts = input.required<PostViewModel[]>();
  readonly filterOptions = input.required<string[]>();
  readonly activeFilter = input.required<string>();
  readonly filterChange = output<string>();
}
