import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IFavorite } from '../model/favorite.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  private apiURL: string = "http://localhost:8080/favorite";
  private headers = { "X-PO-Screen-Lock": "true" };

  constructor(private http: HttpClient) { }

  checkFavorite(userId: number | undefined, city: string, state: string): Observable<IFavorite> {
    return this.http.get<IFavorite>(`${this.apiURL}/${userId}/${city}/${state}`, { headers: this.headers });
  }

  favoriteCity(userId: number | undefined, city: string, state: string) {
    const favorite: IFavorite = {
      user_id: userId,
      city_name: city,
      city_state: state
    };
    return this.http.post<IFavorite>(this.apiURL, favorite);
  }

  removeFavorite(userId: number | undefined, city: string, state: string): Observable<any> {
    return this.http.delete<any>(`${this.apiURL}/${userId}/${city}/${state}`);
  }
}
