import { Injectable } from '@angular/core';
import { IProduct } from '../../../models/iproduct';
import { IPaginate } from '../../../models/ipaginate';
import { ProductService } from '../Product/product.service';

@Injectable({
  providedIn: 'root',
})
export class DiscountedProductsService {
  constructor(private _productService: ProductService) {}

  getDiscountProducts(pageIndex: number) {
    return this._productService.getAllProductsByPaginate(pageIndex);
  }
}
