import { Component, Input } from '@angular/core';
import { IProduct } from '../../../models/iproduct';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IAIProductSearchResult } from '../../../models/iaiproduct-search-result';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-search-results',
  imports: [CommonModule, RouterModule],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css',
})
export class SearchResults {
  results: IAIProductSearchResult[] = [];

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.results = nav?.extras.state?.['results'] || [];
  }

  getImageUrl(images: string[], index: number): string {
    const baseUrl = environment.baseServerUrl;
    const defaultImage = 'assets/images/images.jpeg';

    if (!images || images.length === 0) return defaultImage;
    if (!images[index]) return `${baseUrl}${images[0]}`;
    return `${baseUrl}${images[index]}`;
  }
}
