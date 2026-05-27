import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { IProduct } from '../../../models/iproduct';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../Auth/auth.service';
import { ICartItem } from '../../../models/ICartItem';
import { isPlatformBrowser } from '@angular/common';
import { take } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class CartItemService {
  private apiUrl = `${environment.baseServerUrl}/api/CartItem/add-single`;
  private addMultipleUrl = `${environment.baseServerUrl}/api/CartItem/add-multiple`;
  private updateUrl = `${environment.baseServerUrl}/api/CartItem/`;
  private DeleteUrl = `${environment.baseServerUrl}/api/CartItem/`;
  private cartUrl = `${environment.baseServerUrl}/api/Cart`;

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();
  private cartCache$ = new BehaviorSubject<any>(null);
  private isLoadingCart = false;
  // دالة لتحديث حالة السلة
  refreshCartState() {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.authService.getToken();
      if (token) {
        this.getCurrentUserCart()
          .pipe(take(1))
          .subscribe({
            error: (err) => {
              // في حالة الخطأ نحاول تحميل السلة المحلية
              this.loadCartCountFromLocalStorage();
            },
          });
      } else {
        this.loadCartCountFromLocalStorage();
      }
    }
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // تحقق من حالة تسجيل الدخول وتحديث العداد
      this.initializeCartCount();
    }
  }

  private initializeCartCount() {
    const token = this.authService.getToken();
    if (token) {
      // إذا كان المستخدم مسجل دخول، نجلب السلة من السيرفر
      this.getCurrentUserCart(true).subscribe();
    } else {
      // إذا كان ضيف، نجلب من التخزين المحلي
      this.loadCartCountFromLocalStorage();
    }
  }

  updateCartCount(count: number) {
    this.cartCountSubject.next(count);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cartCount', count.toString());
    }
  }

  loadCartCountFromLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const cart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      this.updateCartCount(cart.length);
    }
  }

  // addToCart(
  //   product: IProduct,
  //   selectedSize: string,
  //   quantity: number
  // ): Observable<void> {
  //   return new Observable<void>((observer) => {
  //     const sizeObj = product.productSizes?.find(
  //       (s) => s.size === selectedSize
  //     );

  //     if (!sizeObj) {
  //       observer.error(new Error('Selected size not found in product'));
  //       return;
  //     }

  //     const token = this.authService.getToken();
  //     let headers = new HttpHeaders();
  //     if (token) {
  //       headers = headers.set('Authorization', `Bearer ${token}`);
  //     }

  //     this.getCurrentUserCart().subscribe({
  //       next: (cart: any) => {
  //         const cartItems = cart?.cartItems || [];

  //         const existingItem = cartItems.find(
  //           (item: any) =>
  //             item.productId === product.id && item.productSizeId === sizeObj.id
  //         );

  //         const oldQuantity = existingItem?.quantity || 0;
  //         const totalQuantity = oldQuantity + quantity;

  //         if (totalQuantity > sizeObj.stockQuantity) {
  //           observer.error(
  //             new Error(
  //               `الكمية المطلوبة (${totalQuantity}) أكثر من المتاح (${sizeObj.stockQuantity})`
  //             )
  //           );
  //           return;
  //         }

  //         const unitPrice = product.price;
  //         const payload = {
  //           id: 0,
  //           cartId: 0,
  //           productId: product.id,
  //           productSizeId: sizeObj.id,
  //           quantity: quantity,
  //           unitPrice: product.price,
  //           totalPriceForOneItemType: product.price * quantity,
  //           productName: product.name,
  //           productImageUrl: (
  //             product.productImagesPaths?.[0]?.imagePath || ''
  //           ).replace(`${environment.baseServerUrl}/`, ''),
  //           productSizeName: selectedSize,
  //         };

  //         this.http.post(this.apiUrl, payload, { headers }).subscribe({
  //           next: () => {
  //             this.getCurrentUserCart(true).subscribe(); // تحديث العداد بعد الإضافة
  //             observer.next();
  //             observer.complete();
  //           },
  //           error: (err) => observer.error(err),
  //         });
  //       },
  //       error: (err) => observer.error(err),
  //     });
  //   });
  // }

  addToCartFromLocalStorageAfterLogin(cartItems: ICartItem[]) {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post(this.addMultipleUrl, cartItems, { headers });
  }

  getCurrentUserCart(forceRefresh = false): Observable<any> {
    // لو عندنا بيانات و مش محتاجين تحديث، رجعها
    if (!forceRefresh && this.cartCache$.value) {
      return this.cartCache$.asObservable();
    }

    // لو الطلب شغال حالياً، رجع نفس الـ observable
    if (this.isLoadingCart) {
      return this.cartCache$.asObservable();
    }

    this.isLoadingCart = true;

    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    this.http.get<any>(this.cartUrl, { headers }).subscribe({
      next: (cart) => {
        if (cart?.cartItems) {
          cart.cartItems = cart.cartItems.map((item: any) => ({
            ...item,
            productImageUrl: item.productImageUrl
              ? `${environment.baseServerUrl}/${item.productImageUrl}`
              : '',
          }));
        }
        this.updateCartCount(cart?.cartItems?.length || 0);
        this.cartCache$.next(cart);
        this.isLoadingCart = false;
      },
      error: (err) => {
        this.isLoadingCart = false;
        if (err.status === 404) {
          this.updateCartCount(0);
          this.cartCache$.next(null);
        }
      },
    });

    return this.cartCache$.asObservable();
  }

  updateCartItemQuantity(item: ICartItem): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.put(this.updateUrl, item, { headers }).pipe(
      tap(() => {
        this.getCurrentUserCart(true).subscribe(); // تحديث العداد بعد التعديل
      }),
    );
  }

  deleteCartItem(cartItemId: number): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http
      .delete(`${this.DeleteUrl}?cartItemId=${cartItemId}`, { headers })
      .pipe(
        tap(() => {
          this.getCurrentUserCart(true).subscribe(); // تحديث العداد بعد الحذف
        }),
      );
  }

  addGuestCartItem(item: ICartItem): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // تنسيق مسار الصورة قبل الإرسال للسيرفر
    const imageUrl = item.productImageUrl?.replace(
      `${environment.baseServerUrl}/`,
      '',
    );

    return this.http
      .post(
        this.apiUrl,
        {
          id: 0,
          cartId: 0,
          productId: item.productId,
          productSizeId: item.productSizeId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPriceForOneItemType: item.totalPriceForOneItemType,
          productName: item.productName,
          productImageUrl: imageUrl,
          productSizeNameEn: item.productSizeNameEn,
          productSizeNameAr: item.productSizeNameAr,
        },
        { headers },
      )
      .pipe(
        tap(() => {
          this.getCurrentUserCart(true).subscribe(); // تحديث العداد بعد الإضافة
        }),
      );
  }
  addToCart(
    product: IProduct,
    selectedSize: string,
    quantity: number,
  ): Observable<void> {
    return new Observable<void>((observer) => {
      const sizeObj = product.productSizes?.find(
        (s) => s.size === selectedSize,
      );
      if (!sizeObj) {
        observer.error(new Error('Selected size not found in product'));
        return;
      }

      const token = this.authService.getToken();
      let headers = new HttpHeaders();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }

      // نستخدم الكاش أو نعمل refresh للسلة لو فاضية
      const checkCart$ = this.cartCache$.value
        ? new BehaviorSubject(this.cartCache$.value).asObservable()
        : this.getCurrentUserCart(true);

      checkCart$.pipe(take(1)).subscribe({
        next: (cart: any) => {
          const cartItems = cart?.cartItems || [];
          const existingItem = cartItems.find(
            (item: any) =>
              item.productId === product.id &&
              item.productSizeId === sizeObj.id,
          );

          const oldQuantity = existingItem?.quantity || 0;
          const totalQuantity = oldQuantity + quantity;

          if (totalQuantity > sizeObj.stockQuantity) {
            observer.error(
              new Error(
                `الكمية المطلوبة (${totalQuantity}) أكثر من المتاح (${sizeObj.stockQuantity})`,
              ),
            );
            return;
          }

          if (existingItem) {
            // لو موجود، نعمل update
            const updatedItem = { ...existingItem, quantity: totalQuantity };
            this.updateCartItemQuantity(updatedItem).subscribe({
              next: () => {
                observer.next();
                observer.complete();
              },
              error: (err) => observer.error(err),
            });
          } else {
            // لو مش موجود، نضيفه
            const payload = {
              id: 0,
              cartId: 0,
              productId: product.id,
              productSizeId: sizeObj.id,
              quantity: quantity,
              unitPrice: product.priceAfterDiscount,
              totalPriceForOneItemType: product.priceAfterDiscount * quantity,
              productName: product.name,
              productImageUrl: (
                product.productImagesPaths?.[0]?.imagePath || ''
              ).replace(`${environment.baseServerUrl}/`, ''),
              productSizeNameEn: selectedSize,
            };

            this.http.post(this.apiUrl, payload, { headers }).subscribe({
              next: () => {
                this.getCurrentUserCart(true).subscribe(); // تحديث الكارت من السيرفر
                observer.next();
                observer.complete();
              },
              error: (err) => observer.error(err),
            });
          }
        },
        error: (err) => observer.error(err),
      });
    });
  }
  clearCartCache() {
    this.cartCache$.next(null); // يمسح بيانات الكاش الحالية
    this.updateCartCount(0); // يعيّن عداد السلة للصفر
  }
}
