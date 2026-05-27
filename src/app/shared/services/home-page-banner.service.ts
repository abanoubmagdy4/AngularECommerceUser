import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { IHomePageBanner } from '../../models/ihome-page-banner';

@Injectable({
  providedIn: 'root',
})
export class HomePageBannerService {
  private baseUrl = `${environment.urlPath}HomePageBanners`;

  constructor(private http: HttpClient) {}

  getActiveBanners(): Observable<IHomePageBanner[]> {
    return this.http
      .get<IHomePageBanner[]>(`${this.baseUrl}/active`)
      .pipe(catchError(() => of([])));
  }
}
