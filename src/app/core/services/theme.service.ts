import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'ks-color-theme';

  readonly mode = signal<ThemeMode>(this.resolveInitialTheme());
  readonly isLight = computed(() => this.mode() === 'light');
  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    effect(() => {
      const mode = this.mode();
      const root = this.document.documentElement;
      const body = this.document.body;

      root.setAttribute('data-theme', mode);
      body.setAttribute('data-theme', mode);
      root.style.colorScheme = mode;

      try {
        this.document.defaultView?.localStorage.setItem(this.storageKey, mode);
      } catch {
        // Storage can be disabled in private browsing. The UI still switches theme in-memory.
      }
    });
  }

  setTheme(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  toggleTheme(): void {
    this.setTheme(this.isLight() ? 'dark' : 'light');
  }

  private resolveInitialTheme(): ThemeMode {
    try {
      const storage = this.document.defaultView?.localStorage.getItem(this.storageKey);

      if (storage === 'light' || storage === 'dark') {
        return storage;
      }
    } catch {
      // Ignore storage access errors and fall back to the system preference.
    }

    return 'light';
  }
}
