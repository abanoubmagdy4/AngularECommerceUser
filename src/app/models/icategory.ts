export interface ICategory {
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
  price?: number;
  discountPercentage?: number;
  categoryId?: number;
  isDeleted?: boolean;
  parentID?: number;
  imageUrl?: string;
}
