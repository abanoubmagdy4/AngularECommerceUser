import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductDetailsService } from '../../shared/services/Product/product-details.service';
import { IProduct } from '../../models/iproduct';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment.development';
import { CartItemService } from '../../shared/services/cart/cart.service';
import { AuthService } from '../../shared/services/Auth/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LanguageService } from '../../shared/services/language/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalizedNamePipe } from '../../shared/pipes/localized-name.pipe';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LocalizedNamePipe],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css'],
})
export class ProductDetails implements OnInit {
  @ViewChild('slidesContainer') slidesContainer!: ElementRef<HTMLDivElement>;
  product: IProduct | null = null;
  isLoading = true;
  selectedSize: string | null = null;
  quantity: number = 1;
  currentSlide = 0;
  isLoggedInNow = false;
  safeDescription!: SafeHtml;
  description!: SafeHtml;
  safeCare!: SafeHtml;
  constructor(
    private route: ActivatedRoute,
    private productDetailsService: ProductDetailsService,
    private cartItemService: CartItemService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private languageService: LanguageService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productDetailsService.getProductById(+id).subscribe({
        next: (res) => {
          this.product = res;
          this.selectedSize = res.productSizes?.[0]?.size || null;
          this.isLoading = false;
          const descHtml = this.languageService.getLocalizedDescription(
            this.product,
          );
          console.log('Product details:', descHtml);
          this.description = this.sanitizer.bypassSecurityTrustHtml(descHtml);

          const careHtml = this.languageService.isArabic()
            ? res.careAr || res.careEn || ''
            : res.careEn || res.careAr || '';
          this.safeCare = this.sanitizer.bypassSecurityTrustHtml(careHtml);
        },
        error: (err) => {
          this.isLoading = false;
        },
      });
    }

    this.isLoggedInNow = !!this.authService.getToken();
  }
  ngOnChanges() {}
  getSizes(): string[] {
    return this.product?.productSizes?.map((s) => s.size) || [];
  }

  get imageUrl(): string {
    const imagePath =
      this.product?.productImagesPaths?.[0]?.imagePath ||
      'assets/images/images.jpeg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads'))
      return `${environment.baseServerUrl}${imagePath}`;
    if (imagePath.startsWith('/assets')) return imagePath;
    return `/assets/images/${imagePath}`;
  }

  get sortedImageUrls(): string[] {
    if (
      !this.product?.productImagesPaths ||
      this.product.productImagesPaths.length === 0
    ) {
      return ['/assets/images/default.png'];
    }
    return this.product.productImagesPaths
      .slice()
      .sort((a, b) => a.priority - b.priority)
      .map((img) => {
        if (img.imagePath.startsWith('http')) return img.imagePath;
        if (img.imagePath.startsWith('/uploads'))
          return `${environment.baseServerUrl}${img.imagePath}`;
        if (img.imagePath.startsWith('/assets')) return img.imagePath;
        return `/assets/images/${img.imagePath}`;
      });
  }

  get currentImage(): string {
    return (
      this.sortedImageUrls[this.currentSlide] || '/assets/images/default.png'
    );
  }

  nextSlide() {
    if (this.currentSlide < this.sortedImageUrls.length - 1) {
      this.currentSlide++;
    } else {
      this.currentSlide = 0;
    }
    this.setPositionByIndex();
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    } else {
      this.currentSlide = this.sortedImageUrls.length - 1;
    }
    this.setPositionByIndex();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  getStockQuantity(size: string): number {
    const sizeObj = this.product?.productSizes?.find((s) => s.size === size);
    return sizeObj ? sizeObj.stockQuantity : 0;
  }

  increaseQuantity(): void {
    const stock = this.getStockQuantity(this.selectedSize || '');
    if (this.quantity < stock) {
      this.quantity++;
    } else {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('ERRORS.INSUFFICIENT_STOCK'),
        text: this.translate.instant('ERRORS.STOCK_EXCEEDED'),
        showConfirmButton: false,
        timer: 2500,
      });
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  showAlert(msg: string) {
    Swal.fire({
      icon: 'success',
      title: this.translate.instant('COMMON.SUCCESS'),
      text: msg,
      toast: true,
      position: 'bottom-right',
      showConfirmButton: false,
      timer: 2000,
      width: 500,
      heightAuto: true,
      background: '#166534',
      color: '#fff',
      customClass: {
        popup: 'custom-swal-toast',
      },
    });
  }

  addToLocalStorageCart(
    product: IProduct,
    selectedSize: string,
    quantity: number,
  ) {
    const sizeObj = product.productSizes?.find((s) => s.size === selectedSize);
    if (!sizeObj) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('COMMON.ERROR'),
        text: this.translate.instant('ERRORS.INVALID_SIZE'),
        toast: true,
        position: 'bottom-right',
        showConfirmButton: false,
        timer: 5000,
        width: 500,
        heightAuto: true,
        background: '#651616',
        color: '#fff',
        customClass: {
          popup: 'custom-swal-toast',
        },
      });
      return;
    }

    const cartItem = {
      productId: product.id,
      productSizeId: sizeObj.id,
      quantity: quantity,
      unitPrice: product.price,
      totalPriceForOneItemType: product.price * quantity,
      name: product.name,
      image: product.productImagesPaths?.[0]
        ? environment.baseServerUrl + product.productImagesPaths[0].imagePath
        : null,
      productSizeName: selectedSize,
      productName: product.name,
    };

    const existingCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    const foundItem = existingCart.find(
      (item: any) =>
        item.productId === product.id && item.productSizeId === sizeObj.id,
    );

    if (foundItem) {
      const totalQuantity = foundItem.quantity + quantity;
      if (totalQuantity > sizeObj.stockQuantity) {
        Swal.fire({
          icon: 'warning',
          title: this.translate.instant('ERRORS.QUANTITY_INVALID'),
          html: `<b>Requested: ${totalQuantity}, Available: ${sizeObj.stockQuantity}</b>`,
          showConfirmButton: false,
          timer: 2500,
        });
        return;
      }

      foundItem.quantity = totalQuantity;
      this.showAlert(this.translate.instant('SUCCESS.ADDED_TO_CART'));
    } else {
      if (quantity > sizeObj.stockQuantity) {
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('ERRORS.INSUFFICIENT_STOCK'),
          text: this.translate.instant('ERRORS.STOCK_EXCEEDED'),
          showConfirmButton: false,
          timer: 2500,
        });

        return;
      }

      existingCart.push(cartItem);
      this.showAlert(this.translate.instant('SUCCESS.ADDED_TO_CART'));
      this.cartItemService.getCurrentUserCart().subscribe((cart) => {
        const count = cart?.cartItems?.length || 0;
        this.cartItemService.updateCartCount(count);
      });
    }

    localStorage.setItem('guestCart', JSON.stringify(existingCart));
    this.cartItemService.updateCartCount(existingCart.length);
  }

  addToCart() {
    if (!this.product || !this.selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: this.translate.instant('ERRORS.SIZE_REQUIRED'),
        confirmButtonText: this.translate.instant('COMMON.OK'),
      });
      return;
    }

    if (this.isLoggedInNow) {
      this.cartItemService
        .addToCart(this.product!, this.selectedSize!, this.quantity)
        .subscribe({
          next: () => {
            this.showAlert(this.translate.instant('SUCCESS.ADDED_TO_CART'));
            this.cartItemService.getCurrentUserCart().subscribe((cart) => {
              const count = cart?.cartItems?.length || 0;
              this.cartItemService.updateCartCount(count);
            });
          },
          error: (err) =>
            Swal.fire({
              icon: 'error',
              title: this.translate.instant('COMMON.ERROR'),
              text:
                err?.message ||
                this.translate.instant('ERRORS.CART_ADD_FAILED'),
              showConfirmButton: false,
              timer: 2500,
            }),
        });
    } else {
      this.addToLocalStorageCart(
        this.product!,
        this.selectedSize!,
        this.quantity,
      );
    }
  }

  onSizeChange(): void {
    this.quantity = 1;
  }

  decodeUserFromToken(token: string): { id: string; email: string } {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ],
      email:
        payload[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
        ],
    };
  }

  buyNow() {
    if (!this.product || !this.selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: this.translate.instant('ERRORS.SIZE_REQUIRED'),
        confirmButtonText: this.translate.instant('COMMON.OK'),
      });
      return;
    }

    const sizeObj = this.product.productSizes?.find(
      (s) => s.size === this.selectedSize,
    );

    if (!sizeObj) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('ERRORS.INVALID_SIZE'),
      });
      return;
    }

    const buyNowItem = {
      productId: this.product.id,
      productSizeId: sizeObj.id,
      productName: this.product.name,
      productSizeNameEn: sizeObj.size,
      productImageUrl: this.product.productImagesPaths?.[0]
        ? environment.baseServerUrl +
          this.product.productImagesPaths[0].imagePath
        : '/assets/images/default.png',
      quantity: this.quantity,
      unitPrice: this.product.price,
      totalPriceForOneItemType: this.product.price * this.quantity,
    };

    sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
    this.router.navigate(['/order']);
  }
  // --- سحب الصور ---
  private isDragging = false;
  private startX = 0;
  private currentTranslate = 0;
  private prevTranslate = 0;
  private animationID: number | null = null;
  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.startX = event.touches[0].clientX;
    this.animationID = requestAnimationFrame(this.animation.bind(this));
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    const currentX = event.touches[0].clientX;
    this.currentTranslate = this.prevTranslate + currentX - this.startX;
  }

  onTouchEnd() {
    this.isDragging = false;
    cancelAnimationFrame(this.animationID!);

    const movedBy = this.currentTranslate - this.prevTranslate;

    if (movedBy < -100 && this.currentSlide < this.sortedImageUrls.length - 1)
      this.currentSlide++;
    else if (movedBy > 100 && this.currentSlide > 0) this.currentSlide--;

    this.setPositionByIndex();
  }

  onMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = true;
    this.startX = event.clientX;
    this.animationID = requestAnimationFrame(this.animation.bind(this));
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const currentX = event.clientX;
    this.currentTranslate = this.prevTranslate + currentX - this.startX;
  }

  onMouseUp() {
    this.isDragging = false;
    cancelAnimationFrame(this.animationID!);

    const movedBy = this.currentTranslate - this.prevTranslate;

    if (movedBy < -100 && this.currentSlide < this.sortedImageUrls.length - 1)
      this.currentSlide++;
    else if (movedBy > 100 && this.currentSlide > 0) this.currentSlide--;

    this.setPositionByIndex();
  }

  onMouseLeave() {
    if (this.isDragging) this.onMouseUp();
  }

  animation() {
    this.setSliderPosition();
    if (this.isDragging) {
      this.animationID = requestAnimationFrame(this.animation.bind(this));
    }
  }

  setSliderPosition() {
    if (this.slidesContainer) {
      this.slidesContainer.nativeElement.style.transform = `translateX(${this.currentTranslate}px)`;
    }
  }

  setPositionByIndex() {
    const containerWidth = this.slidesContainer.nativeElement.clientWidth;
    this.currentTranslate = -this.currentSlide * containerWidth;
    this.prevTranslate = this.currentTranslate;
    if (this.slidesContainer)
      this.slidesContainer.nativeElement.style.transition =
        'transform 0.7s ease-in-out';
    this.setSliderPosition();

    // إزالة الانتقال بعد الانتهاء عشان السحب يكون سلس بعد كده
    setTimeout(() => {
      if (this.slidesContainer)
        this.slidesContainer.nativeElement.style.transition = 'none';
    }, 700);
  }
}
