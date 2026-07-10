import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Karol Mowi | NBA od 2006',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'archiwum',
    title: 'Archiwum | Karol Mowi',
    loadComponent: () => import('./features/archive/archive.component').then((m) => m.ArchiveComponent)
  },
  {
    path: 'o-mnie',
    title: 'O mnie | Karol Mowi',
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent)
  },
  {
    path: 'wspolpraca',
    title: 'Wspolpraca | Karol Mowi',
    loadComponent: () => import('./features/collaboration/collaboration.component').then((m) => m.CollaborationComponent)
  },
  {
    path: 'post/:slug',
    title: 'Artykul | Karol Mowi',
    loadComponent: () => import('./features/post-detail/post-detail.component').then((m) => m.PostDetailComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
