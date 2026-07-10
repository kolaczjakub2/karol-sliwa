import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const serviceMessage = typeof error.error?.message === 'string'
        ? stripHtml(error.error.message)
        : null;

      const friendlyMessage = error.status === 0
        ? 'Nie udało się połączyć ze źródłem danych. Sprawdź połączenie internetowe.'
        : serviceMessage || `Źródło danych zwróciło błąd ${error.status}.`;

      return throwError(() => new Error(friendlyMessage));
    })
  );
};

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
