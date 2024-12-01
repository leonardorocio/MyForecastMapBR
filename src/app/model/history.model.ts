import { IUser } from "./user.model";

export interface IHistory {
  id?: number;
  city_name: string;
  city_state: string;
  forecast_date: Date;
  weather_description: string;
  weather_condition: string;
  temperature_min: number;
  temperature_max: number;
  recorded_at: Date;
  user?: IUser;
  userId: number
}
