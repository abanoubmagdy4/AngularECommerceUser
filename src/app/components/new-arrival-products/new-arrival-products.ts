import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { NewArrivalsService } from '../../shared/services/new-arrivals/new-arrivals.service';
import { IProduct } from '../../models/iproduct';
import { Pagination } from '../pagination/pagination';
import { environment } from '../../../environments/environment.development';
import { RealTimeService } from '../../shared/services/RealTime/real-time-service';
import { LocalizedNamePipe } from '../../shared/pipes/localized-name.pipe';

@Component({
  selector: 'app-new-arrival-products',
  standalone: true,
  templateUrl: './new-arrival-products.html',
  styleUrls: ['./new-arrival-products.css'],
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    TranslateModule,
    Pagination,
    LocalizedNamePipe,
  ],
})
export class NewArrivalProductsComponent implements OnInit {
  @Input() displayLimit: number | null = null;
  filteredProducts: IProduct[] = [] as IProduct[];
  currentPageIndex = 1;
  totalPages = 1;

  constructor(
    private _NewArrivalsService: NewArrivalsService,
    private realTimeService: RealTimeService,
  ) {}

  ngOnInit() {
    this.loadNewArrivalProducts();
    this.realTimeService.onNewProductsArrived((newProducts) => {
      if (this.currentPageIndex === 1) {
        const totalPerPage = 12;
        const updatedProducts = this.sortProductsByDiscountAndPrice([...newProducts, ...this.filteredProducts]);
        this.filteredProducts = updatedProducts.slice(0, totalPerPage);
      }
    });
  }

  loadNewArrivalProducts(pageIndex: number = 1): void {
    this._NewArrivalsService.getNewArrivalProducts(pageIndex).subscribe({
      next: (response) => {
        this.filteredProducts = this.sortProductsByDiscountAndPrice(response.items);
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
      this.loadNewArrivalProducts(page);
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
