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
    this.initializeSplash();
  }

  private initializeSplash(): void {
    if (isPlatformBrowser(this.platformId)) {
      const splashShown = sessionStorage.getItem('splashShown');

      if (splashShown) {
        this.showSplash = false;
      } else {
        this.showSplash = true;

        setTimeout(() => {
          this.showSplash = false;
          sessionStorage.setItem('splashShown', 'true');
        }, 7000);
      }
    } else {
      this.showSplash = false;
    }
  }
}
