import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IUser } from '../model/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiURL: string = "http://localhost:8080/users";
  private headers = { "X-PO-Screen-Lock": "true" };

  constructor(private http: HttpClient) { }

  createUser(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(this.apiURL, user, { headers: this.headers });
  }

  updateUser(user: IUser, userId: number | undefined): Observable<IUser> {
    return this.http.put<IUser>(`${this.apiURL}/${userId}`, user, { headers: this.headers });
  }

  authenticate(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(`${this.apiURL}/login`, user, { headers: this.headers });
  }
}
