import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IForecast, RequestFormat } from '../model/forecast.model';
import { Observable } from 'rxjs';
import { IHistory } from '../model/history.model';
import { IUser } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  private apiURL: string = "http://localhost:8080/history";
  private headers = { "X-PO-Screen-Lock": "true" };

  constructor(private http: HttpClient) { }

  saveHistory(weatherInfo: RequestFormat, userId: number): Observable<IHistory> {
    const todayForecast = weatherInfo.results.forecast.find((info) => weatherInfo.results.date.includes(info.date)) ?? {} as IForecast;
    const [day, month, year] = weatherInfo.results.date.split("/");
    const body: IHistory = {
      city_name: weatherInfo.results.city_name,
      city_state: weatherInfo.results.city.split(", ")[1],
      forecast_date: new Date(`${month}-${day}-${year}`),
      recorded_at: new Date(),
      temperature_max: todayForecast.max,
      temperature_min: todayForecast.min,
      weather_condition: weatherInfo.results.condition_slug,
      weather_description: weatherInfo.results.description,
      userId: userId
    }
    return this.http.post<IHistory>(this.apiURL, body, { headers: this.headers});
  }
}
