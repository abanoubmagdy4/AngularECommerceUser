import { IProductEmbeddingRecord } from './iproduct-embedding-record';

export interface IAIProductSearchResult {
  product: IProductEmbeddingRecord;
  analysis: string;
}
