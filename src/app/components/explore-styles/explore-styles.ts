import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Category } from '../../shared/services/category';
import { ICategory } from '../../models/icategory';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-explore-styles',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './explore-styles.html',
  styleUrls: ['./explore-styles.css'],
})
export class ExploreStyles implements OnInit {
  categories: ICategory[] = [];

  constructor(private categoryService: Category) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        console.log('Categories loaded:', data);
        // Filter to show only parent categories (parentID is null)
        const parentCategories = data.filter(
          (category) => category.parentID === null,
        );
        this.categories = parentCategories.slice(0, 8); // Limit to 8 categories for the home page
        console.log('Parent categories after filter:', this.categories);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      },
    });
  }

  getCategoryImageUrl(category: ICategory): string {
    if (category.imageUrl) {
      // If the imageUrl is already a full URL, return it as is
      if (category.imageUrl.startsWith('http')) {
        return category.imageUrl;
      }
      // Otherwise, prepend the base server URL
      return `${environment.baseServerUrl}${category.imageUrl}`;
    }
    // Fallback placeholder image
    return 'assets/images/category-placeholder.jpg';
  }

  getCategoryName(category: ICategory): string {
    // This will be handled by the translate pipe in the template
    // For now, return the English name as fallback
    return category.nameEn || category.name || '';
  }
}
