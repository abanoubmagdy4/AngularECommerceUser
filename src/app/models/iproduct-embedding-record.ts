export interface IProductEmbeddingRecord {
  key: string;
  productId: number;
  name: string;
  category: string;
  description: string;
  color: string;
  sizes: string[];
  material: string;
  occasion: string;
  productType: string;
  productStatus: string;
  imgReference: string[];
  embedding?: number[]; // ReadOnlyMemory<float> => array of floats
}
