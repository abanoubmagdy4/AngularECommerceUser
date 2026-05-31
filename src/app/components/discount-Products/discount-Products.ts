import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { DiscountedProductsService } from '../../shared/services/discount-products/discount-products.service';
import { IProduct } from '../../models/iproduct';
import { Pagination } from '../pagination/pagination';
import { environment } from '../../../environments/environment.development';
import { RealTimeService } from '../../shared/services/RealTime/real-time-service';
import { LocalizedNamePipe } from '../../shared/pipes/localized-name.pipe';

@Component({
  selector: 'app-discount-Products',
  standalone: true,
  templateUrl: './discount-Products.html',
  styleUrls: ['./discount-Products.css'],
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    TranslateModule,
    Pagination,
    LocalizedNamePipe,
  ],
})
export class DiscountProductsComponent implements OnInit {
  @Input() displayLimit: number | null = null;
  filteredProducts: IProduct[] = [] as IProduct[];
  currentPageIndex = 1;
  totalPages = 1;

  constructor(
    private _DiscountedProductsService: DiscountedProductsService,
    private realTimeService: RealTimeService,
  ) {}

  ngOnInit() {
    this.loadDiscountProducts();
    this.initializeRealTimeUpdates();
  }

  private initializeRealTimeUpdates(): void {
    this.realTimeService.onNewProductsArrived((newProducts) => {
      if (this.currentPageIndex === 1) {
        const totalPerPage = 12;
        const updatedProducts = [...newProducts, ...this.filteredProducts];
        this.filteredProducts = updatedProducts.slice(0, totalPerPage);
      }
    });
  }

  loadDiscountProducts(pageIndex: number = 1): void {
    this._DiscountedProductsService.getDiscountProducts(pageIndex).subscribe({
      next: (response) => {
        this.filteredProducts = response.items
          .filter((p) => p.discountPercentage > 0)
          .sort((a, b) => b.discountPercentage - a.discountPercentage);
        this.currentPageIndex = response.pageIndex;
        this.totalPages = response.totalPages;
      },
      error: (err) => {},
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageIndex = page;
      this.loadDiscountProducts(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getImageUrl(product: IProduct, index: number): string {
    const defaultImage = 'assets/images/images.jpeg';
    const images = product.productImagesPaths;

    if (!images || images.length === 0) return defaultImage;

    if (!images[index])
      return `${environment.baseServerUrl}${images[0].imagePath}`;

    return `${environment.baseServerUrl}${images[index].imagePath}`;
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
