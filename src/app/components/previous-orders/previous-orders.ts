import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RefundOrderService } from '../../shared/services/refund-order/refund-order.service';
import { PreviousOrder } from '../../shared/services/PreviousOrders/previous-orders';
import { IPreviousOrder } from '../../models/iprevious-order';
import { environment } from '../../../environments/environment.development';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-previous-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './previous-orders.html',
  styleUrls: ['./previous-orders.css'],
})
export class PreviousOrders implements OnInit {
  orders: IPreviousOrder[] = [];
  // filteredOrders: IPreviousOrder[] = [];
  imagePath = `${environment.baseServerUrl}`;

  selectedOrderId: number | null = null;
  selectedProductId: number | null = null;
  refundReason: string = '';

  showRefundForm = false;
  showProductRefundForm = false;
  statusBar = [
    'NotApplicable',
    'NotShipped',
    'ReadyToShip',
    'Shipped',
    'OutForDelivery',
    'Delivered',
  ];

  get filterOptions(): string[] {
    return [
      this.translate.instant('PREVIOUS_ORDERS.FILTER_ALL'),
      this.translate.instant('PREVIOUS_ORDERS.FILTER_PENDING'),
      this.translate.instant('PREVIOUS_ORDERS.FILTER_COMPLETED'),
      this.translate.instant('PREVIOUS_ORDERS.FILTER_REJECTED'),
    ];
  }
  selectedFilter = '';
  constructor(
    private refundOrderService: RefundOrderService,
    private previousOrderService: PreviousOrder,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.selectedFilter = this.translate.instant('PREVIOUS_ORDERS.FILTER_ALL');
    this.previousOrderService.getPreviousOrders().subscribe({
      next: (response) => {
        this.orders = response;
      },
      error: () => {
        Swal.fire({
          title: this.translate.instant('COMMON.ERROR'),
          text: this.translate.instant('PREVIOUS_ORDERS.FETCH_ERROR'),
          icon: 'error',
          confirmButtonText: this.translate.instant('COMMON.OK'),
        });
      },
    });
  }

  // ===== Filtering

  // applyFilter() {
  //   if (!this.activeFilter) {
  //     this.filteredOrders = [...this.orders];
  //   } else {
  //     this.filteredOrders = this.orders.filter(
  //       (order) => order.shippingStatus === this.activeFilter
  //     );
  //   }
  // }
  // Change filter
  filterByStatus(status: string) {
    this.selectedFilter = status;
  }

  // Translate status label
  getStepLabel(status: string): string {
    const statusMap: Record<string, string> = {
      NotApplicable: 'ENUMS.SHIPPING_STATUS.NOT_APPLICABLE',
      NotShipped: 'ENUMS.SHIPPING_STATUS.NOT_SHIPPED',
      ReadyToShip: 'ENUMS.SHIPPING_STATUS.READY_TO_SHIP',
      Shipped: 'ENUMS.SHIPPING_STATUS.SHIPPED',
      OutForDelivery: 'ENUMS.SHIPPING_STATUS.OUT_FOR_DELIVERY',
      Delivered: 'ENUMS.SHIPPING_STATUS.DELIVERED',
    };
    const key =
      statusMap[status] ||
      `PREVIOUS_ORDERS.STEP_${status.toUpperCase().replace(/[^A-Z]/g, '_')}`;
    const translation = this.translate.instant(key);
    return translation !== key ? translation : status;
  }

  // Translate order status
  getOrderStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      Created: 'ENUMS.ORDER_STATUS.CREATED',
      AwaitingPayment: 'ENUMS.ORDER_STATUS.AWAITING_PAYMENT',
      Processing: 'ENUMS.ORDER_STATUS.PROCESSING',
      Cancelled: 'ENUMS.ORDER_STATUS.CANCELLED',
      Returned: 'ENUMS.ORDER_STATUS.RETURNED',
    };
    const key = statusMap[status] || `ORDER.${status.toUpperCase()}`;
    const translation = this.translate.instant(key);
    return translation !== key ? translation : status;
  }

  // Translate payment method
  getPaymentMethodLabel(method: string): string {
    const methodMap: Record<string, string> = {
      Online: 'ENUMS.PAYMENT_METHODS.ONLINE',
      COD: 'ENUMS.PAYMENT_METHODS.COD',
      card: 'ENUMS.PAYMENT_METHODS.CARD',
      wallet: 'ENUMS.PAYMENT_METHODS.WALLET',
      CreditCard: 'ENUMS.PAYMENT_METHODS.CARD',
    };
    const key = methodMap[method] || method;
    const translation = this.translate.instant(key);
    return translation !== key ? translation : method;
  }

  // Filtered orders
  get filteredOrders() {
    const filterAll = this.translate.instant('PREVIOUS_ORDERS.FILTER_ALL');
    const filterCompleted = this.translate.instant(
      'PREVIOUS_ORDERS.FILTER_COMPLETED',
    );
    const filterRejected = this.translate.instant(
      'PREVIOUS_ORDERS.FILTER_REJECTED',
    );

    if (this.selectedFilter === filterAll) {
      return this.orders;
    } else if (this.selectedFilter === filterCompleted) {
      return this.orders.filter(
        (order) => order.shippingStatus === 'Delivered',
      );
    } else if (this.selectedFilter === filterRejected) {
      return this.orders.filter(
        (order) => order.shippingStatus === 'Cancelled',
      );
    }
    return this.orders;
  }

  // ===== Refund Forms
  openRefundForm(orderId: number) {
    this.selectedOrderId = orderId;
    this.selectedProductId = null;
    this.refundReason = '';
    this.showRefundForm = true;
    this.showProductRefundForm = false;
  }

  openProductRefundForm(orderId: number, orderItemId: number) {
    this.selectedOrderId = orderId;
    this.selectedProductId = orderItemId;
    this.refundReason = '';
    this.showProductRefundForm = true;
    this.showRefundForm = false;
  }

  closeRefundForms() {
    this.showRefundForm = false;
    this.showProductRefundForm = false;
    this.selectedOrderId = null;
    this.selectedProductId = null;
    this.refundReason = '';
  }

  // Submit Refund
  submitRefund(isProductRefund: boolean) {
    if (!this.refundReason.trim()) return;

    if (
      isProductRefund &&
      this.selectedOrderId &&
      this.selectedProductId !== null
    ) {
      this.refundOrderService
        .refundProduct(this.selectedProductId, this.refundReason.trim())
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: this.translate.instant('COMMON.SUCCESS'),
              text: this.translate.instant(
                'PREVIOUS_ORDERS.PRODUCT_REFUND_SUCCESS',
              ),
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
            this.closeRefundForms();
          },
          error: (err) => {
            Swal.fire({
              title: this.translate.instant('PREVIOUS_ORDERS.FAILED_TITLE'),
              text:
                err?.error?.message ||
                this.translate.instant('PREVIOUS_ORDERS.PRODUCT_REFUND_ERROR'),
              icon: 'error',
              background: '#fff',
              color: '#000',
              confirmButtonColor: '#000',
            });
          },
        });
    } else if (!isProductRefund && this.selectedOrderId !== null) {
      this.refundOrderService
        .refundOrder(this.selectedOrderId, this.refundReason.trim())
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: this.translate.instant('COMMON.SUCCESS'),
              text: this.translate.instant(
                'PREVIOUS_ORDERS.ORDER_REFUND_SUCCESS',
              ),
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
            this.closeRefundForms();
          },
          error: (err) => {
            Swal.fire({
              title: this.translate.instant('PREVIOUS_ORDERS.FAILED_TITLE'),
              text:
                err?.error?.message ||
                this.translate.instant('PREVIOUS_ORDERS.ORDER_REFUND_ERROR'),
              icon: 'error',
              background: '#000',
              color: '#fff',
              confirmButtonColor: '#fff',
            });
          },
        });
    }
  }
  canRequestRefund(order: IPreviousOrder, productId?: number): boolean {
    const isCOD = order.paymentMethod === 'COD';

    if (productId) {
      const product = order.orderItems.find(
        (item) => item.productId === productId,
      );
      if (!product) return false;

      const alreadyRefunded =
        !!product.refundStatus && product.refundStatus.trim() !== '';
      return (
        !alreadyRefunded &&
        ((!isCOD && order.orderStatus === 'Processing') ||
          (isCOD && order.shippingStatus === 'Delivered'))
      );
    }

    const alreadyRefundedOrder =
      Array.isArray(order.refundStatuses) && order.refundStatuses.length > 0;
    const status = order.orderStatus?.trim();
    const shipping = order.shippingStatus?.trim();

    return (
      !alreadyRefundedOrder &&
      ((!isCOD && status === 'Processing') ||
        (isCOD && shipping === 'Delivered'))
    );
  }

  // Progress labels
  shouldShowProgress(order: IPreviousOrder): boolean {
    // Cancelled: don't show progress bar
    if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned')
      return false;

    // Online payment: show when Processing or later
    if (order.paymentMethod !== 'COD') {
      return (
        order.orderStatus === 'Processing' ||
        ['ReadyToShip', 'Shipped', 'OutForDelivery', 'Delivered'].includes(
          order.shippingStatus,
        )
      );
    }

    // COD: show from ReadyToShip
    return ['ReadyToShip', 'Shipped', 'OutForDelivery', 'Delivered'].includes(
      order.shippingStatus,
    );
  }
  getRefundStatuses(order: any): string {
    return (order.refundStatuses || [])
      .filter((s: string | null) => !!s)
      .join(', ');
  }
}
