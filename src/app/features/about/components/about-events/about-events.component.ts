import { Component, input } from '@angular/core';
import { EventCard } from '../../models/about-page.model';

@Component({
  selector: 'ks-about-events',
  standalone: true,
  templateUrl: './about-events.component.html',
  styleUrl: './about-events.component.scss'
})
export class AboutEventsComponent {
  readonly milestones = input.required<EventCard[]>();
  readonly events = input.required<EventCard[]>();
}
