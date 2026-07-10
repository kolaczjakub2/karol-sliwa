export interface TimelineItem {
  period: string;
  title: string;
  description: string;
}

export interface Highlight {
  value: string;
  label: string;
}

export interface FeatureCard {
  icon: string;
  kicker: string;
  title: string;
  description: string;
}

export interface EventCard {
  year: string;
  title: string;
  place: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}
