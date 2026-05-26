export interface IOrder {
  orderId?: number;
  orderNumber?: string;
  createdAt?: Date;
  deliveredAt?: Date;
  customerId: string;
  shippingCost?: number;
  discountValue: number;
  totalOrderPrice: number;
  paymentMethod: PaymentMethods;
  orderStatus: OrderStatus;
  orderItems: IOrderItem[];
  customerInfo: ICustomer;
  addressInfo: IAddress;
}
export interface IOrderItem {
  orderItemId: number;
  productId: number;
  quantity: number;
  productSizeId: number;
  totalPrice: number;
}

// order-status.enum.ts

export enum OrderStatus {
  Created = 0,
  AwaitingPayment = 1,
  Processing = 2,
  Cancelled = 3,
  Returned = 4,
}

export enum PaymentMethods {
  Online = 0,
  COD = 1,
  card = 2,
  wallet = 3,
}

// Helper functions to get localized enum values
export function getOrderStatusTranslation(status: OrderStatus): string {
  const statusMap: Record<OrderStatus, string> = {
    [OrderStatus.Created]: 'ENUMS.ORDER_STATUS.CREATED',
    [OrderStatus.AwaitingPayment]: 'ENUMS.ORDER_STATUS.AWAITING_PAYMENT',
    [OrderStatus.Processing]: 'ENUMS.ORDER_STATUS.PROCESSING',
    [OrderStatus.Cancelled]: 'ENUMS.ORDER_STATUS.CANCELLED',
    [OrderStatus.Returned]: 'ENUMS.ORDER_STATUS.RETURNED',
  };
  return statusMap[status];
}

export function getPaymentMethodTranslation(method: PaymentMethods): string {
  const methodMap: Record<PaymentMethods, string> = {
    [PaymentMethods.Online]: 'ENUMS.PAYMENT_METHODS.ONLINE',
    [PaymentMethods.COD]: 'ENUMS.PAYMENT_METHODS.COD',
    [PaymentMethods.card]: 'ENUMS.PAYMENT_METHODS.CARD',
    [PaymentMethods.wallet]: 'ENUMS.PAYMENT_METHODS.WALLET',
  };
  return methodMap[method];
}

export interface ICustomer {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
}
export interface IAddress {
  id?: number; // nullable => optional
  street: string;
  city: string;
  governrateShippingCostId: number;
  country: string;
  apartment: string;
  building: string;
  floor: string;
}
