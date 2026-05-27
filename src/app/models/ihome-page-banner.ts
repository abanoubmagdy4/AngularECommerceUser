export interface IHomePageBanner {
  id: number;
  titleAr?: string | null;
  titleEn?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  imageUrlAr?: string | null;
  imageUrlEn?: string | null;
  redirectUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}
