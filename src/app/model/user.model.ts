import { IFavorite } from "./favorite.model";
import { IHistory } from "./history.model";

export interface IUser {
  id?: number;
  username: string;
  email: string;
  password: string;
  created_at: Date;
  favoriteCities: IFavorite[];
  weather_history: IHistory[];
}
