import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetVendorsResponseByID, vendors, vendorsResponse } from '../interfaces/vendors-response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorsService {

  constructor(private http: HttpClient) { }

  // public getAllVendors(params: any): Observable<any> {
  //   return this.http.get(`http://localhost:3000/api/vendors?page=${params.pageIndex}&limit=${params.limit}&searchValue=${params.searchValue}&sortBy=${params.sortBy}&direction=${params.direction}`)
  // }

  public getAllVendors(params?: { searchValue: string, page?: number, limit?: number, sortBy?: string, sortDir?: string }): Observable<any> {
    const body: any = {};
    if (params) {
      if (params.searchValue) body.searchValue = params.searchValue;
      if (params.page) body.page = params.page;
      if (params.limit) body.limit = params.limit;
      if (params.sortBy) body.sortBy = params.sortBy;
      if (params.sortDir) body.sortDir = params.sortDir;
    }
    console.log(body);
    return this.http.post(`http://localhost:3000/api/vendors/sortingData`, body);
  }

  public createVendor(vendor: vendors) {
    return this.http.post('http://localhost:3000/api/vendors', vendor)
  }

  public getVendorsById(id: number) {
    return this.http.get<GetVendorsResponseByID>(`http://localhost:3000/api/vendors/${id}`)
  }

  public updateVendor(vendorId: number, vendor: vendors) {
    return this.http.patch(`http://localhost:3000/api/vendors/${vendorId}`, vendor)
  }

  public deleteVendor(id: number) {
    return this.http.delete(`http://localhost:3000/api/vendors/${id}`)
  }
}
