import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ImageCacheService {
  private cache = new Map<string, string>(); // url -> blobUrl

  constructor(private http: HttpClient) {}

  /**
   * Get cached image URL. If not cached, fetches and caches it.
   * Returns a blob URL that can be used in img src.
   */
  getImage(url: string): Observable<string> {
    if (this.cache.has(url)) {
      return of(this.cache.get(url)!);
    }

    return this.http.get(url, { responseType: 'blob' }).pipe(
      map((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        this.cache.set(url, blobUrl);
        return blobUrl;
      }),
      catchError((err) => {
        console.error('Image cache fetch failed:', url, err);
        return of(url); // fallback to original URL
      }),
    );
  }

  /**
   * Preload multiple images into cache
   */
  preloadImages(urls: string[]): void {
    urls.forEach((url) => {
      if (!this.cache.has(url)) {
        this.getImage(url).subscribe();
      }
    });
  }

  /**
   * Clear specific URL from cache
   */
  clearCache(url?: string): void {
    if (url) {
      const blobUrl = this.cache.get(url);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        this.cache.delete(url);
      }
    } else {
      // Clear all
      this.cache.forEach((blobUrl) => URL.revokeObjectURL(blobUrl));
      this.cache.clear();
    }
  }

  /**
   * Check if URL is cached
   */
  isCached(url: string): boolean {
    return this.cache.has(url);
  }
}
