import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '../../../models/iproduct';
import { environment } from '../../../../environments/environment.development';
import { IPaginate } from '../../../models/ipaginate';
import { PaginatedResult } from '../../../models/paginated-result';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private _httpClient: HttpClient) {}

  getAllProductsByPaginate(pageIndex: number): Observable<IPaginate<IProduct>> {
    const url = `${environment.urlPath}Products/Custpaginated?PageIndex=${pageIndex}`;
    return this._httpClient.get<IPaginate<IProduct>>(url);
  }
  getPaginatedProducts(
    page: number,
    size: number,
    search: string = '',
    categoryId?: number,
    minPrice?: number,
    maxPrice?: number,
    isNewArrival?: boolean,
    hasDiscount?: boolean,
    sortBy?: string,
    sortOrder?: string,
  ): Observable<PaginatedResult<IProduct[]>> {
    let params = new HttpParams()
      .set('pageIndex', page)
      .set('pageSize', size)
      .set('SearchTerm', search || '');

    if (categoryId != null) params = params.set('CategoryId', categoryId);
    if (minPrice != null && minPrice !== undefined)
      params = params.set('MinPrice', minPrice);
    if (maxPrice != null && maxPrice !== undefined)
      params = params.set('MaxPrice', maxPrice);
    if (isNewArrival != null) params = params.set('isNewArrival', isNewArrival);
    if (hasDiscount != null) params = params.set('hasDiscount', hasDiscount);
    if (sortBy) params = params.set('SortBy', sortBy);
    if (sortOrder) params = params.set('SortOrder', sortOrder);

    return this._httpClient.get<PaginatedResult<IProduct[]>>(
      `${environment.urlPath}Products/Custpaginated`,
      { params },
    );
  }
}
