import { DatePipe, NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PostViewModel } from '../../../../core/models/wp-post.model';
import { HeroDirection } from '../../models/home-section.model';

@Component({
  selector: 'ks-home-hero',
  standalone: true,
  imports: [RouterLink, DatePipe, NgClass, MatButtonModule, MatIconModule],
  templateUrl: './home-hero.component.html',
  styleUrl: './home-hero.component.scss'
})
export class HomeHeroComponent {
  readonly post = input.required<PostViewModel>();
  readonly heroPosts = input.required<PostViewModel[]>();
  readonly activeIndex = input.required<number>();
  readonly direction = input<HeroDirection>('next');
  readonly podcastPost = input<PostViewModel | undefined>(undefined);

  readonly heroSelected = output<number>();
  readonly previous = output<void>();
  readonly next = output<void>();
  readonly pauseChange = output<boolean>();

  heroNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  heroImage(post: PostViewModel): string {
    return post.hasFeaturedImage ? post.imageUrl : 'assets/hero-fallback.svg';
  }

  heroImageClass(post: PostViewModel): Record<string, boolean> {
    return {
      'is-fallback': !post.hasFeaturedImage
    };
  }

  heroSummary(post: PostViewModel): string {
    return this.truncate(post.excerptText, 210);
  }

  heroBackdropLabel(post: PostViewModel): string {
    const haystack = `${post.title} ${post.topicNames.join(' ')}`.toLowerCase();

    if (haystack.includes('small talk') || haystack.includes('podcast')) return 'NBA\nTALK';
    return 'NBA\nNEWS';
  }

  primaryCategory(post: PostViewModel): string {
    return post.topicNames.at(0) ?? 'NBA';
  }

  private truncate(value: string, maxLength: number): string {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength).trim()}…`;
  }
}
