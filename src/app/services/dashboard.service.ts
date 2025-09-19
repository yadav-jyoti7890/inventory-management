import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CategoryResponse, OrderResponse, ProductResponse, TodayOrderResponse, UserResponse, vendorsResponse } from '../interfaces/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http:HttpClient) { }

  public apiUrl = 'http://localhost:3000';

  public getTotalUsers(){
    return this.http.post<UserResponse>(`${this.apiUrl}/api/users/totalUserCount`, {})
  }

  public getTotalProducts(){
    return this.http.post<ProductResponse>(`${this.apiUrl}/api/products/getAllProducts`, {})
  }

  public getTotalCategories(){
    return this.http.post<CategoryResponse>(`${this.apiUrl}/api/categories/getAllCategory`, {})
  }

  public getTotalOrders(){
    return this.http.post<OrderResponse>(`${this.apiUrl}/api/orders/totalOrders`, {})
  }

  public getTotalTodayOrders(){
    return this.http.post<TodayOrderResponse>(`${this.apiUrl}/api/orders/totalTodayOrders`, {})
  }

  public getTotalVendors(){
    return this.http.post<vendorsResponse>(`${this.apiUrl}/api/vendors/totalVendorsCount`, {})
  }


}
