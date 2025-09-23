import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { createPurchase, getPurchaseDetails, purchase, purchaseProduct } from '../interfaces/purchase';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  constructor(private http: HttpClient) { }

  public getPurchaseData(params: { searchValue: string, page?: number, limit?: number, sortBy?: string, sortDir?: string }) {
    const body: any = {};
    if (params) {
      if (params.searchValue) body.searchValue = params.searchValue
      if (params.page) body.page = params.page
      if (params.limit) body.limit = params.limit
      if (params.sortBy) body.sortBy = params.sortBy
      if (params.sortDir) body.sortDir = params.sortDir
    }
    console.log(body);
  return this.http.post<getPurchaseDetails>(`http://localhost:3000/api/purchase/getPurchaseData`, body)

  }

  public getVendors(): Observable<any>{
    return this.http.get('http://localhost:3000/api/purchase/getVendors')
  }

   public getProducts(): Observable<any>{
    return this.http.get('http://localhost:3000/api/purchase/getproducts')
  }

  public createPurchase(purchaseData:createPurchase): Observable<any>{
     return this.http.post('http://localhost:3000/api/purchase', purchaseData)
  }

  public getProductsById(id:number): Observable<any>{
    return this.http.get(`http://localhost:3000/api/purchase/getPurchaseDataById/${id}`)
  }
  public updateProduct(purchaseId:number, purchaseData:any){
    console.log(purchaseId, purchaseData);
    
     return this.http.patch(`http://localhost:3000/api/purchase/${purchaseId}`, purchaseData)
  }

}
