import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IForecast, RequestFormat } from '../model/forecast.model';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiURL: string = "http://localhost:8080/weather";
  private headers = { "X-PO-Screen-Lock": "true" };

  constructor(private http: HttpClient) { }

  getWeatherInfo(city: string): Observable<RequestFormat> {
    return this.http.get<RequestFormat>(this.apiURL, { headers: this.headers, params: { city }});
  }

}
