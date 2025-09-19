import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { user, userResponse } from '../interfaces/user-response';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }

  // public getAllUsers(): Observable<userResponse> {
  //   return this.http.get<userResponse>('http://localhost:3000/api/users');
  // }

  public getAllUsers(params?: { searchValue: string, page?: number, limit?: number, sortBy?: string, sortDir?: string }): Observable<userResponse> {
    const body: any = {};
    if (params) {
      if (params.searchValue) body.searchValue = params.searchValue;
      if (params.page) body.page = params.page;
      if (params.limit) body.limit = params.limit;
      if (params.sortBy) body.sortBy = params.sortBy;
      if (params.sortDir) body.sortDir = params.sortDir;
    }
    console.log(body);
    return this.http.post<userResponse>(`http://localhost:3000/api/users/getUsersBySorting`, body);
  }

  public createUser(user: user) {
    return this.http.post('http://localhost:3000/api/users', user)
  }

  public deleteUser(id: number) {
    return this.http.delete(`http://localhost:3000/api/users/${id}`)
  }

  public getUserById(id: number): Observable<any> {
    return this.http.get(`http://localhost:3000/api/users/${id}`)
  }

  public updateUser(id: number, user: user) {
    return this.http.patch(`http://localhost:3000/api/users/${id}`, user)
  }

  public getSelectedData(limit: number): Observable<any> {
    return this.http.post<any>('http://localhost:3000/api/users/getSelectedData', {
      value: limit
    });
  }
}