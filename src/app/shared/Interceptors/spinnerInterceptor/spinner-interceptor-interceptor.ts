// src/app/interceptors/spinner.interceptor.ts
import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpHeaders,
} from '@angular/common/http';
import { delay, finalize } from 'rxjs/operators';
import { SpinnerService } from '../../services/SpinnerService/spinner-service';

export const spinnerInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const spinner = inject(SpinnerService);

  // Skip spinner for Cart operations and product search/filter requests
  if (
    req.url.includes('Cart') ||
    req.url.includes('product') ||
    req.url.includes('Product')
  ) {
    return next(req);
  }

  // Check for header to skip global loader (for silent requests)
  if (req.headers.has('X-Skip-Global-Loader')) {
    const cleanReq = req.clone({
      headers: req.headers.delete('X-Skip-Global-Loader'),
    });
    return next(cleanReq);
  }

  spinner.show();
  return next(req).pipe(
    delay(500),
    finalize(() => spinner.hide()),
  );
};
