import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ks-home-author',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './home-author.component.html',
  styleUrl: './home-author.component.scss'
})
export class HomeAuthorComponent {}
