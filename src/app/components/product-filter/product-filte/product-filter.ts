import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Category } from '../../../shared/services/category';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export enum ProductType {
  shirt,
  tshirt,
  pant,
  jeans,
  jacket,
  dress,
  short,
  skirt,
  bag,
  hat,
  shoe,
  sunglass,
}

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-filter.html',
  styleUrl: './product-filter.css',
})
export class ProductFilter implements OnInit {
  @Output() filtersChanged = new EventEmitter<any>();

  ProductTypes = Object.values(ProductType).filter(
    (value) => typeof value === 'string'
  );

  showMobileFilter = false;
  showSearchInput = false;
  searchTerm = '';

  minRange = 0;
  maxRange = 10000;
  minPrice = 0;
  maxPrice = 10000;

  selectedCategoryId?: number;
  selectedSubCategory?: string;
  categories: any[] = [];

  constructor(private categoryService: Category) {}

  ngOnInit() {
    this.loadCategories();
  }

  toggleSearchInput() {
    this.showSearchInput = !this.showSearchInput;
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe((res) => {
      this.categories = res.map((cat: any) => ({ ...cat, open: false }));
    });
  }

  toggleCategory(cat: any) {
    this.categories.forEach((c) => {
      if (c !== cat) c.open = false;
    });
    cat.open = !cat.open;

    // لو فتحت كاتيجوري جديدة امسح السب كاتيجوري المختارة
    if (cat.open) {
      this.selectedSubCategory = undefined;
    }
  }

  closeFilter(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('bg-black')) {
      this.showMobileFilter = false;
    }
  }

  selectCategory(catId: number) {
    this.selectedCategoryId = catId;
    this.selectedSubCategory = undefined;
    this.emitFilters();
  }

  selectSubCategory(sub: string, parentCategoryId?: number) {
    this.selectedSubCategory = sub;

    // لو جالك الـ parentCategoryId، خزنه
    if (parentCategoryId) {
      this.selectedCategoryId = parentCategoryId;
    }

    this.emitFilters();
  }

  updateRange(type: 'min' | 'max') {
    if (type === 'min' && this.minPrice > this.maxPrice) {
      this.minPrice = this.maxPrice;
    }
    if (type === 'max' && this.maxPrice < this.minPrice) {
      this.maxPrice = this.minPrice;
    }
    this.emitFilters();
  }

  emitFilters() {
    let finalSearchTerm = this.searchTerm;

    // لو فيه subCategory ضيفها للبحث
    if (this.selectedSubCategory) {
      if (finalSearchTerm && finalSearchTerm.trim() !== '') {
        finalSearchTerm += ' ' + this.selectedSubCategory;
      } else {
        finalSearchTerm = this.selectedSubCategory;
      }
    }

    this.filtersChanged.emit({
      search: finalSearchTerm, // Search input + subCategory
      categoryId: this.selectedCategoryId, // Category ID
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.minPrice = this.minRange;
    this.maxPrice = this.maxRange;
    this.selectedCategoryId = undefined;
    this.selectedSubCategory = undefined;
    this.emitFilters();
  }
}
