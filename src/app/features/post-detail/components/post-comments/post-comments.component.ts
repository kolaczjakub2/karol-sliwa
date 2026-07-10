import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommentViewModel, PostViewModel } from '../../../../core/models/wp-post.model';
import { CommentForm, CommentRow } from '../../models/comment-thread.model';

@Component({
  selector: 'ks-post-comments',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './post-comments.component.html',
  styleUrl: './post-comments.component.scss'
})
export class PostCommentsComponent {
  readonly article = input.required<PostViewModel>();
  readonly rows = input.required<CommentRow[]>();
  readonly loading = input.required<boolean>();
  readonly error = input<string | null>(null);
  readonly form = input.required<CommentForm>();
  readonly submitting = input.required<boolean>();
  readonly notice = input<string | null>(null);
  readonly replyingTo = input<CommentViewModel | null>(null);

  readonly replyStarted = output<CommentViewModel>();
  readonly replyCanceled = output<void>();
  readonly submitted = output<PostViewModel>();
}
