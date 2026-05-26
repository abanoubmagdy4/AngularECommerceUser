import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Category } from '../../../shared/services/category';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LanguageService } from '../../../shared/services/language/language.service';

export interface ProductFilters {
  search: string;
  categoryId?: number;
  minPrice: number;
  maxPrice: number;
  sortBy: string;
}

export const SORT_OPTIONS = [
  { key: 'default', labelKey: 'SORT.DEFAULT' },
  { key: 'nameAsc', labelKey: 'SORT.NAME_ASC' },
  { key: 'nameDesc', labelKey: 'SORT.NAME_DESC' },
  { key: 'priceAsc', labelKey: 'SORT.PRICE_ASC' },
  { key: 'priceDesc', labelKey: 'SORT.PRICE_DESC' },
  { key: 'newest', labelKey: 'SORT.NEWEST' },
];

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './product-filter.html',
  styleUrl: './product-filter.css',
})
export class ProductFilter implements OnInit, OnDestroy {
  @Output() filtersChanged = new EventEmitter<ProductFilters>();

  sortOptions = SORT_OPTIONS;
  selectedSort = 'default';

  showMobileFilter = false;
  showSearchInput = false;
  searchTerm = '';

  minRange = 0;
  maxRange = 10000;
  minPrice = 0;
  maxPrice = 10000;

  selectedCategoryId?: number;
  categories: any[] = [];

  private searchSubject = new Subject<string>();
  private sub = new Subscription();

  constructor(
    private categoryService: Category,
    public languageService: LanguageService,
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.sub.add(
      this.searchSubject
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(() => this.emitFilters()),
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onSearchInput(value: string) {
    this.searchTerm = value.trim();
    this.searchSubject.next(this.searchTerm);
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
  }

  closeFilter(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('filter-backdrop')) {
      this.showMobileFilter = false;
    }
  }

  selectCategory(catId: number) {
    this.selectedCategoryId = catId;
    this.emitFilters();
  }

  clearCategory() {
    this.selectedCategoryId = undefined;
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

  onSortChange() {
    this.emitFilters();
  }

  emitFilters() {
    const filters = {
      search: this.searchTerm,
      categoryId: this.selectedCategoryId,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      sortBy: this.selectedSort,
    };
    console.log('Emitting filters:', filters);
    this.filtersChanged.emit(filters);
  }

  resetFilters() {
    this.searchTerm = '';
    this.minPrice = this.minRange;
    this.maxPrice = this.maxRange;
    this.selectedCategoryId = undefined;
    this.selectedSort = 'default';
    this.emitFilters();
  }

  getCategoryName(cat: any): string {
    return this.languageService.getLocalizedName(cat);
  }
}
