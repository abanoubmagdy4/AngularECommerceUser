// src/app/shared/services/image-search/image-search.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IAIProductSearchResult } from '../../models/iaiproduct-search-result';

@Injectable({
  providedIn: 'root',
})
export class ImageSearch {
  constructor(private http: HttpClient) {}

  searchByImage(imageFile: File): Observable<IAIProductSearchResult[]> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.http.post<IAIProductSearchResult[]>(
      `${environment.urlPath}Products/get-similar-products-with-image`,
      formData
    );
  }

  searchByPrompt(prompt: string): Observable<IAIProductSearchResult[]> {
    const url = `${environment.urlPath}Products/get-similar-products`;
    return this.http.post<IAIProductSearchResult[]>(url, { promptText: prompt });
  }
}
