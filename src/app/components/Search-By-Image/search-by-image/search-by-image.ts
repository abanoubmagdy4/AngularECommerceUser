import { Component, EventEmitter, Output } from '@angular/core';
import { IProduct } from '../../../models/iproduct';
import { ImageSearch } from '../../../shared/services/image-search';
import { Router } from '@angular/router';
import { IAIProductSearchResult } from '../../../models/iaiproduct-search-result';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-search-by-image',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './search-by-image.html',
  styleUrl: './search-by-image.css',
})
export class SearchByImage {
  @Output() searchResults = new EventEmitter<IAIProductSearchResult[]>();
  selectedFile: File | null = null;
  loading = false;
  loadingPrompt = false;

  promptText: string = '';
  constructor(
    private imageSearchService: ImageSearch,
    private router: Router,
  ) {}
  handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.onSearch(); // يبدأ البحث تلقائي
    }
  }
  onSearch() {
    if (!this.selectedFile) return;

    this.loading = true;

    this.imageSearchService.searchByImage(this.selectedFile).subscribe({
      next: (res) => {
        this.loading = false;
        // Navigate to search results with state
        this.router.navigate(['/search-results'], {
          state: { results: res },
        });
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }
  onSearchByPrompt() {
    if (!this.promptText) return;

    this.loadingPrompt = true;
    this.imageSearchService.searchByPrompt(this.promptText).subscribe({
      next: (res) => {
        this.loadingPrompt = false;
        this.router.navigate(['/search-results'], {
          state: { results: res },
        });
      },
      error: (err) => {
        this.loadingPrompt = false;
      },
    });
  }
}
