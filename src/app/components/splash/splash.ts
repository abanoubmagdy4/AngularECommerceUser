import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './splash.html',
  styleUrls: ['./splash.css'],
})
export class Splash implements OnInit {
  showSplash = true;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Browser environment only

      const splashShown = localStorage.getItem('splashShown');

      if (splashShown) {
        this.showSplash = false;
      } else {
        this.showSplash = true;

        setTimeout(() => {
          this.showSplash = false;
          localStorage.setItem('splashShown', 'true');
        }, 7000);
      }
    } else {
      // Server-side rendering (SSR)
      // Show content without splash
      this.showSplash = false;
    }
  }
}
