import { Component, input } from '@angular/core';
import { TimelineItem } from '../../models/about-page.model';

@Component({
  selector: 'ks-about-timeline',
  standalone: true,
  templateUrl: './about-timeline.component.html',
  styleUrl: './about-timeline.component.scss'
})
export class AboutTimelineComponent {
  readonly timeline = input.required<TimelineItem[]>();
}
