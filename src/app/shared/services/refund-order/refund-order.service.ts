import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { AuthService } from '../Auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RefundOrderService {
  constructor(private _httpClient: HttpClient, private auth: AuthService) {}

  refundOrder(orderId: number, reason: string): Observable<any> {
    return this._httpClient.post(
      `${environment.urlPath}payment/Request-order-refund`,
      {
        orderId,
        reason,
      },
      {
        headers: {
          Authorization: `Bearer ${this.auth.getToken()}`,

          'Content-Type': 'application/json',
        },
        observe: 'response', // 👈 عشان أقدر أشوف الكود
        responseType: 'text' as 'json', // 👈 عشان أتعامل مع النص
      }
    );
  }

  refundProduct(orderItemId: number, reason: string): Observable<any> {
    return this._httpClient.post(
      `${environment.urlPath}payment/Request-product-refund`,
      {
        orderItemId,
        reason,
      },
      {
        headers: {
          Authorization: `Bearer ${this.auth.getToken()}`,

          'Content-Type': 'application/json',
        },
        observe: 'response', // 👈 عشان أقدر أشوف الكود
        responseType: 'text' as 'json', // 👈 عشان أتعامل مع النص
      }
    );
  }
}
