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
import { LanguageService } from '../../shared/services/language/language.service';
import { environment } from '../../../environments/environment.development';
import { HomePageBannerService } from '../../shared/services/home-page-banner.service';
import { ImageCacheService } from '../../shared/services/image-cache.service';
import { IHomePageBanner } from '../../models/ihome-page-banner';

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
  private langChangeSubscription: any;
  @ViewChild('slidesContainer') slidesContainer!: ElementRef<HTMLDivElement>;

  isMobile = false;
  currentSlide = 0;
  banners: IHomePageBanner[] = [];
  bannersLoaded = false;

  fallbackImages = [
    { desktop: '/assets/images/1.png', mobile: '/assets/images/1.png' },
    { desktop: '/assets/images/2.png', mobile: '/assets/images/2.png' },
    { desktop: '/assets/images/3.png', mobile: '/assets/images/3.png' },
  ];

  cachedImageUrls: Map<number, string> = new Map(); // bannerId -> cachedUrl

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private languageService: LanguageService,
    private bannerService: HomePageBannerService,
    private imageCache: ImageCacheService,
  ) {}

  get isArabic(): boolean {
    return this.languageService.isArabic();
  }

  getBannerImageUrl(banner: IHomePageBanner): string {
    // Return cached blob URL if available
    if (this.cachedImageUrls.has(banner.id)) {
      return this.cachedImageUrls.get(banner.id)!;
    }

    // Build full URL and cache it asynchronously
    const path = this.isArabic
      ? banner.imageUrlAr || banner.imageUrlEn
      : banner.imageUrlEn || banner.imageUrlAr;
    if (!path) {
      console.log('Banner has no image path, using default:', banner.id);
      return '/assets/images/default.png';
    }

    const fullUrl = path.startsWith('http')
      ? path
      : `${environment.baseServerUrl}/${path}`;

    console.log('Banner image URL:', banner.id, fullUrl);

    // Fetch and cache for next render
    this.imageCache.getImage(fullUrl).subscribe((cachedUrl) => {
      this.cachedImageUrls.set(banner.id, cachedUrl);
    });

    return fullUrl;
  }

  preloadBannerImages(): void {
    const urls = this.banners
      .map((b) => {
        const path = this.isArabic
          ? b.imageUrlAr || b.imageUrlEn
          : b.imageUrlEn || b.imageUrlAr;
        return path && !path.startsWith('http')
          ? `${environment.baseServerUrl}/${path}`
          : path;
      })
      .filter((url): url is string => !!url);
    this.imageCache.preloadImages(urls);
  }

  getBannerTitle(banner: IHomePageBanner): string {
    if (this.isArabic) {
      return banner.titleAr || banner.titleEn || '';
    }
    return banner.titleEn || banner.titleAr || '';
  }

  get slideCount(): number {
    return this.bannersLoaded && this.banners.length > 0
      ? this.banners.length
      : this.fallbackImages.length;
  }

  get shouldShowBannerSection(): boolean {
    return this.bannersLoaded && this.banners.length > 0;
  }

  ngOnInit() {
    this.bannerService.getActiveBanners().subscribe((banners) => {
      this.banners = banners;
      this.bannersLoaded = true;
      this.currentSlide = 0;
      this.preloadBannerImages();
    });

    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;

      // Only start auto-slide if there are banners or fallback images
      this.intervalId = setInterval(() => {
        this.nextSlide();
      }, 5000);

      this.resizeHandler = () => {
        this.isMobile = window.innerWidth <= 768;
        this.setPositionByIndex();
      };
      window.addEventListener('resize', this.resizeHandler);

      this.langChangeSubscription = this.languageService.currentLang$.subscribe(
        () => {
          this.setPositionByIndex();
        },
      );
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (isPlatformBrowser(this.platformId) && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slideCount;
    this.setPositionByIndex();
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.slideCount) % this.slideCount;
    this.setPositionByIndex();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.setPositionByIndex();
  }

  setPositionByIndex() {
    if (this.slidesContainer) {
      const slideWidth = this.slidesContainer.nativeElement.offsetWidth;
      const isRTL = this.languageService.isArabic();
      const translateValue = isRTL
        ? this.currentSlide * slideWidth
        : -(this.currentSlide * slideWidth);

      this.slidesContainer.nativeElement.style.transition =
        'transform 0.7s ease-in-out';
      this.slidesContainer.nativeElement.style.transform = `translateX(${translateValue}px)`;
    }
  }

  onBannerImageError(event: Event, banner: IHomePageBanner) {
    console.error(
      'Banner image failed to load:',
      banner.id,
      banner.imageUrlEn,
      banner.imageUrlAr,
    );
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/default.png';
  }

  onFallbackImageError(event: Event) {
    console.error('Fallback image failed to load');
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/default.png';
  }
}
