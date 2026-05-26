import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CartItemService } from '../../shared/services/cart/cart.service';
import { AuthService } from '../../shared/services/Auth/auth.service';
import {
  IOrder,
  PaymentMethods,
  OrderStatus,
  ICustomer,
  IAddress,
} from '../../models/IOrder';
import { ICartItem } from '../../models/ICartItem';
import { environment } from '../../../environments/environment.development';
import { Router, RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { OrderService } from '../services/Order/order.service';
import { Login } from '../login/login';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../shared/services/language/language.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order implements OnInit, OnDestroy {
  addressSelectControl: any;
  addNewAddressControl: any;
  cartItems: ICartItem[] = [];
  governorates: {
    id: number;
    nameAr?: string;
    nameEn?: string;
    name?: string;
    shippingCost: number;
  }[] = [];
  shippingCost: number = 0;
  estimatedTotal: number = 0;
  private completedCheckout: boolean = false;
  private shouldContinueCheckout: boolean = false;
  validationErrors: { [key: string]: string[] } = {};

  orderForm: FormGroup;
  isLoggedInNow = false;

  paymentMethods = [
    { value: PaymentMethods.Online, labelKey: 'ENUMS.PAYMENT_METHODS.ONLINE' },
    { value: PaymentMethods.COD, labelKey: 'ENUMS.PAYMENT_METHODS.COD' },
  ];

  order: IOrder = {
    orderId: 0,
    orderNumber: '',
    createdAt: new Date(),
    deliveredAt: undefined,
    customerId: '',
    shippingCost: 0,
    discountValue: 0,
    totalOrderPrice: 0,
    paymentMethod: PaymentMethods.Online,
    orderStatus: OrderStatus.Created,
    orderItems: [],
    customerInfo: {} as ICustomer,
    addressInfo: {} as IAddress,
  };

  savedAddresses: any[] = [];
  useNewAddress: boolean = false;
  selectedAddressId: string | null = null;

  constructor(
    private cartService: CartItemService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private languageService: LanguageService,
  ) {
    this.orderForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)],
      ],
      paymentMethod: [null, Validators.required],
      street: ['', Validators.required],
      apartment: [''],
      building: [''],
      floor: [''],
      governrateShippingCostId: [null, Validators.required],
    });
    this.addressSelectControl = this.fb.control(null);
    this.addNewAddressControl = this.fb.control(false);
  }

  ngOnInit(): void {
    // Synchronize controls with component state
    this.addressSelectControl.valueChanges.subscribe((val: string | null) => {
      this.selectedAddressId = val;
      if (!this.useNewAddress) {
        this.onAddressChange();
      }
    });
    this.addNewAddressControl.valueChanges.subscribe((val: boolean | null) => {
      this.useNewAddress = !!val;
      this.onToggleNewAddress();
    });
    this.loadUserDataIfLoggedIn();
    this.loadGovernorates();

    // Pre-fill form if customerInfo is available
    if (this.order.customerInfo) {
      this.orderForm.patchValue({
        email: this.order.customerInfo.email || '',
        firstName: this.order.customerInfo.firstName || '',
        lastName: this.order.customerInfo.lastName || '',
        phoneNumber: this.order.customerInfo.phoneNumber || '',
      });
    }

    const nav = this.router.getCurrentNavigation();
    let buyNowItem = nav?.extras?.state?.['buyNowItem'];

    if (!buyNowItem) {
      const stored = sessionStorage.getItem('buyNowItem');
      if (stored) {
        try {
          buyNowItem = JSON.parse(stored);
        } catch {}
      }
    }

    if (buyNowItem) {
      this.cartItems = [
        {
          id: 0,
          productId: buyNowItem.productId,
          productSizeId: buyNowItem.productSizeId,
          productName: buyNowItem.productName,
          productSizeNameEn: buyNowItem.productSizeNameEn ?? '',
          productSizeNameAr: buyNowItem.productSizeNameAr ?? '',
          productImageUrl: buyNowItem.productImageUrl?.startsWith('http')
            ? buyNowItem.productImageUrl
            : buyNowItem.productImageUrl,
          quantity: buyNowItem.quantity,
          unitPrice: buyNowItem.unitPrice,
          totalPriceForOneItemType: buyNowItem.totalPriceForOneItemType,
        },
      ];
      this.calculateTotal();
      return;
    }

    const token = this.authService.getToken();
    if (token) {
      this.loadServerCart();
    } else {
      this.loadLocalCart();
    }
  }

  loadUserDataIfLoggedIn(): void {
    const token = this.authService.getToken();
    const user = token ? this.decodeUserFromToken(token) : null;

    if (user?.id) {
      this.order.customerId = user.id;

      this.orderService.getCustomerById().subscribe({
        next: (customerData) => {
          this.order.customerInfo = { ...customerData };
          // Patch form values when customer data is loaded
          this.orderForm.patchValue({
            email: customerData.email || '',
            firstName: customerData.firstName || '',
            lastName: customerData.lastName || '',
            phoneNumber: customerData.phoneNumber || '',
          });
          this.cdr.detectChanges();
        },
        error: (err) => {},
      });

      this.loadAddresses(user.id);
    }
  }

  completeCheckout(): void {
    // التحقق من صحة الفورم
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        html: '<small>Please complete all required fields correctly.</small>',
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

    // التحقق من وجود عناصر في السلة
    if (this.cartItems.length === 0) {
      alert('❌ Your cart is empty.');
      return;
    }

    // تعيين بيانات العميل من الفورم مباشرة
    this.order.customerId = 'guest'; // بدل ما تسيبها فاضية

    this.order.customerInfo = {
      email: this.orderForm.value.email,
      firstName: this.orderForm.value.firstName,
      lastName: this.orderForm.value.lastName,
      phoneNumber: this.orderForm.value.phoneNumber,
      dateOfBirth: new Date(), // غير مستخدم في الفورم، حطينا قيمة افتراضية
    };

    this.order.addressInfo = {
      street: this.orderForm.value.street,
      apartment: this.orderForm.value.apartment,
      building: this.orderForm.value.building,
      floor: this.orderForm.value.floor,
      governrateShippingCostId: this.orderForm.value.governrateShippingCostId,
      city: '', // ممكن تحددها حسب اختيار المحافظة
      country: 'Egypt', // قيمة افتراضية
    };

    this.order.paymentMethod = this.orderForm.value.paymentMethod;

    // تنفيذ الخطوة النهائية لإرسال الطلب
    this.prepareAndSendOrder();
  }

  private prepareAndSendOrder(): void {
    this.order.orderItems = this.cartItems.map((item) => ({
      orderItemId: 0,
      productId: item.productId,
      productSizeId: item.productSizeId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPriceForOneItemType,
    }));

    this.order.totalOrderPrice = this.estimatedTotal + this.shippingCost;

    // Ensure city is set before sending order
    if (
      !this.order.addressInfo.city ||
      this.order.addressInfo.city.trim() === ''
    ) {
      const govId = this.order.addressInfo.governrateShippingCostId;
      const selectedGov = this.governorates.find((gov) => gov.id === govId);
      if (selectedGov) {
        this.order.addressInfo.city = this.getGovernorateName(selectedGov);
      }
    }

    this.orderService.checkoutOrder(this.order).subscribe({
      next: (res) => {
        sessionStorage.removeItem('buyNowItem');
        this.completedCheckout = true;
        const order = res?.order;
        if (res?.intentionUrl && res.intentionUrl.trim() !== '') {
          window.location.href = res.intentionUrl;
          return;
        }

        if (order) {
          const orderSummary = {
            orderNumber: order.orderNumber,
            paymentMethod: order.paymentMethod,
            orderStatus: order.orderStatus,
            createdAt: order.createdAt,
            orderAddressInfo: order.orderAddressInfo,
            discountValue: order.discountValue || 0,
            shippingCost: order.shippingCost || 0,
            orderPrice: order.orderPrice || 0,
            totalOrderPrice: order.totalOrderPrice || 0,
          };
          this.router.navigate(['/order-confirmation'], {
            state: { orderSummary },
          });
          localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
        } else {
          // حالة أخرى ممكن تحط هنا لو حابب
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Order processed successfully',
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
        }
      },

      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: 'An error occurred while placing your order. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
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

  calculateTotal(): void {
    this.estimatedTotal = this.cartItems.reduce(
      (acc, item) => acc + item.totalPriceForOneItemType,
      0,
    );
  }

  loadServerCart(): void {
    this.cartService.getCurrentUserCart().subscribe({
      next: (res: any) => {
        const items = res?.cartItems ?? [];
        this.cartItems = items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productSizeId: item.productSizeId,
          productName: item.productName ?? 'Unknown',
          productSizeNameEn: item.productSizeNameEn ?? '',
          productSizeNameAr: item.productSizeNameAr ?? '',
          productImageUrl: item.productImageUrl
            ? item.productImageUrl
            : '/assets/images/default.png',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPriceForOneItemType: item.totalPriceForOneItemType,
        }));

        this.calculateTotal();
      },
      error: (err) => {},
    });
  }

  loadLocalCart(): void {
    const storedCart = localStorage.getItem('guestCart');
    if (storedCart) {
      try {
        const rawItems = JSON.parse(storedCart);
        this.cartItems = rawItems.map((item: any) => ({
          id: 0,
          productId: item.productId,
          productSizeId: item.productSizeId,
          productName: item.name ?? 'Unknown',
          productSizeNameEn: item.productSizeNameEn ?? '',
          productSizeNameAr: item.productSizeNameAr ?? '',
          productImageUrl: item.image,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPriceForOneItemType: item.totalPriceForOneItemType,
        }));
        this.calculateTotal();
      } catch (e) {}
    }
  }

  loadGovernorates(): void {
    this.orderService.getGovernorateShippingCosts().subscribe({
      next: (res) => {
        this.governorates = res;
      },
      error: (err) => {},
    });
  }

  onGovernorateChange(): void {
    // Always use the value from the form, not just addressInfo
    const govId = this.orderForm.value.governrateShippingCostId;
    const selectedGov = this.governorates.find((gov) => gov.id === govId);

    if (selectedGov) {
      this.order.addressInfo.governrateShippingCostId = selectedGov.id;
      this.order.addressInfo.city = this.getGovernorateName(selectedGov);
      this.shippingCost = selectedGov.shippingCost;
    } else {
      this.order.addressInfo.city = '';
      this.shippingCost = 0;
    }
  }

  loadAddresses(userId: string): void {
    this.orderService.getAddressesByUserId(userId).subscribe({
      next: (addresses) => {
        this.savedAddresses = addresses;
        if (this.savedAddresses.length === 0) {
          this.useNewAddress = true;
          this.addNewAddressControl.setValue(true, { emitEvent: false });
          this.onToggleNewAddress(); // عشان يجهز الفورم
        }
      },
      error: (err) => {},
    });
  }

  onAddressChange(): void {
    if (!this.useNewAddress && this.selectedAddressId) {
      const selected = this.savedAddresses.find(
        (a) => a.id == this.selectedAddressId,
      );
      if (selected) {
        const selectedGovForCity = this.governorates.find(
          (gov) => gov.id === selected.governrateShippingCostId,
        );
        this.order.addressInfo = {
          id: selected.id,
          street: selected.street,
          apartment: selected.apartment,
          building: selected.building,
          floor: selected.floor,
          city: selectedGovForCity ? selectedGovForCity.name : selected.city,
          country: selected.country,
          governrateShippingCostId: selected.governrateShippingCostId,
        };
        // Patch form fields to match selected address
        this.orderForm.patchValue({
          street: selected.street || '',
          apartment: selected.apartment || '',
          building: selected.building || '',
          floor: selected.floor || '',
          governrateShippingCostId: selected.governrateShippingCostId ?? null,
        });
        // Update shipping cost immediately based on governorate
        const selectedGov = this.governorates.find(
          (gov) => gov.id === selected.governrateShippingCostId,
        );
        if (selectedGov) {
          this.shippingCost = selectedGov.shippingCost;
        } else {
          this.shippingCost = 0;
        }
        this.cdr.detectChanges();
      }
    }
  }

  onToggleNewAddress(): void {
    if (this.useNewAddress) {
      this.selectedAddressId = null;
      this.order.addressInfo = {
        street: '',
        apartment: '',
        building: '',
        floor: '',
        city: '',
        country: '',
        governrateShippingCostId: 0,
      };
      // Clear address fields in the form
      this.orderForm.patchValue({
        street: '',
        apartment: '',
        building: '',
        floor: '',
        governrateShippingCostId: null,
      });
      this.cdr.detectChanges();
    } else {
      // If switching back, repopulate from selected address
      this.onAddressChange();
    }
  }

  ngOnDestroy(): void {
    if (!this.completedCheckout) {
      sessionStorage.removeItem('buyNowItem');
    }
  }

  trackByProductId(index: number, item: ICartItem): string {
    return item.productId + '-' + item.productSizeId;
  }

  /**
   * Get localized governorate name based on current language
   */
  getGovernorateName(gov: {
    id: number;
    nameAr?: string;
    nameEn?: string;
    name?: string;
  }): string {
    return this.languageService.getLocalizedName(gov);
  }
}
