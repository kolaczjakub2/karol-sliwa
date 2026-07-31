import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Karol Mówi | NBA od 2006',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'archiwum',
    title: 'Archiwum | Karol Mówi',
    loadComponent: () => import('./features/archive/archive.component').then((m) => m.ArchiveComponent)
  },
  {
    path: 'o-mnie',
    title: 'O mnie | Karol Mówi',
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent)
  },
  {
    path: 'wspolpraca',
    title: 'Współpraca | Karol Mówi',
    loadComponent: () => import('./features/collaboration/collaboration.component').then((m) => m.CollaborationComponent)
  },
  {
    path: 'post/:slug',
    loadComponent: () => import('./features/post-detail/post-detail.component').then((m) => m.PostDetailComponent)
  },
  {
    path: ':slug',
    loadComponent: () => import('./features/post-detail/post-detail.component').then((m) => m.PostDetailComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent)
  }
];
