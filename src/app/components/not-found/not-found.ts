import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  NgIf,
  NgFor,
  DatePipe,
  DecimalPipe,
  CommonModule,
} from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, CommonModule, DatePipe, DecimalPipe, TranslateModule],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.css'],
})
export class NotFound implements OnInit {
  orderSummary: any;

  constructor(
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    this.orderSummary = navigation?.extras?.state?.['orderSummary'];

    if (!this.orderSummary) {
      const stored = localStorage.getItem('orderSummary');
      if (stored) {
        this.orderSummary = JSON.parse(stored);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  getOrderStatusLabel(status: string | number): string {
    const statusStr = String(status);
    const statusMap: Record<string, string> = {
      '0': 'ENUMS.ORDER_STATUS.CREATED',
      '1': 'ENUMS.ORDER_STATUS.AWAITING_PAYMENT',
      '2': 'ENUMS.ORDER_STATUS.PROCESSING',
      '3': 'ENUMS.ORDER_STATUS.CANCELLED',
      '4': 'ENUMS.ORDER_STATUS.RETURNED',
      Created: 'ENUMS.ORDER_STATUS.CREATED',
      AwaitingPayment: 'ENUMS.ORDER_STATUS.AWAITING_PAYMENT',
      Processing: 'ENUMS.ORDER_STATUS.PROCESSING',
      Cancelled: 'ENUMS.ORDER_STATUS.CANCELLED',
      Returned: 'ENUMS.ORDER_STATUS.RETURNED',
    };
    const key = statusMap[statusStr] || statusStr;
    const translation = this.translate.instant(key);
    return translation !== key ? translation : statusStr;
  }

  getPaymentMethodLabel(method: string | number): string {
    const methodStr = String(method);
    const methodMap: Record<string, string> = {
      '0': 'ENUMS.PAYMENT_METHODS.ONLINE',
      '1': 'ENUMS.PAYMENT_METHODS.COD',
      '2': 'ENUMS.PAYMENT_METHODS.CARD',
      '3': 'ENUMS.PAYMENT_METHODS.WALLET',
      Online: 'ENUMS.PAYMENT_METHODS.ONLINE',
      COD: 'ENUMS.PAYMENT_METHODS.COD',
      card: 'ENUMS.PAYMENT_METHODS.CARD',
      wallet: 'ENUMS.PAYMENT_METHODS.WALLET',
    };
    const key = methodMap[methodStr] || methodStr;
    const translation = this.translate.instant(key);
    return translation !== key ? translation : methodStr;
  }

  continueShopping() {
    localStorage.removeItem('orderSummary');
    this.router.navigate(['/home']);
  }
}
