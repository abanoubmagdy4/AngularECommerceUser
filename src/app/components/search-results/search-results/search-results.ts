import { Component, Input } from '@angular/core';
import { IProduct } from '../../../models/iproduct';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IAIProductSearchResult } from '../../../models/iaiproduct-search-result';
import { environment } from '../../../../environments/environment.development';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../shared/services/language/language.service';
import { ProductDetailsService } from '../../../shared/services/Product/product-details.service';

@Component({
  selector: 'app-search-results',
  imports: [CommonModule, RouterModule, TranslateModule, CurrencyPipe],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css',
})
export class SearchResults {
  results: IAIProductSearchResult[] = [];
  productsWithDetails: Map<number, IProduct> = new Map();

  constructor(
    private router: Router,
    public languageService: LanguageService,
    private productDetailsService: ProductDetailsService,
  ) {
    const nav = this.router.getCurrentNavigation();
    this.results = nav?.extras.state?.['results'] || [];
    this.loadProductDetails();
  }

  loadProductDetails() {
    this.results.forEach((result) => {
      this.productDetailsService
        .getProductById(result.product.productId)
        .subscribe({
          next: (product) => {
            this.productsWithDetails.set(result.product.productId, product);
          },
          error: (err) => {},
        });
    });
  }

  getProductDetails(productId: number): IProduct | undefined {
    return this.productsWithDetails.get(productId);
  }

  getLocalizedProductName(product: any): string {
    return this.languageService.isArabic()
      ? product.nameAr || product.name || ''
      : product.nameEn || product.name || '';
  }

  getImageUrl(images: string[], index: number): string {
    const baseUrl = environment.baseServerUrl;
    const defaultImage = 'assets/images/images.jpeg';

    if (!images || images.length === 0) return defaultImage;
    if (!images[index]) return `${baseUrl}${images[0]}`;
    return `${baseUrl}${images[index]}`;
  }

  calculateDiscountPercentage(product: IProduct): number {
    if (!product.price || product.price <= 0) return 0;
    const discount =
      ((product.price - product.priceAfterDiscount) / product.price) * 100;
    return Math.round(discount);
  }
}
