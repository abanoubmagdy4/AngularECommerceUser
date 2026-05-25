import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { CartItemService } from '../cart/cart.service';
import { isPlatformBrowser } from '@angular/common';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authStatus!: BehaviorSubject<boolean>;

  constructor(private cookieService: CookieService) {
    const isLoggedIn = this.cookieService.check('token');
    this.authStatus = new BehaviorSubject<boolean>(isLoggedIn);
  }
  // observable عشان الكومبوننت تشترك عليه
  isLoggedIn(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  // لما يسجل دخول
  setLogin(token: string) {
    this.cookieService.set('token', token);
    this.authStatus.next(true);
  }

  // لما يعمل لوج اوت
  logout() {
    this.cookieService.delete('token');
    this.authStatus.next(false);
  }

  getToken(): string | null {
    const token = this.cookieService.get('token');
    return token && token.trim().length > 0 ? token : null;
  }
}
