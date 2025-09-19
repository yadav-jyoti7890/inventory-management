import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { categoryResponse, productResponse, productResponseById, productSortingResponse, searchProductResponse } from '../interfaces/product-response';
import { product, productForm } from '../interfaces/products';
import { CategoryResponse } from '../interfaces/category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  public apiUrl = 'http://localhost:3000/api/products';


  constructor(private http: HttpClient) { }

  public getAllCategory(): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>('http://localhost:3000/api/products/getCategory', {});
  }

  public createProduct(productData: FormData | product) {
    return this.http.post('http://localhost:3000/api/products', productData);
  }

  public deleteProduct(id: number) {
    return this.http.delete(`http://localhost:3000/api/products/${id}`)
  }

  public getProductById(id: number): Observable<productResponseById> {
    return this.http.get<productResponseById>(`http://localhost:3000/api/products/${id}`)
  }

  public getAllProducts(params?: {searchValue:string, page?: number, limit?: number, sortBy?: string, sortDir?: string }): Observable<productSortingResponse> {
    const body: any = {};
    if (params) {
       if (params.searchValue) body.searchValue = params.searchValue;
      if (params.page) body.page = params.page;
      if (params.limit) body.limit = params.limit;
      if (params.sortBy) body.sortBy = params.sortBy;
      if (params.sortDir) body.sortDir = params.sortDir;
    }
    return this.http.post<productSortingResponse>(`${this.apiUrl}/getProductsBySorting`, body);
  }

  public searchData(searchValue: string | null) {
    console.log(searchValue);
    return this.http.post<searchProductResponse>(`http://localhost:3000/api/products/search`, { searchValue })
  }

  public updateProduct(id: number, productData: FormData | product) {
    return this.http.patch(`http://localhost:3000/api/products/${id}`, productData);
  }
  

}
