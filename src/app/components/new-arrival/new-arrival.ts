import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { NewArrivalsService } from '../../shared/services/new-arrivals/new-arrivals.service';
import { IProduct } from '../../models/iproduct';
import { Pagination } from '../pagination/pagination';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { RealTimeService } from '../../shared/services/RealTime/real-time-service';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedNamePipe } from '../../shared/pipes/localized-name.pipe';

@Component({
  selector: 'app-new-arrival',
  templateUrl: './new-arrival.html',
  styleUrls: ['./new-arrival.css'],
  imports: [
    CurrencyPipe,
    Pagination,
    CommonModule,
    RouterLink,
    TranslateModule,
    LocalizedNamePipe,
  ],
})
export class NewArrival implements OnInit {
  @Input() displayLimit: number | null = null;
  filteredProducts: IProduct[] = [] as IProduct[];
  currentPageIndex = 1;
  totalPages = 1;

  constructor(
    private _NewArrivalsService: NewArrivalsService,
    private realTimeService: RealTimeService,
  ) {}

  ngOnInit() {
    this.loadNewArrivals();
    this.realTimeService.onNewProductsArrived((newProducts) => {
      // بس لو المستخدم في أول صفحة
      if (this.currentPageIndex === 1) {
        const totalPerPage = 12; // أو العدد اللي عندك لكل صفحة
        const updatedProducts = this.sortProductsByDiscountAndPrice([
          ...newProducts,
          ...this.filteredProducts,
        ]);

        // قلل العدد عشان يفضل ثابت
        this.filteredProducts = updatedProducts.slice(0, totalPerPage);
      }
    });
  }

  loadNewArrivals(pageIndex: number = 1): void {
    this._NewArrivalsService.getNewArrivalProducts(pageIndex).subscribe({
      next: (response) => {
        this.filteredProducts = this.sortProductsByDiscountAndPrice(
          response.items,
        );
        this.currentPageIndex = response.pageIndex;
        this.totalPages = response.totalPages;
      },
      error: (err) => {},
    });
  }

  sortProductsByDiscountAndPrice(products: IProduct[]): IProduct[] {
    return products.sort((a, b) => {
      const discountA = this.calculateDiscountPercentage(a);
      const discountB = this.calculateDiscountPercentage(b);

      // If both have discounts, sort by highest discount first
      if (discountA > 0 && discountB > 0) {
        return discountB - discountA;
      }

      // If only A has discount, A comes first
      if (discountA > 0 && discountB === 0) {
        return -1;
      }

      // If only B has discount, B comes first
      if (discountA === 0 && discountB > 0) {
        return 1;
      }

      // If neither has discount, sort by lowest price first
      return a.priceAfterDiscount - b.priceAfterDiscount;
    });
  }
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageIndex = page;
      this.loadNewArrivals(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getImageUrl(product: IProduct, index: number): string {
    const defaultImage = 'assets/images/images.jpeg';
    const images = product.productImagesPaths;

    if (!images || images.length === 0) return defaultImage;

    // لو ماوس واقف عليه، رجع الصورة التانية لو فيه أكتر من صورة
    if (!images[index])
      return `${environment.baseServerUrl}${images[0].imagePath}`;

    return `${environment.baseServerUrl}${images[index].imagePath}`;
  }

  getProductSizesDisplay(product: IProduct): string {
    return product.productSizes && product.productSizes.length
      ? product.productSizes.map((s) => s.size.charAt(0)).join(', ')
      : 'N/A';
  }

  calculateDiscountPercentage(product: IProduct): number {
    if (!product.price || product.price <= 0) return 0;
    const discount =
      ((product.price - product.priceAfterDiscount) / product.price) * 100;
    return Math.round(discount);
  }

  get displayProducts(): IProduct[] {
    if (this.displayLimit && this.displayLimit > 0) {
      return this.filteredProducts.slice(0, this.displayLimit);
    }
    return this.filteredProducts;
  }
}
