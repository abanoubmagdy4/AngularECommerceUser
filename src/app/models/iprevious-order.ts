import { iPreviousOrderItem } from './iPreviousOrderItem';

export interface IPreviousOrder {
  orderId: number; // [BindNever]
  orderNumber?: string; // max 20 chars
  createdAt: Date; // [Required], [BindNever]
  deliveredAt?: Date;
  shippingCost?: number; // decimal(18,2)
  discountValue: number; // decimal(18,2)
  totalOrderPrice: number; // [Required], decimal(18,2)
  paymentMethod: string; // [Required]
  orderStatus: string; // [Required]
  shippingStatus: string; // [Required]
  refundStatuses: (string | null)[]; // [Required], nullable strings inside
  orderItems: iPreviousOrderItem[]; // [Required], assumed to be another interface
  orderAddressInfo: string; // [Required]
}
