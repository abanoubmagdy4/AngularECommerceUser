import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './splash.html',
  styleUrls: ['./splash.css'],
})
export class Splash implements OnInit {
  showSplash = true;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // هنا احنا على المتصفح فقط

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
      // هنا التنفيذ على السيرفر (SSR)
      // نعرض المحتوى بدون splash (أو تخفيه حسب الحاجة)
      this.showSplash = false;
    }
  }
}
