import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { NewArrival } from '../new-arrival/new-arrival';
import { ExploreStyles } from '../explore-styles/explore-styles';
import { DiscountProductsComponent } from '../discount-Products/discount-Products';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NewArrival,
    ExploreStyles,
    DiscountProductsComponent,
    TranslateModule,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit, OnDestroy {
  private intervalId: any;
  private resizeHandler: any;
  @ViewChild('slidesContainer') slidesContainer!: ElementRef<HTMLDivElement>;

  isMobile = false;
  currentSlide = 0;

  images = [
    { desktop: 'assets/images/1.png', mobile: 'assets/images/1.png' },
    { desktop: 'assets/images/2.png', mobile: 'assets/images/2.png' },
    { desktop: 'assets/images/3.png', mobile: 'assets/images/3.png' },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;

      this.intervalId = setInterval(() => {
        this.nextSlide();
      }, 5000);

      this.resizeHandler = () => {
        this.isMobile = window.innerWidth <= 768;
        this.setPositionByIndex();
      };
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (isPlatformBrowser(this.platformId) && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.images.length;
    this.setPositionByIndex();
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.images.length) % this.images.length;
    this.setPositionByIndex();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.setPositionByIndex();
  }

  setPositionByIndex() {
    if (this.slidesContainer) {
      const slideWidth = this.slidesContainer.nativeElement.offsetWidth; // عرض الكونتينر كله
      this.slidesContainer.nativeElement.style.transition =
        'transform 0.7s ease-in-out';
      this.slidesContainer.nativeElement.style.transform = `translateX(-${this.currentSlide * slideWidth}px)`;
    }
  }
}
