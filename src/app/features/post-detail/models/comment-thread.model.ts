import { FormControl, FormGroup } from '@angular/forms';
import { CommentViewModel } from '../../../core/models/wp-post.model';

export interface CommentThreadNode extends CommentViewModel {
  children: CommentThreadNode[];
}

export interface CommentRow {
  comment: CommentThreadNode;
  depth: number;
  parentName?: string;
}

export type CommentForm = FormGroup<{
  authorName: FormControl<string>;
  authorEmail: FormControl<string>;
  content: FormControl<string>;
}>;
