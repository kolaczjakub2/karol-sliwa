import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon.component';

@Component({
  selector: 'ks-archive-paginator',
  standalone: true,
  imports: [FormsModule, AppIconComponent],
  templateUrl: './archive-paginator.component.html',
  styleUrl: './archive-paginator.component.scss'
})
export class ArchivePaginatorComponent {
  readonly total = input.required<number>();
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageNumbers = input.required<number[]>();
  readonly perPage = input.required<number>();
  readonly pageSizeOptions = input.required<number[]>();

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number | string>();
}
