import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class
  OrdersService {

  constructor(private http: HttpClient) { }

  public apiUrl = 'http://localhost:3000';

  public getCustomers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/orders/getCustomers`)
  }

  public saveOrders(orders: any) {
    console.log(orders);
    return this.http.post(`${this.apiUrl}/api/orders`, orders)
  }

  public getOrders(params?: { searchValue: string, page?: number, limit?: number, sortBy?: string, sortDir?: string }) {
    const body: any = {};
    if (params) {
      if (params.searchValue) body.searchValue = params.searchValue
      if (params.page) body.page = params.page
      if (params.limit) body.limit = params.limit
      if (params.sortBy) body.sortBy = params.sortBy
      if (params.sortDir) body.sortDir = params.sortDir
    }
    return this.http.post(`${this.apiUrl}/api/orders/getAllOrders`, body)
  }

}
