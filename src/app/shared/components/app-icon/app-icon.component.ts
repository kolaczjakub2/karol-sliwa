import { Component, input } from '@angular/core';

@Component({
  selector: 'ks-icon',
  standalone: true,
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      @switch (name()) {
        @case ('mail') { <path d="M3 5h18v14H3V5Zm2 2v.5l7 5 7-5V7H5Zm14 10V9.9l-7 5-7-5V17h14Z"/> }
        @case ('search') { <path d="m20.7 19.3-4.2-4.2a7 7 0 1 0-1.4 1.4l4.2 4.2 1.4-1.4ZM5 11a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z"/> }
        @case ('chevron_left') { <path d="m15.4 5-7 7 7 7 1.4-1.4-5.6-5.6 5.6-5.6L15.4 5Z"/> }
        @case ('chevron_right') { <path d="m8.6 19 7-7-7-7-1.4 1.4 5.6 5.6-5.6 5.6L8.6 19Z"/> }
        @case ('arrow_forward') { <path d="M12 3 21 12l-9 9-1.4-1.4 6.6-6.6H3v-2h14.2l-6.6-6.6L12 3Z"/> }
        @case ('close') { <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z"/> }
        @case ('person') { <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"/> }
        @case ('error_outline') { <path d="M11 7h2v6h-2V7Zm0 8h2v2h-2v-2Zm1-13a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/> }
        @case ('info') { <path d="M11 10h2v7h-2v-7Zm0-3h2v2h-2V7Zm1-5a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/> }
        @case ('send') { <path d="M2 3.5 22 12 2 20.5v-6.6l14-1.9-14-1.9V3.5Z"/> }
      @case ('chat_bubble_outline') { <path d="M4 4h16v12H7l-3 3V4Zm2 2v8.2L6.2 14H18V6H6Z"/> }
        @case ('forum') { <path d="M4 4h12v9H7l-3 3V4Zm2 2v5.2L6.2 11H14V6H6Zm12 2h2v11l-3-3H9v-2h8.8l.2.2V8Z"/> }
        @case ('newspaper') { <path d="M4 3h14v3h2v15H5a3 3 0 0 1-3-3V5h2V3Zm2 2v13c0 .4-.1.7-.2 1H18V8h-2v9H8V5H6Zm4 0v4h4V5h-4Zm0 6v2h6v-2h-6Zm0 4v2h6v-2h-6Z"/> }
        @case ('sports_basketball') { <path d="M11 2.1v5.1A9 9 0 0 1 7.2 4 8 8 0 0 1 11 2.1Zm2 0A8 8 0 0 1 16.8 4 9 9 0 0 1 13 7.2V2.1ZM5.8 5.4A11 11 0 0 0 11 9.2V11H2.1a8 8 0 0 1 3.7-5.6ZM13 9.2a11 11 0 0 0 5.2-3.8 8 8 0 0 1 3.7 5.6H13V9.2ZM2.1 13H11v1.8a11 11 0 0 0-5.2 3.8A8 8 0 0 1 2.1 13Zm10.9 0h8.9a8 8 0 0 1-3.7 5.6 11 11 0 0 0-5.2-3.8V13Zm-2 3.8v5.1A8 8 0 0 1 7.2 20a9 9 0 0 1 3.8-3.2Zm2 0a9 9 0 0 1 3.8 3.2 8 8 0 0 1-3.8 1.9v-5.1Z"/> }
        @case ('mic') { <path d="M9 4a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V4Zm-3 7h2a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.9V20h3v2H8v-2h3v-3.1A6 6 0 0 1 6 11Z"/> }
        @case ('public') { <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-3.1a15 15 0 0 0-1.4-3.2A8.1 8.1 0 0 1 18.9 8ZM12 4c.8 1 1.5 2.3 1.8 4h-3.6c.3-1.7 1-3 1.8-4ZM4.3 14a8 8 0 0 1 0-4h3.5a17 17 0 0 0 0 4H4.3Zm.8 2h3.1c.3 1.2.8 2.3 1.4 3.2A8.1 8.1 0 0 1 5.1 16Zm3.1-8H5.1a8.1 8.1 0 0 1 4.5-3.2A15 15 0 0 0 8.2 8ZM12 20c-.8-1-1.5-2.3-1.8-4h3.6c-.3 1.7-1 3-1.8 4Zm2.2-6H9.8a15 15 0 0 1 0-4h4.4a15 15 0 0 1 0 4Zm.2 5.2c.6-.9 1.1-2 1.4-3.2h3.1a8.1 8.1 0 0 1-4.5 3.2Zm1.8-5.2a17 17 0 0 0 0-4h3.5a8 8 0 0 1 0 4h-3.5Z"/> }
        @case ('facebook') { <path d="M13.6 21v-7.3h2.5l.4-2.9h-2.9V9c0-.8.2-1.4 1.5-1.4h1.6V5c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v1.9H8v2.9h2.5V21h3.1Z"/> }
        @case ('instagram') { <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm4 3.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Zm0 2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Zm4.2-2.7a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/> }
        @case ('x') { <path d="M4.5 4h3.8l4.1 5.5L17.4 4h2.1l-6.1 6.8L20 20h-3.8l-4.4-6-5.3 6H4.4l6.4-7.3L4.5 4Zm3 1.6 9.6 12.8H17L7.4 5.6h.1Z"/> }
        @case ('youtube') { <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.9 12 4.9 12 4.9s-6 0-7.7.4a2.7 2.7 0 0 0-1.9 1.9A27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9c1.7.4 7.7.4 7.7.4s6 0 7.7-.4a2.7 2.7 0 0 0 1.9-1.9A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10.2 15.1V8.9l5.4 3.1-5.4 3.1Z"/> }
        @default { <path d="M12 3 3 12l9 9 1.4-1.4-6.6-6.6H21v-2H6.8l6.6-6.6L12 3Z"/> }
      }
    </svg>
  `,
  styles: [`:host{display:inline-grid;width:1.5rem;height:1.5rem;place-items:center;flex:0 0 auto}svg{display:block;width:100%;height:100%;fill:currentColor}`]
})
export class AppIconComponent {
  readonly name = input.required<string>();
}
