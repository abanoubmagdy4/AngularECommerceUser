import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private title = inject(Title);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  private appName = 'CASHOLIC';
  private currentTitleKey: string | null = null;

  init(): void {
    // Listen to language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateTitle();
    });

    // Listen to navigation events
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentTitleKey = this.findTitleKey(this.activatedRoute);
        this.updateTitle();
      });
  }

  private findTitleKey(route: ActivatedRoute): string | null {
    let child = route.firstChild;
    let titleKey: string | null = null;

    while (child) {
      if (child.snapshot.data && child.snapshot.data['titleKey']) {
        titleKey = child.snapshot.data['titleKey'];
      }
      child = child.firstChild;
    }

    // Fallback to root route data
    if (!titleKey && route.snapshot.data && route.snapshot.data['titleKey']) {
      titleKey = route.snapshot.data['titleKey'];
    }

    return titleKey;
  }

  private updateTitle(): void {
    if (!this.currentTitleKey) {
      this.title.setTitle(this.appName);
      return;
    }

    const translated = this.translate.instant(this.currentTitleKey);
    if (translated && translated !== this.currentTitleKey) {
      this.title.setTitle(`${translated} | ${this.appName}`);
    } else {
      this.title.setTitle(this.appName);
    }
  }
}
