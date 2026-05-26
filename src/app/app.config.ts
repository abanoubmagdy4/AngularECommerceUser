import {
  ApplicationConfig,
  importProvidersFrom,
  APP_INITIALIZER,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

import { spinnerInterceptor } from './shared/Interceptors/spinnerInterceptor/spinner-interceptor-interceptor';
import { authInterceptor } from './shared/Interceptors/auth-interceptor';
import { LanguageService } from './shared/services/language/language.service';

// Custom TranslateLoader that works with ngx-translate v16+
export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http
      .get(`/assets/i18n/${lang}.json`)
      .pipe(catchError(() => of({})));
  }
}

// Factory function for CustomTranslateLoader
export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new CustomTranslateLoader(http);
}

// Initialize language on app startup
export function initializeLanguage(
  languageService: LanguageService,
): () => void {
  return () => {
    // Language is initialized in the service constructor
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions(), withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([spinnerInterceptor, authInterceptor]),
    ),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
        fallbackLang: 'ar',
      }),
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeLanguage,
      deps: [LanguageService],
      multi: true,
    },
  ],
};
