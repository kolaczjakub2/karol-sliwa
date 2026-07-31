import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PostViewModel } from '../../../../core/models/wp-post.model';

@Component({
  selector: 'ks-home-podcast',
  standalone: true,
  imports: [RouterLink, DatePipe, MatButtonModule],
  templateUrl: './home-podcast.component.html',
  styleUrl: './home-podcast.component.scss'
})
export class HomePodcastComponent {
  readonly podcast = input.required<PostViewModel>();
  readonly episodes = input.required<PostViewModel[]>();
}
