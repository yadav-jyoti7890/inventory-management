import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryResponse, CategoryResponseById, categorySortingResponse, searchCategoryResponse } from '../interfaces/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  public apiUrl = 'http://localhost:3000/api/categories';


  constructor(private http: HttpClient) { }

  public createCategory(name: string) {
    return this.http.post('http://localhost:3000/api/categories', { name: name })
  }

  // public getAllCategory(): Observable<CategoryResponse> {
  //   return this.http.get<CategoryResponse>('http://localhost:3000/api/categories')
  // }

  public getAllCategory(params?: { searchValue:string, page?: number, limit?: number, sortBy?: string, sortDir?: string }): Observable<categorySortingResponse>{
      const body: any = {};
      if (params) {
        if (params.searchValue) body.searchValue = params.searchValue;
        if (params.page) body.page = params.page;
        if (params.limit) body.limit = params.limit;
        if (params.sortBy) body.sortBy = params.sortBy;
        if (params.sortDir) body.sortDir = params.sortDir;
      }
      return this.http.post<categorySortingResponse>(`${this.apiUrl}/getCategoryBySorting`, body);
    }

  public deleteCategory(id: number) {
    return this.http.delete(`http://localhost:3000/api/categories/${id}`)
  }

  public getCategoryById(id: number) {
    return this.http.get<CategoryResponseById>(`http://localhost:3000/api/categories/${id}`)
  }

  public updateCategory(name: string | null, id: number) {
    return this.http.patch(`http://localhost:3000/api/categories/${id}`, { name: name })
  }

  // public getcategoryBySorting(payload: { searchValue:string,page: number; limit: number; sortBy: string; sortDir: string }) {
  //   return this.http.post<any>(`${this.apiUrl}/getCategoryBySorting`, payload);
  // }

  public searchData(searchValue:string|null){
    console.log(searchValue);
    return this.http.post<searchCategoryResponse>(`http://localhost:3000/api/categories/search`,{searchValue})
  }
}
