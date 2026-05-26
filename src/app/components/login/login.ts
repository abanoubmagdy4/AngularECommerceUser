// ✅ login.component.ts
import {
  Component,
  Optional,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { RouterStateService } from '../../shared/services/Router-State/router-state.service';
import { LoginService } from '../../shared/services/login/login.service';
import { CartItemService } from '../../shared/services/cart/cart.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './../../shared/services/Auth/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ICartItem } from '../../models/ICartItem';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  form!: FormGroup;
  isVerificationPopupVisible = false;
  verificationCode = '';
  countdown = 120;
  countdownDisplay = '02:00';
  private timer: any = null;

  @Output() loginSuccess = new EventEmitter<void>();

  constructor(
    public routerState: RouterStateService,
    private _loginService: LoginService,
    private fb: FormBuilder,
    private cookieService: CookieService,
    @Optional() private dialogRef: MatDialogRef<Login>,
    private router: Router,
    private _authService: AuthService,
    private _cartItemService: CartItemService,
    private translate: TranslateService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
    });
  }

  sendCode() {
    const email = this.form.get('email')?.value;

    if (this.form.invalid) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('COMMON.ERROR'),
        html: `<small>${this.translate.instant('LOGIN.ENTER_VALID_EMAIL')}</small>`,
        toast: true,
        position: 'bottom-end',
        background: '#651616',
        color: '#fff',
        showConfirmButton: false,
        showCloseButton: true,
        timer: 3500,
        timerProgressBar: true,
      });
      return;
    }

    this._loginService.getVerifyingCodeToLogin(email).subscribe({
      next: () => {
        this.startCountdown();
        this.isVerificationPopupVisible = true;
      },
      error: (err) => {
        alert(this.translate.instant('LOGIN.SEND_CODE_ERROR'));
      },
    });
  }

  startCountdown() {
    this.countdown = 120;
    this.updateCountdownDisplay();
    clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.countdown--;
      this.updateCountdownDisplay();

      if (this.countdown <= 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  updateCountdownDisplay() {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    this.countdownDisplay = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  resendCode() {
    if (this.countdown > 0) return;

    const email = this.form.get('email')?.value;
    this._loginService.getVerifyingCodeToLogin(email).subscribe({
      next: () => {
        this.startCountdown();
      },
      error: () => alert(this.translate.instant('LOGIN.RESEND_ERROR')),
    });
  }

  async verifyCode() {
    const email = this.form.get('email')?.value;
    const code = this.verificationCode;

    this._loginService.loginAfterGetCode(email, code).subscribe({
      next: async (res) => {
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('COMMON.SUCCESS'),
          text: this.translate.instant('LOGIN.LOGIN_SUCCESS'),
          toast: true,
          position: 'bottom-right',
          showConfirmButton: false,
          timer: 5000,
          width: 500,
          heightAuto: true,
          background: '#166534',
          color: '#fff',
          customClass: {
            popup: 'custom-swal-toast',
          },
        });

        // Store token
        this._authService.setLogin(res.token);

        // Migrate guest cart
        const guestCartRaw = localStorage.getItem('guestCart');
        if (guestCartRaw) {
          try {
            const cart = await firstValueFrom(
              this._cartItemService.getCurrentUserCart(),
            );
            const cartId = cart?.id;

            // Prepare final payload
            const guestCartItems: ICartItem[] = JSON.parse(guestCartRaw).map(
              (item: any) => ({
                id: 0,
                productId: item.productId,
                productSizeId: item.productSizeId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPriceForOneItemType: item.totalPriceForOneItemType,
                productName: item.productName || item.name || 'Unknown',
                productImageUrl: item.productImageUrl || item.image || '',
                productSizeNameEn: item.productSizeNameEn || '',
                productSizeNameAr: item.productSizeNameAr || '',
              }),
            );
            const result = await firstValueFrom(
              this._cartItemService.addToCartFromLocalStorageAfterLogin(
                guestCartItems,
              ),
            );
            localStorage.removeItem('guestCart'); // Clean guest cart after success
          } catch (err) {
            localStorage.removeItem('guestCart'); // Clean even on error
          }
        }

        // Close dialog if using dialog
        if (this.dialogRef) {
          this.dialogRef.close({
            token: res.token,
            customerInfo: res.customerInfo,
          });
        }

        // Emit to parent component
        this.loginSuccess.emit();

        // Navigate to home
        this.isVerificationPopupVisible = false;
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('LOGIN.INVALID_CODE_TITLE'),
          text: this.translate.instant('LOGIN.INVALID_CODE_TEXT'),
        });
      },
    });
  }

  get isHome(): boolean {
    return this.routerState.isHome;
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
//
