export interface IForecast {
  temp: number;
  date: string;
  time: string;
  condition_code: string;
  description: string;
  currently: string;
  humidity: number;
  cloudiness: number;
  rain: number;
  wind_speedy: string;
  sunrise: string;
  sunset: string;
  moon_phase: string;
  condition_slug: string;
  condition: string;
  timezone: string;
  weekday: string;
  min: number;
  max: number;
  city_name: string;
  city: string;
  forecast: Omit<IForecast, "forecast">[];
}

export type RequestFormat = { results: IForecast };

