import { INewArrivals } from './inew-arrivals';
import { IProductImagesPaths } from './iproduct-images-paths';
import { IProductSizes } from './iproduct-sizes';

export interface IProduct {
  id: number;
  // Bilingual fields (new - from backend)
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  // Legacy single language fields (for backward compatibility)
  name?: string;
  description?: string;
  // Other fields
  price: number;
  discountPercentage: number;
  priceAfterDiscount: number;
  averageRating?: number;
  categoryId: number;
  isDeleted: boolean;
  productSizes?: IProductSizes[];
  productImagesPaths: IProductImagesPaths[];
  NewArrival: INewArrivals;
  details?: string;
  care?: string;
  fit?: string;
  PublishAt: Date;
  IsPublished: boolean;
}
