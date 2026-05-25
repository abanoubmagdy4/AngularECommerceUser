import { Component, Inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { NewArrival } from '../new-arrival/new-arrival';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NewArrival],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
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

      setInterval(() => {
        this.nextSlide();
      }, 5000);
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
    this.slidesContainer.nativeElement.style.transition = 'transform 0.7s ease-in-out';
    this.slidesContainer.nativeElement.style.transform = `translateX(-${this.currentSlide * slideWidth}px)`;
  }
}

}
