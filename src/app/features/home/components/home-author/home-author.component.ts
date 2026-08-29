import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon.component';

@Component({
  selector: 'ks-home-author',
  standalone: true,
  imports: [RouterLink, AppIconComponent],
  templateUrl: './home-author.component.html',
  styleUrl: './home-author.component.scss'
})
export class HomeAuthorComponent {}
